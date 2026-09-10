import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/superadmin";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/admin/users/[id]/reset-password
 * Genera un magic link de tipo "recovery" para ese usuario y se lo envía por
 * email vía Resend. Útil para reactivar cuentas de clientes cuando piden ayuda.
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();
  if (!caller || !isSuperAdmin(caller.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json({ error: "No configurado" }, { status: 500 });
  }
  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Cargar el user objetivo
  const { data: target, error: targetErr } =
    await admin.auth.admin.getUserById(params.id);
  if (targetErr || !target?.user?.email) {
    return NextResponse.json(
      { error: targetErr?.message ?? "Usuario no encontrado" },
      { status: 404 },
    );
  }

  const email = target.user.email;

  // Nombre desde profile (fallback al email)
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", params.id)
    .single();

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";

  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${APP_URL}/auth/establecer-contrasena`,
    },
  });

  if (linkErr || !link.properties?.action_link) {
    return NextResponse.json(
      { error: linkErr?.message ?? "No se pudo generar el enlace" },
      { status: 500 },
    );
  }

  const tpl = passwordResetEmail({
    userName: profile?.full_name ?? null,
    resetUrl: link.properties.action_link,
  });
  const sent = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });

  if (!sent.ok && !sent.skipped) {
    return NextResponse.json(
      { error: "No se pudo enviar el email", resetUrl: link.properties.action_link },
      { status: 500 },
    );
  }

  // Si Resend no está configurado (dev) devolvemos el link para que el admin
  // pueda copiarlo a mano.
  return NextResponse.json({
    ok: true,
    skippedEmail: sent.skipped ?? false,
    resetUrl: sent.skipped ? link.properties.action_link : undefined,
  });
}
