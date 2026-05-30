import Link from "next/link";
import { Linkedin, Trophy, Award, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function TalentSection() {
  const t = await getTranslations("Talent");
  const c = await getTranslations("Common");
  return (
    <section id="talento" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white px-3 py-1 text-xs font-medium text-mint-800">
          <Trophy className="h-3.5 w-3.5" />
          {t("badge")}
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          {t("title_a")} <span className="text-gradient-mint">{t("title_b")}</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
        <article className="rounded-2xl border bg-card p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-100 text-mint-700">
            <Linkedin className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{t("linkedin_title")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("linkedin_desc")}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <Bullet>{t("linkedin_b1")}</Bullet>
            <Bullet>{t("linkedin_b2")}</Bullet>
            <Bullet>{t("linkedin_b3")}</Bullet>
            <Bullet>{t("linkedin_b4")}</Bullet>
          </ul>
        </article>

        <article className="rounded-2xl border bg-card p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-100 text-mint-700">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{t("challenges_title")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("challenges_desc")}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <Bullet>{t("challenges_b1")}</Bullet>
            <Bullet>{t("challenges_b2")}</Bullet>
            <Bullet>{t("challenges_b3")}</Bullet>
            <Bullet>{t("challenges_b4")}</Bullet>
          </ul>
        </article>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/registro">
            {c("free_trial_cta")} <Sparkles className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/#precios">{c("see_pricing")}</Link>
        </Button>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-muted-foreground">
      <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}
