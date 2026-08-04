import { Upload } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { UploadDeliverableForm } from "./upload-form";

export const dynamic = "force-dynamic";

export default async function StudentEntregablesPage() {
  const supabase = createClient();
  const t = await getTranslations("StudentDeliverables");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, organization_id")
    .eq("id", user!.id)
    .single();

  const studentId = profile?.student_id;
  const orgId = profile?.organization_id;

  const { data: tasks } = await supabase
    .from("practice_tasks")
    .select("id, title, due_date, status")
    .eq("student_id", studentId)
    .eq("deliverable_required", true)
    .order("due_date", { ascending: true, nullsFirst: false });

  const { data: deliverables } = await supabase
    .from("deliverables")
    .select(
      "id, title, description, storage_path, submitted_at, reviewed_at, feedback, task_id, practice_tasks(title)",
    )
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("upload_title")}</CardTitle>
          <CardDescription>{t("upload_hint")}</CardDescription>
        </CardHeader>
        <CardContent>
          {studentId && orgId && (
            <UploadDeliverableForm
              studentId={studentId}
              organizationId={orgId}
              tasks={tasks ?? []}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("history_title")}</CardTitle>
          <CardDescription>{t("history_count", { n: deliverables?.length ?? 0 })}</CardDescription>
        </CardHeader>
        <CardContent>
          {!deliverables?.length ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{t("empty")}</p>
            </div>
          ) : (
            <ul className="divide-y">
              {deliverables.map((d) => {
                const task = d.practice_tasks as { title?: string } | null;
                return (
                  <li key={d.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task?.title && <span>{task.title} · </span>}
                          {t("sent_at", { date: formatDate(d.submitted_at) })}
                        </p>
                        {d.feedback && (
                          <p className="mt-2 rounded bg-mint-50 p-2 text-xs">
                            <strong>{t("feedback_prefix")} </strong>
                            {d.feedback}
                          </p>
                        )}
                      </div>
                      <Badge variant={d.reviewed_at ? "success" : "secondary"}>
                        {d.reviewed_at ? t("status_reviewed") : t("status_pending_review")}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
