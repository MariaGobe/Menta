import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PresentationEditor } from "./presentation-editor";

export const dynamic = "force-dynamic";

export default async function StudentPresentacionPage() {
  const supabase = createClient();
  const t = await getTranslations("StudentPresentation");
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

  if (!studentId || !orgId) return null;

  const { data: student } = await supabase
    .from("students")
    .select("full_name, practice_type, start_date, end_date, organizations(name)")
    .eq("id", studentId)
    .single();

  let { data: presentation } = await supabase
    .from("final_presentations")
    .select("*")
    .eq("student_id", studentId)
    .maybeSingle();

  if (!presentation) {
    const [{ data: tasks }, { data: logs }] = await Promise.all([
      supabase
        .from("practice_tasks")
        .select("title")
        .eq("student_id", studentId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(8),
      supabase
        .from("daily_activity_logs")
        .select("learnings")
        .eq("student_id", studentId)
        .not("learnings", "is", null)
        .order("log_date", { ascending: false })
        .limit(15),
    ]);

    const companyName =
      (student?.organizations as { name?: string } | null)?.name ??
      t("share_company_fallback");
    const suggested = {
      title: t("share_title", { company: companyName }),
      summary: t("share_summary", {
        name: student?.practice_type ?? "",
        start: student?.start_date ?? "",
        end: student?.end_date ?? "",
      }),
      achievements:
        (tasks ?? []).slice(0, 5).map((task) => ({ title: task.title })) ?? [],
      competencies: extractCompetencies(
        (logs ?? []).map((l) => l.learnings).filter(Boolean) as string[],
      ),
    };

    presentation = {
      id: "",
      organization_id: orgId,
      student_id: studentId,
      title: suggested.title,
      summary: suggested.summary,
      achievements: suggested.achievements,
      competencies: suggested.competencies,
      highlights: null,
      is_public: false,
      public_slug: null,
      published_at: null,
      created_at: "",
      updated_at: "",
    };
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="border-mint-200 bg-mint-50/40">
        <CardContent className="p-4 text-sm">
          <p className="text-mint-900">
            <strong>{t("how_title")}</strong> {t("how_hint")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("yours_title")}</CardTitle>
          <CardDescription>{t("yours_hint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PresentationEditor
            studentId={studentId}
            organizationId={orgId}
            initial={presentation as never}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function extractCompetencies(learnings: string[]): { name: string }[] {
  if (learnings.length === 0) return [];
  const text = learnings.join(" ").toLowerCase();
  const candidates = [
    "trabajo en equipo",
    "comunicación",
    "teamwork",
    "communication",
    "autonomía",
    "autonomy",
    "resolución de problemas",
    "problem solving",
    "react",
    "javascript",
    "python",
    "git",
    "sql",
    "diseño",
    "design",
    "ux",
    "ui",
    "agile",
    "scrum",
    "testing",
    "documentación",
    "documentation",
    "análisis",
    "analysis",
    "presentación",
    "presentation",
  ];
  return candidates
    .filter((c) => text.includes(c))
    .slice(0, 8)
    .map((name) => ({ name }));
}
