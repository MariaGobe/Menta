"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, Globe, Loader2, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Presentation {
  id: string;
  student_id: string;
  organization_id: string;
  title: string | null;
  summary: string | null;
  achievements: { title: string; detail?: string }[] | null;
  competencies: { name: string; level?: string }[] | null;
  is_public: boolean;
  public_slug: string | null;
}

interface Props {
  studentId: string;
  organizationId: string;
  initial: Presentation;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function PresentationEditor({
  studentId,
  organizationId,
  initial,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial.title ?? "");
  const [summary, setSummary] = useState(initial.summary ?? "");
  const [achievementsText, setAchievementsText] = useState(
    (initial.achievements ?? []).map((a) => a.title).join("\n"),
  );
  const [competenciesText, setCompetenciesText] = useState(
    (initial.competencies ?? []).map((c) => c.name).join("\n"),
  );
  const [isPublic, setIsPublic] = useState(initial.is_public);
  const [slug, setSlug] = useState(initial.public_slug ?? "");

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const achievements = achievementsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((title) => ({ title }));
    const competencies = competenciesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const finalSlug = isPublic ? slug || slugify(title || `${studentId.slice(0, 8)}`) : null;

    const payload = {
      student_id: studentId,
      organization_id: organizationId,
      title: title || null,
      summary: summary || null,
      achievements,
      competencies,
      is_public: isPublic,
      public_slug: finalSlug,
      published_at: isPublic ? new Date().toISOString() : null,
    };

    const { error: err } = await supabase
      .from("final_presentations")
      .upsert(payload, { onConflict: "student_id" });

    setSaving(false);
    if (err) {
      // Posible conflicto de slug único
      if (err.message.includes("public_slug")) {
        setError(
          "El enlace público ya está en uso. Cambia el final del slug e inténtalo de nuevo.",
        );
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

  const publicUrl =
    isPublic && slug && typeof window !== "undefined"
      ? `${window.location.origin}/p/${slug}`
      : null;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Mis prácticas como desarrolladora frontend en X"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Resumen</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          placeholder="Qué hiciste, qué aprendiste, qué destacarías..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="achievements">Logros principales (uno por línea)</Label>
        <Textarea
          id="achievements"
          value={achievementsText}
          onChange={(e) => setAchievementsText(e.target.value)}
          rows={5}
          placeholder={`Implementé el dashboard de admin\nDiseñé los flujos de onboarding\nParticipé en 3 sprints completos`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="competencies">Competencias desarrolladas (una por línea)</Label>
        <Textarea
          id="competencies"
          value={competenciesText}
          onChange={(e) => setCompetenciesText(e.target.value)}
          rows={4}
          placeholder={`React\nTrabajo en equipo\nGit y revisión de PRs\nComunicación`}
        />
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="is_public"
            checked={isPublic}
            onChange={(e) => {
              setIsPublic(e.target.checked);
              if (e.target.checked && !slug && title) {
                setSlug(slugify(title));
              }
            }}
            className="mt-1 h-4 w-4"
          />
          <label htmlFor="is_public" className="flex-1 cursor-pointer text-sm">
            <span className="flex items-center gap-2 font-medium">
              {isPublic ? (
                <>
                  <Globe className="h-4 w-4 text-mint-700" /> Pública
                  (portfolio)
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Privada
                </>
              )}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Si la haces pública, obtendrás un enlace que puedes compartir como
              portfolio profesional.
            </span>
          </label>
        </div>

        {isPublic && (
          <div className="mt-3 space-y-2">
            <Label htmlFor="slug">URL pública</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {typeof window !== "undefined" ? window.location.origin : ""}
                /p/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="tu-nombre-empresa-2026"
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

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-mint-700">
            <Check className="h-4 w-4" /> Guardado
          </span>
        )}
        {publicUrl && (
          <Button variant="outline" asChild>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Eye className="h-4 w-4" /> Ver pública
            </a>
          </Button>
        )}
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar presentación
        </Button>
      </div>
    </div>
  );
}
