import Link from "next/link";
import { Plus, Award, Sparkles, Globe, Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  MILESTONE_TYPE_LABELS,
  type MilestoneType,
} from "@/types/database";

export const dynamic = "force-dynamic";

export default async function StudentHitosPage() {
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
  const studentId = profile?.student_id;

  const { data: milestones } = await supabase
    .from("milestones")
    .select(
      "id, type, title, description, is_published, public_slug, published_at, endorsed_at, company_endorsement, created_at",
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/student/hitos/nuevo">
            <Plus className="h-4 w-4" /> {t("new_button")}
          </Link>
        </Button>
      </div>

      {!milestones?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{t("empty_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("empty_hint")}</p>
            <Button className="mt-6" asChild>
              <Link href="/student/hitos/nuevo">
                <Plus className="h-4 w-4" /> {t("empty_button")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {milestones.map((m) => (
            <Link
              key={m.id}
              href={`/student/hitos/${m.id}`}
              className="block"
            >
              <Card className="transition hover:border-mint-300 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-base">{m.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="secondary" className="mr-2">
                          {MILESTONE_TYPE_LABELS[m.type as MilestoneType]}
                        </Badge>
                        {t("created_at", { date: formatDate(m.created_at) })}
                        {m.endorsed_at && (
                          <span className="ml-2 text-mint-700">
                            {t("endorsed_suffix")}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {m.is_published ? (
                      <Badge variant="success" className="gap-1">
                        <Globe className="h-3 w-3" /> {t("public_badge")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" /> {t("private_badge")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                {m.description && (
                  <CardContent className="pt-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {m.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card className="border-mint-200 bg-mint-50/50">
        <CardContent className="flex items-center gap-3 p-4">
          <Sparkles className="h-5 w-5 text-mint-700" />
          <p className="text-sm text-mint-900">{t("tip")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
