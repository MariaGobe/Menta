import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { deliverableSubmittedEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Dispara email al tutor de empresa cuando un alumno sube un entregable.
 * El propio alumno (autenticado) llama este endpoint tras hacer el insert.
 * RLS asegura que solo puede notificar entregables propios.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deliverableId } = (await request.json().catch(() => ({}))) as {
    deliverableId?: string;
  };
  if (!deliverableId) {
    return NextResponse.json({ error: "deliverableId requerido" }, { status: 400 });
  }

  // Cargamos contexto. RLS limita lo que puede ver el alumno → entregables suyos.
  const { data: d } = await supabase
    .from("deliverables")
    .select(
      "id, title, student_id, organization_id, practice_tasks(title), students(full_name, tutor_company_email, tutor_company_name), organizations(email, name)",
    )
    .eq("id", deliverableId)
    .single();

  if (!d) {
    return NextResponse.json({ error: "Entregable no encontrado" }, { status: 404 });
  }

  const student: any = d.students;
  const org: any = d.organizations;
  const task: any = d.practice_tasks;

  // Preferimos el email del tutor de empresa; fallback al email general de la organización.
  const to = student?.tutor_company_email || org?.email;
  if (!to) {
    return NextResponse.json({ ok: false, skipped: "no_recipient" });
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";

  const { subject, html } = deliverableSubmittedEmail({
    tutorName: student?.tutor_company_name ?? null,
    studentName: student?.full_name ?? "Un alumno",
    deliverableTitle: d.title,
    taskTitle: task?.title ?? null,
    studentDetailUrl: `${APP_URL}/alumnos/${d.student_id}`,
  });

  await sendEmail({ to, subject, html });
  return NextResponse.json({ ok: true });
}
