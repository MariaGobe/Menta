import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/superadmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serviceClient() {
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) return null;
  return createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function requireSuperAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.email)) return null;
  return user;
}

/**
 * PATCH /api/admin/users/[id]
 * Body: { role?: "owner" | "admin" | "student", full_name?: string }
 * Cambia rol o nombre de cualquier profile.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = serviceClient();
  if (!admin)
    return NextResponse.json({ error: "No configurado" }, { status: 500 });

  const { role, full_name } = (await request.json().catch(() => ({}))) as {
    role?: "owner" | "admin" | "student";
    full_name?: string;
  };

  const update: Record<string, unknown> = {};
  if (role && ["owner", "admin", "student"].includes(role)) update.role = role;
  if (typeof full_name === "string") update.full_name = full_name.trim();

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("profiles")
    .update(update)
    .eq("id", params.id)
    .select("id, email, full_name, role, organization_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, profile: data });
}

/**
 * DELETE /api/admin/users/[id]
 * Elimina el usuario de Supabase Auth (cascada al profile).
 * IMPORTANTE: no permitimos que el super admin se borre a sí mismo.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (caller.id === params.id) {
    return NextResponse.json(
      { error: "No puedes eliminarte a ti mismo" },
      { status: 400 },
    );
  }

  const admin = serviceClient();
  if (!admin)
    return NextResponse.json({ error: "No configurado" }, { status: 500 });

  const { error } = await admin.auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
