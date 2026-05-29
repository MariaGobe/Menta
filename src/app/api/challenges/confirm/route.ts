import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/challenges";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Callback de éxito tras pagar el reto adicional. Verifica el estado de la
 * sesión, marca el reto como `paid` y lo publica. Redirige a /retos/[id].
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const challengeId = url.searchParams.get("challenge");
  const sessionId = url.searchParams.get("session_id");

  if (!challengeId || !sessionId) {
    return NextResponse.redirect(new URL("/retos", request.url));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.redirect(
      new URL(`/retos/${challengeId}?payment=failed`, request.url),
    );
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, title, public_slug")
    .eq("id", challengeId)
    .single();

  if (challenge) {
    const slug =
      challenge.public_slug ||
      slugify(`${challenge.title}-${challenge.id.slice(0, 6)}`);

    await supabase
      .from("challenges")
      .update({
        payment_status: "paid",
        status: "published",
        published_at: new Date().toISOString(),
        public_slug: slug,
        stripe_payment_intent_id:
          (session.payment_intent as string | null) ?? null,
      })
      .eq("id", challengeId);
  }

  return NextResponse.redirect(
    new URL(`/retos/${challengeId}?published=1`, request.url),
  );
}
