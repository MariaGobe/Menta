"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileStack, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  planId: string;
}

export function SaveTemplateButton({ planId }: Props) {
  const router = useRouter();
  const t = useTranslations("PlanEditor");
  const [saving, setSaving] = useState(false);

  async function save() {
    const name = window.prompt(t("save_as_template_prompt"));
    if (!name || !name.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/plans/${planId}/save-as-template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Error");
      return;
    }
    alert(t("save_as_template_success"));
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={save} disabled={saving}>
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileStack className="h-4 w-4" />}
      {t("save_as_template_button")}
    </Button>
  );
}
