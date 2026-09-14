import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * DELETE /api/mentor/documents/[id]
 * Borra el archivo del bucket y el registro en DB.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const { data: doc } = await admin
    .from("mentor_documents")
    .select("id, organization_id, storage_path")
    .eq("id", params.id)
    .single();
  if (!doc || doc.organization_id !== profile.organization_id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await admin.storage.from("mentor-docs").remove([doc.storage_path]);
  const { error } = await admin.from("mentor_documents").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
