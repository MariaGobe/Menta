import Link from "next/link";
import { Sparkles, ArrowRight, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "./organization-form";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { TeamPanel } from "./team-panel";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const supabase = createClient();
  const t = await getTranslations("Configuracion");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, nif, email, phone, address, city, postal_code")
    .single();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const { data: members } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .order("role", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Link
        href="/configuracion/mentor"
        className="block rounded-xl border bg-mint-50/40 p-5 transition hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint-100 text-mint-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{t("mentor_card_title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("mentor_card_desc")}</p>
          </div>
          <ArrowRight className="h-5 w-5 self-center text-muted-foreground" />
        </div>
      </Link>

      <TeamPanel
        currentUserId={user!.id}
        currentRole={(myProfile?.role as "owner" | "admin" | "student") ?? "admin"}
        members={(members ?? []) as any}
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint-100 text-mint-700">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{t("language_card_title")}</CardTitle>
              <CardDescription>{t("language_card_desc")}</CardDescription>
            </div>
          </div>
          <LanguageSwitcher variant="compact" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("company_card_title")}</CardTitle>
          <CardDescription>{t("company_card_desc")}</CardDescription>
        </CardHeader>
        <CardContent>{org && <OrganizationForm organization={org} />}</CardContent>
      </Card>
    </div>
  );
}
