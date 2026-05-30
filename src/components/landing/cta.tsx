import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function FinalCta() {
  const t = await getTranslations("FinalCta");
  const c = await getTranslations("Common");
  return (
    <section className="container py-20 md:py-28">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl gradient-mint p-10 text-center text-white md:p-16">
        <h2 className="text-3xl font-bold md:text-4xl">{t("title")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-base opacity-95 md:text-lg">{t("subtitle")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/registro">
              {c("free_trial_cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
            asChild
          >
            <Link href="/#precios">{c("see_pricing")}</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs opacity-80">{t("footnote")}</p>
      </div>
    </section>
  );
}
