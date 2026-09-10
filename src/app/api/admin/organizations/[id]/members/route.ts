import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/superadmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * (Super admin) Invita a un nuevo miembro (owner/admin) a CUALQUIER organización.
 * A diferencia de /api/organization/invite-member, este endpoint no comprueba
 * que el llamante pertenezca a la organización — se salta esa validación por
 * ser super admin.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, fullName, role } = (await request.json().catch(() => ({}))) as {
    email?: string;
    fullName?: string;
    role?: "owner" | "admin";
  };
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }
  const requestedRole = role === "owner" ? "owner" : "admin";

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json({ error: "No configurado" }, { status: 500 });
  }
  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verificar que la org existe
  const { data: org } = await admin
    .from("organizations")
    .select("id")
    .eq("id", params.id)
    .single();
  if (!org) {
    return NextResponse.json(
      { error: "Organización no encontrada" },
      { status: 404 },
    );
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";
  const { error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
    data: {
      organization_id: params.id,
      invited_role: requestedRole,
      full_name: fullName?.trim() || email,
    },
    redirectTo: `${APP_URL}/auth/establecer-contrasena`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
