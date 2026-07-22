import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { planSuggestionReviewedEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * La empresa acepta o rechaza una sugerencia de cambio.
 * Envía email al alumno con la decisión (y comentario opcional).
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

  const { status, notes } = (await request.json().catch(() => ({}))) as {
    status?: "accepted" | "rejected";
    notes?: string;
  };
  if (status !== "accepted" && status !== "rejected") {
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  // Actualizar sugerencia
  const { data: updated, error } = await supabase
    .from("plan_change_suggestions")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes?.trim() || null,
    })
    .eq("id", params.id)
    .select("id, title, student_id, students(full_name, email)")
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo guardar la revisión" },
      { status: 500 },
    );
  }

  // Nombre del revisor
  const { data: reviewer } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const student: any = updated.students;
  if (student?.email) {
    const { subject, html } = planSuggestionReviewedEmail({
      studentName: student.full_name ?? "alumno",
      suggestionTitle: updated.title,
      status,
      reviewNotes: notes?.trim() || null,
      reviewerName: reviewer?.full_name ?? null,
    });
    sendEmail({ to: student.email, subject, html }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
