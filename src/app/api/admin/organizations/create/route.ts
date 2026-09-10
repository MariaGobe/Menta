import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/superadmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * (Super admin) Crea una organización nueva e invita al primer owner.
 * Uso típico: aprobar una solicitud de acceso de la beta.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    orgName,
    ownerEmail,
    ownerName,
    orgEmail,
    trialMonths,
  } = (await request.json().catch(() => ({}))) as {
    orgName?: string;
    ownerEmail?: string;
    ownerName?: string;
    orgEmail?: string;
    trialMonths?: number;
  };

  if (!orgName?.trim() || !ownerEmail?.trim()) {
    return NextResponse.json(
      { error: "Nombre de organización y email del owner requeridos" },
      { status: 400 },
    );
  }

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json({ error: "No configurado" }, { status: 500 });
  }
  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Crear la organización
  const months = Math.max(1, Math.min(24, trialMonths ?? 12));
  const trialEndsAt = new Date();
  trialEndsAt.setMonth(trialEndsAt.getMonth() + months);

  const { data: newOrg, error: orgErr } = await admin
    .from("organizations")
    .insert({
      name: orgName.trim(),
      email: orgEmail?.trim() || ownerEmail.trim(),
      subscription_status: "trialing",
      trial_ends_at: trialEndsAt.toISOString(),
      onboarded_at: new Date().toISOString(), // saltamos wizard, ya la configuran ellos si quieren
    })
    .select("id")
    .single();

  if (orgErr || !newOrg) {
    return NextResponse.json(
      { error: orgErr?.message ?? "No se pudo crear la organización" },
      { status: 500 },
    );
  }

  // 2) Invitar al owner
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";
  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
    ownerEmail.trim(),
    {
      data: {
        organization_id: newOrg.id,
        invited_role: "owner",
        full_name: ownerName?.trim() || ownerEmail.trim(),
      },
      redirectTo: `${APP_URL}/auth/establecer-contrasena`,
    },
  );

  if (inviteErr) {
    // rollback de la org
    await admin.from("organizations").delete().eq("id", newOrg.id);
    return NextResponse.json({ error: inviteErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, organizationId: newOrg.id });
}
