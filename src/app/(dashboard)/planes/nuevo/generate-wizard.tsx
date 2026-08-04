"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRACTICE_TYPE_LABELS, type PracticeType } from "@/types/database";
import type { GeneratedPlan } from "@/lib/plan-templates";
import { formatDate } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string;
  practice_type: PracticeType;
  start_date: string | null;
  end_date: string | null;
  total_hours: number | null;
  status: string;
}

interface Props {
  students: Student[];
}

export function GeneratePlanWizard({ students }: Props) {
  const router = useRouter();
  const t = useTranslations("PlanWizard");
  const [studentId, setStudentId] = useState<string>("");
  const [objectives, setObjectives] = useState<string>("");
  const [companyContext, setCompanyContext] = useState<string>("");
  const [projectTasksText, setProjectTasksText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [orgId, setOrgId] = useState<string>("");

  const selected = students.find((s) => s.id === studentId);

  async function generate(useAi: boolean) {
    if (!studentId) {
      setError(t("error_no_student"));
      return;
    }
    setError(null);
    setLoading(true);
    const projectTasks = projectTasksText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/^(.+?)[·\-–—\(:]\s*(\d+(?:\.\d+)?)\s*h?\)?\s*$/i);
        if (m) return { title: m[1].trim(), hours: Number(m[2]) };
        return { title: line };
      });

    const res = await fetch("/api/plans/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        useAi,
        customObjectives: objectives
          ? objectives
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        companyContext: companyContext || undefined,
        projectTasks: projectTasks.length > 0 ? projectTasks : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setError(err.error ?? t("error_generate"));
      return;
    }
    const data = (await res.json()) as { plan: GeneratedPlan; organizationId: string };
    setPlan(data.plan);
    setOrgId(data.organizationId);
  }

  async function save() {
    if (!plan || !studentId || !orgId) return;
    setSaving(true);
    const res = await fetch("/api/plans/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, organizationId: orgId, plan }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setError(err.error ?? t("error_save"));
      return;
    }
    const data = (await res.json()) as { planId: string };
    router.push(`/planes/${data.planId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="student">{t("student_label")}</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger>
            <SelectValue placeholder={t("student_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name} · {PRACTICE_TYPE_LABELS[s.practice_type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (!selected.start_date || !selected.end_date) && (
          <p className="text-xs text-destructive">{t("no_dates_warning")}</p>
        )}
      </div>

      {selected && selected.start_date && selected.end_date && (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("type_label")}</p>
              <p className="font-medium">
                {PRACTICE_TYPE_LABELS[selected.practice_type]}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("period_label")}</p>
              <p className="font-medium">
                {formatDate(selected.start_date)} – {formatDate(selected.end_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("hours_label")}</p>
              <p className="font-medium">{selected.total_hours ?? "—"} h</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="objectives">{t("objectives_label")}</Label>
        <Textarea
          id="objectives"
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          rows={4}
          placeholder={t("objectives_placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("objectives_hint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="context">{t("context_label")}</Label>
        <Textarea
          id="context"
          value={companyContext}
          onChange={(e) => setCompanyContext(e.target.value)}
          rows={3}
          placeholder={t("context_placeholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project_tasks">{t("tasks_label")}</Label>
        <Textarea
          id="project_tasks"
          value={projectTasksText}
          onChange={(e) => setProjectTasksText(e.target.value)}
          rows={5}
          placeholder={t("tasks_placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("tasks_hint")}</p>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {!plan && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => generate(false)} disabled={loading || !studentId}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {t("generate_template")}
          </Button>
          <Button
            variant="outline"
            onClick={() => generate(true)}
            disabled={loading || !studentId}
          >
            <Sparkles className="h-4 w-4" /> {t("generate_ai")}
          </Button>
        </div>
      )}

      {plan && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-mint-50 p-4">
            <h3 className="text-sm font-semibold">{plan.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white px-2 py-1">
                {formatDate(plan.start_date)} – {formatDate(plan.end_date)}
              </span>
              <span className="rounded-full bg-white px-2 py-1">
                {t("hours_unit", { h: plan.total_hours })}
              </span>
              <span className="rounded-full bg-white px-2 py-1">
                {t("phases_count", { n: plan.phases.length })}
              </span>
              <span className="rounded-full bg-white px-2 py-1">
                {t("tasks_count", { n: plan.phases.reduce((sum, p) => sum + p.tasks.length, 0) })}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {plan.phases.map((p, idx) => (
              <details key={idx} className="rounded-lg border bg-card p-4" open>
                <summary className="cursor-pointer text-sm font-semibold">
                  {p.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {t("phase_tasks_count", { n: p.tasks.length })}
                  </span>
                </summary>
                {p.description && (
                  <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>
                )}
                <ul className="mt-3 space-y-2 text-xs">
                  {p.tasks.map((task, ti) => (
                    <li
                      key={ti}
                      className="flex items-center justify-between gap-3 rounded border bg-muted/30 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-muted-foreground">
                          {t("due_hours", { date: formatDate(task.due_date), h: task.estimated_hours })}
                          {task.deliverable_required && ` ${t("with_deliverable")}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("save_draft")}
            </Button>
            <Button variant="outline" onClick={() => setPlan(null)}>
              {t("regenerate")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
