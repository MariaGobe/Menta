import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GeneratedPlan } from "@/lib/plan-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Persiste un plan generado: crea el practice_plan + sus phases + tasks,
 * y los eventos del calendario asociados a cada tarea/hito.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    studentId?: string;
    organizationId?: string;
    plan?: GeneratedPlan;
  };

  if (!body.studentId || !body.organizationId || !body.plan) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const { plan } = body;

  // Si ya existe un plan para este alumno, lo borramos (cascade limpia fases/tareas)
  await supabase.from("practice_plans").delete().eq("student_id", body.studentId);

  // Crear plan
  const { data: created, error: planErr } = await supabase
    .from("practice_plans")
    .insert({
      organization_id: body.organizationId,
      student_id: body.studentId,
      title: plan.title,
      description: plan.description,
      objectives: plan.objectives,
      status: "draft",
      start_date: plan.start_date,
      end_date: plan.end_date,
      total_hours: plan.total_hours,
    })
    .select("id")
    .single();

  if (planErr || !created) {
    return NextResponse.json({ error: planErr?.message }, { status: 500 });
  }

  // Crear fases y tareas
  for (const phase of plan.phases) {
    const { data: phaseRow, error: phaseErr } = await supabase
      .from("practice_phases")
      .insert({
        plan_id: created.id,
        organization_id: body.organizationId,
        name: phase.name,
        description: phase.description,
        order_index: phase.order_index,
        start_date: phase.start_date,
        end_date: phase.end_date,
      })
      .select("id")
      .single();

    if (phaseErr || !phaseRow) continue;

    if (phase.tasks.length > 0) {
      await supabase.from("practice_tasks").insert(
        phase.tasks.map((t) => ({
          plan_id: created.id,
          phase_id: phaseRow.id,
          organization_id: body.organizationId,
          student_id: body.studentId,
          title: t.title,
          description: t.description,
          due_date: t.due_date,
          estimated_hours: t.estimated_hours,
          deliverable_required: t.deliverable_required,
          order_index: t.order_index,
        })),
      );

      // Eventos de calendario por cada tarea con due_date
      await supabase.from("calendar_events").insert(
        phase.tasks.map((t) => ({
          organization_id: body.organizationId,
          student_id: body.studentId,
          title: t.title,
          description: t.description,
          event_type: t.deliverable_required ? "deliverable" : "task",
          event_date: t.due_date,
        })),
      );
    }
  }

  return NextResponse.json({ ok: true, planId: created.id });
}
