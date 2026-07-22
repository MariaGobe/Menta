import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PLAN_STATUS_LABELS, type PlanStatus } from "@/types/database";
import { DuplicatePlanButton } from "./duplicate-button";

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
  const supabase = createClient();
  const t = await getTranslations("Plans");
  const { data: plans } = await supabase
    .from("practice_plans")
    .select(
      "id, title, status, start_date, end_date, total_hours, student_id, students(full_name, practice_type)",
    )
    .order("created_at", { ascending: false });

  const n = plans?.length ?? 0;
  const countLabel = n === 0 ? t("count_zero") : n === 1 ? t("count_one") : t("count_other", { n });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{countLabel}</p>
        </div>
        <Button asChild>
          <Link href="/planes/nuevo">
            <Plus className="h-4 w-4" /> {t("generate")}
          </Link>
        </Button>
      </div>

      {!plans?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{t("empty_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("empty_subtitle")}</p>
            <Button className="mt-6" asChild>
              <Link href="/planes/nuevo">
                <Plus className="h-4 w-4" /> {t("empty_button")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">{t("th_student")}</th>
                  <th className="px-6 py-3 font-medium">{t("th_plan")}</th>
                  <th className="px-6 py-3 font-medium">{t("th_period")}</th>
                  <th className="px-6 py-3 font-medium">{t("th_hours")}</th>
                  <th className="px-6 py-3 font-medium">{t("th_status")}</th>
                  <th className="px-6 py-3 font-medium text-right">{t("th_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {plans.map((p) => {
                  const s = p.students as { full_name?: string; practice_type?: string } | null;
                  return (
                    <tr key={p.id} className="hover:bg-accent/30">
                      <td className="px-6 py-4 font-medium">{s?.full_name ?? "—"}</td>
                      <td className="px-6 py-4">
                        <Link href={`/planes/${p.id}`} className="hover:text-primary">
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(p.start_date)} – {formatDate(p.end_date)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.total_hours ?? "—"} h
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            p.status === "approved" || p.status === "in_progress"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {PLAN_STATUS_LABELS[p.status as PlanStatus]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DuplicatePlanButton planId={p.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
