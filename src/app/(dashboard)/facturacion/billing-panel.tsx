"use client";

import { useState } from "react";
import { Loader2, Minus, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PLANS,
  calculatePlanPrice,
  formatCurrency,
  type BillingCycle,
  type PlanId,
} from "@/lib/utils";

interface Props {
  hasSubscription: boolean;
  currentExtras: number;
  currentStudents: number;
  currentPlanId?: PlanId | null;
  currentCycle?: BillingCycle | null;
}

export function BillingPanel({
  hasSubscription,
  currentExtras,
  currentStudents,
  currentPlanId,
  currentCycle,
}: Props) {
  const [planId, setPlanId] = useState<PlanId>(currentPlanId ?? "base");
  const [cycle, setCycle] = useState<BillingCycle>(currentCycle ?? "yearly");
  const plan = PLANS.find((p) => p.id === planId)!;
  const [students, setStudents] = useState(
    Math.max(currentStudents, plan.includedStudents),
  );
  const [loading, setLoading] = useState(false);

  const breakdown = calculatePlanPrice({ planId, cycle, students });
  const extras = breakdown.extras;

  async function startCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, cycle, extraStudents: extras }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  async function openPortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  if (hasSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gestionar suscripción</CardTitle>
          <CardDescription>
            Cambia tu método de pago, descarga facturas o cancela tu plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openPortal} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Abrir portal de cliente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activar plan</CardTitle>
        <CardDescription>
          Elige plan, ciclo de facturación y número de alumnos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Selector de plan */}
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => {
            const isCustom = p.id === "custom";
            const selected = planId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={isCustom}
                onClick={() => setPlanId(p.id)}
                className={`relative rounded-lg border p-4 text-left transition ${
                  selected
                    ? "border-primary bg-mint-50 ring-2 ring-primary/30"
                    : isCustom
                      ? "border-dashed bg-muted/30 text-muted-foreground"
                      : "hover:border-mint-300"
                }`}
              >
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isCustom ? "Contacto directo" : `Hasta ${p.includedStudents} alumnos`}
                </p>
                {p.highlight && !isCustom && (
                  <Badge className="absolute right-2 top-2 text-[10px]">
                    Recomendado
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Toggle ciclo */}
        <div className="inline-flex items-center rounded-full border bg-card p-1 text-sm">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`rounded-full px-3 py-1 transition ${cycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={`rounded-full px-3 py-1 transition ${cycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Anual (ahorra ~10%)
          </button>
        </div>

        {/* Selector alumnos */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Alumnos previstos
              <span className="ml-1 text-xs text-muted-foreground">
                ({plan.includedStudents} incluidos)
              </span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setStudents((v) => Math.max(plan.includedStudents, v - 1))
                }
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-10 text-center text-lg font-semibold">
                {students}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setStudents((v) => v + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {plan.name} ({cycle === "yearly" ? "anual" : "mensual"})
              </span>
              <span>{formatCurrency(breakdown.basePrice ?? 0)}</span>
            </div>
            {extras > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  + {extras} alumno{extras > 1 ? "s" : ""} extra
                </span>
                <span>+ {formatCurrency(breakdown.extraCost)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total {cycle === "yearly" ? "/ año" : "/ mes"}</span>
              <span>
                {formatCurrency(breakdown.total ?? 0)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  + IVA
                </span>
              </span>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={startCheckout}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuar al pago seguro
        </Button>
        <p className="text-xs text-muted-foreground">
          Pago con Stripe. Podrás cambiar de plan o cancelar en cualquier
          momento desde el portal de cliente.
        </p>
      </CardContent>
    </Card>
  );
}
