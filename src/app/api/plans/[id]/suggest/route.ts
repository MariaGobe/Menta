import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { planSuggestionCreatedEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * El alumno propone un cambio en su plan. Se crea el registro y se envía
 * un email al tutor de empresa (o al email general de la organización).
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

  const { title, description } = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
  };
  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json(
      { error: "Título y descripción obligatorios" },
      { status: 400 },
    );
  }

  // Cargar plan + datos del alumno (RLS asegura que solo el alumno del plan lo ve)
  const { data: plan } = await supabase
    .from("practice_plans")
    .select("id, title, organization_id, student_id, students(full_name, tutor_company_email, tutor_company_name), organizations(email)")
    .eq("id", params.id)
    .single();

  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }

  // Crear la sugerencia
  const { data: suggestion, error } = await supabase
    .from("plan_change_suggestions")
    .insert({
      plan_id: plan.id,
      student_id: plan.student_id,
      organization_id: plan.organization_id,
      suggested_by: user.id,
      title: title.trim(),
      description: description.trim(),
    })
    .select("id")
    .single();

  if (error || !suggestion) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo crear la sugerencia" },
      { status: 500 },
    );
  }

  // Notificar por email — fire-and-forget
  const student: any = plan.students;
  const org: any = plan.organizations;
  const to = student?.tutor_company_email || org?.email;
  if (to) {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";
    const { subject, html } = planSuggestionCreatedEmail({
      tutorName: student?.tutor_company_name ?? null,
      studentName: student?.full_name ?? "El alumno",
      suggestionTitle: title.trim(),
      suggestionDescription: description.trim(),
      planTitle: plan.title,
      studentDetailUrl: `${APP_URL}/planes/${plan.id}`,
    });
    sendEmail({ to, subject, html }).catch(() => {});
  }

  return NextResponse.json({ ok: true, id: suggestion.id });
}
