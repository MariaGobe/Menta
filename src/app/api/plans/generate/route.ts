import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePlanFromTemplate } from "@/lib/plan-templates";
import type { PracticeType } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Genera un plan de prácticas a partir del contexto del alumno.
 *
 * MODO ACTUAL: usa plantillas estáticas adaptadas a las fechas del alumno.
 * MODO FUTURO: cuando se enchufe un LLM, este endpoint llamará al modelo
 * pasándole el contexto y la plantilla como ejemplo, y el LLM devolverá un
 * plan personalizado. La firma del endpoint no cambia.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    studentId?: string;
    customObjectives?: string[];
    companyContext?: string;
    projectTasks?: { title: string; hours?: number }[];
    useAi?: boolean;
  };

  if (!body.studentId) {
    return NextResponse.json({ error: "studentId requerido" }, { status: 400 });
  }

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, organization_id, full_name, practice_type, start_date, end_date, total_hours",
    )
    .eq("id", body.studentId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
  }
  if (!student.start_date || !student.end_date) {
    return NextResponse.json(
      { error: "El alumno debe tener fecha de inicio y fin" },
      { status: 400 },
    );
  }

  const plan = generatePlanFromTemplate({
    practiceType: student.practice_type as PracticeType,
    studentName: student.full_name,
    startDate: student.start_date,
    endDate: student.end_date,
    totalHours: student.total_hours ?? 400,
    customObjectives: body.customObjectives,
    companyContext: body.companyContext,
    projectTasks: body.projectTasks,
  });

  // TODO: si body.useAi === true y existe una clave de LLM configurada,
  // llamar al modelo para refinar el plan. De momento devolvemos la plantilla.

  return NextResponse.json({
    plan,
    studentId: student.id,
    organizationId: student.organization_id,
    practiceType: student.practice_type,
    aiUsed: false,
  });
}
