"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "es", labelKey: "spanish" as const },
  { code: "en", labelKey: "english" as const },
];

export function LanguageSwitcher({ variant = "navbar" }: { variant?: "navbar" | "compact" }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  async function pick(code: string) {
    setOpen(false);
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: code }),
    });
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent",
          variant === "navbar" ? "text-muted-foreground hover:text-foreground" : "",
          pending && "opacity-60",
        )}
        aria-label={t("language")}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-lg border bg-popover shadow-md"
          onMouseLeave={() => setOpen(false)}
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => pick(l.code)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent"
            >
              <span>{t(l.labelKey)}</span>
              {locale === l.code && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
