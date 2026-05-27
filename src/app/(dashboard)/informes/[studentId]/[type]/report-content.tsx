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

export function ReportContent({
  title,
  reportType,
  student,
  plan,
  phases,
  tasks,
  logs,
  deliverables,
}: Props) {
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
          Período: {formatDate(student.start_date)} – {formatDate(student.end_date)} ·{" "}
          {student.total_hours ?? "—"}h
        </p>
      </header>

      {/* Datos administrativos */}
      <section className="mt-6 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Alumno</p>
          <p>{student.full_name}</p>
          <p className="text-xs text-muted-foreground">DNI/NIE: {student.dni ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Empresa</p>
          <p>{student.organizations?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {student.organizations?.nif && `NIF ${student.organizations.nif}`}
            {student.organizations?.city && ` · ${student.organizations.city}`}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Tutor académico</p>
          <p>{student.tutor_academic_name ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Tutor de empresa</p>
          <p>{student.tutor_company_name ?? "—"}</p>
        </div>
      </section>

      {/* Resumen */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">1. Resumen</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Metric label="Progreso" value={`${progressPct}%`} />
          <Metric label="Tareas" value={`${doneTasks}/${totalTasks}`} />
          <Metric label="Horas" value={`${Math.round(hoursLogged)}h`} />
          <Metric label="Entregables" value={String(deliverables.length)} />
        </div>
        {plan?.description && (
          <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
        )}
      </section>

      {/* Plan y objetivos */}
      {plan && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">2. Plan de prácticas</h2>
          <p className="mt-1 text-sm font-medium">{plan.title}</p>
          {plan.objectives && plan.objectives.length > 0 && (
            <>
              <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
                Objetivos formativos
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

      {/* Fases y tareas */}
      {phases.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">3. Actividad realizada</h2>
          {phases.map((ph) => {
            const phTasks = tasks.filter((t) => t.phase_id === ph.id);
            return (
              <div key={ph.id} className="mt-4">
                <p className="text-sm font-semibold">{ph.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ph.start_date)} – {formatDate(ph.end_date)}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {phTasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className={
                          t.status === "completed"
                            ? "text-mint-700"
                            : "text-muted-foreground"
                        }
                      >
                        {t.status === "completed" ? "✓" : "○"}
                      </span>
                      <span className={t.status === "completed" ? "" : "text-muted-foreground"}>
                        {t.title}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {t.estimated_hours && `${t.estimated_hours}h · `}
                          {t.completed_at
                            ? `completada ${formatDate(t.completed_at)}`
                            : t.due_date && `vence ${formatDate(t.due_date)}`}
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

      {/* Entregables */}
      {deliverables.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">4. Entregables</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {deliverables.map((d, i) => (
              <li key={i} className="rounded border p-3">
                <p className="font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  Enviado {formatDate(d.submitted_at)}
                  {d.reviewed_at && ` · revisado ${formatDate(d.reviewed_at)}`}
                </p>
                {d.description && <p className="mt-1 text-xs">{d.description}</p>}
                {d.feedback && (
                  <p className="mt-1 rounded bg-mint-50 p-2 text-xs">
                    <strong>Feedback:</strong> {d.feedback}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Diario (en memoria principalmente) */}
      {(isMemoria || reportType === "final_centro") && logs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            {isMemoria ? "5. Memoria personal" : "5. Diario de actividad"}
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
                    <strong>Aprendizajes:</strong> {l.learnings}
                  </p>
                )}
                {l.difficulties && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <strong>Dificultades:</strong> {l.difficulties}
                  </p>
                )}
              </div>
            ))}
            {logs.length > 20 && (
              <p className="text-xs italic text-muted-foreground">
                ... {logs.length - 20} entradas más no mostradas.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Conclusiones / firma */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          {reportType === "memoria" ? "6. Reflexión final" : "6. Valoración"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {reportType === "memoria"
            ? "Este informe se ha generado automáticamente a partir de la actividad registrada. El alumno puede editarlo y completarlo con su reflexión personal."
            : "Este informe se ha generado a partir de los datos registrados en Menta. El tutor de empresa puede añadir observaciones complementarias antes de su entrega oficial."}
        </p>
        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          <div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">Tutor de empresa</p>
              <p className="text-sm">{student.tutor_company_name ?? "—"}</p>
            </div>
          </div>
          <div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">
                {reportType === "memoria" ? "Alumno" : "Tutor académico"}
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
        Generado con Menta · {new Date().toLocaleDateString("es-ES")}
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
