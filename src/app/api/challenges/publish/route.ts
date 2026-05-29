import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/challenges";
import { checkChallengeAvailability } from "@/lib/challenges-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Intenta publicar un reto. Si la empresa ya gastó su reto gratis del año,
 * devolvemos `requiresPayment: true` y el frontend redirige al checkout.
 * Si el reto ya está marcado como `paid`, lo publicamos directamente.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId } = (await request.json().catch(() => ({}))) as {
    challengeId?: string;
  };
  if (!challengeId)
    return NextResponse.json({ error: "challengeId requerido" }, { status: 400 });

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (!challenge)
    return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });

  // Si ya está pagado o aún tiene reto gratis disponible, publicar
  const availability = await checkChallengeAvailability(challenge.organization_id);
  const canPublishForFree =
    challenge.payment_status === "free" && availability.hasFree;
  const alreadyPaid = challenge.payment_status === "paid";

  if (!canPublishForFree && !alreadyPaid) {
    return NextResponse.json({
      requiresPayment: true,
      priceEur: availability.priceEur,
    });
  }

  // Asegurar slug único
  let slug = challenge.public_slug;
  if (!slug) {
    slug = slugify(`${challenge.title}-${challenge.id.slice(0, 6)}`);
  }

  const { error: err } = await supabase
    .from("challenges")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      public_slug: slug,
    })
    .eq("id", challengeId);

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  return NextResponse.json({ ok: true, slug });
}
