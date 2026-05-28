"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Props {
  studentId: string;
  organizationId: string;
}

export function CompanyRecommendationButton({ studentId, organizationId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string).trim();
    const endorsement = (fd.get("endorsement") as string).trim();

    if (!endorsement) {
      setError("Escribe el texto de la recomendación");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error: err } = await supabase.from("milestones").insert({
      organization_id: organizationId,
      student_id: studentId,
      type: "company_recommendation",
      title: title || "Recomendación de la empresa",
      description: null,
      company_endorsement: endorsement,
      endorsed_by: user?.id ?? null,
      endorsed_at: new Date().toISOString(),
    });

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    router.refresh();
    setTimeout(() => {
      setOpen(false);
      setDone(false);
    }, 1500);
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Award className="h-4 w-4" /> Escribir recomendación
      </Button>
    );
  }

  return (
    <div className="w-full rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-mint-700" />
          <h3 className="text-base font-semibold">Recomendación al alumno</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Este texto quedará vinculado al alumno como un hito. Él podrá
        publicarlo y compartirlo en LinkedIn cuando quiera.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título (opcional)</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ej. Una incorporación brillante a nuestro equipo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endorsement">Recomendación *</Label>
          <Textarea
            id="endorsement"
            name="endorsement"
            rows={6}
            required
            placeholder="Cuenta lo que ha aportado el alumno, qué actitud has visto, qué valores destacas. Hablamos en primera persona como empresa."
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || done}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : done ? (
              <Check className="h-4 w-4" />
            ) : (
              <Award className="h-4 w-4" />
            )}
            {done ? "Recomendación enviada" : "Enviar recomendación"}
          </Button>
        </div>
      </form>
    </div>
  );
}
