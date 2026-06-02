import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingPanel } from "./billing-panel";
import {
  formatDate,
  PLANS,
  type BillingCycle,
  type PlanId,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FacturacionPage() {
  const supabase = createClient();
  const t = await getTranslations("Facturacion");
  const { data: org } = await supabase
    .from("organizations")
    .select(
      "subscription_status, trial_ends_at, current_period_end, extra_students_count, stripe_customer_id, stripe_subscription_id, plan_id, billing_cycle",
    )
    .single();

  const { count: studentsCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  const statusVariant: Record<
    string,
    "success" | "warning" | "destructive" | "secondary"
  > = {
    trialing: "warning",
    active: "success",
    past_due: "destructive",
    canceled: "secondary",
    incomplete: "warning",
  };

  const statusKey: Record<string, string> = {
    trialing: "status_trialing",
    active: "status_active",
    past_due: "status_past_due",
    canceled: "status_canceled",
    incomplete: "status_incomplete",
  };

  const current = org?.subscription_status ?? "trialing";
  const isActive = current === "active";

  const planId = (org?.plan_id ?? "base") as PlanId;
  const cycle = (org?.billing_cycle ?? "yearly") as BillingCycle;
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const priceLabel =
    cycle === "yearly" ? `${plan.yearlyPrice}€` : `${plan.monthlyPrice}€`;
  const cycleLabel = cycle === "yearly" ? t("per_year") : t("per_month");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{t("status_title")}</CardTitle>
              <CardDescription>
                {isActive
                  ? t("next_renewal", { date: formatDate(org?.current_period_end) })
                  : current === "trialing"
                    ? t("trial_ends", { date: formatDate(org?.trial_ends_at) })
                    : t("no_subscription")}
              </CardDescription>
            </div>
            <Badge variant={statusVariant[current] ?? "secondary"}>
              {t(statusKey[current] as never)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t("plan_label", { name: plan.name })}</p>
              <p className="text-2xl font-bold">{priceLabel}</p>
              <p className="text-xs text-muted-foreground">
                {t("plan_hint", { cycle: cycleLabel, n: plan.includedStudents })}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t("extras_label")}</p>
              <p className="text-2xl font-bold">{org?.extra_students_count ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("extras_hint")}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t("current_students_label")}</p>
              <p className="text-2xl font-bold">{studentsCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("current_students_hint")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <BillingPanel
        hasSubscription={!!org?.stripe_subscription_id}
        currentExtras={org?.extra_students_count ?? 0}
        currentStudents={studentsCount ?? 0}
        currentPlanId={(org?.plan_id as PlanId | null) ?? null}
        currentCycle={(org?.billing_cycle as BillingCycle | null) ?? null}
      />
    </div>
  );
}
