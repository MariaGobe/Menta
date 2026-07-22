"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, MessageSquarePlus, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "rejected";
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

interface Props {
  planId: string;
  initialSuggestions: Suggestion[];
}

export function SuggestChangeCard({ planId, initialSuggestions }: Props) {
  const router = useRouter();
  const t = useTranslations("PlanSuggestions");

  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [openForm, setOpenForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/plans/${planId}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Error enviando sugerencia");
      return;
    }
    // Optimistic: reset form + refresh
    setTitle("");
    setDescription("");
    setOpenForm(false);
    router.refresh();
  }

  function statusBadge(s: Suggestion["status"]) {
    if (s === "accepted")
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" /> {t("status_accepted")}
        </Badge>
      );
    if (s === "rejected")
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" /> {t("status_rejected")}
        </Badge>
      );
    return (
      <Badge variant="warning" className="gap-1">
        <Clock className="h-3 w-3" /> {t("status_pending")}
      </Badge>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </div>
        {!openForm && (
          <Button size="sm" onClick={() => setOpenForm(true)}>
            <MessageSquarePlus className="h-4 w-4" />
            {t("new_button")}
          </Button>
        )}
      </CardHeader>

      {openForm && (
        <CardContent>
          <form onSubmit={submit} className="space-y-3 rounded-md border bg-muted/30 p-4">
            <div className="space-y-2">
              <Label htmlFor="s_title">{t("field_title")}</Label>
              <Input
                id="s_title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("field_title_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s_desc">{t("field_description")}</Label>
              <Textarea
                id="s_desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("field_description_placeholder")}
                rows={4}
                required
              />
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenForm(false)}
                disabled={saving}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" size="sm" disabled={saving || !title.trim() || !description.trim()}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      )}

      {suggestions.length > 0 && (
        <CardContent>
          <div className="border-t pt-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("my_suggestions_title")}
            </h4>
            <ul className="space-y-3">
              {suggestions.map((s) => (
                <li key={s.id} className="rounded-md border p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="font-medium">{s.title}</p>
                    {statusBadge(s.status)}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {s.description}
                  </p>
                  {s.reviewed_at && s.status !== "pending" && (
                    <div className="mt-3 rounded bg-muted/40 p-2 text-xs">
                      <p className="text-muted-foreground">
                        {t("reviewed_at", { date: formatDate(s.reviewed_at) })}
                      </p>
                      {s.review_notes && (
                        <>
                          <p className="mt-2 font-semibold">{t("review_notes_label")}</p>
                          <p className="mt-1 whitespace-pre-wrap">{s.review_notes}</p>
                        </>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
