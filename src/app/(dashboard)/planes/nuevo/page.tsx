import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GeneratePlanWizard } from "./generate-wizard";

export const dynamic = "force-dynamic";

export default async function NuevoPlanPage() {
  const supabase = createClient();
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
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generar plan</h1>
        <p className="text-muted-foreground">
          Selecciona un alumno y genera un plan de prácticas a partir de una
          plantilla. Podrás revisarlo y editarlo antes de aprobarlo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del plan</CardTitle>
          <CardDescription>
            La plantilla se elige automáticamente según el tipo de práctica del
            alumno. Las fechas y horas se toman de la ficha del alumno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratePlanWizard students={students ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
