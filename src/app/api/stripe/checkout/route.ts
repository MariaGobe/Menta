import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { extraStudents } = (await request.json().catch(() => ({}))) as {
    extraStudents?: number;
  };

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
    { price: process.env.STRIPE_PRICE_BASE!, quantity: 1 },
  ];
  if ((extraStudents ?? 0) > 0) {
    lineItems.push({
      price: process.env.STRIPE_PRICE_EXTRA_STUDENT!,
      quantity: extraStudents,
    });
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
  });

  return NextResponse.json({ url: session.url });
}
