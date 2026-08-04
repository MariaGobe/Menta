import Link from "next/link";
import { ArrowLeft, Sparkles, CreditCard } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { checkChallengeAvailability } from "@/lib/challenges-server";
import {
  CHALLENGE_ADDON_PRICE_EUR,
  FREE_CHALLENGES_PER_YEAR,
} from "@/lib/challenges";
import { NewChallengeForm } from "./new-challenge-form";

export const dynamic = "force-dynamic";

export default async function NuevoRetoPage() {
  const supabase = createClient();
  const t = await getTranslations("NewChallenge");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user!.id)
    .single();
  const orgId = profile?.organization_id ?? "";

  const availability = await checkChallengeAvailability(orgId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/retos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {availability.hasFree ? (
        <Card className="border-mint-200 bg-mint-50/40">
          <CardContent className="flex items-start gap-3 p-4">
            <Sparkles className="h-5 w-5 shrink-0 text-mint-700" />
            <p className="text-sm text-mint-900">
              <strong>{t("free_note", { n: FREE_CHALLENGES_PER_YEAR })}</strong>
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 p-4">
            <CreditCard className="h-5 w-5 shrink-0 text-amber-700" />
            <div className="text-sm text-amber-900">
              <p>{t("paid_note", { price: CHALLENGE_ADDON_PRICE_EUR })}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("form_card_title")}</CardTitle>
          <CardDescription>{t("form_card_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <NewChallengeForm organizationId={orgId} />
        </CardContent>
      </Card>
    </div>
  );
}
