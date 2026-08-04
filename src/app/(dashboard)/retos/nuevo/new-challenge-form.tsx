"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Props {
  organizationId: string;
}

function addDays(d: string, days: number) {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function NewChallengeForm({ organizationId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("ChallengeForm");
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 30));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const tags = ((fd.get("tags") as string) ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { data, error: err } = await supabase
      .from("challenges")
      .insert({
        organization_id: organizationId,
        title: fd.get("title") as string,
        short_description: (fd.get("short_description") as string) || null,
        problem_statement: (fd.get("problem_statement") as string) || null,
        requirements: (fd.get("requirements") as string) || null,
        evaluation_criteria:
          (fd.get("evaluation_criteria") as string) || null,
        deliverable_format: (fd.get("deliverable_format") as string) || null,
        tags: tags.length ? tags : null,
        start_date: startDate,
        end_date: endDate,
        max_applicants: fd.get("max_applicants")
          ? Number(fd.get("max_applicants"))
          : null,
        status: "draft",
      })
      .select("id")
      .single();

    setLoading(false);
    if (err || !data) {
      setError(err?.message ?? t("error_save"));
      return;
    }
    router.push(`/retos/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">{t("title_label")}</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder={t("title_placeholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="short_description">{t("short_desc_label")}</Label>
        <Textarea
          id="short_description"
          name="short_description"
          rows={2}
          maxLength={280}
          placeholder={t("short_desc_hint")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem_statement">{t("brief_label")}</Label>
        <Textarea
          id="problem_statement"
          name="problem_statement"
          rows={5}
          placeholder={t("brief_placeholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">{t("requirements_label")}</Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={3}
          placeholder={t("requirements_placeholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="evaluation_criteria">{t("evaluation_label")}</Label>
        <Textarea
          id="evaluation_criteria"
          name="evaluation_criteria"
          rows={3}
          placeholder={t("evaluation_placeholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliverable_format">{t("format_label")}</Label>
        <Input
          id="deliverable_format"
          name="deliverable_format"
          placeholder={t("format_placeholder")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="start_date">{t("start_date_label")}</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setEndDate(addDays(e.target.value, 30));
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">{t("end_date_label")}</Label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t("duration_hint")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_applicants">{t("max_applicants_label")}</Label>
          <Input
            id="max_applicants"
            name="max_applicants"
            type="number"
            min="1"
            placeholder={t("max_applicants_placeholder")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">{t("tags_label")}</Label>
        <Input
          id="tags"
          name="tags"
          placeholder={t("tags_placeholder")}
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("save_draft")}
        </Button>
      </div>
    </form>
  );
}
