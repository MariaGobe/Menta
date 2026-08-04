import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import type { CalendarEventType } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CompanyCalendarioPage() {
  const supabase = createClient();
  const t = await getTranslations("CompanyCalendar");
  const { data: events } = await supabase
    .from("calendar_events")
    .select(
      "id, title, description, event_date, event_type, student_id, students(full_name)",
    )
    .order("event_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <MonthCalendar
        showStudent
        events={(events ?? []).map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          event_date: e.event_date,
          event_type: e.event_type as CalendarEventType,
          student_name:
            (e.students as { full_name?: string } | null)?.full_name ?? null,
        }))}
      />
    </div>
  );
}
