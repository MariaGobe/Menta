import Link from "next/link";
import { ClipboardCheck, Clock, Plus, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SeguimientoPage() {
  const supabase = createClient();
  const t = await getTranslations("Tracking");

  const [{ data: evaluations }, { data: hours }] = await Promise.all([
    supabase
      .from("evaluations")
      .select("id, type, evaluation_date, score, student_id, students(full_name)")
      .order("evaluation_date", { ascending: false })
      .limit(20),
    supabase
      .from("hour_logs")
      .select("id, log_date, hours, approved, student_id, students(full_name)")
      .order("log_date", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{t("evaluations_title")}</CardTitle>
              <CardDescription>{t("evaluations_subtitle")}</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> {t("new_button")}
            </Button>
          </CardHeader>
          <CardContent>
            {!evaluations?.length ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">{t("evaluations_empty_title")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("evaluations_empty_hint")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {evaluations.map((e) => {
                  const student = e.students as { full_name?: string } | null;
                  return (
                    <div key={e.id} className="flex items-center justify-between py-3">
                      <div>
                        <Link
                          href={`/alumnos/${e.student_id}`}
                          className="font-medium hover:text-primary"
                        >
                          {student?.full_name ?? "—"}
                        </Link>
                        <p className="text-xs text-muted-foreground capitalize">
                          {e.type} · {formatDate(e.evaluation_date)}
                        </p>
                      </div>
                      {e.score !== null && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" /> {e.score}/10
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{t("hours_title")}</CardTitle>
              <CardDescription>{t("hours_subtitle")}</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> {t("hours_register")}
            </Button>
          </CardHeader>
          <CardContent>
            {!hours?.length ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">{t("hours_empty_title")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("hours_empty_hint")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {hours.map((h) => {
                  const student = h.students as { full_name?: string } | null;
                  return (
                    <div key={h.id} className="flex items-center justify-between py-3">
                      <div>
                        <Link
                          href={`/alumnos/${h.student_id}`}
                          className="font-medium hover:text-primary"
                        >
                          {student?.full_name ?? "—"}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(h.log_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{h.hours}h</Badge>
                        {h.approved ? (
                          <Badge variant="success">{t("approved_badge")}</Badge>
                        ) : (
                          <Badge variant="warning">{t("pending_badge")}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
