"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Upload,
  FileText,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MentorDocument } from "@/types/database";

interface Props {
  documents: MentorDocument[];
}

const ACCEPT = ".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv";

export function MentorDocumentsPanel({ documents }: Props) {
  const router = useRouter();
  const t = useTranslations("MentorDocs");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/mentor/documents", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? t("upload_error"));
        break;
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(t("confirm_delete"))) return;
    setBusyId(id);
    const res = await fetch(`/api/mentor/documents/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(`Error: ${j.error ?? res.statusText}`);
      return;
    }
    router.refresh();
  }

  function statusBadge(status: MentorDocument["extraction_status"]) {
    if (status === "ready")
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" /> {t("status_ready")}
        </Badge>
      );
    if (status === "failed")
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" /> {t("status_failed")}
        </Badge>
      );
    if (status === "skipped")
      return (
        <Badge variant="secondary" className="gap-1">
          <FileWarning className="h-3 w-3" /> {t("status_skipped")}
        </Badge>
      );
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> {t("status_pending")}
      </Badge>
    );
  }

  function fmtSize(bytes: number | null) {
    if (bytes == null) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition ${
          dragOver ? "border-mint-500 bg-mint-50" : "border-muted bg-muted/20"
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{t("drop_title")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("drop_hint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? t("uploading") : t("choose_file")}
        </Button>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={d.name}>
                    {d.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtSize(d.size_bytes)}
                    {d.extraction_status === "failed" && d.extraction_error
                      ? ` · ${d.extraction_error.slice(0, 60)}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {statusBadge(d.extraction_status)}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(d.id)}
                  disabled={busyId === d.id}
                  className="text-destructive hover:bg-destructive/10"
                >
                  {busyId === d.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {documents.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {t("empty")}
        </p>
      )}
    </div>
  );
}
