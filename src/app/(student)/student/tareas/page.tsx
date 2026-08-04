import { ClipboardList } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/types/database";
import { TaskRow } from "./task-row";

export const dynamic = "force-dynamic";

export default async function StudentTasksPage() {
  const supabase = createClient();
  const t = await getTranslations("StudentTasks");
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

  const pending = (tasks ?? []).filter((task) => task.status !== "completed");
  const done = (tasks ?? []).filter((task) => task.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("pending_title", { n: pending.length })}</CardTitle>
          <CardDescription>{t("pending_hint")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!pending.length ? (
            <p className="text-sm text-muted-foreground">{t("no_pending")}</p>
          ) : (
            <ul className="divide-y">
              {pending.map((task) => (
                <TaskRow
                  key={task.id}
                  task={{
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    due_date: task.due_date,
                    status: task.status as TaskStatus,
                    estimated_hours: task.estimated_hours,
                    phase_name:
                      (task.practice_phases as { name?: string } | null)?.name ?? null,
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
            <CardTitle className="text-base">{t("completed_title", { n: done.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {done.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between py-3 opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium line-through">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(task.due_date)}
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
