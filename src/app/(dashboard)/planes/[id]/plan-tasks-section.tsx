"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar as CalIcon,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import {
  TASK_STATUS_LABELS,
  type TaskStatus,
} from "@/types/database";

interface Task {
  id: string;
  phase_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  estimated_hours: number | null;
  deliverable_required: boolean;
  deliverable_description: string | null;
  order_index: number;
}

interface Phase {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  order_index: number;
  tasks: Task[];
}

interface Props {
  planId: string;
  organizationId: string;
  studentId: string | null;
  phases: Phase[];
  readOnly?: boolean;
  /** Si true, permite eliminar la fase entera (con sus tareas) */
  allowDeletePhases?: boolean;
}

export function PlanTasksSection({
  planId,
  organizationId,
  studentId,
  phases,
  readOnly = false,
  allowDeletePhases = false,
}: Props) {
  return (
    <div className="space-y-3">
      {phases.map((ph) => (
        <PhaseCard
          key={ph.id}
          planId={planId}
          organizationId={organizationId}
          studentId={studentId}
          phase={ph}
          readOnly={readOnly}
          allowDelete={allowDeletePhases}
        />
      ))}
    </div>
  );
}

function PhaseCard({
  planId,
  organizationId,
  studentId,
  phase,
  readOnly,
  allowDelete,
}: {
  planId: string;
  organizationId: string;
  studentId: string | null;
  phase: Phase;
  readOnly: boolean;
  allowDelete: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("PlanTasks");
  const tEditor = useTranslations("PlanEditor");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deletePhase() {
    if (!confirm(tEditor("delete_phase_confirm", { name: phase.name }))) return;
    setDeleting(true);
    await supabase.from("calendar_events").delete().in(
      "task_id",
      phase.tasks.map((tk) => tk.id),
    );
    await supabase.from("practice_tasks").delete().eq("phase_id", phase.id);
    await supabase.from("practice_phases").delete().eq("id", phase.id);
    setDeleting(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex-1">
          <CardTitle className="text-base">{phase.name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <CalIcon className="h-3 w-3" />
            {formatDate(phase.start_date)} – {formatDate(phase.end_date)}
            {phase.description && <span> · {phase.description}</span>}
          </CardDescription>
        </div>
        {allowDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={deletePhase}
            disabled={deleting}
            title={tEditor("delete_phase")}
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {phase.tasks.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">{t("phase_empty")}</p>
        )}
        <ul className="divide-y">
          {phase.tasks.map((task) => (
            <TaskRow key={task.id} task={task} readOnly={readOnly} />
          ))}
        </ul>
        {adding && (
          <div className="mt-3 rounded-lg border bg-muted/30 p-3">
            <TaskForm
              planId={planId}
              phaseId={phase.id}
              organizationId={organizationId}
              studentId={studentId}
              defaultDueDate={phase.end_date}
              onDone={() => setAdding(false)}
            />
          </div>
        )}
        {!adding && !readOnly && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-3 w-3" /> {t("add_task")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, readOnly }: { task: Task; readOnly: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("PlanTasks");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!confirm(t("delete_confirm", { title: task.title }))) return;
    setDeleting(true);
    await supabase.from("calendar_events").delete().eq("task_id", task.id);
    await supabase.from("practice_tasks").delete().eq("id", task.id);
    setDeleting(false);
    router.refresh();
  }

  if (editing) {
    return (
      <li className="rounded-lg border bg-muted/30 p-3 my-2">
        <TaskForm
          editingTask={task}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium">{task.title}</p>
        {task.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("due_on", { date: formatDate(task.due_date) })} · {task.estimated_hours ?? "—"} h
          {task.deliverable_required && ` ${t("with_deliverable")}`}
        </p>
        {task.deliverable_required && task.deliverable_description && (
          <p className="mt-1 rounded bg-mint-50 p-2 text-xs text-mint-900">
            <strong>{t("form_deliverable_desc_label")}:</strong>{" "}
            {task.deliverable_description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant={
            task.status === "completed"
              ? "success"
              : task.status === "blocked"
                ? "destructive"
                : "secondary"
          }
        >
          {TASK_STATUS_LABELS[task.status]}
        </Badge>
        {!readOnly && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditing(true)}
              title={t("edit_title")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={remove}
              disabled={deleting}
              title={t("delete_title")}
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

interface TaskFormProps {
  planId?: string;
  phaseId?: string;
  organizationId?: string;
  studentId?: string;
  defaultDueDate?: string | null;
  editingTask?: Task;
  onDone: () => void;
}

function TaskForm(props: TaskFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("PlanTasks");
  const isEdit = !!props.editingTask;
  const [loading, setLoading] = useState(false);
  const [deliverableOn, setDeliverableOn] = useState(
    props.editingTask?.deliverable_required ?? false,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      due_date: (fd.get("due_date") as string) || null,
      estimated_hours: fd.get("estimated_hours")
        ? Number(fd.get("estimated_hours"))
        : null,
      deliverable_required: fd.get("deliverable_required") === "on",
      deliverable_description:
        fd.get("deliverable_required") === "on"
          ? (fd.get("deliverable_description") as string) || null
          : null,
    };

    if (isEdit && props.editingTask) {
      const taskId = props.editingTask.id;
      await supabase.from("practice_tasks").update(payload).eq("id", taskId);
      await supabase
        .from("calendar_events")
        .update({
          title: payload.title,
          description: payload.description,
          event_date: payload.due_date,
          event_type: payload.deliverable_required ? "deliverable" : "task",
        })
        .eq("task_id", taskId);
    } else {
      const { data: created } = await supabase
        .from("practice_tasks")
        .insert({
          ...payload,
          plan_id: props.planId,
          phase_id: props.phaseId,
          organization_id: props.organizationId,
          student_id: props.studentId,
          status: "pending",
          order_index: 999,
        })
        .select("id")
        .single();

      if (created?.id && payload.due_date) {
        await supabase.from("calendar_events").insert({
          organization_id: props.organizationId,
          student_id: props.studentId,
          task_id: created.id,
          title: payload.title,
          description: payload.description,
          event_type: payload.deliverable_required ? "deliverable" : "task",
          event_date: payload.due_date,
        });
      }
    }

    setLoading(false);
    router.refresh();
    props.onDone();
  }

  const editing = props.editingTask;
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title">{t("form_title_label")}</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={editing?.title ?? ""}
          placeholder={t("form_title_placeholder")}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">{t("form_description_label")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={editing?.description ?? ""}
          placeholder={t("form_description_placeholder")}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="due_date">{t("form_due_label")}</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={editing?.due_date ?? props.defaultDueDate ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="estimated_hours">{t("form_hours_label")}</Label>
          <Input
            id="estimated_hours"
            name="estimated_hours"
            type="number"
            min="0"
            step="0.5"
            defaultValue={editing?.estimated_hours ?? ""}
            placeholder="8"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="deliverable_required">&nbsp;</Label>
          <label className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm">
            <input
              type="checkbox"
              name="deliverable_required"
              checked={deliverableOn}
              onChange={(e) => setDeliverableOn(e.target.checked)}
              className="h-4 w-4"
            />
            {t("form_deliverable_label")}
          </label>
        </div>
      </div>
      {deliverableOn && (
        <div className="space-y-1 rounded-md border border-mint-200 bg-mint-50/40 p-3">
          <Label htmlFor="deliverable_description">
            {t("form_deliverable_desc_label")}
          </Label>
          <Textarea
            id="deliverable_description"
            name="deliverable_description"
            rows={2}
            defaultValue={editing?.deliverable_description ?? ""}
            placeholder={t("form_deliverable_desc_placeholder")}
          />
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={props.onDone}
          disabled={loading}
        >
          <X className="h-3.5 w-3.5" /> {t("cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {isEdit ? t("save_changes") : t("create_task")}
        </Button>
      </div>
    </form>
  );
}
