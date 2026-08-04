import Link from "next/link";
import { Plus, Trophy, Sparkles, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  CHALLENGE_STATUS_LABELS,
  type ChallengeStatus,
} from "@/types/database";
import { checkChallengeAvailability } from "@/lib/challenges-server";
import {
  CHALLENGE_ADDON_PRICE_EUR,
  FREE_CHALLENGES_PER_YEAR,
} from "@/lib/challenges";

export const dynamic = "force-dynamic";

export default async function RetosPage() {
  const supabase = createClient();
  const t = await getTranslations("Challenges");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user!.id)
    .single();
  const orgId = profile?.organization_id;

  const { data: challenges } = await supabase
    .from("challenges")
    .select(
      "id, title, status, start_date, end_date, public_slug, payment_status",
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const counts: Record<string, number> = {};
  if (challenges) {
    for (const c of challenges) {
      const { count } = await supabase
        .from("challenge_applications")
        .select("*", { count: "exact", head: true })
        .eq("challenge_id", c.id);
      counts[c.id] = count ?? 0;
    }
  }

  const availability = orgId ? await checkChallengeAvailability(orgId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/retos/nuevo">
            <Plus className="h-4 w-4" /> {t("new_button")}
          </Link>
        </Button>
      </div>

      <Card className="border-mint-200 bg-mint-50/40">
        <CardContent className="flex items-start gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-mint-700" />
          <div className="flex-1 text-sm text-mint-900">
            <p>
              <strong>{t("free_first", { n: FREE_CHALLENGES_PER_YEAR })}</strong>{" "}
              {availability && (
                <>
                  {t("used_this_year", { n: availability.usedThisYear })}{" "}
                  {availability.hasFree ? (
                    <span>{t("next_free")}</span>
                  ) : (
                    <span>{t("extra_cost", { price: CHALLENGE_ADDON_PRICE_EUR })}</span>
                  )}
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-mint-800">{t("monthly_note")}</p>
          </div>
        </CardContent>
      </Card>

      {!challenges?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{t("empty_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("empty_hint")}</p>
            <Button className="mt-6" asChild>
              <Link href="/retos/nuevo">
                <Plus className="h-4 w-4" /> {t("empty_button")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {challenges.map((c) => (
            <Link key={c.id} href={`/retos/${c.id}`}>
              <Card className="transition hover:border-mint-300 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-base">{c.title}</CardTitle>
                      <CardDescription>
                        {formatDate(c.start_date)} – {formatDate(c.end_date)} ·{" "}
                        {t("applicants_count", { n: counts[c.id] ?? 0 })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          c.status === "published"
                            ? "success"
                            : c.status === "closed"
                              ? "info"
                              : "secondary"
                        }
                      >
                        {CHALLENGE_STATUS_LABELS[c.status as ChallengeStatus]}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
