import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Clona un plan como plantilla. La plantilla queda vinculada a la organización
 * (sin alumno) y con is_template=true. Puede reutilizarse desde /plantillas.
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

  const { name } = (await request.json().catch(() => ({}))) as { name?: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const [{ data: plan }, { data: phases }, { data: tasks }] = await Promise.all([
    supabase.from("practice_plans").select("*").eq("id", params.id).single(),
    supabase
      .from("practice_phases")
      .select("*")
      .eq("plan_id", params.id)
      .order("order_index"),
    supabase
      .from("practice_tasks")
      .select("*")
      .eq("plan_id", params.id)
      .order("order_index"),
  ]);

  if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

  const { data: newPlan, error: planErr } = await supabase
    .from("practice_plans")
    .insert({
      organization_id: plan.organization_id,
      student_id: null,
      title: plan.title,
      description: plan.description,
      objectives: plan.objectives,
      status: "draft",
      is_template: true,
      template_name: name.trim(),
      total_hours: plan.total_hours,
    })
    .select("id, organization_id")
    .single();

  if (planErr || !newPlan) {
    return NextResponse.json(
      { error: planErr?.message ?? "No se pudo crear la plantilla" },
      { status: 500 },
    );
  }

  const phaseIdMap = new Map<string, string>();
  if (phases && phases.length > 0) {
    const newPhases = phases.map((p) => ({
      plan_id: newPlan.id,
      organization_id: newPlan.organization_id,
      name: p.name,
      description: p.description,
      order_index: p.order_index,
      start_date: null,
      end_date: null,
    }));
    const { data: insertedPhases } = await supabase
      .from("practice_phases")
      .insert(newPhases)
      .select("id, order_index");
    for (const oldPhase of phases) {
      const match = insertedPhases?.find((p) => p.order_index === oldPhase.order_index);
      if (match) phaseIdMap.set(oldPhase.id, match.id);
    }
  }

  if (tasks && tasks.length > 0) {
    const newTasks = tasks.map((tk) => ({
      plan_id: newPlan.id,
      phase_id: tk.phase_id ? phaseIdMap.get(tk.phase_id) ?? null : null,
      organization_id: newPlan.organization_id,
      student_id: null,
      title: tk.title,
      description: tk.description,
      due_date: null,
      status: "pending",
      estimated_hours: tk.estimated_hours,
      deliverable_required: tk.deliverable_required,
      deliverable_description: tk.deliverable_description,
      order_index: tk.order_index,
    }));
    await supabase.from("practice_tasks").insert(newTasks);
  }

  return NextResponse.json({ ok: true, id: newPlan.id });
}
