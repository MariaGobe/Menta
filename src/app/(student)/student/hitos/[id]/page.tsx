import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MILESTONE_TYPE_LABELS, type MilestoneType } from "@/types/database";
import { MilestoneEditor } from "./milestone-editor";

export const dynamic = "force-dynamic";

export default async function MilestoneDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const t = await getTranslations("StudentMilestones");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id")
    .eq("id", user!.id)
    .single();

  const { data: milestone } = await supabase
    .from("milestones")
    .select("*")
    .eq("id", params.id)
    .eq("student_id", profile?.student_id ?? "")
    .single();

  if (!milestone) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("full_name, organizations(name)")
    .eq("id", milestone.student_id)
    .single();

  const companyName =
    (student?.organizations as { name?: string } | null)?.name ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/student/hitos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {milestone.title}
          </h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          <Badge variant="secondary" className="mr-2">
            {MILESTONE_TYPE_LABELS[milestone.type as MilestoneType]}
          </Badge>
          {milestone.endorsed_at && (
            <Badge variant="success" className="gap-1">
              <Award className="h-3 w-3" /> {t("endorsed_by_company")}
            </Badge>
          )}
        </p>
      </div>

      {milestone.endorsed_at && milestone.company_endorsement && (
        <Card className="border-mint-200 bg-mint-50/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-mint-700" />
              {t("endorsement_received_title")}
            </CardTitle>
            <CardDescription>{t("endorsement_received_hint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line italic text-mint-900">
              &ldquo;{milestone.company_endorsement}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("editor_title")}</CardTitle>
          <CardDescription>{t("editor_hint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <MilestoneEditor
            milestone={milestone as never}
            studentName={student?.full_name ?? null}
            companyName={companyName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
