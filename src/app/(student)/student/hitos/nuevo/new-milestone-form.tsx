"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  MILESTONE_TYPE_LABELS,
  MILESTONE_TYPE_HINTS,
  type MilestoneType,
} from "@/types/database";

interface Props {
  studentId: string;
  organizationId: string;
}

const TYPES_FOR_STUDENT: MilestoneType[] = [
  "problem_solved",
  "project_completed",
  "practice_completed",
  "custom",
];

export function NewMilestoneForm({ studentId, organizationId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("StudentMilestones");
  const [type, setType] = useState<MilestoneType>("problem_solved");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const tagsRaw = (fd.get("tags") as string) || "";
    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { data: created, error: err } = await supabase
      .from("milestones")
      .insert({
        organization_id: organizationId,
        student_id: studentId,
        type,
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || null,
        tags: tags.length > 0 ? tags : null,
      })
      .select("id")
      .single();

    setLoading(false);
    if (err || !created) {
      setError(err?.message ?? t("form_error_save"));
      return;
    }
    router.push(`/student/hitos/${created.id}`);
    router.refresh();
  }

  const hint = MILESTONE_TYPE_HINTS[type];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="type">{t("form_type_label")}</Label>
        <Select value={type} onValueChange={(v) => setType(v as MilestoneType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES_FOR_STUDENT.map((tp) => (
              <SelectItem key={tp} value={tp}>
                {MILESTONE_TYPE_LABELS[tp]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">{t("form_title_label")}</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={140}
          placeholder={t("form_title_placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("form_title_hint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("form_description_label")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={8}
          placeholder={hint.placeholder}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">{t("form_tags_label")}</Label>
        <Input
          id="tags"
          name="tags"
          placeholder={t("form_tags_placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("form_tags_hint")}</p>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("form_save_draft")}
        </Button>
      </div>
    </form>
  );
}
