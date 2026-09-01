import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import {
  accessRequestInternalEmail,
  accessRequestConfirmationEmail,
} from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Formulario público de solicitud de acceso a Menta (fase de test controlado).
 * No requiere autenticación. Guarda la solicitud y avisa por email al equipo
 * + al solicitante.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    companyName?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactRole?: string;
    practiceTypes?: string[];
    estimatedStudents?: number;
    durationMonths?: number;
    startsWhen?: string;
    sector?: string;
    notes?: string;
  };

  if (!body.companyName?.trim() || !body.contactName?.trim() || !body.contactEmail?.trim()) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios: empresa, nombre y email" },
      { status: 400 },
    );
  }

  // Insertamos con service role para evitar cualquier issue de RLS con anon
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Servicio no configurado" },
      { status: 500 },
    );
  }
  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.from("access_requests").insert({
    company_name: body.companyName.trim(),
    contact_name: body.contactName.trim(),
    contact_email: body.contactEmail.trim().toLowerCase(),
    contact_phone: body.contactPhone?.trim() || null,
    contact_role: body.contactRole?.trim() || null,
    practice_types: body.practiceTypes ?? [],
    estimated_students: body.estimatedStudents ?? null,
    duration_months: body.durationMonths ?? null,
    starts_when: body.startsWhen?.trim() || null,
    sector: body.sector?.trim() || null,
    notes: body.notes?.trim() || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Emails — fire-and-forget
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";
  const teamEmail = process.env.EMAIL_TO_INTERNAL ?? "menta@gobesoluciones.com";

  const internal = accessRequestInternalEmail({
    companyName: body.companyName,
    contactName: body.contactName,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone ?? null,
    contactRole: body.contactRole ?? null,
    practiceTypes: body.practiceTypes ?? [],
    estimatedStudents: body.estimatedStudents ?? null,
    durationMonths: body.durationMonths ?? null,
    startsWhen: body.startsWhen ?? null,
    sector: body.sector ?? null,
    notes: body.notes ?? null,
    adminUrl: `${APP_URL}/admin/solicitudes`,
  });
  sendEmail({ to: teamEmail, subject: internal.subject, html: internal.html }).catch(() => {});

  const conf = accessRequestConfirmationEmail({
    contactName: body.contactName,
    companyName: body.companyName,
  });
  sendEmail({ to: body.contactEmail, subject: conf.subject, html: conf.html }).catch(() => {});

  return NextResponse.json({ ok: true });
}
