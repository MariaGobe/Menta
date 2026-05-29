import Link from "next/link";
import { ArrowLeft, Sparkles, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  checkChallengeAvailability,
  CHALLENGE_ADDON_PRICE_EUR,
  FREE_CHALLENGES_PER_YEAR,
} from "@/lib/challenges";
import { NewChallengeForm } from "./new-challenge-form";

export const dynamic = "force-dynamic";

export default async function NuevoRetoPage() {
  const supabase = createClient();
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
        <ArrowLeft className="h-4 w-4" /> Volver a retos
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear reto</h1>
        <p className="text-muted-foreground">
          Define el reto, las fechas y los criterios. Cuando lo publiques, será
          visible públicamente y los alumnos podrán aplicar.
        </p>
      </div>

      {availability.hasFree ? (
        <Card className="border-mint-200 bg-mint-50/40">
          <CardContent className="flex items-start gap-3 p-4">
            <Sparkles className="h-5 w-5 shrink-0 text-mint-700" />
            <p className="text-sm text-mint-900">
              <strong>
                Este reto es gratis — usas tu {FREE_CHALLENGES_PER_YEAR}.º de
                este año.
              </strong>{" "}
              Podrás publicarlo directamente al guardar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 p-4">
            <CreditCard className="h-5 w-5 shrink-0 text-amber-700" />
            <div className="text-sm text-amber-900">
              <p>
                Ya has usado tu reto gratuito del año. Para publicar uno
                adicional se aplicará un coste de{" "}
                <strong>{CHALLENGE_ADDON_PRICE_EUR}€ + IVA</strong>. Puedes
                crear el borrador y pagar al publicar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del reto</CardTitle>
          <CardDescription>
            Sé claro con el problema, los criterios y el formato de entrega.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewChallengeForm organizationId={orgId} />
        </CardContent>
      </Card>
    </div>
  );
}
