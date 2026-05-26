"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  studentId: string;
  phases: Phase[];
  /** Si el plan está aprobado, solo se permite ver y completar; no editar */
  readOnly?: boolean;
}

export function PlanTasksSection({
  planId,
  organizationId,
  studentId,
  phases,
  readOnly = false,
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
}: {
  planId: string;
  organizationId: string;
  studentId: string;
  phase: Phase;
  readOnly: boolean;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{phase.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <CalIcon className="h-3 w-3" />
          {formatDate(phase.start_date)} – {formatDate(phase.end_date)}
          {phase.description && <span> · {phase.description}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {phase.tasks.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">
            Esta fase aún no tiene tareas.
          </p>
        )}
        <ul className="divide-y">
          {phase.tasks.map((t) => (
            <TaskRow key={t.id} task={t} readOnly={readOnly} />
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
            <Plus className="h-3 w-3" /> Añadir tarea
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, readOnly }: { task: Task; readOnly: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    setDeleting(true);
    // Borrar también el calendar_event asociado (si lo hay)
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
          Vence {formatDate(task.due_date)} · {task.estimated_hours ?? "—"} h
          {task.deliverable_required && " · con entregable"}
        </p>
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
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={remove}
              disabled={deleting}
              title="Eliminar"
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
  // Creación
  planId?: string;
  phaseId?: string;
  organizationId?: string;
  studentId?: string;
  defaultDueDate?: string | null;
  // Edición
  editingTask?: Task;
  onDone: () => void;
}

function TaskForm(props: TaskFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!props.editingTask;
  const [loading, setLoading] = useState(false);

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
    };

    if (isEdit && props.editingTask) {
      const taskId = props.editingTask.id;
      await supabase.from("practice_tasks").update(payload).eq("id", taskId);
      // Mantener el calendar_event sincronizado
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

      // Crear evento de calendario si tiene fecha
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

  const t = props.editingTask;
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={t?.title ?? ""}
          placeholder="Ej. Implementar pantalla de login"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={t?.description ?? ""}
          placeholder="Detalle de qué incluye esta tarea, requisitos, criterios de aceptación..."
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="due_date">Fecha límite</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={t?.due_date ?? props.defaultDueDate ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="estimated_hours">Horas estimadas</Label>
          <Input
            id="estimated_hours"
            name="estimated_hours"
            type="number"
            min="0"
            step="0.5"
            defaultValue={t?.estimated_hours ?? ""}
            placeholder="8"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="deliverable_required">&nbsp;</Label>
          <label className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm">
            <input
              type="checkbox"
              name="deliverable_required"
              defaultChecked={t?.deliverable_required ?? false}
              className="h-4 w-4"
            />
            Requiere entregable
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={props.onDone}
          disabled={loading}
        >
          <X className="h-3.5 w-3.5" /> Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {isEdit ? "Guardar cambios" : "Crear tarea"}
        </Button>
      </div>
    </form>
  );
}
