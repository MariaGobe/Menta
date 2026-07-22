import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Duplica un plan de prácticas: crea un nuevo plan (borrador) con las mismas
 * fases y tareas. No copia estados (todo queda en pending/draft). El nuevo
 * plan se puede asignar a otro alumno vía ?student=... o hereda el actual.
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

  const url = new URL(request.url);
  const targetStudentId = url.searchParams.get("student");

  // Cargar plan original + fases + tareas (RLS asegura misma org).
  const [{ data: plan }, { data: phases }, { data: tasks }] = await Promise.all([
    supabase.from("practice_plans").select("*").eq("id", params.id).single(),
    supabase
      .from("practice_phases")
      .select("*")
      .eq("plan_id", params.id)
      .order("order_index", { ascending: true }),
    supabase
      .from("practice_tasks")
      .select("*")
      .eq("plan_id", params.id)
      .order("order_index", { ascending: true }),
  ]);

  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }

  // 1) Crear nuevo plan (borrador, sin approved_at)
  const { data: newPlan, error: planErr } = await supabase
    .from("practice_plans")
    .insert({
      organization_id: plan.organization_id,
      student_id: targetStudentId ?? plan.student_id,
      title: `${plan.title} (copia)`,
      description: plan.description,
      objectives: plan.objectives,
      status: "draft",
      start_date: plan.start_date,
      end_date: plan.end_date,
      total_hours: plan.total_hours,
    })
    .select("id, organization_id, student_id")
    .single();

  if (planErr || !newPlan) {
    return NextResponse.json(
      { error: planErr?.message ?? "No se pudo crear el plan" },
      { status: 500 },
    );
  }

  // 2) Duplicar fases y guardar mapeo id_viejo → id_nuevo para tareas
  const phaseIdMap = new Map<string, string>();
  if (phases && phases.length > 0) {
    const newPhases = phases.map((p) => ({
      plan_id: newPlan.id,
      organization_id: newPlan.organization_id,
      name: p.name,
      description: p.description,
      order_index: p.order_index,
      start_date: p.start_date,
      end_date: p.end_date,
    }));
    const { data: insertedPhases, error: phasesErr } = await supabase
      .from("practice_phases")
      .insert(newPhases)
      .select("id, order_index");
    if (phasesErr) {
      // rollback
      await supabase.from("practice_plans").delete().eq("id", newPlan.id);
      return NextResponse.json({ error: phasesErr.message }, { status: 500 });
    }
    // Ordenar y mapear por order_index (asumimos únicos dentro del plan)
    for (const oldPhase of phases) {
      const match = insertedPhases?.find((p) => p.order_index === oldPhase.order_index);
      if (match) phaseIdMap.set(oldPhase.id, match.id);
    }
  }

  // 3) Duplicar tareas (reset de estado)
  if (tasks && tasks.length > 0) {
    const newTasks = tasks.map((t) => ({
      plan_id: newPlan.id,
      phase_id: t.phase_id ? phaseIdMap.get(t.phase_id) ?? null : null,
      organization_id: newPlan.organization_id,
      student_id: newPlan.student_id,
      title: t.title,
      description: t.description,
      due_date: null, // el nuevo plan puede tener otras fechas
      status: "pending",
      estimated_hours: t.estimated_hours,
      deliverable_required: t.deliverable_required,
      order_index: t.order_index,
    }));
    const { error: tasksErr } = await supabase.from("practice_tasks").insert(newTasks);
    if (tasksErr) {
      // no hacemos rollback duro; devolvemos el plan creado igualmente
      console.warn("[duplicate plan] tareas fallaron:", tasksErr.message);
    }
  }

  return NextResponse.json({ ok: true, id: newPlan.id });
}
