"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Loader2,
  Trash2,
  Upload,
  X,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  planId: string;
  planTitle: string;
}

const ACCEPT = ".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv";
const MAX_FILES = 3;

export function PlanAiActions({ planId, planTitle }: Props) {
  const router = useRouter();
  const t = useTranslations("PlanAi");
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState<null | "regenerate" | "delete">(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list).slice(0, MAX_FILES - files.length);
    setFiles((f) => [...f, ...arr].slice(0, MAX_FILES));
  }

  async function regenerate() {
    setBusy("regenerate");
    setError(null);
    const fd = new FormData();
    fd.append("context", context);
    for (const f of files) fd.append("files", f);
    const res = await fetch(`/api/plans/${planId}/regenerate`, {
      method: "POST",
      body: fd,
    });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? t("error"));
      return;
    }
    setDone(true);
    setContext("");
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
    setTimeout(() => {
      setOpen(false);
      setDone(false);
      router.refresh();
    }, 1200);
  }

  async function deletePlan() {
    if (!confirm(t("confirm_delete", { title: planTitle }))) return;
    setBusy("delete");
    setError(null);
    const res = await fetch(`/api/plans/${planId}/delete`, { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? t("error"));
      return;
    }
    router.push("/planes");
    router.refresh();
  }

  if (!open) {
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Sparkles className="h-4 w-4" />
          {t("regenerate_button")}
        </Button>
        <Button
          variant="outline"
          onClick={deletePlan}
          disabled={busy === "delete"}
          className="text-destructive hover:bg-destructive/10"
        >
          {busy === "delete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {t("delete_button")}
        </Button>
      </>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{t("dialog_title")}</CardTitle>
          <CardDescription>{t("dialog_subtitle")}</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
          disabled={!!busy}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="plan_ai_context">{t("context_label")}</Label>
          <Textarea
            id="plan_ai_context"
            rows={5}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={t("context_placeholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("files_label")}</Label>
          <p className="text-xs text-muted-foreground">{t("files_hint")}</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={files.length >= MAX_FILES}
            >
              <Upload className="h-4 w-4" />
              {t("add_file")}
            </Button>
            {files.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="max-w-[180px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
        )}
        {done && (
          <p className="flex items-center gap-2 rounded-md bg-mint-50 p-2 text-sm text-mint-800">
            <CheckCircle2 className="h-4 w-4" /> {t("done")}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={!!busy}
          >
            {t("cancel")}
          </Button>
          <Button onClick={regenerate} disabled={!!busy}>
            {busy === "regenerate" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {busy === "regenerate" ? t("regenerating") : t("regenerate_submit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
