import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MentorConfig, MentorTone } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint del mentor virtual.
 *
 * Carga el contexto que la empresa ha configurado en `mentor_configs` y lo
 * combina con los datos del alumno (plan, tareas) para generar una respuesta.
 *
 * HOY: respuestas heurísticas que usan el contexto para personalizar tono y
 * referencias (recursos, knowledge base).
 *
 * MAÑANA: este mismo endpoint llamará a un LLM con `buildSystemPrompt(context)`
 * como system prompt y mantendrá el contrato hacia el cliente.
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

  // Cargar contexto: alumno, plan, tareas pendientes y config del mentor
  const [{ data: student }, { data: tasks }, { data: plan }] = await Promise.all([
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

  const reply = generateReply(message, {
    studentName: student?.full_name ?? null,
    tasks: tasks ?? [],
    plan: plan ?? null,
    mentorConfig,
  });

  await supabase.from("mentor_messages").insert({
    student_id: studentId,
    role: "assistant",
    content: reply,
  });

  return NextResponse.json({ reply });
}

interface MentorContext {
  studentName: string | null;
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
 * System prompt que se enviará al LLM cuando se enchufe. Combina la config
 * de la empresa con el contexto puntual del alumno.
 */
export function buildSystemPrompt(ctx: MentorContext): string {
  const c = ctx.mentorConfig;
  const lines: string[] = [];

  lines.push(
    "Eres el mentor virtual de Menta. Acompañas a alumnos en prácticas de empresa.",
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
    lines.push(`\nInformación interna útil:\n${c.knowledge_base}`);
  }
  if (c?.resources && c.resources.length > 0) {
    lines.push(
      `\nRecursos disponibles:\n${c.resources
        .map((r) => `- ${r.label}: ${r.url}`)
        .join("\n")}`,
    );
  }
  if (c?.custom_instructions) {
    lines.push(`\nInstrucciones específicas:\n${c.custom_instructions}`);
  }

  lines.push("\n--- Contexto del alumno ---");
  if (ctx.studentName) lines.push(`Nombre: ${ctx.studentName}`);
  if (ctx.plan)
    lines.push(
      `Plan: "${ctx.plan.title}" (${ctx.plan.start_date} – ${ctx.plan.end_date})`,
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
 * Respuesta heurística que usa el contexto. Se sustituirá por llamada a LLM.
 */
function generateReply(message: string, ctx: MentorContext): string {
  const m = message.toLowerCase();
  const tone = (ctx.mentorConfig?.tone ?? "cercano") as MentorTone;
  const tu = tone === "formal" ? "usted" : "tú";
  const greet = ctx.studentName
    ? `${tone === "formal" ? "Buenos días" : "Hola"} ${ctx.studentName.split(" ")[0]}`
    : tone === "formal"
      ? "Buenos días"
      : "Hola";

  if (/hola|buenos|qué tal|hey/.test(m)) {
    const desc = ctx.mentorConfig?.company_description
      ? ` Recuerda que estás haciendo prácticas en una empresa que ${ctx.mentorConfig.company_description.split(".")[0].toLowerCase()}.`
      : "";
    return `${greet}. Estoy aquí para ayudar${tone === "formal" ? "le" : "te"}.${desc} ¿En qué puedo ayudar${tone === "formal" ? "le" : "te"} hoy?`;
  }

  if (/hoy|tarea|qué hago|que hago|qué tengo/.test(m)) {
    if (!ctx.tasks.length) {
      return `Ahora mismo no ${tone === "formal" ? "tiene" : "tienes"} tareas pendientes. Buen momento para repasar aprendizajes o dejar el diario al día.`;
    }
    const lines = ctx.tasks
      .slice(0, 3)
      .map((t, i) => `${i + 1}. ${t.title}${t.due_date ? ` (vence ${t.due_date})` : ""}`)
      .join("\n");
    return `${greet}. Estas son ${tu === "tú" ? "tus" : "sus"} próximas tareas:\n\n${lines}\n\nEmpieza por la primera. Si ${tone === "formal" ? "se queda" : "te quedas"} bloqueado, vuelve a preguntar${tone === "formal" ? "me" : "me"}.`;
  }

  if (/bloquead|atascad|no sé|dificult/.test(m)) {
    const customNote = ctx.mentorConfig?.custom_instructions
      ? "\n\n(Nota: tu empresa me ha indicado que algunas dudas las gestione directamente el tutor humano, así que si veo que es un tema complejo te derivaré)"
      : "";
    return `Te entiendo. Antes de bloquearte:\n\n• Divide la tarea en pasos pequeños y empieza por el más simple.\n• Escribe en el diario qué te bloquea — a veces solo redactarlo despeja.\n• Si tras 30 min sigues atascado, contacta con el tutor de empresa.${customNote}\n\n¿Quieres que repasemos la tarea concreta?`;
  }

  if (/tiempo|deadline|fecha|voy bien/.test(m)) {
    if (!ctx.plan) return "Aún no hay plan asignado, así que no puedo medir el avance.";
    return `${greet}. ${tu === "tú" ? "Tu" : "Su"} plan "${ctx.plan.title}" termina el ${ctx.plan.end_date ?? "—"}. Quedan ${ctx.tasks.length} tareas pendientes. Si va${tu === "tú" ? "s" : ""} marcando una cada pocos días, llega${tu === "tú" ? "s" : ""} con margen.`;
  }

  if (/herramienta|cómo se|wiki|recurso/.test(m)) {
    if (ctx.mentorConfig?.knowledge_base) {
      return `Mira lo que tengo de la empresa sobre eso:\n\n${ctx.mentorConfig.knowledge_base.slice(0, 500)}${ctx.mentorConfig.knowledge_base.length > 500 ? "..." : ""}\n\n¿Concreta${tu === "tú" ? "s" : ""} la duda y te explico mejor?`;
    }
    return "Aún no tengo recursos cargados por tu empresa. Pídeselo a tu tutor o cuéntame qué necesitas saber y miramos juntos.";
  }

  if (/entrega|deliver|subir/.test(m)) {
    return "Para una buena entrega: revisa el enunciado, comprueba que cumples cada requisito, prueba dos veces antes de subir, y añade una breve descripción del trabajo. ¿Sobre qué tarea concreta es?";
  }

  if (/memoria|presentaci/.test(m)) {
    return "La memoria y la presentación final se generan a partir de tu diario, entregables y tareas completadas. Cuanto más rellenes el diario cada día, más fácil será que Menta te prepare un borrador potente al final.";
  }

  return `Buena pregunta. Cuénta${tu === "tú" ? "me" : "me"} un poco más de contexto para ayudar${tone === "formal" ? "le" : "te"} mejor: ¿es sobre una tarea concreta, sobre el plan general, o sobre cómo organiza${tu === "tú" ? "rte" : "rse"}?`;
}
