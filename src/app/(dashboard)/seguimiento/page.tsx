import Link from "next/link";
import { ClipboardCheck, Clock, Plus, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SeguimientoPage() {
  const supabase = createClient();

  const [{ data: evaluations }, { data: hours }] = await Promise.all([
    supabase
      .from("evaluations")
      .select("id, type, evaluation_date, score, student_id, students(full_name)")
      .order("evaluation_date", { ascending: false })
      .limit(20),
    supabase
      .from("hour_logs")
      .select("id, log_date, hours, approved, student_id, students(full_name)")
      .order("log_date", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seguimiento y evaluación</h1>
        <p className="text-muted-foreground">
          Registra horas, evaluaciones e informes de cada alumno.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Últimas evaluaciones</CardTitle>
              <CardDescription>Inicial, intermedia, final.</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Nueva
            </Button>
          </CardHeader>
          <CardContent>
            {!evaluations?.length ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Sin evaluaciones</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Programa la primera evaluación de un alumno.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {evaluations.map((e) => {
                  const student = e.students as { full_name?: string } | null;
                  return (
                    <div key={e.id} className="flex items-center justify-between py-3">
                      <div>
                        <Link
                          href={`/alumnos/${e.student_id}`}
                          className="font-medium hover:text-primary"
                        >
                          {student?.full_name ?? "—"}
                        </Link>
                        <p className="text-xs text-muted-foreground capitalize">
                          {e.type} · {formatDate(e.evaluation_date)}
                        </p>
                      </div>
                      {e.score !== null && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" /> {e.score}/10
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Registro de horas</CardTitle>
              <CardDescription>Últimos registros.</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Registrar
            </Button>
          </CardHeader>
          <CardContent>
            {!hours?.length ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Sin horas registradas</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Empieza a registrar las horas de tus alumnos.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {hours.map((h) => {
                  const student = h.students as { full_name?: string } | null;
                  return (
                    <div key={h.id} className="flex items-center justify-between py-3">
                      <div>
                        <Link
                          href={`/alumnos/${h.student_id}`}
                          className="font-medium hover:text-primary"
                        >
                          {student?.full_name ?? "—"}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(h.log_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{h.hours}h</Badge>
                        {h.approved ? (
                          <Badge variant="success">Aprobado</Badge>
                        ) : (
                          <Badge variant="warning">Pendiente</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
