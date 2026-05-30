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
  const { data: org } = await supabase
    .from("organizations")
    .select(
      "subscription_status, trial_ends_at, current_period_end, extra_students_count, stripe_customer_id, stripe_subscription_id, plan_id, billing_cycle",
    )
    .single();

  const { count: studentsCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  const statusLabel: Record<
    string,
    { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
  > = {
    trialing: { label: "Prueba gratuita", variant: "warning" },
    active: { label: "Activa", variant: "success" },
    past_due: { label: "Pago pendiente", variant: "destructive" },
    canceled: { label: "Cancelada", variant: "secondary" },
    incomplete: { label: "Incompleta", variant: "warning" },
  };

  const current = org?.subscription_status ?? "trialing";
  const isActive = current === "active";

  const planId = (org?.plan_id ?? "base") as PlanId;
  const cycle = (org?.billing_cycle ?? "yearly") as BillingCycle;
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const priceLabel =
    cycle === "yearly"
      ? `${plan.yearlyPrice}€`
      : `${plan.monthlyPrice}€`;
  const cycleLabel = cycle === "yearly" ? "/ año" : "/ mes";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
        <p className="text-muted-foreground">
          Gestiona tu suscripción, datos fiscales y facturas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Estado de la suscripción</CardTitle>
              <CardDescription>
                {isActive
                  ? `Próxima renovación: ${formatDate(org?.current_period_end)}`
                  : current === "trialing"
                    ? `Tu prueba termina el ${formatDate(org?.trial_ends_at)}`
                    : "Sin suscripción activa"}
              </CardDescription>
            </div>
            <Badge variant={statusLabel[current]?.variant ?? "secondary"}>
              {statusLabel[current]?.label ?? current}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Plan {plan.name}</p>
              <p className="text-2xl font-bold">{priceLabel}</p>
              <p className="text-xs text-muted-foreground">
                + IVA {cycleLabel}, hasta {plan.includedStudents} alumnos
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Alumnos extra contratados</p>
              <p className="text-2xl font-bold">{org?.extra_students_count ?? 0}</p>
              <p className="text-xs text-muted-foreground">
                49€ + IVA / año cada uno
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Alumnos actuales</p>
              <p className="text-2xl font-bold">{studentsCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Registrados en la plataforma</p>
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
