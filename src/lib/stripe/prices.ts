/**
 * Mapeo plan + ciclo → Stripe price IDs.
 * Server-only (lee env vars secretas no-public).
 */
export type PlanId = "base" | "pro" | "custom";
export type BillingCycle = "monthly" | "yearly";

export interface ResolvedPrices {
  base: string;
  extraStudent: string;
}

export function resolvePrices(
  planId: PlanId,
  cycle: BillingCycle,
): ResolvedPrices | null {
  if (planId === "custom") return null; // Custom no pasa por checkout estándar

  const env = process.env;
  if (planId === "base" && cycle === "yearly") {
    return {
      base:
        env.STRIPE_PRICE_BASE_YEARLY ?? env.STRIPE_PRICE_BASE ?? "",
      extraStudent:
        env.STRIPE_PRICE_EXTRA_STUDENT_YEARLY ??
        env.STRIPE_PRICE_EXTRA_STUDENT ??
        "",
    };
  }
  if (planId === "base" && cycle === "monthly") {
    return {
      base: env.STRIPE_PRICE_BASE_MONTHLY ?? "",
      extraStudent: env.STRIPE_PRICE_EXTRA_STUDENT_MONTHLY ?? "",
    };
  }
  if (planId === "pro" && cycle === "yearly") {
    return {
      base: env.STRIPE_PRICE_PRO_YEARLY ?? "",
      extraStudent:
        env.STRIPE_PRICE_EXTRA_STUDENT_YEARLY ??
        env.STRIPE_PRICE_EXTRA_STUDENT ??
        "",
    };
  }
  if (planId === "pro" && cycle === "monthly") {
    return {
      base: env.STRIPE_PRICE_PRO_MONTHLY ?? "",
      extraStudent: env.STRIPE_PRICE_EXTRA_STUDENT_MONTHLY ?? "",
    };
  }
  return null;
}

/**
 * Inverso: dado un price_id de Stripe, devuelve (plan, cycle).
 * Se usa en el webhook para guardar el plan contratado.
 */
export function reversePrice(priceId: string | null | undefined): {
  planId: PlanId | null;
  cycle: BillingCycle | null;
} {
  if (!priceId) return { planId: null, cycle: null };
  const env = process.env;
  const map: Record<string, { planId: PlanId; cycle: BillingCycle }> = {};
  if (env.STRIPE_PRICE_BASE_YEARLY)
    map[env.STRIPE_PRICE_BASE_YEARLY] = { planId: "base", cycle: "yearly" };
  if (env.STRIPE_PRICE_BASE_MONTHLY)
    map[env.STRIPE_PRICE_BASE_MONTHLY] = { planId: "base", cycle: "monthly" };
  if (env.STRIPE_PRICE_PRO_YEARLY)
    map[env.STRIPE_PRICE_PRO_YEARLY] = { planId: "pro", cycle: "yearly" };
  if (env.STRIPE_PRICE_PRO_MONTHLY)
    map[env.STRIPE_PRICE_PRO_MONTHLY] = { planId: "pro", cycle: "monthly" };
  // Legacy
  if (env.STRIPE_PRICE_BASE)
    map[env.STRIPE_PRICE_BASE] = { planId: "base", cycle: "yearly" };

  const hit = map[priceId];
  return hit
    ? { planId: hit.planId, cycle: hit.cycle }
    : { planId: null, cycle: null };
}
