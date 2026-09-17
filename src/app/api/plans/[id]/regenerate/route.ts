import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claudeComplete, claudeExtractText } from "@/lib/anthropic";
import type { GeneratedPlan } from "@/lib/plan-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_DOC_BYTES = 15 * 1024 * 1024;
const MAX_DOCS = 3;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
]);

/**
 * POST /api/plans/[id]/regenerate
 * multipart/form-data con:
 *   - context: string       instrucciones adicionales para la IA
 *   - files[]: File[]       PDFs / textos a usar como referencia
 *
 * Carga el plan actual, pide a Claude que devuelva un plan nuevo en JSON
 * teniendo en cuenta el contexto + docs adjuntos, y reemplaza fases y
 * tareas del plan (mantiene el registro por id para conservar histórico
 * de referencias externas).
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const context = ((form.get("context") as string) ?? "").trim();
  const files: File[] = [];
  for (const [key, value] of form.entries()) {
    if (key === "files" && value instanceof File) files.push(value);
  }
  if (files.length > MAX_DOCS) {
    return NextResponse.json(
      { error: `Máximo ${MAX_DOCS} archivos por regeneración` },
      { status: 400 },
    );
  }

  // 1) Cargar plan actual + alumno
  const { data: plan } = await supabase
    .from("practice_plans")
    .select(
      "id, organization_id, student_id, title, description, objectives, start_date, end_date, total_hours",
    )
    .eq("id", params.id)
    .single();
  if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

  const { data: student } = await supabase
    .from("students")
    .select(
      "full_name, practice_type, position, department, internal_training_type",
    )
    .eq("id", plan.student_id ?? "")
    .maybeSingle();

  // 2) Extraer texto de los archivos adjuntos (PDF via Claude, texto directo).
  const attachments: { name: string; text: string }[] = [];
  for (const f of files) {
    const mime = f.type || "application/octet-stream";
    if (!ALLOWED_MIME.has(mime)) continue;
    if (f.size > MAX_DOC_BYTES) continue;
    const buf = Buffer.from(await f.arrayBuffer());
    if (mime === "application/pdf") {
      const res = await claudeExtractText({
        base64: buf.toString("base64"),
        mediaType: mime,
        filename: f.name,
      });
      if (res.ok) attachments.push({ name: f.name, text: res.text });
    } else {
      attachments.push({ name: f.name, text: buf.toString("utf8").slice(0, 100_000) });
    }
  }

  // 3) Prompt a Claude
  const isInternal = student?.practice_type === "internal";
  const system = `Eres un experto en diseño de programas formativos ${
    isInternal ? "internos en empresas" : "de prácticas curriculares"
  }. Devuelves SIEMPRE un JSON válido con esta forma exacta (sin markdown, sin comentarios, sin texto extra):

{
  "title": "string",
  "description": "string",
  "objectives": ["string", ...],
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "total_hours": number,
  "phases": [
    {
      "name": "string",
      "description": "string",
      "order_index": number,
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "due_date": "YYYY-MM-DD",
          "estimated_hours": number,
          "deliverable_required": boolean,
          "order_index": number
        }
      ]
    }
  ]
}

Reglas:
- Respeta las fechas start_date/end_date del plan actual salvo que el usuario indique lo contrario.
- Divide en 3-5 fases equilibradas.
- Cada fase tiene entre 3 y 6 tareas con fechas dentro de la fase.
- Los objetivos son 4-6 frases cortas.
- Devuelve SOLO el JSON, sin envolverlo en \`\`\`\`\`\` ni añadir prosa.`;

  const userPrompt = [
    `## Plan actual`,
    `Título: ${plan.title}`,
    `Descripción: ${plan.description ?? "—"}`,
    `Objetivos: ${(plan.objectives ?? []).join(" · ") || "—"}`,
    `Fechas: ${plan.start_date} → ${plan.end_date} (${plan.total_hours ?? 0} h)`,
    "",
    `## Persona`,
    student
      ? `${student.full_name} · ${student.practice_type}${
          isInternal
            ? ` · ${student.internal_training_type ?? "—"} · ${student.department ?? "—"} · ${student.position ?? "—"}`
            : ""
        }`
      : "Sin datos",
    "",
    `## Instrucciones adicionales del usuario`,
    context || "(sin instrucciones extra — mejora el plan actual)",
  ];

  if (attachments.length > 0) {
    userPrompt.push("", "## Documentos de referencia adjuntos");
    for (const a of attachments) {
      userPrompt.push(`### ${a.name}`, a.text.slice(0, 40_000));
    }
  }

  const llm = await claudeComplete({
    system,
    userMessage: userPrompt.join("\n"),
    maxTokens: 4000,
    temperature: 0.4,
  });

  if (!llm.ok) {
    return NextResponse.json(
      { error: `IA no disponible: ${llm.error}` },
      { status: 502 },
    );
  }

  // 4) Parsear JSON
  let generated: GeneratedPlan;
  try {
    // A veces Claude envuelve en fences aunque le digas que no.
    const raw = llm.text.trim();
    const clean = raw.startsWith("```")
      ? raw.replace(/^```[a-z]*\n?/, "").replace(/```\s*$/, "")
      : raw;
    generated = JSON.parse(clean) as GeneratedPlan;
  } catch (err) {
    console.error("[plan regenerate] JSON inválido:", err, llm.text.slice(0, 400));
    return NextResponse.json(
      { error: "La IA devolvió un plan con formato inválido. Reintenta." },
      { status: 502 },
    );
  }

  // 5) Reemplazar contenido del plan (mantenemos el mismo plan.id).
  await supabase
    .from("practice_plans")
    .update({
      title: generated.title,
      description: generated.description,
      objectives: generated.objectives,
      start_date: generated.start_date,
      end_date: generated.end_date,
      total_hours: generated.total_hours,
      status: "draft",
    })
    .eq("id", plan.id);

  // Borrar fases (cascade limpia tareas) y eventos de calendario del plan.
  await supabase.from("practice_phases").delete().eq("plan_id", plan.id);
  await supabase
    .from("calendar_events")
    .delete()
    .eq("student_id", plan.student_id ?? "")
    .in("event_type", ["task", "deliverable"]);

  // Recrear fases y tareas.
  for (const phase of generated.phases) {
    const { data: phaseRow } = await supabase
      .from("practice_phases")
      .insert({
        plan_id: plan.id,
        organization_id: plan.organization_id,
        name: phase.name,
        description: phase.description,
        order_index: phase.order_index,
        start_date: phase.start_date,
        end_date: phase.end_date,
      })
      .select("id")
      .single();
    if (!phaseRow) continue;
    if (phase.tasks.length > 0) {
      await supabase.from("practice_tasks").insert(
        phase.tasks.map((t) => ({
          plan_id: plan.id,
          phase_id: phaseRow.id,
          organization_id: plan.organization_id,
          student_id: plan.student_id,
          title: t.title,
          description: t.description,
          due_date: t.due_date,
          estimated_hours: t.estimated_hours,
          deliverable_required: t.deliverable_required,
          order_index: t.order_index,
        })),
      );
      await supabase.from("calendar_events").insert(
        phase.tasks.map((t) => ({
          organization_id: plan.organization_id,
          student_id: plan.student_id,
          title: t.title,
          description: t.description,
          event_type: t.deliverable_required ? "deliverable" : "task",
          event_date: t.due_date,
        })),
      );
    }
  }

  return NextResponse.json({
    ok: true,
    planId: plan.id,
    usage: llm.usage,
  });
}
