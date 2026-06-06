import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claudeComplete } from "@/lib/anthropic";
import type { MentorConfig, MentorTone } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint del mentor virtual.
 *
 * Carga la configuración que la empresa ha definido en `mentor_configs` y la
 * combina con el contexto del alumno (plan, tareas, primer nombre).
 *
 * - Si hay ANTHROPIC_API_KEY: llama a Claude Haiku con el system prompt + los
 *   últimos turnos como historial.
 * - Si no hay key o la llamada falla: vuelve al stub heurístico para que la
 *   feature siga funcionando sin sorpresas.
 *
 * Privacidad: solo enviamos el PRIMER NOMBRE del alumno al modelo (no apellidos,
 * ni email, ni DNI, ni datos de tutores).
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, message } = (await request.json().catch(() => ({}))) as {
    studentId?: string;
    message?: string;
  };
  if (!studentId || !message) {
    return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 });
  }

  // Guardar mensaje del alumno
  await supabase.from("mentor_messages").insert({
    student_id: studentId,
    role: "user",
    content: message,
  });

  // Cargar contexto: alumno, plan, tareas pendientes, config del mentor e
  // historial corto para dar continuidad sin saturar el prompt.
  const [
    { data: student },
    { data: tasks },
    { data: plan },
    { data: history },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("organization_id, full_name, practice_type")
      .eq("id", studentId)
      .single(),
    supabase
      .from("practice_tasks")
      .select("title, status, due_date")
      .eq("student_id", studentId)
      .neq("status", "completed")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(5),
    supabase
      .from("practice_plans")
      .select("title, status, start_date, end_date")
      .eq("student_id", studentId)
      .maybeSingle(),
    supabase
      .from("mentor_messages")
      .select("role, content")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(7), // últimos 7 (último es el que acabamos de insertar)
  ]);

  let mentorConfig: MentorConfig | null = null;
  if (student?.organization_id) {
    const { data } = await supabase
      .from("mentor_configs")
      .select("*")
      .eq("organization_id", student.organization_id)
      .maybeSingle();
    mentorConfig = data ?? null;
  }

  // Solo primer nombre — minimización de PII enviada al LLM.
  const firstName = (student?.full_name ?? "").split(" ")[0] || null;

  const ctx: MentorContext = {
    studentFirstName: firstName,
    tasks: tasks ?? [],
    plan: plan ?? null,
    mentorConfig,
  };

  // Historial: descartamos el mensaje recién insertado (es el `message` actual)
  // y revertimos para que vaya cronológico. Limitado a 6 turnos previos.
  const prior = (history ?? [])
    .slice(1)
    .reverse()
    .slice(-6)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // Intentamos LLM primero; si no responde, caemos a stub.
  let reply: string;
  const llm = await claudeComplete({
    system: buildSystemPrompt(ctx),
    userMessage: message,
    history: prior,
    maxTokens: 600,
    temperature: 0.7,
  });

  if (llm.ok) {
    reply = llm.text;
    if (llm.usage) {
      console.log(
        "[mentor] LLM ok",
        `in=${llm.usage.input_tokens}`,
        `out=${llm.usage.output_tokens}`,
      );
    }
  } else {
    if (!("skipped" in llm)) {
      console.warn("[mentor] LLM falló, usando stub heurístico:", llm.error);
    }
    reply = generateReply(message, ctx);
  }

  await supabase.from("mentor_messages").insert({
    student_id: studentId,
    role: "assistant",
    content: reply,
  });

  return NextResponse.json({ reply });
}

