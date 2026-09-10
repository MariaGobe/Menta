import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Un owner/admin invita a otro miembro a su organización.
 * Envía un magic link con metadata {organization_id, invited_role, full_name}.
 * El trigger handle_new_user crea el profile con el rol correcto al confirmar.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, fullName, role } = (await request.json().catch(() => ({}))) as {
    email?: string;
    fullName?: string;
    role?: "owner" | "admin";
  };
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }
  const requestedRole = role === "owner" ? "owner" : "admin";

  // Cargar la org del usuario invitador + comprobar que es owner o admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id || (profile.role !== "owner" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json({ error: "No configurado" }, { status: 500 });
  }
  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";
  const redirectTo = `${APP_URL}/auth/establecer-contrasena`;

  const { error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
    data: {
      organization_id: profile.organization_id,
      invited_role: requestedRole,
      full_name: fullName?.trim() || email,
    },
    redirectTo,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
