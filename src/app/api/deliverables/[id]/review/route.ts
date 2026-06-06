import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { deliverableReviewedEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Marca un entregable como revisado, guarda el feedback y envía email al alumno.
 * Solo la empresa propietaria puede llamarlo (RLS lo asegura).
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

  const { feedback } = (await request.json().catch(() => ({}))) as {
    feedback?: string;
  };

  const { data: updated, error } = await supabase
    .from("deliverables")
    .update({
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      feedback: feedback?.trim() || null,
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

  const student: any = updated.students;

  // Nombre del tutor revisor (de profiles)
  const { data: reviewerProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Email al alumno
  if (student?.email) {
    const { subject, html } = deliverableReviewedEmail({
      studentName: student.full_name ?? "alumno",
      deliverableTitle: updated.title,
      feedback: feedback?.trim() || null,
      reviewerName: reviewerProfile?.full_name ?? null,
    });
    sendEmail({ to: student.email, subject, html }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
