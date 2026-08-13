"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Props {
  planId: string;
  organizationId: string;
  nextOrderIndex: number;
}

export function AddPhaseButton({ planId, organizationId, nextOrderIndex }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("PlanEditor");
  const tTasks = useTranslations("PlanTasks");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("practice_phases").insert({
      plan_id: planId,
      organization_id: organizationId,
      name: name.trim(),
      description: description.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
      order_index: nextOrderIndex,
    });
    setSaving(false);
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {t("add_phase")}
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="space-y-2">
        <Label htmlFor="ph_name">{t("new_phase_name")}</Label>
        <Input
          id="ph_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ph_desc">{t("new_phase_description")}</Label>
        <Textarea
          id="ph_desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ph_start">{tTasks("form_due_label")}</Label>
          <Input
            id="ph_start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ph_end">{tTasks("form_due_label")}</Label>
          <Input
            id="ph_end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" /> {tTasks("cancel")}
        </Button>
        <Button size="sm" onClick={save} disabled={saving || !name.trim()}>
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {tTasks("create_task")}
        </Button>
      </div>
    </div>
  );
}
