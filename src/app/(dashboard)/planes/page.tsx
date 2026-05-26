import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PLAN_STATUS_LABELS, type PlanStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
  const supabase = createClient();
  const { data: plans } = await supabase
    .from("practice_plans")
    .select(
      "id, title, status, start_date, end_date, total_hours, student_id, students(full_name, practice_type)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Planes de prácticas
          </h1>
          <p className="text-muted-foreground">
            {plans?.length ?? 0} planes activos
          </p>
        </div>
        <Button asChild>
          <Link href="/planes/nuevo">
            <Plus className="h-4 w-4" /> Generar plan
          </Link>
        </Button>
      </div>

      {!plans?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Aún no hay planes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea el primer plan de prácticas para un alumno.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/planes/nuevo">
                <Plus className="h-4 w-4" /> Generar primer plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Alumno</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Período</th>
                  <th className="px-6 py-3 font-medium">Horas</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {plans.map((p) => {
                  const s = p.students as { full_name?: string; practice_type?: string } | null;
                  return (
                    <tr key={p.id} className="hover:bg-accent/30">
                      <td className="px-6 py-4 font-medium">{s?.full_name ?? "—"}</td>
                      <td className="px-6 py-4">
                        <Link href={`/planes/${p.id}`} className="hover:text-primary">
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(p.start_date)} – {formatDate(p.end_date)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.total_hours ?? "—"} h
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            p.status === "approved" || p.status === "in_progress"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {PLAN_STATUS_LABELS[p.status as PlanStatus]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
