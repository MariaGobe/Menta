import Link from "next/link";
import { Calendar as CalIcon, Target, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { SuggestChangeCard } from "./suggest-change";
import {
  PLAN_STATUS_LABELS,
  TASK_STATUS_LABELS,
  type PlanStatus,
  type TaskStatus,
} from "@/types/database";

export const dynamic = "force-dynamic";

export default async function StudentPlanPage() {
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

  const { data: plan } = await supabase
    .from("practice_plans")
    .select(
      "id, title, description, status, start_date, end_date, total_hours, objectives",
    )
    .eq("student_id", studentId)
    .maybeSingle();

  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi plan</h1>
          <p className="text-muted-foreground">
            Aquí verás tu plan de prácticas completo.
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              Tu plan aún no está disponible
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu tutor de empresa está preparando tu plan de prácticas. En
              cuanto lo apruebe, aparecerá aquí.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (plan.status === "draft") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-amber-500" />
            <h3 className="mt-4 text-lg font-semibold">Plan en revisión</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu empresa está revisando tu plan. Cuando lo aprueben podrás
              verlo aquí.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: phases } = await supabase
    .from("practice_phases")
    .select("id, name, description, order_index, start_date, end_date")
    .eq("plan_id", plan.id)
    .order("order_index");

  const { data: tasks } = await supabase
    .from("practice_tasks")
    .select("id, phase_id, title, description, due_date, status, estimated_hours, deliverable_required")
    .eq("plan_id", plan.id)
    .order("order_index");

  const tasksByPhase = (phases ?? []).map((ph) => ({
    ...ph,
    tasks: (tasks ?? []).filter((t) => t.phase_id === ph.id),
  }));
  const total = tasks?.length ?? 0;
  const done = (tasks ?? []).filter((t) => t.status === "completed").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  // Sugerencias de cambio del propio alumno (por RLS solo ve las suyas)
  const { data: suggestions } = await supabase
    .from("plan_change_suggestions")
    .select("id, title, description, status, reviewed_at, review_notes, created_at")
    .eq("plan_id", plan.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{plan.title}</h1>
          <Badge variant="success">{PLAN_STATUS_LABELS[plan.status as PlanStatus]}</Badge>
        </div>
        <p className="mt-1 text-muted-foreground">
          {formatDate(plan.start_date)} – {formatDate(plan.end_date)} ·{" "}
          {plan.total_hours} h totales
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sobre tu plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{plan.description}</p>
            {plan.objectives && plan.objectives.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Objetivos
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
            <CardTitle className="text-base">Tu progreso</CardTitle>
            <CardDescription>{done} / {total} tareas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{progress}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <Button className="mt-4 w-full" variant="outline" size="sm" asChild>
              <Link href="/student/tareas">Ir a tareas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <SuggestChangeCard
        planId={plan.id}
        initialSuggestions={(suggestions ?? []) as any}
      />

      <div className="space-y-3">
        {tasksByPhase.map((ph) => (
          <Card key={ph.id}>
            <CardHeader>
              <CardTitle className="text-base">{ph.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <CalIcon className="h-3 w-3" />
                {formatDate(ph.start_date)} – {formatDate(ph.end_date)}
                {ph.description && <span> · {ph.description}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ph.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Esta fase aún no tiene tareas.
                </p>
              ) : (
                <ul className="divide-y">
                  {ph.tasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Vence {formatDate(t.due_date)} · {t.estimated_hours} h
                          {t.deliverable_required && " · con entregable"}
                        </p>
                      </div>
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
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
