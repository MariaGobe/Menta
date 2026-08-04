import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MentorConfigForm } from "./mentor-config-form";

export const dynamic = "force-dynamic";

export default async function MentorConfigPage() {
  const supabase = createClient();
  const t = await getTranslations("MentorConfigPage");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user!.id)
    .single();

  const orgId = profile?.organization_id;
  const { data: config } = await supabase
    .from("mentor_configs")
    .select("*")
    .eq("organization_id", orgId)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/configuracion"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-100 text-mint-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      <Card className="border-mint-200 bg-mint-50/40">
        <CardContent className="p-4 text-sm">
          <p className="text-mint-900">{t("why_matters")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("config_title")}</CardTitle>
          <CardDescription>{t("config_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {orgId && (
            <MentorConfigForm organizationId={orgId} config={config ?? null} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
