"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PLANS,
  annualSavings,
  type BillingCycle,
  type PlanDefinition,
} from "@/lib/utils";

function fmtCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function Pricing() {
  const t = useTranslations("Pricing");
  const c = useTranslations("Common");
  const locale = useLocale();
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  return (
    <section id="precios" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="success" className="mb-4">
          {t("badge")}
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-8 inline-flex items-center rounded-full border bg-card p-1 text-sm">
          <button
            onClick={() => setCycle("monthly")}
            className={`rounded-full px-4 py-1.5 transition ${cycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t("monthly")}
          </button>
          <button
            onClick={() => setCycle("yearly")}
            className={`relative rounded-full px-4 py-1.5 transition ${cycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t("yearly")}
            <span className="ml-2 rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-semibold text-mint-800">
              {t("save_badge")}
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} cycle={cycle} locale={locale} />
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">{t("footnote")}</p>
    </section>
  );
}

function PlanCard({
  plan,
  cycle,
  locale,
}: {
  plan: PlanDefinition;
  cycle: BillingCycle;
  locale: string;
}) {
  const t = useTranslations("Pricing");
  const c = useTranslations("Common");
  const isCustom = plan.id === "custom";
  const price = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const savings = annualSavings(plan);

  const taglineKey = (`plan_${plan.id}_tagline`) as
    | "plan_base_tagline"
    | "plan_pro_tagline"
    | "plan_custom_tagline";

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
          <Badge>{t("most_popular")}</Badge>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t(taglineKey)}</p>
      </div>

      <div className="mt-6">
        {isCustom ? (
          <div>
            <span className="text-4xl font-bold">{t("custom_label")}</span>
            <p className="mt-1 text-xs text-muted-foreground">{t("custom_hint")}</p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold">{fmtCurrency(price ?? 0, locale)}</span>
              <span className="text-muted-foreground">
                {cycle === "yearly" ? t("per_year") : t("per_month")}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("vat_excluded", { n: plan.includedStudents })}
            </p>
            {cycle === "yearly" && savings > 0 && (
              <p className="mt-2 text-xs font-medium text-mint-700">
                {t("save_label", { amount: fmtCurrency(savings, locale) })}
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
          <a href="mailto:menta@gobesoluciones.com">{c("contact")}</a>
        </Button>
      ) : (
        <Button
          className="mt-8"
          size="lg"
          variant={plan.highlight ? "default" : "outline"}
          asChild
        >
          <Link href="/registro">{c("free_trial_cta")}</Link>
        </Button>
      )}
    </Card>
  );
}
