"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Linkedin,
  Loader2,
  Lock,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import {
  buildLinkedInPost,
  linkedInShareUrl,
  slugify,
} from "@/lib/milestones";
import { MILESTONE_TYPE_HINTS, type Milestone } from "@/types/database";

interface Props {
  milestone: Milestone;
  studentName: string | null;
  companyName: string | null;
}

export function MilestoneEditor({ milestone, studentName, companyName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("StudentMilestones");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description ?? "");
  const [tagsText, setTagsText] = useState(
    (milestone.tags ?? []).join(", "),
  );
  const [isPublished, setIsPublished] = useState(milestone.is_published);
  const [slug, setSlug] = useState(milestone.public_slug ?? "");

  const hint = MILESTONE_TYPE_HINTS[milestone.type];

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const finalSlug = isPublished
      ? slug || slugify(`${title}-${milestone.id.slice(0, 6)}`)
      : null;

    const { error: err } = await supabase
      .from("milestones")
      .update({
        title,
        description: description || null,
        tags: tags.length > 0 ? tags : null,
        is_published: isPublished,
        public_slug: finalSlug,
        published_at: isPublished
          ? milestone.published_at ?? new Date().toISOString()
          : null,
      })
      .eq("id", milestone.id);

    setSaving(false);
    if (err) {
      if (err.message.includes("public_slug")) {
        setError(t("slug_conflict"));
      } else {
        setError(err.message);
      }
      return;
    }
    if (finalSlug) setSlug(finalSlug);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  async function remove() {
    if (!confirm(t("delete_confirm"))) return;
    await supabase.from("milestones").delete().eq("id", milestone.id);
    router.push("/student/hitos");
    router.refresh();
  }

  const publicUrl =
    isPublished && slug && typeof window !== "undefined"
      ? `${window.location.origin}/h/${slug}`
      : null;

  const linkedInPost = publicUrl
    ? buildLinkedInPost({
        title,
        description,
        type: milestone.type,
        studentName,
        companyName,
        endorsement: milestone.company_endorsement,
        publicUrl,
        tags: tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
    : null;

  async function copyPost() {
    if (!linkedInPost) return;
    await navigator.clipboard.writeText(linkedInPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">{t("form_title_label")}</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("form_description_label")}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          placeholder={hint.placeholder}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">{t("form_tags_label")}</Label>
        <Input
          id="tags"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder={t("form_tags_placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("form_tags_hint")}</p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="publish"
            checked={isPublished}
            onChange={(e) => {
              setIsPublished(e.target.checked);
              if (e.target.checked && !slug && title) {
                setSlug(slugify(title));
              }
            }}
            className="mt-1 h-4 w-4"
          />
          <label htmlFor="publish" className="flex-1 cursor-pointer text-sm">
            <span className="flex items-center gap-2 font-medium">
              {isPublished ? (
                <>
                  <Globe className="h-4 w-4 text-mint-700" /> {t("published_label")}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> {t("draft_label")}
                </>
              )}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {t("public_hint")}
            </span>
          </label>
        </div>
        {isPublished && (
          <div className="mt-3 space-y-2">
            <Label htmlFor="slug">{t("public_url_label")}</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {typeof window !== "undefined" ? window.location.origin : ""}
                /h/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="mi-hito-2026"
                className="flex-1"
              />
            </div>
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> {publicUrl}
              </a>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={remove}
        >
          <Trash2 className="h-4 w-4" /> {t("delete_button")}
        </Button>
        <div className="flex items-center gap-3">
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
      </div>

      {publicUrl && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-[#0a66c2]" />
            <h3 className="text-base font-semibold">{t("share_linkedin")}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("share_hint")}</p>

          <div className="mt-4 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t("suggested_text_label")}
            </p>
            <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm">
              {linkedInPost}
            </pre>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <a
                href={linkedInShareUrl(publicUrl)}
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin className="h-4 w-4" /> {t("open_linkedin")}
              </a>
            </Button>
            <Button variant="outline" onClick={copyPost}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t("copied") : t("copy_text")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
