import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Forzar runtime dinámico para que no se ejecute en build time
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

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const extraQty =
        subscription.items.data.find(
          (i) => i.price.id === process.env.STRIPE_PRICE_EXTRA_STUDENT,
        )?.quantity ?? 0;

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
