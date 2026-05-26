import { Calendar as CalendarIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CALENDAR_EVENT_TYPE_LABELS, type CalendarEventType } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function StudentCalendarioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id")
    .eq("id", user!.id)
    .single();
  const studentId = profile?.student_id;

  const today = new Date().toISOString().slice(0, 10);
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, description, event_date, event_type")
    .eq("student_id", studentId)
    .gte("event_date", today)
    .order("event_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi calendario</h1>
        <p className="text-muted-foreground">
          Todos los hitos, entregas y reuniones de tus prácticas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos eventos</CardTitle>
          <CardDescription>{events?.length ?? 0} eventos en agenda.</CardDescription>
        </CardHeader>
        <CardContent>
          {!events?.length ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Sin eventos programados</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cuando tu empresa apruebe tu plan, los hitos aparecerán aquí.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-4 py-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-mint-100 text-mint-800">
                    <span className="text-xs font-medium">
                      {new Date(e.event_date).toLocaleDateString("es-ES", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {new Date(e.event_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{e.title}</p>
                    {e.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {e.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(e.event_date)}
                    </p>
                  </div>
                  <Badge variant="info">
                    {CALENDAR_EVENT_TYPE_LABELS[e.event_type as CalendarEventType]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
