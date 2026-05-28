import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewMilestoneForm } from "./new-milestone-form";

export const dynamic = "force-dynamic";

export default async function NuevoHitoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, organization_id")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/student/hitos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a hitos
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear hito</h1>
        <p className="text-muted-foreground">
          Elige el tipo, redacta el contenido y, cuando estés listo, publícalo
          para compartirlo en LinkedIn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del hito</CardTitle>
          <CardDescription>
            Puedes guardarlo como borrador y editarlo más tarde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.student_id && profile?.organization_id && (
            <NewMilestoneForm
              studentId={profile.student_id}
              organizationId={profile.organization_id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
