"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Tramo editable en el formulario. `id` puede empezar por "new-" si es
 * un tramo aún sin persistir; el server distingue por eso.
 */
export interface HourScheduleDraft {
  id: string;
  from_date: string;
  to_date: string;
  weekly_hours: number;
  notes?: string | null;
}

interface Props {
  value: HourScheduleDraft[];
  onChange: (next: HourScheduleDraft[]) => void;
  /** Fechas del período de prácticas para autocompletar tramos nuevos. */
  bounds?: { start_date?: string | null; end_date?: string | null };
}

let counter = 0;
function nextId() {
  counter += 1;
  return `new-${Date.now()}-${counter}`;
}

export function HourScheduleEditor({ value, onChange, bounds }: Props) {
  const t = useTranslations("HourSchedule");

  function addRow() {
    // Autocompleta: si hay tramos previos, el nuevo empieza al día siguiente
    // del último "to_date". Si no hay ninguno, usa start_date del período.
    const last = value[value.length - 1];
    const nextFrom = last?.to_date
      ? shiftDay(last.to_date, 1)
      : bounds?.start_date ?? "";
    onChange([
      ...value,
      {
        id: nextId(),
        from_date: nextFrom,
        to_date: bounds?.end_date ?? "",
        weekly_hours: last?.weekly_hours ?? 20,
      },
    ]);
  }

  function update(id: string, patch: Partial<HourScheduleDraft>) {
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    onChange(value.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-md border border-mint-200 bg-mint-50/60 p-3 text-xs text-mint-900">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>{t("hint")}</p>
      </div>

      {value.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
          {t("empty")}
        </p>
      )}

      <ul className="space-y-2">
        {value.map((row, idx) => (
          <li
            key={row.id}
            className="grid gap-2 rounded-md border bg-muted/20 p-3 md:grid-cols-[1fr_1fr_120px_auto]"
          >
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`hs_from_${row.id}`}>
                {t("from_label")} #{idx + 1}
              </Label>
              <Input
                id={`hs_from_${row.id}`}
                type="date"
                value={row.from_date}
                onChange={(e) => update(row.id, { from_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`hs_to_${row.id}`}>
                {t("to_label")}
              </Label>
              <Input
                id={`hs_to_${row.id}`}
                type="date"
                value={row.to_date}
                onChange={(e) => update(row.id, { to_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`hs_h_${row.id}`}>
                {t("hours_label")}
              </Label>
              <Input
                id={`hs_h_${row.id}`}
                type="number"
                min={0}
                step="0.5"
                value={row.weekly_hours}
                onChange={(e) =>
                  update(row.id, {
                    weekly_hours: Number(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(row.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4" />
        {t("add_row")}
      </Button>
    </div>
  );
}

function shiftDay(iso: string, days: number): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
