"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface Props {
  studentId: string;
  organizationId: string;
  tasks: { id: string; title: string; due_date: string | null; status: string }[];
}

export function UploadDeliverableForm({ studentId, organizationId, tasks }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("StudentDeliverables");
  const [taskId, setTaskId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File;
    if (!file || file.size === 0) {
      setError(t("form_error_no_file"));
      setLoading(false);
      return;
    }

    const path = `${organizationId}/deliverables/${studentId}/${Date.now()}-${file.name}`;
    const { error: storageErr } = await supabase.storage
      .from("documents")
      .upload(path, file);

    if (storageErr) {
      setError(t("form_error_upload", { msg: storageErr.message }));
      setLoading(false);
      return;
    }

    const { data: inserted, error: dbErr } = await supabase
      .from("deliverables")
      .insert({
        organization_id: organizationId,
        student_id: studentId,
        task_id: taskId || null,
        title: (fd.get("title") as string) || file.name,
        description: (fd.get("description") as string) || null,
        storage_path: path,
        file_size: file.size,
        mime_type: file.type,
      })
      .select("id")
      .single();

    if (dbErr || !inserted) {
      setLoading(false);
      setError(dbErr?.message ?? t("form_error_save"));
      return;
    }

    fetch("/api/notifications/deliverable-submitted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliverableId: inserted.id }),
    }).catch(() => {});

    setLoading(false);
    (e.target as HTMLFormElement).reset();
    setTaskId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task">{t("form_task_label")}</Label>
        <Select value={taskId} onValueChange={setTaskId}>
          <SelectTrigger>
            <SelectValue placeholder={t("form_task_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {tasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.title}
                {task.due_date && ` ${t("form_task_due", { date: formatDate(task.due_date) })}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">{t("form_title_label")}</Label>
        <Input id="title" name="title" placeholder={t("form_title_placeholder")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("form_description_label")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder={t("form_description_placeholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">{t("form_file_label")}</Label>
        <Input id="file" name="file" type="file" required />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {t("form_submit")}
      </Button>
    </form>
  );
}
