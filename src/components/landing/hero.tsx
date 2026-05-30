import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export async function Hero() {
  const t = await getTranslations("Hero");
  const c = await getTranslations("Common");
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-mint-soft" />
      <div
        className="absolute inset-x-0 top-0 -z-0 h-[420px] opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, hsl(162 30% 70%) 0%, transparent 40%), radial-gradient(circle at 70% 60%, hsl(178 30% 70%) 0%, transparent 40%)",
        }}
      />
      <div className="container relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <Badge variant="success" className="mb-6">
            {t("badge")}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {t("title_a")} <span className="text-gradient-mint">{t("title_b")}</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            {t("subtitle")}{" "}
            <span className="font-medium text-foreground">{t("subtitle_emphasis")}</span>
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/registro">
                {c("free_trial_cta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#como-funciona">{c("how_it_works")}</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {c("no_card")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {c("ready_in_minutes")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {c("cancel_anytime")}
            </span>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 md:grid-cols-3">
          <Stat number="80%" label={t("stat_time")} />
          <Stat number="24/7" label={t("stat_247")} />
          <Stat number="1 click" label={t("stat_reports")} />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border bg-card/80 p-5 text-center backdrop-blur">
      <p className="text-3xl font-bold text-gradient-mint">{number}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
