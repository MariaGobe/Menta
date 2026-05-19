"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { PRACTICE_TYPE_LABELS, type PracticeType } from "@/types/database";

export default function NuevoAlumnoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceType, setPracticeType] = useState<PracticeType>("fp");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .single();

    if (!profile?.organization_id) {
      setError("No se pudo obtener tu organización.");
      setLoading(false);
      return;
    }

    const payload = {
      organization_id: profile.organization_id,
      full_name: formData.get("full_name") as string,
      dni: (formData.get("dni") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      practice_type: practiceType,
      institution_name: (formData.get("institution_name") as string) || null,
      program_name: (formData.get("program_name") as string) || null,
      tutor_academic_name: (formData.get("tutor_academic_name") as string) || null,
      tutor_academic_email: (formData.get("tutor_academic_email") as string) || null,
      tutor_company_name: (formData.get("tutor_company_name") as string) || null,
      tutor_company_email: (formData.get("tutor_company_email") as string) || null,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
      total_hours: Number(formData.get("total_hours")) || 0,
      weekly_hours: Number(formData.get("weekly_hours")) || null,
      notes: (formData.get("notes") as string) || null,
      status: "active" as const,
    };

    const { data, error } = await supabase.from("students").insert(payload).select("id").single();
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/alumnos/${data.id}`);
    router.refresh();
  }

  const institutionLabel: Record<PracticeType, string> = {
    fp: "Centro de FP",
    university: "Universidad",
    internal: "Departamento interno",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/alumnos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a alumnos
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo alumno</h1>
        <p className="text-muted-foreground">Da de alta un alumno en prácticas.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tipo de práctica</CardTitle>
            <CardDescription>
              Elige el itinerario. Los documentos requeridos se adaptarán automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              name="practice_type"
              value={practiceType}
              onValueChange={(v) => setPracticeType(v as PracticeType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRACTICE_TYPE_LABELS) as PracticeType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {PRACTICE_TYPE_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {practiceType === "fp" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Para alumnos de FP se solicitará el PFI (Programa Formativo Individual).
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full_name">Nombre completo *</Label>
              <Input id="full_name" name="full_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI / NIE</Label>
              <Input id="dni" name="dni" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos académicos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="institution_name">{institutionLabel[practiceType]}</Label>
              <Input id="institution_name" name="institution_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program_name">
                {practiceType === "fp" ? "Ciclo formativo" : practiceType === "university" ? "Grado" : "Programa"}
              </Label>
              <Input id="program_name" name="program_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_academic_name">Tutor académico</Label>
              <Input id="tutor_academic_name" name="tutor_academic_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_academic_email">Email tutor académico</Label>
              <Input id="tutor_academic_email" type="email" name="tutor_academic_email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_company_name">Tutor de empresa</Label>
              <Input id="tutor_company_name" name="tutor_company_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_company_email">Email tutor de empresa</Label>
              <Input id="tutor_company_email" type="email" name="tutor_company_email" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Período de prácticas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha inicio</Label>
              <Input id="start_date" type="date" name="start_date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha fin</Label>
              <Input id="end_date" type="date" name="end_date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_hours">Total de horas</Label>
              <Input id="total_hours" type="number" min="0" name="total_hours" defaultValue="400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly_hours">Horas/semana</Label>
              <Input id="weekly_hours" type="number" min="0" name="weekly_hours" defaultValue="20" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas internas</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/alumnos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear alumno
          </Button>
        </div>
      </form>
    </div>
  );
}
