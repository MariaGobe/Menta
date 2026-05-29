import Link from "next/link";
import { Plus, Trophy, Sparkles, ChevronRight } from "lucide-react";
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

  // Para cada reto activo, contar aplicantes
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
          <h1 className="text-3xl font-bold tracking-tight">Retos abiertos</h1>
          <p className="text-muted-foreground">
            Publica un reto para captar talento. Los aplicantes resuelven un
            problema real y tú decides a quién contactar.
          </p>
        </div>
        <Button asChild>
          <Link href="/retos/nuevo">
            <Plus className="h-4 w-4" /> Nuevo reto
          </Link>
        </Button>
      </div>

      <Card className="border-mint-200 bg-mint-50/40">
        <CardContent className="flex items-start gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-mint-700" />
          <div className="flex-1 text-sm text-mint-900">
            <p>
              <strong>Tienes {FREE_CHALLENGES_PER_YEAR} reto gratis al año.</strong>{" "}
              {availability && (
                <>
                  Has publicado {availability.usedThisYear} en los últimos 12
                  meses.{" "}
                  {availability.hasFree ? (
                    <span>Tu próximo reto es gratis.</span>
                  ) : (
                    <span>
                      Retos adicionales: {CHALLENGE_ADDON_PRICE_EUR}€ + IVA cada
                      uno.
                    </span>
                  )}
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-mint-800">
              Cada reto dura 1 mes. Recibirás un resumen automático con los
              aplicantes y los trabajos destacados al cerrarlo.
            </p>
          </div>
        </CardContent>
      </Card>

      {!challenges?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Aún no tienes retos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea tu primer reto público y empieza a captar talento joven.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/retos/nuevo">
                <Plus className="h-4 w-4" /> Crear primer reto
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
                        {counts[c.id] ?? 0} aplicante
                        {counts[c.id] === 1 ? "" : "s"}
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
