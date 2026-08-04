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
  const t = useTranslations("StudentForm");
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
      setLoading(false);
      if (err || !data) {
        setError(err?.message ?? t("error_create"));
        return;
      }
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

      <Card>
        <CardHeader>
          <CardTitle>{t("period_title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">{t("start_date_label")}</Label>
            <Input id="start_date" type="date" name="start_date" defaultValue={initial?.start_date ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">{t("end_date_label")}</Label>
            <Input id="end_date" type="date" name="end_date" defaultValue={initial?.end_date ?? ""} />
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
              name="weekly_hours"
              defaultValue={initial?.weekly_hours ?? 20}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
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
          <Link href={mode === "edit" && initial?.id ? `/alumnos/${initial.id}` : "/alumnos"}>
            {t("cancel")}
          </Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  );
}
