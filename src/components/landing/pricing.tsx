"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PLANS,
  annualSavings,
  formatCurrency,
  type BillingCycle,
  type PlanDefinition,
} from "@/lib/utils";

export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  return (
    <section id="precios" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="success" className="mb-4">
          Precios claros y sin sorpresas
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Empieza gratis. Elige el plan que encaje contigo.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          1 mes de prueba gratuita en cualquier plan. Sin permanencia. Cancela
          cuando quieras.
        </p>

        <div className="mt-8 inline-flex items-center rounded-full border bg-card p-1 text-sm">
          <button
            onClick={() => setCycle("monthly")}
            className={`rounded-full px-4 py-1.5 transition ${cycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Pago mensual
          </button>
          <button
            onClick={() => setCycle("yearly")}
            className={`relative rounded-full px-4 py-1.5 transition ${cycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Pago anual
            <span className="ml-2 rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-semibold text-mint-800">
              Ahorra hasta 10%
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} cycle={cycle} />
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Todos los precios sin IVA. Alumnos adicionales: 49€/año por encima de
        los incluidos en cada plan.
      </p>
    </section>
  );
}

function PlanCard({ plan, cycle }: { plan: PlanDefinition; cycle: BillingCycle }) {
  const isCustom = plan.id === "custom";
  const price =
    cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const savings = annualSavings(plan);

  return (
    <Card
      className={
        plan.highlight
          ? "relative flex flex-col border-primary/40 bg-mint-50/40 p-8 shadow-md"
          : "flex flex-col p-8"
      }
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>Más popular</Badge>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
      </div>

      <div className="mt-6">
        {isCustom ? (
          <div>
            <span className="text-4xl font-bold">A medida</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Hablemos para construir tu plan.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold">{formatCurrency(price ?? 0)}</span>
              <span className="text-muted-foreground">
                {cycle === "yearly" ? "/ año" : "/ mes"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              + IVA · hasta {plan.includedStudents} alumnos incluidos
            </p>
            {cycle === "yearly" && savings > 0 && (
              <p className="mt-2 text-xs font-medium text-mint-700">
                Ahorras {formatCurrency(savings)} al año
              </p>
            )}
          </>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="h-5 w-5 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isCustom ? (
        <Button className="mt-8" variant="outline" size="lg" asChild>
          <a href="mailto:menta@gobesoluciones.com">Contactar</a>
        </Button>
      ) : (
        <Button
          className="mt-8"
          size="lg"
          variant={plan.highlight ? "default" : "outline"}
          asChild
        >
          <Link href="/registro">Empezar 1 mes gratis</Link>
        </Button>
      )}
    </Card>
  );
}
