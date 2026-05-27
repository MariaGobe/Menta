"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import {
  CALENDAR_EVENT_TYPE_LABELS,
  type CalendarEventType,
} from "@/types/database";

export interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // YYYY-MM-DD
  event_type: CalendarEventType;
  student_name?: string | null;
}

interface Props {
  events: CalEvent[];
  /** Si true, muestra el nombre del alumno en cada evento (vista empresa) */
  showStudent?: boolean;
  /** Fecha inicial visible (por defecto: hoy) */
  initialDate?: string;
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const EVENT_TONE: Record<CalendarEventType, string> = {
  task: "bg-mint-100 text-mint-800 border-mint-200",
  milestone: "bg-amber-100 text-amber-900 border-amber-200",
  meeting: "bg-sky-100 text-sky-900 border-sky-200",
  deliverable: "bg-purple-100 text-purple-900 border-purple-200",
  final_presentation: "bg-pink-100 text-pink-900 border-pink-200",
};

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function toIso(d: Date): string {
  // YYYY-MM-DD en zona local
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function MonthCalendar({ events, showStudent = false, initialDate }: Props) {
  const [cursor, setCursor] = useState<Date>(
    initialDate ? new Date(initialDate) : new Date(),
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const key = e.event_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  // 0=Mon..6=Sun (queremos lunes como primer día)
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  // Construir grid de 6 semanas x 7 días
  const totalCells = 42;
  const cells: { date: Date; inMonth: boolean }[] = [];
  // Días del mes anterior visibles
  for (let i = 0; i < firstWeekday; i++) {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (firstWeekday - i));
    cells.push({ date: d, inMonth: false });
  }
  // Días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), i), inMonth: true });
  }
  // Resto del grid
  while (cells.length < totalCells) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }

  const today = toIso(new Date());

  function prev() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
    setSelectedDay(null);
  }
  function next() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    setSelectedDay(null);
  }
  function goToday() {
    setCursor(new Date());
    setSelectedDay(toIso(new Date()));
  }

  const monthLabel = cursor.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base capitalize">{monthLabel}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToday}>
              Hoy
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cabecera con días de la semana */}
          <div className="grid grid-cols-7 gap-px text-xs font-medium text-muted-foreground">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="p-2 text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Grid de celdas */}
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
            {cells.map((cell, idx) => {
              const iso = toIso(cell.date);
              const dayEvents = eventsByDay.get(iso) ?? [];
              const isToday = iso === today;
              const isSelected = iso === selectedDay;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDay(iso)}
                  className={cn(
                    "relative flex min-h-[88px] flex-col gap-1 bg-card p-1.5 text-left transition-colors hover:bg-accent/30",
                    !cell.inMonth && "bg-muted/30 text-muted-foreground",
                    isSelected && "ring-2 ring-primary ring-inset",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday &&
                        "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground",
                    )}
                  >
                    {cell.date.getDate()}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={cn(
                          "truncate rounded border px-1.5 py-0.5 text-[10px] leading-tight",
                          EVENT_TONE[e.event_type],
                        )}
                        title={e.title}
                      >
                        {e.title}
                      </span>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{dayEvents.length - 3} más
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalle del día seleccionado */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {formatDate(selectedDay)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <CalIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay eventos este día.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {selectedEvents.map((e) => (
                  <li key={e.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{e.title}</p>
                        {e.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {e.description}
                          </p>
                        )}
                        {showStudent && e.student_name && (
                          <Link
                            href="#"
                            className="mt-1 inline-block text-xs text-muted-foreground hover:text-primary"
                          >
                            {e.student_name}
                          </Link>
                        )}
                      </div>
                      <Badge
                        className={cn("text-xs", EVENT_TONE[e.event_type])}
                        variant="outline"
                      >
                        {CALENDAR_EVENT_TYPE_LABELS[e.event_type]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
