import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * DELETE /api/plans/[id]/delete
 * Elimina un plan y sus dependencias (fases/tareas por cascade). Limpia
 * también los eventos de calendario asociados a las tareas del plan.
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: plan } = await supabase
    .from("practice_plans")
    .select("id, student_id")
    .eq("id", params.id)
    .single();
  if (!plan) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Los eventos de calendario referencian student_id + tarea; borramos los
  // task/deliverable del alumno ligados al plan usando phase_id no aplica
  // porque calendar_events no tiene plan_id. Nos apoyamos en el borrado
  // manual de las tareas primero para saber los títulos si hiciera falta,
  // pero por ahora borramos por cascade y quitamos huérfanos por match.
  const { data: tasks } = await supabase
    .from("practice_tasks")
    .select("title, due_date")
    .eq("plan_id", params.id);

  const { error } = await supabase.from("practice_plans").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Limpieza best-effort de eventos que emparejen título+fecha.
  if (plan.student_id && tasks && tasks.length > 0) {
    for (const t of tasks) {
      await supabase
        .from("calendar_events")
        .delete()
        .eq("student_id", plan.student_id)
        .eq("title", t.title)
        .eq("event_date", t.due_date);
    }
  }

  return NextResponse.json({ ok: true });
}
