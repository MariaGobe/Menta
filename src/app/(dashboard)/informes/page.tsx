import Link from "next/link";
import { FileSpreadsheet, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const REPORT_TYPES = [
  {
    id: "intermedio",
    title: "Informe intermedio",
    description: "Estado del alumno a mitad de prácticas.",
  },
  {
    id: "final_empresa",
    title: "Informe final para empresa",
    description: "Resumen interno con evaluación y observaciones.",
  },
  {
    id: "final_centro",
    title: "Informe final para centro educativo",
    description: "Documento oficial para el centro o universidad.",
  },
  {
    id: "memoria",
    title: "Memoria de prácticas",
    description: "Memoria personal del alumno (puede generarla él mismo).",
  },
];

export default async function InformesPage() {
  const supabase = createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, practice_type, status, start_date, end_date")
    .order("full_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Informes</h1>
        <p className="text-muted-foreground">
          Genera informes exportables para empresa, centros educativos y
          alumnos. Cada informe se genera a partir de los datos registrados en
          Menta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selecciona un alumno</CardTitle>
          <CardDescription>
            Después podrás elegir el tipo de informe a generar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!students?.length ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay alumnos.
            </p>
          ) : (
            <ul className="divide-y">
              {students.map((s) => (
                <li key={s.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between py-3 hover:bg-accent/20 rounded-lg px-2 -mx-2 list-none">
                      <div>
                        <p className="text-sm font-medium">{s.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.practice_type} ·{" "}
                          {s.start_date ?? "—"} → {s.end_date ?? "—"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-2 grid gap-2 px-2 pb-3 md:grid-cols-2">
                      {REPORT_TYPES.map((rt) => (
                        <Link
                          key={rt.id}
                          href={`/informes/${s.id}/${rt.id}`}
                          className="flex items-start gap-3 rounded-lg border bg-card p-3 hover:shadow-md transition"
                        >
                          <FileSpreadsheet className="h-5 w-5 shrink-0 text-mint-700" />
                          <div>
                            <p className="text-sm font-medium">{rt.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {rt.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
