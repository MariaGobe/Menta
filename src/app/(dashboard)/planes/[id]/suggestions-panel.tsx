"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, MessageSquareText, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  suggestions: Suggestion[];
}

export function PlanSuggestionsPanel({ suggestions }: Props) {
  const router = useRouter();
  const t = useTranslations("PlanSuggestions");

  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, status: "accepted" | "rejected") {
    setBusyId(id);
    const res = await fetch(`/api/plans/suggestions/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes: notes[id] ?? "" }),
    });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Error");
      return;
    }
    setOpenId(null);
    router.refresh();
  }

  const pending = suggestions.filter((s) => s.status === "pending");
  const reviewed = suggestions.filter((s) => s.status !== "pending");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint-100">
          <MessageSquareText className="h-4 w-4 text-mint-700" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">{t("company_title")}</CardTitle>
          <CardDescription>{t("company_subtitle")}</CardDescription>
        </div>
        {pending.length > 0 && (
          <Badge variant="warning">{pending.length}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("company_empty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {[...pending, ...reviewed].map((s) => (
              <li key={s.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="font-medium">{s.title}</p>
                  {s.status === "pending" ? (
                    <Badge variant="warning">{t("status_pending")}</Badge>
                  ) : s.status === "accepted" ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {t("status_accepted")}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" /> {t("status_rejected")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("sent_at", { date: formatDate(s.created_at) })}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {s.description}
                </p>

                {s.review_notes && s.status !== "pending" && (
                  <div className="mt-3 rounded bg-muted/40 p-2 text-xs">
                    <p className="font-semibold">{t("review_notes_label")}</p>
                    <p className="mt-1 whitespace-pre-wrap">{s.review_notes}</p>
                  </div>
                )}

                {s.status === "pending" && (
                  <div className="mt-3 space-y-2">
                    {openId === s.id ? (
                      <>
                        <Textarea
                          value={notes[s.id] ?? ""}
                          onChange={(e) =>
                            setNotes((n) => ({ ...n, [s.id]: e.target.value }))
                          }
                          placeholder={t("review_notes_placeholder")}
                          rows={3}
                        />
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenId(null)}
                            disabled={busyId === s.id}
                          >
                            {t("cancel")}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => review(s.id, "rejected")}
                            disabled={busyId === s.id}
                          >
                            {busyId === s.id && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            <XCircle className="h-4 w-4" />
                            {t("reject")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => review(s.id, "accepted")}
                            disabled={busyId === s.id}
                          >
                            {busyId === s.id && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            <CheckCircle2 className="h-4 w-4" />
                            {t("accept")}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenId(s.id)}
                      >
                        {t("review_notes_label")}
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
