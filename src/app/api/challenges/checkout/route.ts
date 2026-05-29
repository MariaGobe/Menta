import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { CHALLENGE_ADDON_PRICE_EUR } from "@/lib/challenges";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Crea una sesión de Checkout de Stripe en modo "payment" (pago único de 84€)
 * para desbloquear un reto adicional. Al volver del pago, /api/challenges/confirm
 * marca el reto como `paid` y lo publica.
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
    .select("id, title, organization_id, payment_status")
    .eq("id", challengeId)
    .single();
  if (!challenge)
    return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });

  const { data: org } = await supabase
    .from("organizations")
    .select("name, email, stripe_customer_id")
    .eq("id", challenge.organization_id)
    .single();

  let customerId = org?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org?.email ?? user.email,
      name: org?.name,
      metadata: { organization_id: challenge.organization_id },
    });
    customerId = customer.id;
    await supabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", challenge.organization_id);
  }

  // Marcamos como 'pending' para que el frontend sepa que está a la espera del pago
  await supabase
    .from("challenges")
    .update({ payment_status: "pending" })
    .eq("id", challengeId);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Reto Menta — ${challenge.title}`,
            description:
              "Publicación de un reto adicional en Menta. Incluye 1 mes activo.",
          },
          unit_amount: CHALLENGE_ADDON_PRICE_EUR * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/challenges/confirm?challenge=${challengeId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/retos/${challengeId}?canceled=1`,
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    metadata: {
      kind: "challenge_addon",
      challenge_id: challengeId,
      organization_id: challenge.organization_id,
    },
  };

  const session = await stripe.checkout.sessions.create(sessionParams);
  return NextResponse.json({ url: session.url });
}