interface MentorContext {
  studentFirstName: string | null;
  tasks: { title: string; status: string; due_date: string | null }[];
  plan: {
    title: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
  mentorConfig: MentorConfig | null;
}

/**
 * System prompt enviado al LLM.
 * Combina la config de la empresa con el contexto del alumno (sin PII).
 */
export function buildSystemPrompt(ctx: MentorContext): string {
  const c = ctx.mentorConfig;
  const lines: string[] = [];

  lines.push(
    "Eres el mentor virtual de Menta. Acompañas a alumnos en prácticas de empresa.",
    "Tu rol es ayudar a planificar el día, desbloquear dudas y motivar al alumno.",
    "Sé concreto, breve y útil. No inventes datos sobre la empresa o el plan que no estén en este prompt.",
    "Si te preguntan algo que no sabes, dilo y sugiere hablar con el tutor humano.",
  );

  if (c?.company_description) {
    lines.push(`\nSobre la empresa:\n${c.company_description}`);
  }
  if (c?.industry) {
    lines.push(`Sector: ${c.industry}`);
  }
  if (c?.tone) {
    lines.push(`Tono: ${tonePrompt(c.tone as MentorTone)}`);
  }
  if (c?.mentor_personality) {
    lines.push(`Personalidad: ${c.mentor_personality}`);
  }
  if (c?.knowledge_base) {
    lines.push(`\nInformación interna útil de la empresa:\n${c.knowledge_base}`);
  }
  if (c?.resources && c.resources.length > 0) {
    lines.push(
      `\nRecursos disponibles que puedes recomendar:\n${c.resources
        .map((r) => `- ${r.label}: ${r.url}`)
        .join("\n")}`,
    );
  }
  if (c?.custom_instructions) {
    lines.push(`\nInstrucciones específicas de la empresa:\n${c.custom_instructions}`);
  }

  lines.push("\n--- Contexto del alumno ---");
  if (ctx.studentFirstName) lines.push(`Nombre: ${ctx.studentFirstName}`);
  if (ctx.plan)
    lines.push(
      `Plan: "${ctx.plan.title}" (del ${ctx.plan.start_date ?? "—"} al ${ctx.plan.end_date ?? "—"})`,
    );
  if (ctx.tasks.length > 0) {
    lines.push(
      `Tareas pendientes:\n${ctx.tasks
        .map((t) => `- ${t.title}${t.due_date ? ` (vence ${t.due_date})` : ""}`)
        .join("\n")}`,
    );
  }

  return lines.join("\n");
}

function tonePrompt(tone: MentorTone): string {
  switch (tone) {
    case "formal":
      return "formal, profesional, usa usted, evita coloquialismos";
    case "profesional":
      return "claro y profesional, sin ser distante";
    case "didactico":
      return "didáctico, explica el porqué de las cosas, da ejemplos";
    case "cercano":
    default:
      return "cercano, usa tú, animoso pero serio cuando hace falta";
  }
}

/**
 * Stub heurístico — solo se usa si la llamada al LLM falla.
 * Se mantiene para que la feature no muera si la key se cae o expira.
 */
function generateReply(message: string, ctx: MentorContext): string {
  const m = message.toLowerCase();
  const tone = (ctx.mentorConfig?.tone ?? "cercano") as MentorTone;
  const tu = tone === "formal" ? "usted" : "tú";
  const greet = ctx.studentFirstName
    ? `${tone === "formal" ? "Buenos días" : "Hola"} ${ctx.studentFirstName}`
    : tone === "formal"
      ? "Buenos días"
      : "Hola";

  if (/hola|buenos|qué tal|hey/.test(m)) {
    return `${greet}. ¿En qué puedo ayudar${tone === "formal" ? "le" : "te"} hoy?`;
  }

  if (/hoy|tarea|qué hago|que hago|qué tengo/.test(m)) {
    if (!ctx.tasks.length) {
      return `Ahora mismo no ${tone === "formal" ? "tiene" : "tienes"} tareas pendientes. Buen momento para repasar aprendizajes o dejar el diario al día.`;
    }
    const lines = ctx.tasks
      .slice(0, 3)
      .map((t, i) => `${i + 1}. ${t.title}${t.due_date ? ` (vence ${t.due_date})` : ""}`)
      .join("\n");
    return `${greet}. Estas son ${tu === "tú" ? "tus" : "sus"} próximas tareas:\n\n${lines}\n\nEmpieza por la primera. Si ${tone === "formal" ? "se queda" : "te quedas"} bloqueado, vuelve a preguntar.`;
  }

  if (/bloquead|atascad|no sé|dificult/.test(m)) {
    return `Te entiendo. Divide la tarea en pasos pequeños, escribe en el diario qué te bloquea y, si tras 30 min sigues atascado, contacta con tu tutor de empresa.`;
  }

  return `Buena pregunta. Cuéntame un poco más de contexto: ¿es sobre una tarea concreta, sobre el plan general, o sobre cómo organizarte?`;
}
