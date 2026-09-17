"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  INTERNAL_TRAINING_TYPE_LABELS,
  STATUS_LABELS,
  type PracticeType,
  type InternalTrainingType,
  type StudentStatus,
  type StudentHourSchedule,
} from "@/types/database";
import { HourScheduleEditor, type HourScheduleDraft } from "./hour-schedule-editor";
import { ManagersEditor, type ManagerDraft } from "./managers-editor";
import type { StudentManager } from "@/types/database";

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
  department?: string | null;
  position?: string | null;
  manager_name?: string | null;
  manager_email?: string | null;
  internal_training_type?: InternalTrainingType | null;
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
  /** "external": solo permite fp/university. "internal": solo internal.
   * Se usa en /alumnos/nuevo (external) y /empleados/nuevo (internal). */
  scope?: "external" | "internal";
  /** A dónde volver al cancelar/guardar. Por defecto /alumnos. */
  returnTo?: "alumnos" | "empleados";
  /** Tramos de dedicación variable persistidos (solo modo edit). */
  initialSchedules?: StudentHourSchedule[];
  /** Managers persistidos (solo modo edit). */
  initialManagers?: StudentManager[];
}

export function StudentForm({
  mode,
  initial,
  scope,
  returnTo,
  initialSchedules,
  initialManagers,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("StudentForm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultType: PracticeType =
    initial?.practice_type ?? (scope === "internal" ? "internal" : "fp");
  const [practiceType, setPracticeType] = useState<PracticeType>(defaultType);
  const [status, setStatus] = useState<StudentStatus>(initial?.status ?? "active");
  const [internalTrainingType, setInternalTrainingType] = useState<
    InternalTrainingType | ""
  >(initial?.internal_training_type ?? "");
  const [startDate, setStartDate] = useState<string>(initial?.start_date ?? "");
  const [endDate, setEndDate] = useState<string>(initial?.end_date ?? "");
  const [schedules, setSchedules] = useState<HourScheduleDraft[]>(
    (initialSchedules ?? []).map((s) => ({
      id: s.id,
      from_date: s.from_date,
      to_date: s.to_date,
      weekly_hours: Number(s.weekly_hours),
      notes: s.notes,
    })),
  );
  const initialIds = new Set((initialSchedules ?? []).map((s) => s.id));

  const [managers, setManagers] = useState<ManagerDraft[]>(() => {
    if (initialManagers && initialManagers.length > 0) {
      return initialManagers.map((m) => ({
        id: m.id,
        name: m.name ?? "",
        email: m.email ?? "",
        role: m.role ?? "",
        is_primary: m.is_primary,
      }));
    }
    // Retrocompatibilidad: si venía el manager único en la fila del alumno,
    // lo mostramos como fila editable para no perder la info.
    if (initial?.manager_name || initial?.manager_email) {
      return [
        {
          id: `new-${Date.now()}-0`,
          name: initial.manager_name ?? "",
          email: initial.manager_email ?? "",
          role: "",
          is_primary: true,
        },
      ];
    }
    return [];
  });
  const initialManagerIds = new Set((initialManagers ?? []).map((m) => m.id));
  const isInternal = practiceType === "internal";
  // El listado sí es distinto (Alumnos/Empleados), pero el detalle está unificado en /alumnos/[id].
  const listBase = returnTo ?? (isInternal ? "empleados" : "alumnos");
  const backHref =
    mode === "edit" && initial?.id ? `/alumnos/${initial.id}` : `/${listBase}`;

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
      // Los campos que no aplican a este tipo se envían como null para no
      // arrastrar datos viejos si se cambia el tipo en modo edición.
      institution_name: isInternal ? null : (formData.get("institution_name") as string) || null,
      program_name: isInternal ? null : (formData.get("program_name") as string) || null,
      tutor_academic_name: isInternal ? null : (formData.get("tutor_academic_name") as string) || null,
      tutor_academic_email: isInternal ? null : (formData.get("tutor_academic_email") as string) || null,
      tutor_company_name: (formData.get("tutor_company_name") as string) || null,
      tutor_company_email: (formData.get("tutor_company_email") as string) || null,
      department: isInternal ? (formData.get("department") as string) || null : null,
      position: isInternal ? (formData.get("position") as string) || null : null,
      // Los managers viven ahora en la tabla student_managers.
      // Mantenemos las columnas por retrocompat pero las dejamos vacías.
      manager_name: null,
      manager_email: null,
      internal_training_type: isInternal ? (internalTrainingType || null) : null,
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
        setError(t("error_session"));
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      if (!profile?.organization_id) {
        setError(t("error_org"));
        setLoading(false);
        return;
      }
      const { data, error: err } = await supabase
        .from("students")
        .insert({ ...payload, organization_id: profile.organization_id })
        .select("id")
        .single();
      if (err || !data) {
        setLoading(false);
        setError(err?.message ?? t("error_create"));
        return;
      }
      await syncSchedules(data.id);
      setLoading(false);
      // Detalle unificado bajo /alumnos/[id]; el back link se adapta.
      router.push(`/alumnos/${data.id}`);
      router.refresh();
    } else {
      if (!initial?.id) {
        setError(t("error_no_id"));
        setLoading(false);
        return;
      }
      const { error: err } = await supabase
        .from("students")
        .update(payload)
        .eq("id", initial.id);
      if (err) {
        setLoading(false);
        setError(err.message);
        return;
      }
      await syncSchedules(initial.id);
      setLoading(false);
      router.push(`/alumnos/${initial.id}`);
      router.refresh();
    }
  }

  /**
   * Sincroniza tramos y managers con sus tablas: inserta los "new-",
   * actualiza los persistidos y borra los que ya no están en el estado.
   */
  async function syncSchedules(studentId: string) {
    // ─── Tramos de dedicación ──────────────────────────────────────────
    const currentIds = new Set(schedules.map((s) => s.id));
    const toDelete: string[] = [];
    initialIds.forEach((id) => {
      if (!currentIds.has(id)) toDelete.push(id);
    });
    if (toDelete.length > 0) {
      await supabase.from("student_hour_schedules").delete().in("id", toDelete);
    }
    const toInsert = schedules
      .filter((s) => s.id.startsWith("new-"))
      .filter((s) => s.from_date && s.to_date && s.weekly_hours >= 0)
      .map((s) => ({
        student_id: studentId,
        from_date: s.from_date,
        to_date: s.to_date,
        weekly_hours: s.weekly_hours,
      }));
    if (toInsert.length > 0) {
      await supabase.from("student_hour_schedules").insert(toInsert);
    }
    const toUpdate = schedules.filter(
      (s) => !s.id.startsWith("new-") && initialIds.has(s.id),
    );
    for (const s of toUpdate) {
      await supabase
        .from("student_hour_schedules")
        .update({
          from_date: s.from_date,
          to_date: s.to_date,
          weekly_hours: s.weekly_hours,
        })
        .eq("id", s.id);
    }

    // ─── Managers ──────────────────────────────────────────────────────
    if (isInternal) {
      const currentMgrIds = new Set(managers.map((m) => m.id));
      const mgrsToDelete: string[] = [];
      initialManagerIds.forEach((id) => {
        if (!currentMgrIds.has(id)) mgrsToDelete.push(id);
      });
      if (mgrsToDelete.length > 0) {
        await supabase.from("student_managers").delete().in("id", mgrsToDelete);
      }
      const mgrsToInsert = managers
        .filter((m) => m.id.startsWith("new-") && m.name.trim())
        .map((m) => ({
          student_id: studentId,
          name: m.name.trim(),
          email: m.email.trim() || null,
          role: m.role.trim() || null,
          is_primary: m.is_primary,
        }));
      if (mgrsToInsert.length > 0) {
        await supabase.from("student_managers").insert(mgrsToInsert);
      }
      const mgrsToUpdate = managers.filter(
        (m) => !m.id.startsWith("new-") && initialManagerIds.has(m.id),
      );
      for (const m of mgrsToUpdate) {
        await supabase
          .from("student_managers")
          .update({
            name: m.name.trim(),
            email: m.email.trim() || null,
            role: m.role.trim() || null,
            is_primary: m.is_primary,
          })
          .eq("id", m.id);
      }
    }
  }

  const institutionLabel: Record<PracticeType, string> = {
    fp: t("institution_fp"),
    university: t("institution_university"),
    internal: t("institution_internal"),
  };

  const programLabel: Record<PracticeType, string> = {
    fp: t("program_label_fp"),
    university: t("program_label_university"),
    internal: t("program_label_internal"),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("practice_type_card_title")}</CardTitle>
          <CardDescription>{t("practice_type_card_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="practice_type">{t("practice_type_label")}</Label>
            <Select
              name="practice_type"
              value={practiceType}
              onValueChange={(v) => setPracticeType(v as PracticeType)}
              disabled={scope === "internal"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRACTICE_TYPE_LABELS) as PracticeType[])
                  .filter((k) => {
                    if (scope === "internal") return k === "internal";
                    if (scope === "external") return k !== "internal";
                    return true;
                  })
                  .map((k) => (
                    <SelectItem key={k} value={k}>
                      {PRACTICE_TYPE_LABELS[k]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {practiceType === "fp" && (
              <p className="text-xs text-muted-foreground">{t("fp_hint")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{t("status_label")}</Label>
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
          <CardTitle>{t("personal_data")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="full_name">{t("full_name_label")}</Label>
            <Input id="full_name" name="full_name" required defaultValue={initial?.full_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dni">{t("dni_label")}</Label>
            <Input id="dni" name="dni" defaultValue={initial?.dni ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone_label")}</Label>
            <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">{t("email_label")}</Label>
            <Input id="email" type="email" name="email" defaultValue={initial?.email ?? ""} />
          </div>
        </CardContent>
      </Card>

      {isInternal ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("internal_data")}</CardTitle>
            <CardDescription>{t("internal_data_subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="internal_training_type">
                {t("internal_training_type_label")}
              </Label>
              <Select
                value={internalTrainingType || undefined}
                onValueChange={(v) =>
                  setInternalTrainingType(v as InternalTrainingType)
                }
              >
                <SelectTrigger id="internal_training_type">
                  <SelectValue placeholder={t("internal_training_type_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(INTERNAL_TRAINING_TYPE_LABELS) as InternalTrainingType[]).map(
                    (k) => (
                      <SelectItem key={k} value={k}>
                        {INTERNAL_TRAINING_TYPE_LABELS[k]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("internal_training_type_hint")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">{t("department_label")}</Label>
              <Input
                id="department"
                name="department"
                defaultValue={initial?.department ?? ""}
                placeholder={t("department_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">{t("position_label")}</Label>
              <Input
                id="position"
                name="position"
                defaultValue={initial?.position ?? ""}
                placeholder={t("position_placeholder")}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-semibold">{t("managers_label")}</Label>
              <p className="text-xs text-muted-foreground">{t("managers_hint")}</p>
              <ManagersEditor value={managers} onChange={setManagers} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("academic_data")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="institution_name">{institutionLabel[practiceType]}</Label>
              <Input id="institution_name" name="institution_name" defaultValue={initial?.institution_name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program_name">{programLabel[practiceType]}</Label>
              <Input id="program_name" name="program_name" defaultValue={initial?.program_name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_academic_name">{t("tutor_academic_label")}</Label>
              <Input id="tutor_academic_name" name="tutor_academic_name" defaultValue={initial?.tutor_academic_name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_academic_email">{t("tutor_academic_email_label")}</Label>
              <Input id="tutor_academic_email" type="email" name="tutor_academic_email" defaultValue={initial?.tutor_academic_email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_company_name">{t("tutor_company_label")}</Label>
              <Input id="tutor_company_name" name="tutor_company_name" defaultValue={initial?.tutor_company_name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_company_email">{t("tutor_company_email_label")}</Label>
              <Input id="tutor_company_email" type="email" name="tutor_company_email" defaultValue={initial?.tutor_company_email ?? ""} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isInternal ? t("period_title_internal") : t("period_title")}</CardTitle>
          <CardDescription>{t("period_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t("start_date_label")}</Label>
              <Input
                id="start_date"
                type="date"
                name="start_date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">{t("end_date_label")}</Label>
              <Input
                id="end_date"
                type="date"
                name="end_date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_hours">{t("total_hours_label")}</Label>
              <Input
                id="total_hours"
                type="number"
                min="0"
                name="total_hours"
                defaultValue={initial?.total_hours ?? 400}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly_hours">{t("weekly_hours_label")}</Label>
              <Input
                id="weekly_hours"
                type="number"
                min="0"
                step="0.5"
                name="weekly_hours"
                defaultValue={initial?.weekly_hours ?? 20}
              />
              <p className="text-xs text-muted-foreground">
                {t("weekly_hours_hint")}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="text-sm font-semibold">
              {t("schedules_label")}
            </Label>
            <HourScheduleEditor
              value={schedules}
              onChange={setSchedules}
              bounds={{ start_date: startDate, end_date: endDate }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes_label")}</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ""} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" asChild>
          <Link href={backHref}>{t("cancel")}</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  );
}
