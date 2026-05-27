import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  BookOpen,
  Upload,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EvaluacionStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, practice_type, status, start_date, end_date, total_hours, institution_name",
    )
    .eq("id", params.id)
    .single();
  if (!student) notFound();

  const [{ data: tasks }, { data: logs }, { data: deliverables }, { data: messages }] =
    await Promise.all([
      supabase
        .from("practice_tasks")
        .select("title, status, due_date, completed_at")
        .eq("student_id", student.id),
      supabase
        .from("daily_activity_logs")
        .select("log_date, hours_worked, tasks_done, learnings")
        .eq("student_id", student.id)
        .order("log_date", { ascending: false }),
      supabase
        .from("deliverables")
        .select("id, title, submitted_at, reviewed_at")
        .eq("student_id", student.id)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("mentor_messages")
        .select("id", { count: "exact", head: true })
        .eq("student_id", student.id),
    ]);

  const today = new Date();
  const totalTasks = tasks?.length ?? 0;
  const doneTasks = (tasks ?? []).filter((t) => t.status === "completed").length;
  const overdue = (tasks ?? []).filter(
    (t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < today,
  );
  const hoursLogged = (logs ?? []).reduce(
    (sum, l) => sum + Number(l.hours_worked ?? 0),
    0,
  );
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const totalHoursTarget = student.total_hours ?? 0;
  const hoursPct =
    totalHoursTarget === 0 ? 0 : Math.min(100, Math.round((hoursLogged / totalHoursTarget) * 100));
  const messagesCount = (messages as unknown as { length?: number })?.length ?? 0;

  // Propuesta de evaluación automática
  const proposal = generateProposal({
    progress,
    hoursPct,
    overdueCount: overdue.length,
    diaryEntries: logs?.length ?? 0,
    deliverablesCount: deliverables?.length ?? 0,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/evaluacion"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a evaluación
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{student.full_name}</h1>
        <p className="text-muted-foreground">
          {student.institution_name ?? "Sin centro"} ·{" "}
          {formatDate(student.start_date)} – {formatDate(student.end_date)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Progreso" value={`${progress}%`} icon={TrendingUp} tone="success" />
        <StatCard
          label="Horas registradas"
          value={`${Math.round(hoursLogged)}h`}
          hint={`${hoursPct}% de ${totalHoursTarget}h`}
          icon={Clock}
        />
        <StatCard
          label="Entradas diario"
          value={logs?.length ?? 0}
          icon={BookOpen}
        />
        <StatCard
          label="Entregables"
          value={deliverables?.length ?? 0}
          icon={Upload}
        />
      </div>

      {overdue.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Tareas retrasadas ({overdue.length})
              </p>
              <ul className="mt-1 text-xs text-destructive/90">
                {overdue.slice(0, 5).map((t, i) => (
                  <li key={i}>
                    {t.title} · vencía {formatDate(t.due_date)}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-mint-200 bg-mint-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-mint-700" />
            Propuesta de evaluación
          </CardTitle>
          <CardDescription>
            Sugerencia generada por Menta a partir de los datos registrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-mint-800">
              {proposal.score}
            </span>
            <span className="text-sm text-mint-700">/10</span>
            <Badge variant="success" className="ml-2">
              {proposal.label}
            </Badge>
          </div>
          <p className="text-sm text-mint-900">{proposal.summary}</p>
          <ul className="space-y-1 text-xs text-mint-800">
            {proposal.factors.map((f, i) => (
              <li key={i}>· {f}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Esta es solo una propuesta. La evaluación oficial la decide el
            tutor de la empresa.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tareas</CardTitle>
            <CardDescription>
              {doneTasks} / {totalTasks} completadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {(tasks ?? []).slice(0, 8).map((t, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span
                    className={
                      t.status === "completed"
                        ? "line-through text-muted-foreground"
                        : ""
                    }
                  >
                    {t.title}
                  </span>
                  <Badge
                    variant={
                      t.status === "completed"
                        ? "success"
                        : t.status === "blocked"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {TASK_STATUS_LABELS[t.status as TaskStatus]}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diario reciente</CardTitle>
            <CardDescription>Últimas {Math.min(5, logs?.length ?? 0)} entradas.</CardDescription>
          </CardHeader>
          <CardContent>
            {!logs?.length ? (
              <p className="text-sm text-muted-foreground">Sin entradas todavía.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {logs.slice(0, 5).map((l, i) => (
                  <li key={i} className="rounded border p-2">
                    <p className="text-xs font-semibold">{formatDate(l.log_date)} · {l.hours_worked ?? 0}h</p>
                    {l.tasks_done && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {l.tasks_done}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Otras evidencias</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded border p-3">
            <ClipboardList className="h-4 w-4 text-mint-700" />
            <p className="mt-2 text-xs text-muted-foreground">Conversaciones con el mentor</p>
            <p className="text-lg font-semibold">{messagesCount}</p>
          </div>
          <div className="rounded border p-3">
            <Upload className="h-4 w-4 text-mint-700" />
            <p className="mt-2 text-xs text-muted-foreground">Entregables revisados</p>
            <p className="text-lg font-semibold">
              {(deliverables ?? []).filter((d) => d.reviewed_at).length} /{" "}
              {deliverables?.length ?? 0}
            </p>
          </div>
          <div className="rounded border p-3">
            <BookOpen className="h-4 w-4 text-mint-700" />
            <p className="mt-2 text-xs text-muted-foreground">% horas cubiertas</p>
            <p className="text-lg font-semibold">{hoursPct}%</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href={`/informes?student=${student.id}`}>
            Generar informe
          </Link>
        </Button>
      </div>
    </div>
  );
}

function generateProposal(input: {
  progress: number;
  hoursPct: number;
  overdueCount: number;
  diaryEntries: number;
  deliverablesCount: number;
}) {
  // Heurística simple ponderada
  let score = 5;
  const factors: string[] = [];

  if (input.progress >= 80) {
    score += 2;
    factors.push("Buen ritmo de avance (>80% tareas completadas).");
  } else if (input.progress >= 50) {
    score += 1;
    factors.push("Ritmo aceptable de avance.");
  } else if (input.progress < 30) {
    score -= 1;
    factors.push("Avance por debajo de lo esperado.");
  }

  if (input.hoursPct >= 80) {
    score += 1;
    factors.push("Cumplimiento de horas adecuado.");
  } else if (input.hoursPct < 40) {
    score -= 1;
    factors.push("Menos horas registradas de las previstas.");
  }

  if (input.overdueCount === 0) {
    score += 1;
    factors.push("Sin tareas retrasadas.");
  } else if (input.overdueCount >= 3) {
    score -= 2;
    factors.push(`${input.overdueCount} tareas retrasadas — atención.`);
  }

  if (input.diaryEntries >= 20) {
    score += 1;
    factors.push("Diario muy bien mantenido.");
  } else if (input.diaryEntries < 5) {
    score -= 1;
    factors.push("Diario poco rellenado.");
  }

  if (input.deliverablesCount >= 3) {
    score += 1;
    factors.push("Buen ritmo de entregables.");
  }

  score = Math.max(1, Math.min(10, score));
  const label =
    score >= 8 ? "Excelente" : score >= 6 ? "Notable" : score >= 5 ? "Suficiente" : "A mejorar";
  const summary =
    score >= 8
      ? "El alumno cumple muy bien con el plan y muestra implicación constante."
      : score >= 6
        ? "El alumno avanza correctamente, con margen de mejora puntual."
        : score >= 5
          ? "El alumno cumple los mínimos, pero conviene reforzar el acompañamiento."
          : "Se recomienda una revisión con el alumno: hay señales de riesgo.";

  return { score, label, summary, factors };
}
