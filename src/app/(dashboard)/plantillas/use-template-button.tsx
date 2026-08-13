"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Student {
  id: string;
  full_name: string;
}

interface Props {
  templateId: string;
  students: Student[];
}

export function UseTemplateButton({ templateId, students }: Props) {
  const router = useRouter();
  const t = useTranslations("TemplatesUse");
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (!studentId) return;
    setLoading(true);
    const res = await fetch(
      `/api/plans/${templateId}/duplicate?student=${studentId}`,
      { method: "POST" },
    );
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Error");
      return;
    }
    const data = (await res.json()) as { id: string };
    router.push(`/planes/${data.id}`);
    router.refresh();
  }

  if (!open) {
    return (
      <Button className="w-full" onClick={() => setOpen(true)}>
        {t("use_button")} <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
        {t("no_students")}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
      <div className="space-y-2">
        <Label htmlFor={`s_${templateId}`}>{t("pick_student_title")}</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger id={`s_${templateId}`}>
            <SelectValue placeholder={t("pick_student_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t("pick_student_hint")}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
        <Button size="sm" onClick={confirm} disabled={!studentId || loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("confirm_button")}
        </Button>
      </div>
    </div>
  );
}
