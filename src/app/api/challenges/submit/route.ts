import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint público para que un aplicante envíe / actualice su trabajo.
 * Identifica la aplicación con su UUID (no enumerable). Si los datos coinciden,
 * permite guardar o actualizar la submission asociada.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    applicationId?: string;
    challengeId?: string;
    content?: string;
    externalUrl?: string;
    storagePath?: string;
    fileSize?: number;
    mimeType?: string;
    shareWithCompany?: boolean;
  };

  if (!body.applicationId || !body.challengeId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: application } = await supabase
    .from("challenge_applications")
    .select("id, challenge_id, status")
    .eq("id", body.applicationId)
    .eq("challenge_id", body.challengeId)
    .single();
  if (!application) {
    return NextResponse.json(
      { error: "Aplicación no encontrada" },
      { status: 404 },
    );
  }

  // Actualizar consentimiento de compartir
  if (typeof body.shareWithCompany === "boolean") {
    await supabase
      .from("challenge_applications")
      .update({ share_with_company: body.shareWithCompany })
      .eq("id", application.id);
  }

  // Si hay contenido, guardamos submission (sobrescribimos la anterior si existe)
  if (body.content || body.externalUrl || body.storagePath) {
    await supabase
      .from("challenge_submissions")
      .delete()
      .eq("application_id", application.id);

    await supabase.from("challenge_submissions").insert({
      application_id: application.id,
      challenge_id: application.challenge_id,
      content: body.content ?? null,
      storage_path: body.storagePath ?? null,
      file_size: body.fileSize ?? null,
      mime_type: body.mimeType ?? null,
      external_url: body.externalUrl ?? null,
    });

    await supabase
      .from("challenge_applications")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", application.id);
  }

  return NextResponse.json({ ok: true });
}
