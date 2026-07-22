"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import {
  PRACTICE_TYPE_LABELS,
  STATUS_LABELS,
  type PracticeType,
  type StudentStatus,
} from "@/types/database";

export interface StudentFormDefaults {
  id?: string;
  full_name?: string | null;
  dni?: string | null;
  email?: string | null;
  phone?: string | null;
  practice_type?: PracticeType;
  institution_name?: string | null;
  program_name?: string | null;
  tutor_academic_name?: string | null;
  tutor_academic_email?: string | null;
  tutor_company_name?: string | null;
  tutor_company_email?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  total_hours?: number | null;
  weekly_hours?: number | null;
  notes?: string | null;
  status?: StudentStatus;
}

interface Props {
  mode: "create" | "edit";
  initial?: StudentFormDefaults;
}

export function StudentForm({ mode, initial }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceType, setPracticeType] = useState<PracticeType>(
    initial?.practice_type ?? "fp",
  );
  const [status, setStatus] = useState<StudentStatus>(initial?.status ?? "active");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
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
      status,
    };

    if (mode === "create") {
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
        .select("organization_id")
        .eq("id", user.id)
        .single();
      if (!profile?.organization_id) {
        setError("No se pudo obtener tu organización.");
        setLoading(false);
        return;
      }
      const { data, error: err } = await supabase
        .from("students")
        .insert({ ...payload, organization_id: profile.organization_id })
        .select("id")
        .single();
      setLoading(false);
      if (err || !data) {
        setError(err?.message ?? "Error al crear el alumno");
        return;
      }
      router.push(`/alumnos/${data.id}`);
      router.refresh();
    } else {
      if (!initial?.id) {
        setError("Falta el identificador del alumno.");
        setLoading(false);
        return;
      }
      const { error: err } = await supabase
        .from("students")
        .update(payload)
        .eq("id", initial.id);
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      router.push(`/alumnos/${initial.id}`);
      router.refresh();
    }
  }

  const institutionLabel: Record<PracticeType, string> = {
    fp: "Centro de FP",
    university: "Universidad",
    internal: "Departamento interno",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tipo de práctica</CardTitle>
          <CardDescription>
            Elige el itinerario. Los documentos requeridos se adaptarán automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="practice_type">Tipo de práctica</Label>
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
              <p className="text-xs text-muted-foreground">
                Para alumnos de FP se solicitará el PFI (Programa Formativo Individual).
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              name="status"
              value={status}
              onValueChange={(v) => setStatus(v as StudentStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as StudentStatus[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {STATUS_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="full_name">Nombre completo *</Label>
            <Input id="full_name" name="full_name" required defaultValue={initial?.full_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dni">DNI / NIE</Label>
            <Input id="dni" name="dni" defaultValue={initial?.dni ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" defaultValue={initial?.email ?? ""} />
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
            <Input id="institution_name" name="institution_name" defaultValue={initial?.institution_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program_name">
              {practiceType === "fp" ? "Ciclo formativo" : practiceType === "university" ? "Grado" : "Programa"}
            </Label>
            <Input id="program_name" name="program_name" defaultValue={initial?.program_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutor_academic_name">Tutor académico</Label>
            <Input id="tutor_academic_name" name="tutor_academic_name" defaultValue={initial?.tutor_academic_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutor_academic_email">Email tutor académico</Label>
            <Input id="tutor_academic_email" type="email" name="tutor_academic_email" defaultValue={initial?.tutor_academic_email ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutor_company_name">Tutor de empresa</Label>
            <Input id="tutor_company_name" name="tutor_company_name" defaultValue={initial?.tutor_company_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutor_company_email">Email tutor de empresa</Label>
            <Input id="tutor_company_email" type="email" name="tutor_company_email" defaultValue={initial?.tutor_company_email ?? ""} />
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
            <Input id="start_date" type="date" name="start_date" defaultValue={initial?.start_date ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">Fecha fin</Label>
            <Input id="end_date" type="date" name="end_date" defaultValue={initial?.end_date ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_hours">Total de horas</Label>
            <Input
              id="total_hours"
              type="number"
              min="0"
              name="total_hours"
              defaultValue={initial?.total_hours ?? 400}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weekly_hours">Horas/semana</Label>
            <Input
              id="weekly_hours"
              type="number"
              min="0"
              name="weekly_hours"
              defaultValue={initial?.weekly_hours ?? 20}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notas internas</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ""} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" asChild>
          <Link href={mode === "edit" && initial?.id ? `/alumnos/${initial.id}` : "/alumnos"}>
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Crear alumno" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
