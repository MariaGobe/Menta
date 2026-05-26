"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Props {
  studentId: string;
  organizationId: string;
  date: string;
  existing: {
    id: string;
    tasks_done: string | null;
    hours_worked: number | null;
    learnings: string | null;
    difficulties: string | null;
    next_steps: string | null;
  } | null;
}

export function DailyLogForm({ studentId, organizationId, date, existing }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const fd = new FormData(e.currentTarget);
    const payload = {
      organization_id: organizationId,
      student_id: studentId,
      log_date: date,
      tasks_done: (fd.get("tasks_done") as string) || null,
      hours_worked: fd.get("hours_worked")
        ? Number(fd.get("hours_worked"))
        : null,
      learnings: (fd.get("learnings") as string) || null,
      difficulties: (fd.get("difficulties") as string) || null,
      next_steps: (fd.get("next_steps") as string) || null,
    };

    await supabase.from("daily_activity_logs").upsert(payload, {
      onConflict: "student_id,log_date",
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tasks_done">¿Qué tareas has realizado hoy?</Label>
          <Textarea
            id="tasks_done"
            name="tasks_done"
            rows={3}
            defaultValue={existing?.tasks_done ?? ""}
            placeholder="Descripción de tareas realizadas..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hours_worked">Horas dedicadas</Label>
          <Input
            id="hours_worked"
            name="hours_worked"
            type="number"
            min="0"
            step="0.5"
            defaultValue={existing?.hours_worked ?? ""}
            placeholder="8"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="learnings">Aprendizajes</Label>
          <Textarea
            id="learnings"
            name="learnings"
            rows={2}
            defaultValue={existing?.learnings ?? ""}
            placeholder="¿Qué has aprendido hoy?"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="difficulties">Dificultades</Label>
          <Textarea
            id="difficulties"
            name="difficulties"
            rows={2}
            defaultValue={existing?.difficulties ?? ""}
            placeholder="¿Qué te ha costado? ¿Qué te ha bloqueado?"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="next_steps">Próximos pasos</Label>
          <Textarea
            id="next_steps"
            name="next_steps"
            rows={2}
            defaultValue={existing?.next_steps ?? ""}
            placeholder="¿Qué vas a hacer mañana?"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-mint-700">
            <Check className="h-4 w-4" /> Guardado
          </span>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar entrada
        </Button>
      </div>
    </form>
  );
}
