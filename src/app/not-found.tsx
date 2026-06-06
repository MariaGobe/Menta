import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-mint-soft p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Logo size={40} />
        <span className="text-2xl font-bold">Menta</span>
      </Link>

      <div className="max-w-md rounded-2xl border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint-100">
          <Compass className="h-7 w-7 text-mint-700" />
        </div>
        <p className="text-sm font-semibold text-mint-700">404</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">{t("back_home")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">{t("back_dashboard")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
