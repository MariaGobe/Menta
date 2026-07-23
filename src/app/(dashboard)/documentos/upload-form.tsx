"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_TYPE_LABELS, type DocumentType } from "@/types/database";
import { useTranslations } from "next-intl";

interface Props {
  students: { id: string; full_name: string }[];
}

export function UploadDocumentForm({ students }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const tShare = useTranslations("CompanyDocuments");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<DocumentType>("convenio");
  const [studentId, setStudentId] = useState<string>("");
  const [shareWithStudent, setShareWithStudent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      setError("Selecciona un archivo.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesión expirada. Vuelve a entrar.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      setError("No se pudo obtener tu organización.");
      setLoading(false);
      return;
    }

    const filePath = `${profile.organization_id}/${Date.now()}-${file.name}`;
    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (storageError) {
      setError(`Error subiendo archivo: ${storageError.message}`);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("documents").insert({
      organization_id: profile.organization_id,
      student_id: studentId || null,
      type,
      name: (formData.get("name") as string) || file.name,
      storage_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: profile.id,
      share_with_student: shareWithStudent,
    });

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student">Alumno</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger>
            <SelectValue placeholder="Documento general (sin alumno)" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo de documento</Label>
        <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((k) => (
              <SelectItem key={k} value={k}>
                {DOCUMENT_TYPE_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre (opcional)</Label>
        <Input id="name" name="name" placeholder="Convenio firmado" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Archivo</Label>
        <Input id="file" name="file" type="file" required />
      </div>

      <label className="flex items-start gap-3 rounded-md border bg-muted/30 p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={shareWithStudent}
          onChange={(e) => setShareWithStudent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-mint-600"
        />
        <div className="text-sm">
          <p className="font-medium">{tShare("share_with_student_label")}</p>
          <p className="text-xs text-muted-foreground">
            {tShare("share_with_student_hint")}
          </p>
        </div>
      </label>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Subir documento
      </Button>
    </form>
  );
}
