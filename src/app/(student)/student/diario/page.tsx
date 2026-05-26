import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { DailyLogForm } from "./daily-log-form";

export const dynamic = "force-dynamic";

export default async function StudentDiarioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, organization_id")
    .eq("id", user!.id)
    .single();

  const studentId = profile?.student_id;
  const today = new Date().toISOString().slice(0, 10);

  const { data: todayLog } = await supabase
    .from("daily_activity_logs")
    .select("*")
    .eq("student_id", studentId)
    .eq("log_date", today)
    .maybeSingle();

  const { data: history } = await supabase
    .from("daily_activity_logs")
    .select("id, log_date, tasks_done, hours_worked, learnings, difficulties")
    .eq("student_id", studentId)
    .order("log_date", { ascending: false })
    .limit(15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diario de prácticas</h1>
        <p className="text-muted-foreground">
          Registra cada día lo que has hecho. Esto alimenta tus informes y memoria
          final.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entrada de hoy · {formatDate(today)}</CardTitle>
          <CardDescription>
            Rellena lo que has trabajado hoy. Se guarda automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentId && profile?.organization_id && (
            <DailyLogForm
              studentId={studentId}
              organizationId={profile.organization_id}
              date={today}
              existing={todayLog ?? null}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
          <CardDescription>Tus últimas entradas.</CardDescription>
        </CardHeader>
        <CardContent>
          {!history?.length ? (
            <p className="text-sm text-muted-foreground">
              Todavía no has registrado ningún día.
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div key={h.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{formatDate(h.log_date)}</p>
                    <span className="text-xs text-muted-foreground">
                      {h.hours_worked ?? 0} h
                    </span>
                  </div>
                  {h.tasks_done && (
                    <p className="mt-2 whitespace-pre-line text-sm">
                      <strong>Tareas: </strong>
                      {h.tasks_done}
                    </p>
                  )}
                  {h.learnings && (
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                      <strong>Aprendizajes: </strong>
                      {h.learnings}
                    </p>
                  )}
                  {h.difficulties && (
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                      <strong>Dificultades: </strong>
                      {h.difficulties}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
