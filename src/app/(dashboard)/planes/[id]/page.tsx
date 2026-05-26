import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { PLAN_STATUS_LABELS, type PlanStatus, type TaskStatus } from "@/types/database";
import { ApprovePlanButton } from "./approve-button";
import { PlanTasksSection } from "./plan-tasks-section";

export const dynamic = "force-dynamic";

export default async function PlanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: plan } = await supabase
    .from("practice_plans")
    .select(
      "id, title, description, status, start_date, end_date, total_hours, objectives, student_id, organization_id, approved_at, students(full_name, practice_type)",
    )
    .eq("id", params.id)
    .single();

  if (!plan) notFound();

  const { data: phases } = await supabase
    .from("practice_phases")
    .select("id, name, description, order_index, start_date, end_date")
    .eq("plan_id", plan.id)
    .order("order_index");

  const { data: tasks } = await supabase
    .from("practice_tasks")
    .select(
      "id, phase_id, title, description, due_date, status, estimated_hours, deliverable_required, order_index",
    )
    .eq("plan_id", plan.id)
    .order("order_index");

  const student = plan.students as { full_name?: string; practice_type?: string } | null;
  const tasksByPhase = (phases ?? []).map((ph) => ({
    ...ph,
    tasks: (tasks ?? []).filter((t) => t.phase_id === ph.id),
  }));
  const totalTasks = tasks?.length ?? 0;
  const completed = (tasks ?? []).filter((t) => t.status === "completed").length;
  const progress = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/planes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{plan.title}</h1>
            <Badge
              variant={
                plan.status === "approved" || plan.status === "in_progress"
                  ? "success"
                  : "secondary"
              }
            >
              {PLAN_STATUS_LABELS[plan.status as PlanStatus]}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {student?.full_name} · {plan.start_date && formatDate(plan.start_date)} –{" "}
            {plan.end_date && formatDate(plan.end_date)} · {plan.total_hours}h
          </p>
        </div>
        {plan.status === "draft" && <ApprovePlanButton planId={plan.id} />}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{plan.description}</p>
            {plan.objectives && plan.objectives.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Objetivos formativos
                  </p>
                  <ul className="space-y-1">
                    {plan.objectives.map((o: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <Target className="h-4 w-4 shrink-0 text-primary" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progreso</CardTitle>
            <CardDescription>
              {completed} / {totalTasks} tareas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{progress}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <PlanTasksSection
        planId={plan.id}
        organizationId={plan.organization_id}
        studentId={plan.student_id}
        phases={tasksByPhase.map((ph) => ({
          id: ph.id,
          name: ph.name,
          description: ph.description,
          start_date: ph.start_date,
          end_date: ph.end_date,
          order_index: ph.order_index,
          tasks: ph.tasks.map((t) => ({
            id: t.id,
            phase_id: t.phase_id,
            title: t.title,
            description: t.description,
            due_date: t.due_date,
            status: t.status as TaskStatus,
            estimated_hours: t.estimated_hours,
            deliverable_required: t.deliverable_required,
            order_index: t.order_index ?? 0,
          })),
        }))}
      />
    </div>
  );
}
