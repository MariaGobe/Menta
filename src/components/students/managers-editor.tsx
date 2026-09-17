"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Manager editable en el formulario. `id` empieza por "new-" si aún no
 * está persistido; el server distingue por eso.
 */
export interface ManagerDraft {
  id: string;
  name: string;
  email: string;
  role: string;
  is_primary: boolean;
}

interface Props {
  value: ManagerDraft[];
  onChange: (next: ManagerDraft[]) => void;
}

let counter = 0;
function nextId() {
  counter += 1;
  return `new-${Date.now()}-${counter}`;
}

export function ManagersEditor({ value, onChange }: Props) {
  const t = useTranslations("Managers");

  function addRow() {
    onChange([
      ...value,
      {
        id: nextId(),
        name: "",
        email: "",
        role: "",
        is_primary: value.length === 0, // El primero que se añade es primario.
      },
    ]);
  }

  function update(id: string, patch: Partial<ManagerDraft>) {
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    const next = value.filter((r) => r.id !== id);
    // Si borramos al primario, promocionar al primero de los que quedan.
    if (next.length > 0 && !next.some((r) => r.is_primary)) {
      next[0].is_primary = true;
    }
    onChange(next);
  }

  function makePrimary(id: string) {
    onChange(value.map((r) => ({ ...r, is_primary: r.id === id })));
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
          {t("empty")}
        </p>
      )}

      <ul className="space-y-2">
        {value.map((row) => (
          <li
            key={row.id}
            className="grid gap-2 rounded-md border bg-muted/20 p-3 md:grid-cols-[1fr_1fr_140px_auto_auto]"
          >
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`mgr_name_${row.id}`}>
                {t("name_label")}
              </Label>
              <Input
                id={`mgr_name_${row.id}`}
                value={row.name}
                onChange={(e) => update(row.id, { name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`mgr_email_${row.id}`}>
                {t("email_label")}
              </Label>
              <Input
                id={`mgr_email_${row.id}`}
                type="email"
                value={row.email}
                onChange={(e) => update(row.id, { email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`mgr_role_${row.id}`}>
                {t("role_label")}
              </Label>
              <Input
                id={`mgr_role_${row.id}`}
                value={row.role}
                onChange={(e) => update(row.id, { role: e.target.value })}
                placeholder={t("role_placeholder")}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant={row.is_primary ? "default" : "ghost"}
                size="sm"
                onClick={() => makePrimary(row.id)}
                title={t("make_primary")}
                className={row.is_primary ? "" : "text-muted-foreground"}
              >
                <Star
                  className={`h-4 w-4 ${row.is_primary ? "fill-current" : ""}`}
                />
              </Button>
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
        {t("add_manager")}
      </Button>
    </div>
  );
}
