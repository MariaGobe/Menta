import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface OnboardingPayload {
  company?: {
    name?: string;
    nif?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
  };
  mentor?: {
    company_description?: string | null;
    tone?: "cercano" | "profesional" | "formal" | "didactico" | null;
  };
  student?: {
    full_name?: string;
    email?: string;
    practice_type?: "fp" | "university" | "internal";
  } | null;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as OnboardingPayload;

  // Cargamos la org del usuario.
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "Sin organización" }, { status: 400 });
  }
  const orgId = profile.organization_id;

  // 1) Actualizar datos de la empresa
  if (body.company) {
    const { error } = await supabase
      .from("organizations")
      .update({
        ...(body.company.name ? { name: body.company.name } : {}),
        nif: body.company.nif ?? null,
        address: body.company.address ?? null,
        city: body.company.city ?? null,
        postal_code: body.company.postal_code ?? null,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", orgId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    await supabase
      .from("organizations")
      .update({ onboarded_at: new Date().toISOString() })
      .eq("id", orgId);
  }

  // 2) Upsert mentor_config si hay datos
  if (body.mentor && (body.mentor.company_description || body.mentor.tone)) {
    await supabase.from("mentor_configs").upsert(
      {
        organization_id: orgId,
        company_description: body.mentor.company_description ?? null,
        tone: body.mentor.tone ?? "cercano",
        updated_by: user.id,
      },
      { onConflict: "organization_id" },
    );
  }

  // 3) Crear primer alumno + invitación (opcional)
  let invitedStudentId: string | null = null;
  if (body.student?.full_name && body.student.email) {
    const { data: student, error: studentErr } = await supabase
      .from("students")
      .insert({
        organization_id: orgId,
        full_name: body.student.full_name,
        email: body.student.email,
        practice_type: body.student.practice_type ?? "fp",
        status: "active",
      })
      .select("id, full_name, email, organization_id")
      .single();

    if (!studentErr && student) {
      invitedStudentId = student.id;

      // Invitación inmediata (service role para no chocar con rate limits del cliente)
      const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-theta.vercel.app";

      if (serviceUrl && serviceKey) {
        const admin = createServiceClient(serviceUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        await admin.auth.admin
          .inviteUserByEmail(student.email!, {
            data: {
              student_id: student.id,
              organization_id: orgId,
              full_name: student.full_name,
            },
            redirectTo: `${APP_URL}/auth/establecer-contrasena`,
          })
          .catch(() => {});
      }
    }
  }

  return NextResponse.json({ ok: true, invitedStudentId });
}
