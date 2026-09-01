"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, Send, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanDefinition } from "@/lib/utils";

export function Pricing() {
  const t = useTranslations("Pricing");

  return (
    <section id="precios" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="warning" className="mb-4">
          {t("badge")}
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/solicitar-acceso">
              <Send className="h-4 w-4" />
              {t("request_cta")}
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            {t("already_account_prefix")}{" "}
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t("already_account_link")}
            </Link>
          </p>
        </div>
      </div>

      {/* Modalidades de uso — sin precios */}
      <div className="mx-auto mt-16 max-w-2xl text-center">
        <h3 className="text-xl font-semibold">{t("modes_title")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("modes_subtitle")}
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: PlanDefinition }) {
  const t = useTranslations("Pricing");
  const isCustom = plan.id === "custom";

  const taglineKey = `plan_${plan.id}_tagline` as
    | "plan_base_tagline"
    | "plan_pro_tagline"
    | "plan_custom_tagline";

  return (
    <Card
      className={
        plan.highlight
          ? "relative flex flex-col border-primary/40 bg-mint-50/30 p-8"
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
          <p className="text-sm font-medium text-muted-foreground">
            {t("custom_hint")}
          </p>
        ) : (
          <p className="text-sm font-medium">
            {t("included_students", { n: plan.includedStudents })}
          </p>
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
    </Card>
  );
}
