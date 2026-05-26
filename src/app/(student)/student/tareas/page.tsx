import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/types/database";
import { TaskRow } from "./task-row";

export const dynamic = "force-dynamic";

export default async function StudentTasksPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id")
    .eq("id", user!.id)
    .single();
  const studentId = profile?.student_id;

  const { data: tasks } = await supabase
    .from("practice_tasks")
    .select("id, title, description, due_date, status, estimated_hours, phase_id, practice_phases(name)")
    .eq("student_id", studentId)
    .order("due_date", { ascending: true, nullsFirst: false });

  const pending = (tasks ?? []).filter((t) => t.status !== "completed");
  const done = (tasks ?? []).filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
        <p className="text-muted-foreground">
          Marca tus tareas como completadas a medida que avances.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pendientes ({pending.length})</CardTitle>
          <CardDescription>Ordenadas por fecha límite.</CardDescription>
        </CardHeader>
        <CardContent>
          {!pending.length ? (
            <p className="text-sm text-muted-foreground">No tienes tareas pendientes.</p>
          ) : (
            <ul className="divide-y">
              {pending.map((t) => (
                <TaskRow
                  key={t.id}
                  task={{
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    due_date: t.due_date,
                    status: t.status as TaskStatus,
                    estimated_hours: t.estimated_hours,
                    phase_name:
                      (t.practice_phases as { name?: string } | null)?.name ?? null,
                  }}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completadas ({done.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {done.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-3 opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium line-through">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(t.due_date)}
                    </p>
                  </div>
                  <Badge variant="success">{TASK_STATUS_LABELS.completed}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
