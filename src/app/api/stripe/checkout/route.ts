import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import {
  resolvePrices,
  type BillingCycle,
  type PlanId,
} from "@/lib/stripe/prices";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Crea sesión de Stripe Checkout para una suscripción.
 * Body: { planId: "base" | "pro", cycle: "monthly" | "yearly", extraStudents: number }
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    planId?: PlanId;
    cycle?: BillingCycle;
    extraStudents?: number;
  };

  const planId: PlanId = body.planId ?? "base";
  const cycle: BillingCycle = body.cycle ?? "yearly";

  if (planId === "custom") {
    return NextResponse.json(
      { error: "El plan Custom requiere contacto directo" },
      { status: 400 },
    );
  }

  const prices = resolvePrices(planId, cycle);
  if (!prices?.base) {
    return NextResponse.json(
      { error: "Price ID no configurado para esta combinación" },
      { status: 500 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  if (!profile?.organization_id) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, email, stripe_customer_id")
    .eq("id", profile.organization_id)
    .single();

  let customerId = org?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org?.email ?? user.email,
      name: org?.name,
      metadata: { organization_id: profile.organization_id },
    });
    customerId = customer.id;
    await supabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", profile.organization_id);
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: prices.base, quantity: 1 },
  ];
  const extras = Math.max(0, body.extraStudents ?? 0);
  if (extras > 0 && prices.extraStudent) {
    lineItems.push({ price: prices.extraStudent, quantity: extras });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/facturacion?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/facturacion?canceled=1`,
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    subscription_data: {
      metadata: {
        plan_id: planId,
        billing_cycle: cycle,
        organization_id: profile.organization_id,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
