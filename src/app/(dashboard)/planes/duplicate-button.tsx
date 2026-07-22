"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  planId: string;
  size?: "sm" | "default";
  variant?: "outline" | "ghost";
}

export function DuplicatePlanButton({ planId, size = "sm", variant = "ghost" }: Props) {
  const router = useRouter();
  const t = useTranslations("Plans");
  const [loading, setLoading] = useState(false);

  async function duplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("duplicate_confirm"))) return;
    setLoading(true);
    const res = await fetch(`/api/plans/${planId}/duplicate`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Error");
      return;
    }
    const data = (await res.json()) as { id: string };
    router.push(`/planes/${data.id}`);
    router.refresh();
  }

  return (
    <Button variant={variant} size={size} onClick={duplicate} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {loading ? t("duplicating") : t("duplicate")}
    </Button>
  );
}
