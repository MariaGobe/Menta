import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Users,
  FileText,
  ClipboardCheck,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { PRACTICE_TYPE_LABELS, STATUS_LABELS } from "@/types/database";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const t = await getTranslations("CompanyDashboard");

  const [{ count: studentsCount }, { count: activeCount }, { count: docsCount }, { data: recent }] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase
      .from("students")
      .select("id, full_name, practice_type, status, start_date")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const { data: org } = await supabase
    .from("organizations")
    .select("subscription_status, trial_ends_at")
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/alumnos/nuevo">
            <Plus className="h-4 w-4" /> {t("new_student")}
          </Link>
        </Button>
      </div>

      {org?.subscription_status === "trialing" && org.trial_ends_at && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-900">
                {t("trial_message_1")}{" "}
                <strong>{formatDate(org.trial_ends_at)}</strong>
                {t("trial_message_2")}
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/facturacion">{t("activate_plan")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("stat_total")} value={studentsCount ?? 0} icon={Users} />
        <StatCard label={t("stat_active")} value={activeCount ?? 0} icon={ClipboardCheck} tone="success" />
        <StatCard label={t("stat_documents")} value={docsCount ?? 0} icon={FileText} />
        <StatCard label={t("stat_hours")} value="—" icon={Clock} hint={t("stat_hours_hint")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recent_title")}</CardTitle>
          <CardDescription>{t("recent_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!recent?.length ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{t("empty_title")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("empty_hint")}</p>
              <Button className="mt-4" asChild>
                <Link href="/alumnos/nuevo">
                  <Plus className="h-4 w-4" /> {t("empty_button")}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recent.map((s) => (
                <Link
                  key={s.id}
                  href={`/alumnos/${s.id}`}
                  className="flex items-center justify-between py-3 hover:bg-accent/50 rounded-lg px-2 -mx-2"
                >
                  <div>
                    <p className="font-medium">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {PRACTICE_TYPE_LABELS[s.practice_type]} · {t("starts")} {formatDate(s.start_date)}
                    </p>
                  </div>
                  <Badge variant={s.status === "active" ? "success" : "secondary"}>
                    {STATUS_LABELS[s.status]}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
