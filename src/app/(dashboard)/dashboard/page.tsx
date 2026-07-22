import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  Users,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  CalendarDays,
  Inbox,
  ChevronRight,
  ListChecks,
  MessageSquareText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { PRACTICE_TYPE_LABELS, STATUS_LABELS } from "@/types/database";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function plusDaysISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysUntil(dateStr: string): number {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(dateStr);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export default async function DashboardPage() {
  const supabase = createClient();
  const t = await getTranslations("CompanyDashboard");

  // Si la empresa todavía no ha hecho el onboarding, lo mostramos primero.
  const { data: orgOnboarding } = await supabase
    .from("organizations")
    .select("onboarded_at")
    .single();
  if (orgOnboarding && !orgOnboarding.onboarded_at) {
    redirect("/bienvenida");
  }

  const today = todayISO();
  const monthStart = startOfMonthISO();
  const in7Days = plusDaysISO(7);

  const [
    { count: totalStudents },
    { count: activeStudents },
    { data: hourLogsMonth },
    { count: pendingDeliverablesCount },
    { data: pendingDeliverables },
    { count: upcomingEventsCount },
    { data: upcomingEvents },
    { data: upcomingTasks },
    { data: pendingSuggestions },
    { data: recent },
    { data: org },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("hour_logs")
      .select("hours")
      .eq("approved", true)
      .gte("log_date", monthStart),
    supabase
      .from("deliverables")
      .select("*", { count: "exact", head: true })
      .is("reviewed_at", null),
    supabase
      .from("deliverables")
      .select("id, title, submitted_at, student_id, students(full_name)")
      .is("reviewed_at", null)
      .order("submitted_at", { ascending: false, nullsFirst: false })
      .limit(5),
    supabase
      .from("calendar_events")
      .select("*", { count: "exact", head: true })
      .gte("event_date", today)
      .lte("event_date", in7Days),
    supabase
      .from("calendar_events")
      .select("id, title, event_type, event_date, start_time, student_id, students(full_name)")
      .gte("event_date", today)
      .lte("event_date", in7Days)
      .order("event_date", { ascending: true })
      .limit(5),
    supabase
      .from("practice_tasks")
      .select("id, title, due_date, status, student_id, students(full_name)")
      .not("status", "eq", "done")
      .not("due_date", "is", null)
      .gte("due_date", plusDaysISO(-30))
      .lte("due_date", in7Days)
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("plan_change_suggestions")
      .select("id, title, plan_id, created_at, students(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("students_summary")
      .select("id, full_name, practice_type, status, start_date, logged_hours, total_hours")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("organizations")
      .select("subscription_status, trial_ends_at")
      .single(),
  ]);

  const totalHoursMonth =
    hourLogsMonth?.reduce((acc, l: { hours: number | string }) => acc + Number(l.hours ?? 0), 0) ?? 0;

  function dueLabel(date: string) {
    const d = daysUntil(date);
    if (d < 0) return { text: t("overdue"), tone: "destructive" as const };
    if (d === 0) return { text: t("due_today"), tone: "warning" as const };
    if (d === 1) return { text: t("due_tomorrow"), tone: "warning" as const };
    return { text: t("due_in_days", { n: d }), tone: "secondary" as const };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/alumnos/nuevo">
            <Plus className="h-4 w-4" /> {t("new_student")}
          </Link>
        </Button>
      </div>

      {pendingSuggestions && pendingSuggestions.length > 0 && (
        <Card className="border-mint-200 bg-mint-50">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-mint-700" />
              <div>
                <p className="text-sm font-semibold text-mint-900">
                  {t("pending_suggestions_title")}
                </p>
                <p className="text-sm text-mint-800">
                  {t("pending_suggestions_hint", { n: pendingSuggestions.length })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pendingSuggestions.slice(0, 3).map((s: any) => (
                    <Link
                      key={s.id}
                      href={`/planes/${s.plan_id}`}
                      className="rounded-full bg-white/70 px-3 py-1 text-xs text-mint-800 hover:bg-white"
                    >
                      {s.students?.full_name ?? "Alumno"} · {s.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {org?.subscription_status === "trialing" && org.trial_ends_at && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-900">
                {t("trial_message_1")}{" "}
                <strong>{formatDate(org.trial_ends_at)}</strong>
                {t("trial_message_2")}
              </p>
            </div>
            <Button size="sm" variant="warning" asChild>
              <Link href="/facturacion">{t("activate_plan")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("stat_active")}
          value={activeStudents ?? 0}
          icon={Users}
          tone="success"
          hint={t("stat_active_hint", { total: totalStudents ?? 0 })}
        />
        <StatCard
          label={t("stat_hours_month")}
          value={totalHoursMonth.toFixed(0)}
          icon={Clock}
          hint={t("stat_hours_month_hint")}
        />
        <StatCard
          label={t("stat_pending_review")}
          value={pendingDeliverablesCount ?? 0}
          icon={Inbox}
          tone={pendingDeliverablesCount && pendingDeliverablesCount > 0 ? "warning" : "default"}
          hint={t("stat_pending_review_hint")}
        />
        <StatCard
          label={t("stat_upcoming_events")}
          value={upcomingEventsCount ?? 0}
          icon={CalendarDays}
          hint={t("stat_upcoming_events_hint")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Entregables por revisar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-mint-700" />
              {t("pending_review_title")}
            </CardTitle>
            <CardDescription>{t("pending_review_subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!pendingDeliverables?.length ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("pending_review_empty")}
              </p>
            ) : (
              <div className="divide-y">
                {pendingDeliverables.map((d: any) => (
                  <Link
                    key={d.id}
                    href={`/alumnos/${d.student_id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-accent/50 rounded-lg px-2 -mx-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.students?.full_name} · {t("submitted_at")}{" "}
                        {d.submitted_at ? formatDate(d.submitted_at) : "—"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas tareas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-mint-700" />
              {t("upcoming_tasks_title")}
            </CardTitle>
            <CardDescription>{t("upcoming_tasks_subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!upcomingTasks?.length ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("upcoming_tasks_empty")}
              </p>
            ) : (
              <div className="divide-y">
                {upcomingTasks.map((task: any) => {
                  const label = dueLabel(task.due_date);
                  return (
                    <Link
                      key={task.id}
                      href={`/alumnos/${task.student_id}`}
                      className="flex items-center justify-between gap-3 py-3 hover:bg-accent/50 rounded-lg px-2 -mx-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.students?.full_name} · {formatDate(task.due_date)}
                        </p>
                      </div>
                      <Badge variant={label.tone === "destructive" ? "destructive" : label.tone === "warning" ? "warning" : "secondary"}>
                        {label.text}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos eventos */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-mint-700" />
              {t("stat_upcoming_events")}
            </CardTitle>
            <CardDescription>{t("stat_upcoming_events_hint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {upcomingEvents.map((ev: any) => (
                <Link
                  key={ev.id}
                  href={`/calendario`}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-accent/50 rounded-lg px-2 -mx-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ev.students?.full_name ? `${ev.students.full_name} · ` : ""}
                      {formatDate(ev.event_date)}
                      {ev.start_time ? ` · ${ev.start_time.slice(0, 5)}` : ""}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alumnos recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t("recent_title")}</CardTitle>
            <CardDescription>{t("recent_subtitle")}</CardDescription>
          </div>
          {recent && recent.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/alumnos">
                {t("view_all")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!recent?.length ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{t("empty_title")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("empty_hint")}</p>
              <Button className="mt-4" asChild>
                <Link href="/alumnos/nuevo">
                  <Plus className="h-4 w-4" /> {t("empty_button")}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recent.map((s: any) => {
                const logged = Number(s.logged_hours ?? 0);
                const total = Number(s.total_hours ?? 0);
                const pct = total > 0 ? Math.min(100, Math.round((logged / total) * 100)) : 0;
                return (
                  <Link
                    key={s.id}
                    href={`/alumnos/${s.id}`}
                    className="flex items-center justify-between gap-4 py-3 hover:bg-accent/50 rounded-lg px-2 -mx-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {PRACTICE_TYPE_LABELS[s.practice_type as keyof typeof PRACTICE_TYPE_LABELS]}{" "}
                        · {t("starts")} {s.start_date ? formatDate(s.start_date) : "—"}
                      </p>
                    </div>
                    {total > 0 && (
                      <div className="hidden sm:flex flex-col items-end gap-1 w-32">
                        <span className="text-xs text-muted-foreground">
                          {t("hours_progress", { logged: Math.round(logged), total: Math.round(total) })}
                        </span>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-mint-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Badge variant={s.status === "active" ? "success" : "secondary"}>
                      {STATUS_LABELS[s.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
