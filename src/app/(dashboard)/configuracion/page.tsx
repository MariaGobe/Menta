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
        <p className="text-muted-foreground">Gestiona los datos de tu organización.</p>
      </div>

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
