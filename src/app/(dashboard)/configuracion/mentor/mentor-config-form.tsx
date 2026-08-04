"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2, ShieldAlert } from "lucide-react";
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
  MENTOR_TONE_LABELS,
  type MentorConfig,
  type MentorTone,
} from "@/types/database";

interface Props {
  organizationId: string;
  config: MentorConfig | null;
}

export function MentorConfigForm({ organizationId, config }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("MentorConfigForm");
  const tWarn = useTranslations("MentorConfig");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tone, setTone] = useState<MentorTone>(
    (config?.tone as MentorTone) ?? "cercano",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const fd = new FormData(e.currentTarget);
    const resourcesRaw = fd.get("resources_text") as string;
    const resources = resourcesRaw
      ? resourcesRaw
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            const m = line.match(/^(.+?)\s+(https?:\/\/\S+)$/);
            if (m) return { label: m[1].trim(), url: m[2] };
            return { label: line, url: line };
          })
      : [];

    const payload = {
      organization_id: organizationId,
      company_description: (fd.get("company_description") as string) || null,
      industry: (fd.get("industry") as string) || null,
      tone,
      mentor_personality: (fd.get("mentor_personality") as string) || null,
      knowledge_base: (fd.get("knowledge_base") as string) || null,
      resources: resources.length > 0 ? resources : null,
      custom_instructions: (fd.get("custom_instructions") as string) || null,
    };

    await supabase.from("mentor_configs").upsert(payload, {
      onConflict: "organization_id",
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  const resourcesText = (config?.resources ?? [])
    .map((r) => (r.label === r.url ? r.url : `${r.label} ${r.url}`))
    .join("\n");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="company_description">{t("company_label")}</Label>
        <Textarea
          id="company_description"
          name="company_description"
          rows={3}
          defaultValue={config?.company_description ?? ""}
          placeholder={t("company_placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("company_hint")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">{t("industry_label")}</Label>
          <Input
            id="industry"
            name="industry"
            defaultValue={config?.industry ?? ""}
            placeholder={t("industry_placeholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tone">{t("tone_label")}</Label>
          <Select
            name="tone"
            value={tone}
            onValueChange={(v) => setTone(v as MentorTone)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MENTOR_TONE_LABELS) as MentorTone[]).map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {MENTOR_TONE_LABELS[tp]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mentor_personality">{t("personality_label")}</Label>
        <Textarea
          id="mentor_personality"
          name="mentor_personality"
          rows={2}
          defaultValue={config?.mentor_personality ?? ""}
          placeholder={t("personality_placeholder")}
        />
      </div>

      <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div>
          <p className="font-semibold text-amber-900">{tWarn("knowledge_warning_title")}</p>
          <p className="mt-1 text-amber-800">{tWarn("knowledge_warning")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="knowledge_base">{t("knowledge_label")}</Label>
        <Textarea
          id="knowledge_base"
          name="knowledge_base"
          rows={6}
          defaultValue={config?.knowledge_base ?? ""}
          placeholder={t("knowledge_placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("knowledge_hint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resources_text">{t("resources_label")}</Label>
        <Textarea
          id="resources_text"
          name="resources_text"
          rows={3}
          defaultValue={resourcesText}
          placeholder={t("resources_placeholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_instructions">{t("custom_label")}</Label>
        <Textarea
          id="custom_instructions"
          name="custom_instructions"
          rows={3}
          defaultValue={config?.custom_instructions ?? ""}
          placeholder={t("custom_placeholder")}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-mint-700">
            <Check className="h-4 w-4" /> {t("updated")}
          </span>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
