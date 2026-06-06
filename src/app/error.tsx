"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    // Log a la consola — en producción puedes mandarlo a Sentry o similar
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-mint-soft p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Logo size={40} />
        <span className="text-2xl font-bold">Menta</span>
      </Link>

      <div className="max-w-md rounded-2xl border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-7 w-7 text-amber-700" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground/60">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => reset()}>
            <RotateCcw className="h-4 w-4" /> {t("retry")}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">{t("back_home")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
