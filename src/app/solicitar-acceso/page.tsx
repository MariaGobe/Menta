import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/logo";
import { AccessRequestForm } from "./request-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AccessRequest");
  return { title: t("title") };
}

export default async function SolicitarAccesoPage() {
  const t = await getTranslations("AccessRequest");
  return (
    <div className="min-h-screen gradient-mint-soft py-12">
      <div className="mx-auto max-w-2xl px-4">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <Logo size={40} />
          <span className="text-2xl font-bold">Menta</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <AccessRequestForm />
      </div>
    </div>
  );
}
