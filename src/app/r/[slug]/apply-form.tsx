"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApplyForm({ challengeId }: { challengeId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ url: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      challengeId,
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || undefined,
      linkedin: (fd.get("linkedin") as string) || undefined,
      education: (fd.get("education") as string) || undefined,
      shareWithCompany: fd.get("share_with_company") === "on",
    };

    const res = await fetch("/api/challenges/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Error al enviar la solicitud");
      return;
    }
    setSuccess({ url: data.workspaceUrl });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-mint-200 bg-mint-50/60 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-mint-700" />
        <h3 className="mt-3 text-lg font-semibold text-mint-900">
          ¡Estás dentro!
        </h3>
        <p className="mt-2 text-sm text-mint-900">
          Hemos guardado tu aplicación. Accede a tu espacio personal para
          subir tu propuesta cuando la tengas lista.
        </p>
        <a
          href={success.url}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Ir a mi espacio del reto
        </a>
        <p className="mt-3 text-xs text-mint-800">
          Guarda este enlace. Es tu acceso personal y privado.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo *</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn (URL)</Label>
          <Input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="education">Estudios / formación actual</Label>
          <Textarea
            id="education"
            name="education"
            rows={2}
            placeholder="Ej. Estudiante de 2.º DAW en CIFP Joaquín Blume"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
        <input
          type="checkbox"
          name="share_with_company"
          className="mt-1 h-4 w-4"
          defaultChecked
        />
        <span>
          <strong>Quiero participar también en procesos de selección.</strong>{" "}
          Acepto compartir mis datos y mi progreso con la empresa que organiza
          el reto. Si lo desmarcas, tu trabajo se evaluará igual pero tus datos
          personales no se compartirán.
        </span>
      </label>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar solicitud
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Al enviar aceptas que Menta procese tus datos para esta candidatura.
      </p>
    </form>
  );
}
