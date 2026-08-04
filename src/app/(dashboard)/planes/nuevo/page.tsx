import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GeneratePlanWizard } from "./generate-wizard";

export const dynamic = "force-dynamic";

export default async function NuevoPlanPage() {
  const supabase = createClient();
  const t = await getTranslations("PlanNew");
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, practice_type, start_date, end_date, total_hours, status")
    .eq("status", "active")
    .order("full_name");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/planes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("form_card_title")}</CardTitle>
          <CardDescription>{t("form_card_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratePlanWizard students={students ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
