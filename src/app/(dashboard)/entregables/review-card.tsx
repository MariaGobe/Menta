"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Download, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface Props {
  id: string;
  title: string;
  description: string | null;
  storage_path: string;
  submitted_at: string;
  reviewed_at: string | null;
  feedback: string | null;
  studentName: string;
  taskTitle: string | null;
}

export function DeliverableReviewCard(p: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("Deliverables");

  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState(p.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(p.storage_path, 60);
    setDownloading(false);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else if (error) {
      alert(error.message);
    }
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/deliverables/${p.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Error guardando");
      return;
    }
    setExpanded(false);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{p.title}</p>
            <p className="text-xs text-muted-foreground">
              {p.studentName} · {t("submitted_at")} {formatDate(p.submitted_at)}
              {p.taskTitle && ` · ${t("task_label")}: ${p.taskTitle}`}
            </p>
            {p.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {p.description}
              </p>
            )}
          </div>
          {p.reviewed_at && (
            <Badge variant="success" className="shrink-0">
              <Check className="mr-1 h-3 w-3" /> {t("reviewed_at")}{" "}
              {formatDate(p.reviewed_at)}
            </Badge>
          )}
        </div>

        {p.feedback && !expanded && (
          <div className="rounded-md bg-mint-50 p-3 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-mint-700">
              {t("feedback_label")}
            </p>
            <p className="whitespace-pre-wrap text-mint-900">{p.feedback}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={download} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {t("download")}
          </Button>
          {!p.reviewed_at && (
            <Button size="sm" onClick={() => setExpanded((x) => !x)}>
              <MessageSquare className="h-4 w-4" /> {t("mark_reviewed")}
            </Button>
          )}
          {p.reviewed_at && (
            <Button size="sm" variant="ghost" onClick={() => setExpanded((x) => !x)}>
              {expanded ? t("cancel") : t("feedback_label")}
            </Button>
          )}
        </div>

        {expanded && (
          <div className="space-y-3 rounded-md border bg-muted/30 p-3">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("feedback_placeholder")}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setExpanded(false)}>
                {t("cancel")}
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("save_review")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
