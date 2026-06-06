import { getTranslations } from "next-intl/server";
import { Inbox, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliverableReviewCard } from "./review-card";

export const dynamic = "force-dynamic";

export default async function DeliverablesPage() {
  const supabase = createClient();
  const t = await getTranslations("Deliverables");

  const { data: rows } = await supabase
    .from("deliverables")
    .select(
      "id, title, description, storage_path, submitted_at, reviewed_at, feedback, students(full_name), practice_tasks(title)",
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(100);

  const items = (rows ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    storage_path: d.storage_path,
    submitted_at: d.submitted_at,
    reviewed_at: d.reviewed_at,
    feedback: d.feedback,
    studentName: d.students?.full_name ?? "—",
    taskTitle: d.practice_tasks?.title ?? null,
  }));

  const pending = items.filter((i) => !i.reviewed_at);
  const reviewed = items.filter((i) => i.reviewed_at);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            <Inbox className="mr-1 h-4 w-4" />
            {t("tab_pending")}
            {pending.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            {t("tab_reviewed")}
            {reviewed.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {reviewed.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-mint-500" />
              <p className="mt-3 text-sm font-medium">{t("empty_pending")}</p>
            </div>
          ) : (
            pending.map((d) => <DeliverableReviewCard key={d.id} {...d} />)
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="mt-4 space-y-3">
          {reviewed.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{t("empty_reviewed")}</p>
            </div>
          ) : (
            reviewed.map((d) => <DeliverableReviewCard key={d.id} {...d} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
