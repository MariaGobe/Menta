import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { reversePrice } from "@/lib/stripe/prices";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase URL or service role key not set. Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createServiceClient(url, key);
}

const EXTRA_STUDENT_PRICE_IDS = () =>
  new Set(
    [
      process.env.STRIPE_PRICE_EXTRA_STUDENT,
      process.env.STRIPE_PRICE_EXTRA_STUDENT_YEARLY,
      process.env.STRIPE_PRICE_EXTRA_STUDENT_MONTHLY,
    ].filter(Boolean) as string[],
  );

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook error: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const supabase = getServiceClient();
  const extraIds = EXTRA_STUDENT_PRICE_IDS();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;

      // Cantidad de alumnos extra (suma cualquier price de "alumno extra")
      const extraQty =
        subscription.items.data
          .filter((i) => extraIds.has(i.price.id))
          .reduce((sum, i) => sum + (i.quantity ?? 0), 0) ?? 0;

      // Detectar el plan principal (no extra)
      const basePriceId = subscription.items.data.find(
        (i) => !extraIds.has(i.price.id),
      )?.price.id;
      const { planId, cycle } = reversePrice(basePriceId);

      // Metadata enviada en checkout tiene prioridad (más fiable)
      const metaPlan =
        (subscription.metadata?.plan_id as
          | "base"
          | "pro"
          | "custom"
          | undefined) ?? planId;
      const metaCycle =
        (subscription.metadata?.billing_cycle as
          | "monthly"
          | "yearly"
          | undefined) ?? cycle;

      await supabase
        .from("organizations")
        .update({
          subscription_status: subscription.status as
            | "active"
            | "trialing"
            | "past_due"
            | "canceled"
            | "incomplete",
          stripe_subscription_id: subscription.id,
          extra_students_count: extraQty,
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
          plan_id: metaPlan ?? null,
          billing_cycle: metaCycle ?? null,
        })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("organizations")
        .update({ subscription_status: "canceled" })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
