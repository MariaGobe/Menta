"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Props {
  challengeId: string;
  applicationId: string;
  organizationId: string;
  shareWithCompany: boolean;
  initialContent: string;
  initialExternalUrl: string;
  initialStoragePath: string | null;
}

export function SubmissionForm(props: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [content, setContent] = useState(props.initialContent);
  const [externalUrl, setExternalUrl] = useState(props.initialExternalUrl);
  const [shareWithCompany, setShareWithCompany] = useState(
    props.shareWithCompany,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedFile, setSavedFile] = useState<string | null>(
    props.initialStoragePath,
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    const path = `${props.organizationId}/challenges/${props.challengeId}/${props.applicationId}/${Date.now()}-${file.name}`;
    const { error: err } = await supabase.storage
      .from("documents")
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (err) {
      setError(err.message);
      return null;
    }
    setSavedFile(path);
    return { path, size: file.size, type: file.type };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    let upload: { path: string; size: number; type: string } | null = null;
    if (file && file.size > 0) {
      const r = await uploadFile(file);
      if (!r) {
        setSaving(false);
        return;
      }
      upload = r;
    }

    const res = await fetch("/api/challenges/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: props.applicationId,
        challengeId: props.challengeId,
        content: content || undefined,
        externalUrl: externalUrl || undefined,
        storagePath: upload?.path ?? savedFile ?? undefined,
        fileSize: upload?.size,
        mimeType: upload?.type,
        shareWithCompany,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Descripción de tu solución</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Explica tu enfoque, decisiones técnicas, qué problemas resolviste y cómo."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="external_url">Enlace externo (opcional)</Label>
        <Input
          id="external_url"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="https://github.com/... o https://figma.com/..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Adjuntar archivo (opcional)</Label>
        <Input id="file" name="file" type="file" />
        {savedFile && (
          <p className="text-xs text-mint-700">
            ✓ Archivo previo guardado. Sube otro para reemplazarlo.
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
        <input
          type="checkbox"
          checked={shareWithCompany}
          onChange={(e) => setShareWithCompany(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span>
          Quiero participar en procesos de selección y comparto mis datos con
          la empresa.
        </span>
      </label>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-mint-700">
            <Check className="h-4 w-4" /> Guardado
          </span>
        )}
        <Button type="submit" disabled={saving || uploading}>
          {saving || uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar mi entrega
        </Button>
      </div>
    </form>
  );
}
