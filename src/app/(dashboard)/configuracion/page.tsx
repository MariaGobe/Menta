import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "./organization-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, nif, email, phone, address, city, postal_code")
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu organización y el mentor virtual.</p>
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
            <p className="font-semibold">Configurar mentor virtual</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Alimenta al mentor con información sobre tu empresa, herramientas
              y forma de trabajar. Lo usará para acompañar a tus alumnos día a
              día sin necesidad de tu intervención.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 self-center text-muted-foreground" />
        </div>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la empresa</CardTitle>
          <CardDescription>
            Esta información aparecerá en convenios y documentos generados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {org && <OrganizationForm organization={org} />}
        </CardContent>
      </Card>
    </div>
  );
}
