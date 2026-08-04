"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/types/database";

interface Props {
  task: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    status: TaskStatus;
    estimated_hours: number | null;
    phase_name: string | null;
  };
}

export function TaskRow({ task }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("StudentTasks");
  const [loading, setLoading] = useState(false);

  async function markCompleted() {
    setLoading(true);
    await supabase
      .from("practice_tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", task.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium">{task.title}</p>
        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.phase_name && <span>{task.phase_name}</span>}
          {task.due_date && <span>{t("due_on", { date: formatDate(task.due_date) })}</span>}
          {task.estimated_hours && <span>{t("estimated_hours", { h: task.estimated_hours })}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={task.status === "blocked" ? "destructive" : "secondary"}>
          {TASK_STATUS_LABELS[task.status]}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={markCompleted}
          disabled={loading}
          title={t("mark_done_title")}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {t("done_label")}
        </Button>
      </div>
    </li>
  );
}
