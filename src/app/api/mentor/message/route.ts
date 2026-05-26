import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint del mentor virtual.
 *
 * Hoy devuelve respuestas plantilla basadas en heurísticas simples y guarda
 * la conversación en `mentor_messages`. Está preparado para sustituir
 * `generateReply` por una llamada real a un LLM (OpenAI/Anthropic) en el futuro.
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

  // Cargar contexto del alumno para enriquecer la respuesta
  const [{ data: tasks }, { data: plan }] = await Promise.all([
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

  const reply = generateReply(message, {
    tasks: tasks ?? [],
    plan: plan ?? null,
  });

  await supabase.from("mentor_messages").insert({
    student_id: studentId,
    role: "assistant",
    content: reply,
  });

  return NextResponse.json({ reply });
}

interface MentorContext {
  tasks: { title: string; status: string; due_date: string | null }[];
  plan: { title: string; status: string; start_date: string | null; end_date: string | null } | null;
}

/**
 * Generador de respuesta. Hoy es heurístico; mañana se conecta a un LLM
 * pasándole el `message`, el `context` y un system prompt de mentor.
 */
function generateReply(message: string, context: MentorContext): string {
  const m = message.toLowerCase();

  if (/hoy|tarea|qué hago|que hago/.test(m)) {
    if (!context.tasks.length) {
      return "No tienes tareas pendientes ahora mismo. Es buen momento para repasar tus aprendizajes y dejar tu diario al día.";
    }
    const lines = context.tasks
      .slice(0, 3)
      .map(
        (t, i) =>
          `${i + 1}. ${t.title}${t.due_date ? ` (vence ${t.due_date})` : ""}`,
      )
      .join("\n");
    return `Estas son tus próximas tareas:\n\n${lines}\n\nEmpieza por la primera. Si te bloqueas, vuelve a preguntarme.`;
  }

  if (/bloquead|atascad|no sé|dificult/.test(m)) {
    return "Te entiendo. Antes de bloquearte:\n\n• Divide la tarea en pasos pequeños y empieza por el más simple.\n• Escribe en tu diario qué te bloquea exactamente — a veces solo redactarlo despeja.\n• Si después de 30 min sigues atascado, contacta con tu tutor de empresa.\n\n¿Quieres que repasemos juntos la tarea concreta?";
  }

  if (/tiempo|deadline|fecha|voy bien/.test(m)) {
    if (!context.plan) return "Aún no tienes plan asignado, así que no puedo medir el avance.";
    return `Tu plan "${context.plan.title}" termina el ${context.plan.end_date ?? "—"}. Tienes ${context.tasks.length} tareas pendientes. Si vas marcando una tarea cada pocos días, llegas con margen.`;
  }

  if (/entrega|deliver|subir/.test(m)) {
    return "Para una buena entrega: revisa el enunciado, comprueba que cumples cada requisito, prueba dos veces antes de subir, y añade una breve descripción del trabajo. ¿Sobre qué tarea concreta es?";
  }

  if (/memoria|presentaci/.test(m)) {
    return "La memoria y la presentación final se generan a partir de tu diario, entregables y tareas completadas. Cuanto más rellenes el diario cada día, más fácil será que Menta te prepare un borrador potente al final.";
  }

  if (/hola|buenos|qué tal|hey/.test(m)) {
    return "¡Hola! Estoy aquí para ayudarte con tu día a día en las prácticas. Pregúntame qué tarea hacer, cómo desbloquearte o cualquier duda sobre tu plan.";
  }

  return "Buena pregunta. Cuéntame un poco más de contexto para ayudarte mejor: ¿es sobre una tarea concreta, sobre tu plan general, o sobre cómo organizarte?";
}
