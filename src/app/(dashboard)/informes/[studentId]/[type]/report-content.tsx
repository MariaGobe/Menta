import { getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/utils";
import { PRACTICE_TYPE_LABELS, type PracticeType } from "@/types/database";

interface Props {
  title: string;
  reportType: string;
  student: {
    full_name: string;
    dni: string | null;
    practice_type: string;
    institution_name: string | null;
    program_name: string | null;
    tutor_academic_name: string | null;
    tutor_company_name: string | null;
    start_date: string | null;
    end_date: string | null;
    total_hours: number | null;
    organizations: { name?: string; nif?: string; address?: string; city?: string } | null;
  };
  plan: {
    title: string;
    description: string | null;
    objectives: string[] | null;
    total_hours: number | null;
  } | null;
  phases: { id: string; name: string; start_date: string | null; end_date: string | null }[];
  tasks: {
    title: string;
    status: string;
    due_date: string | null;
    completed_at: string | null;
    estimated_hours: number | null;
    phase_id: string | null;
  }[];
  logs: {
    log_date: string;
    hours_worked: number | null;
    tasks_done: string | null;
    learnings: string | null;
    difficulties: string | null;
  }[];
  deliverables: {
    title: string;
    description: string | null;
    submitted_at: string;
    reviewed_at: string | null;
    feedback: string | null;
  }[];
}

export async function ReportContent({
  title,
  reportType,
  student,
  plan,
  phases,
  tasks,
  logs,
  deliverables,
}: Props) {
  const t = await getTranslations("ReportPDF");
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const hoursLogged = logs.reduce((sum, l) => sum + Number(l.hours_worked ?? 0), 0);

  const isMemoria = reportType === "memoria";

  return (
    <article className="rounded-2xl border bg-card p-10 print:border-0 print:p-0 print:shadow-none print:rounded-none">
      <header className="border-b pb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{student.full_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {PRACTICE_TYPE_LABELS[student.practice_type as PracticeType]} ·{" "}
          {student.institution_name ?? "—"} · {student.program_name ?? ""}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("period", { start: formatDate(student.start_date), end: formatDate(student.end_date) })} ·{" "}
          {student.total_hours ?? "—"}h
        </p>
      </header>

      <section className="mt-6 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{t("student_section")}</p>
          <p>{student.full_name}</p>
          <p className="text-xs text-muted-foreground">{t("dni_prefix")} {student.dni ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{t("company_section")}</p>
          <p>{student.organizations?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {student.organizations?.nif && `${t("nif_prefix")} ${student.organizations.nif}`}
            {student.organizations?.city && ` · ${student.organizations.city}`}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{t("tutor_academic_section")}</p>
          <p>{student.tutor_academic_name ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{t("tutor_company_section")}</p>
          <p>{student.tutor_company_name ?? "—"}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("section_1_summary")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Metric label={t("metric_progress")} value={`${progressPct}%`} />
          <Metric label={t("metric_tasks")} value={`${doneTasks}/${totalTasks}`} />
          <Metric label={t("metric_hours")} value={`${Math.round(hoursLogged)}h`} />
          <Metric label={t("metric_deliverables")} value={String(deliverables.length)} />
        </div>
        {plan?.description && (
          <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
        )}
      </section>

      {plan && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">{t("section_2_plan")}</h2>
          <p className="mt-1 text-sm font-medium">{plan.title}</p>
          {plan.objectives && plan.objectives.length > 0 && (
            <>
              <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
                {t("learning_objectives")}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {plan.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {phases.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">{t("section_3_activity")}</h2>
          {phases.map((ph) => {
            const phTasks = tasks.filter((t) => t.phase_id === ph.id);
            return (
              <div key={ph.id} className="mt-4">
                <p className="text-sm font-semibold">{ph.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ph.start_date)} – {formatDate(ph.end_date)}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {phTasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className={
                          task.status === "completed"
                            ? "text-mint-700"
                            : "text-muted-foreground"
                        }
                      >
                        {task.status === "completed" ? "✓" : "○"}
                      </span>
                      <span className={task.status === "completed" ? "" : "text-muted-foreground"}>
                        {task.title}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {task.estimated_hours && `${task.estimated_hours}h · `}
                          {task.completed_at
                            ? t("task_completed_on", { date: formatDate(task.completed_at) })
                            : task.due_date && t("task_due_on", { date: formatDate(task.due_date) })}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {deliverables.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">{t("section_4_deliverables")}</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {deliverables.map((d, i) => (
              <li key={i} className="rounded border p-3">
                <p className="font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t("sent_on", { date: formatDate(d.submitted_at) })}
                  {d.reviewed_at && ` ${t("reviewed_on", { date: formatDate(d.reviewed_at) })}`}
                </p>
                {d.description && <p className="mt-1 text-xs">{d.description}</p>}
                {d.feedback && (
                  <p className="mt-1 rounded bg-mint-50 p-2 text-xs">
                    <strong>{t("feedback_prefix")}</strong> {d.feedback}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(isMemoria || reportType === "final_centro") && logs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            {isMemoria ? t("section_5_memoria") : t("section_5_diary")}
          </h2>
          <div className="mt-3 space-y-3 text-sm">
            {logs.slice(0, 20).map((l, i) => (
              <div key={i} className="rounded border p-3">
                <p className="text-xs font-semibold">
                  {formatDate(l.log_date)} · {l.hours_worked ?? 0}h
                </p>
                {l.tasks_done && <p className="mt-1">{l.tasks_done}</p>}
                {l.learnings && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <strong>{t("learnings_prefix")}</strong> {l.learnings}
                  </p>
                )}
                {l.difficulties && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <strong>{t("difficulties_prefix")}</strong> {l.difficulties}
                  </p>
                )}
              </div>
            ))}
            {logs.length > 20 && (
              <p className="text-xs italic text-muted-foreground">
                {t("more_entries", { n: logs.length - 20 })}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          {reportType === "memoria" ? t("section_6_reflection") : t("section_6_valuation")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {reportType === "memoria" ? t("footer_note_auto") : t("footer_note_data")}
        </p>
        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          <div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">{t("company_tutor_role")}</p>
              <p className="text-sm">{student.tutor_company_name ?? "—"}</p>
            </div>
          </div>
          <div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">
                {reportType === "memoria" ? t("student_role") : t("academic_tutor_role")}
              </p>
              <p className="text-sm">
                {reportType === "memoria"
                  ? student.full_name
                  : student.tutor_academic_name ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-12 border-t pt-4 text-center text-xs text-muted-foreground print:fixed print:bottom-0 print:left-0 print:right-0">
        {t("generated_with")} {new Date().toLocaleDateString(t("locale"))}
      </footer>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
