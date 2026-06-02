import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const supabase = createClient();
  const t = await getTranslations("StudentDashboard");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, full_name")
    .eq("id", user!.id)
    .single();

  const studentId = profile?.student_id;
  if (!studentId) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          {t("no_account_msg")}
        </CardContent>
      </Card>
    );
  }

  const [{ data: plan }, { data: todayTasks }, { data: upcomingEvents }, { data: hoursAgg }] =
    await Promise.all([
      supabase
        .from("practice_plans")
        .select("id, title, status, start_date, end_date, total_hours")
        .eq("student_id", studentId)
        .maybeSingle(),
      supabase
        .from("practice_tasks")
        .select("id, title, status, due_date, estimated_hours")
        .eq("student_id", studentId)
        .neq("status", "completed")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5),
      supabase
        .from("calendar_events")
        .select("id, title, event_date, event_type")
        .eq("student_id", studentId)
        .gte("event_date", new Date().toISOString().slice(0, 10))
        .order("event_date", { ascending: true })
        .limit(5),
      supabase
        .from("daily_activity_logs")
        .select("hours_worked")
        .eq("student_id", studentId),
    ]);

  const loggedHours = (hoursAgg ?? []).reduce(
    (sum, l) => sum + Number(l.hours_worked ?? 0),
    0,
  );
  const totalTasks = await supabase
    .from("practice_tasks")
    .select("status", { count: "exact" })
    .eq("student_id", studentId);
  const completedTasks = (totalTasks.data ?? []).filter(
    (t) => t.status === "completed",
  ).length;
  const totalCount = totalTasks.count ?? 0;
  const progressPct =
    totalCount === 0 ? 0 : Math.round((completedTasks / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("hello", { name: profile?.full_name?.split(" ")[0] ?? "" })}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {!plan ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">{t("no_plan_title")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("no_plan_hint")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{plan.title}</CardTitle>
                <CardDescription>
                  {t("plan_period", {
                    start: formatDate(plan.start_date),
                    end: formatDate(plan.end_date),
                    hours: plan.total_hours ?? "—",
                  })}
                </CardDescription>
              </div>
              <Badge variant={plan.status === "in_progress" ? "success" : "secondary"}>
                {plan.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("progress")}</span>
                <span className="font-medium">{progressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("progress_hint", { done: completedTasks, total: totalCount })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("stat_pending")} value={totalCount - completedTasks} icon={ClipboardList} />
        <StatCard label={t("stat_hours")} value={`${loggedHours}h`} icon={Clock} />
        <StatCard label={t("stat_progress")} value={`${progressPct}%`} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{t("upcoming_tasks_title")}</CardTitle>
              <CardDescription>{t("upcoming_tasks_subtitle")}</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/student/tareas">{t("see_all_tasks")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!todayTasks?.length ? (
              <p className="text-sm text-muted-foreground">{t("no_pending_tasks")}</p>
            ) : (
              <ul className="divide-y">
                {todayTasks.map((tk) => (
                  <li key={tk.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{tk.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("due", { date: formatDate(tk.due_date), hours: tk.estimated_hours ?? "—" })}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {TASK_STATUS_LABELS[tk.status as TaskStatus]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{t("upcoming_events_title")}</CardTitle>
              <CardDescription>{t("upcoming_events_subtitle")}</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/student/calendario">{t("open_calendar")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!upcomingEvents?.length ? (
              <p className="text-sm text-muted-foreground">{t("no_events")}</p>
            ) : (
              <ul className="divide-y">
                {upcomingEvents.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(e.event_date)}</p>
                    </div>
                    <Badge variant="info">{e.event_type}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/student/diario" className="rounded-xl border bg-card p-4 transition hover:shadow-md">
          <BookOpen className="h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">{t("quick_diary_title")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("quick_diary_desc")}</p>
        </Link>
        <Link href="/student/mentor" className="rounded-xl border bg-card p-4 transition hover:shadow-md">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">{t("quick_mentor_title")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("quick_mentor_desc")}</p>
        </Link>
        <Link href="/student/calendario" className="rounded-xl border bg-card p-4 transition hover:shadow-md">
          <Calendar className="h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">{t("quick_calendar_title")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("quick_calendar_desc")}</p>
        </Link>
      </div>
    </div>
  );
}
