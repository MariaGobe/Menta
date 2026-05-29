import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint público para que un aplicante se registre a un reto.
 * No requiere login. Usa la service role internamente (con validación).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    challengeId?: string;
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    education?: string;
    shareWithCompany?: boolean;
  };

  if (!body.challengeId || !body.name || !body.email) {
    return NextResponse.json(
      { error: "Faltan datos: nombre, email y reto son obligatorios" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Comprobar que el reto está publicado
  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, organization_id, status, end_date, max_applicants, title, public_slug")
    .eq("id", body.challengeId)
    .single();

  if (!challenge || challenge.status !== "published") {
    return NextResponse.json(
      { error: "El reto no está abierto a aplicaciones" },
      { status: 400 },
    );
  }
  if (new Date(challenge.end_date) < new Date()) {
    return NextResponse.json(
      { error: "El reto ya ha terminado" },
      { status: 400 },
    );
  }

  // Verificar tope de aplicantes
  if (challenge.max_applicants) {
    const { count } = await supabase
      .from("challenge_applications")
      .select("*", { count: "exact", head: true })
      .eq("challenge_id", challenge.id);
    if ((count ?? 0) >= challenge.max_applicants) {
      return NextResponse.json(
        { error: "Se ha alcanzado el máximo de aplicantes" },
        { status: 400 },
      );
    }
  }

  const { data, error } = await supabase
    .from("challenge_applications")
    .insert({
      challenge_id: challenge.id,
      organization_id: challenge.organization_id,
      applicant_name: body.name,
      applicant_email: body.email,
      applicant_phone: body.phone ?? null,
      applicant_linkedin: body.linkedin ?? null,
      applicant_education: body.education ?? null,
      share_with_company: Boolean(body.shareWithCompany),
      status: "registered",
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") {
      return NextResponse.json(
        { error: "Ya hay una aplicación con este email para este reto" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    applicationId: data.id,
    workspaceUrl: `/r/${challenge.public_slug}/aplicacion/${data.id}`,
  });
}
