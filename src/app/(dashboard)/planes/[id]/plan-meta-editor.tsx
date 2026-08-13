"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface Props {
  planId: string;
  initial: {
    title: string;
    description: string | null;
    objectives: string[] | null;
    start_date: string | null;
    end_date: string | null;
    total_hours: number | null;
  };
}

export function PlanMetaEditor({ planId, initial }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("PlanEditor");
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [objectivesText, setObjectivesText] = useState(
    (initial.objectives ?? []).join("\n"),
  );
  const [startDate, setStartDate] = useState(initial.start_date ?? "");
  const [endDate, setEndDate] = useState(initial.end_date ?? "");
  const [totalHours, setTotalHours] = useState<number>(initial.total_hours ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const objectives = objectivesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    await supabase
      .from("practice_plans")
      .update({
        title,
        description: description || null,
        objectives: objectives.length > 0 ? objectives : null,
        start_date: startDate || null,
        end_date: endDate || null,
        total_hours: totalHours || null,
      })
      .eq("id", planId);
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("edit_title")}</CardTitle>
        <CardDescription>{t("edit_hint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="p_title">{t("field_title")}</Label>
          <Input
            id="p_title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p_desc">{t("field_description")}</Label>
          <Textarea
            id="p_desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p_obj">{t("field_objectives")}</Label>
          <Textarea
            id="p_obj"
            rows={5}
            value={objectivesText}
            onChange={(e) => setObjectivesText(e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="p_start">{t("field_start")}</Label>
            <Input
              id="p_start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p_end">{t("field_end")}</Label>
            <Input
              id="p_end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p_hours">{t("field_hours")}</Label>
            <Input
              id="p_hours"
              type="number"
              min={0}
              value={totalHours}
              onChange={(e) => setTotalHours(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-mint-700">
              <Check className="h-4 w-4" /> {t("saved")}
            </span>
          )}
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
