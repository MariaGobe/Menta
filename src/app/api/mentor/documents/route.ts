import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { claudeExtractText } from "@/lib/anthropic";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Permitir hasta 20MB por archivo. Vercel Serverless suele aceptar 4.5MB en body
// por defecto; los usuarios con archivos más grandes deberán reducirlos.
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
]);

/**
 * POST /api/mentor/documents
 * multipart/form-data con { file: File }
 * Sube el archivo al bucket mentor-docs, crea el registro y extrae texto.
 */
export async function POST(request: Request) {
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

  const form = await request.formData().catch(() => null);
  const file = form?.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      { error: `Tipo no soportado (${mime}). Usa PDF, TXT, MD o CSV.` },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Archivo demasiado grande (máximo ${MAX_BYTES / 1024 / 1024} MB)` },
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^\w.\-()]+/g, "_").slice(0, 120);
  const storagePath = `${profile.organization_id}/${Date.now()}-${safeName}`;

  // 1) Subir al bucket
  const { error: upErr } = await admin.storage
    .from("mentor-docs")
    .upload(storagePath, buffer, { contentType: mime, upsert: false });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // 2) Extraer texto
  let extracted: string | null = null;
  let status: "ready" | "failed" | "skipped" = "skipped";
  let error: string | null = null;

  if (mime === "application/pdf") {
    const res = await claudeExtractText({
      base64: buffer.toString("base64"),
      mediaType: mime,
      filename: file.name,
    });
    if (res.ok) {
      extracted = res.text;
      status = "ready";
    } else {
      status = res.skipped ? "skipped" : "failed";
      error = res.error;
    }
  } else if (mime.startsWith("text/")) {
    extracted = buffer.toString("utf8").slice(0, 200_000); // límite defensivo
    status = "ready";
  }

  // 3) Insertar registro
  const { data: doc, error: insErr } = await admin
    .from("mentor_documents")
    .insert({
      organization_id: profile.organization_id,
      name: file.name,
      storage_path: storagePath,
      mime_type: mime,
      size_bytes: file.size,
      extracted_text: extracted,
      extraction_status: status,
      extraction_error: error,
      created_by: user.id,
    })
    .select("id, name, extraction_status")
    .single();

  if (insErr) {
    // rollback storage
    await admin.storage.from("mentor-docs").remove([storagePath]);
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, document: doc });
}
