import Link from "next/link";
import { ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface StudentEval {
  id: string;
  name: string;
  practice_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  hoursLogged: number;
  diaryEntries: number;
  deliverables: number;
  daysSinceLastLog: number | null;
  risk: "ok" | "watch" | "alert";
}

function computeRisk(s: Omit<StudentEval, "risk">): StudentEval["risk"] {
  if (
    s.overdueTasks >= 3 ||
    (s.daysSinceLastLog !== null && s.daysSinceLastLog > 7)
  )
    return "alert";
  if (
    s.overdueTasks >= 1 ||
    (s.daysSinceLastLog !== null && s.daysSinceLastLog > 3)
  )
    return "watch";
  return "ok";
}

export default async function EvaluacionPage() {
  const supabase = createClient();
  const { data: students } = await supabase
    .from("students")
    .select(
      "id, full_name, practice_type, status, start_date, end_date, total_hours",
    )
    .eq("status", "active");

  const evaluations: StudentEval[] = [];
  const today = new Date();

  for (const s of students ?? []) {
    const [{ data: tasks }, { data: logs }, { data: deliverables }] =
      await Promise.all([
        supabase
          .from("practice_tasks")
          .select("status, due_date")
          .eq("student_id", s.id),
        supabase
          .from("daily_activity_logs")
          .select("log_date, hours_worked")
          .eq("student_id", s.id)
          .order("log_date", { ascending: false }),
        supabase
          .from("deliverables")
          .select("id", { count: "exact", head: true })
          .eq("student_id", s.id),
      ]);

    const totalTasks = tasks?.length ?? 0;
    const doneTasks = (tasks ?? []).filter((t) => t.status === "completed").length;
    const overdueTasks = (tasks ?? []).filter(
      (t) =>
        t.status !== "completed" &&
        t.due_date &&
        new Date(t.due_date) < today,
    ).length;
    const hoursLogged = (logs ?? []).reduce(
      (sum, l) => sum + Number(l.hours_worked ?? 0),
      0,
    );
    const diaryEntries = logs?.length ?? 0;
    const deliverablesCount = (deliverables as unknown as { length?: number })?.length ?? 0;
    let daysSinceLastLog: number | null = null;
    if (logs && logs[0]) {
      const last = new Date(logs[0].log_date);
      daysSinceLastLog = Math.floor(
        (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    const base = {
      id: s.id,
      name: s.full_name,
      practice_type: s.practice_type,
      status: s.status,
      start_date: s.start_date,
      end_date: s.end_date,
      totalTasks,
      doneTasks,
      overdueTasks,
      hoursLogged,
      diaryEntries,
      deliverables: deliverablesCount,
      daysSinceLastLog,
    };
    evaluations.push({ ...base, risk: computeRisk(base) });
  }

  const alerts = evaluations.filter((e) => e.risk === "alert");
  const watch = evaluations.filter((e) => e.risk === "watch");
  const ok = evaluations.filter((e) => e.risk === "ok");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evaluación</h1>
        <p className="text-muted-foreground">
          Vista agregada del progreso, evidencias y riesgos por alumno. Menta
          genera una propuesta automática basada en estos datos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardDescription>Alertas</CardDescription>
            <CardTitle className="text-2xl">{alerts.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Alumnos con retrasos importantes o sin actividad reciente.
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardDescription>Vigilancia</CardDescription>
            <CardTitle className="text-2xl">{watch.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Alumnos con alguna señal a revisar.
          </CardContent>
        </Card>
        <Card className="border-mint-200 bg-mint-50">
          <CardHeader className="pb-2">
            <CardDescription>En curso</CardDescription>
            <CardTitle className="text-2xl">{ok.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Alumnos al día con el plan.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alumnos en curso</CardTitle>
          <CardDescription>
            Click en un alumno para ver el detalle de su evaluación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay alumnos activos en este momento.
            </p>
          ) : (
            <ul className="divide-y">
              {evaluations.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/evaluacion/${e.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-accent/20 rounded-lg px-2 -mx-2"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <RiskIcon risk={e.risk} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.doneTasks}/{e.totalTasks} tareas ·{" "}
                          {Math.round(e.hoursLogged)}h registradas ·{" "}
                          {e.diaryEntries} entradas de diario ·{" "}
                          {e.deliverables} entregables
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {e.overdueTasks > 0 && (
                        <Badge variant="destructive">
                          {e.overdueTasks} retrasada
                          {e.overdueTasks > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {e.daysSinceLastLog !== null && e.daysSinceLastLog > 3 && (
                        <Badge variant="warning">
                          {e.daysSinceLastLog}d sin diario
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RiskIcon({ risk }: { risk: StudentEval["risk"] }) {
  if (risk === "alert")
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-4 w-4" />
      </span>
    );
  if (risk === "watch")
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <AlertTriangle className="h-4 w-4" />
      </span>
    );
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-100 text-mint-700">
      <CheckCircle2 className="h-4 w-4" />
    </span>
  );
}
