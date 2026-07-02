import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/superadmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Action =
  | { kind: "extend_trial"; months: number }
  | { kind: "mark_active" }
  | { kind: "reset_trial_now" };

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSuperAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Action;

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

  let update: Record<string, unknown> = {};

  if (body.kind === "extend_trial") {
    const months = Math.max(1, Math.min(24, body.months || 12));
    // Extender N meses desde ahora
    const trialEnds = new Date();
    trialEnds.setMonth(trialEnds.getMonth() + months);
    update = {
      trial_ends_at: trialEnds.toISOString(),
      subscription_status: "trialing",
    };
  } else if (body.kind === "mark_active") {
    update = {
      subscription_status: "active",
    };
  } else if (body.kind === "reset_trial_now") {
    update = {
      trial_ends_at: new Date().toISOString(),
    };
  } else {
    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("organizations")
    .update(update)
    .eq("id", params.id)
    .select("id, name, subscription_status, trial_ends_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, organization: data });
}
