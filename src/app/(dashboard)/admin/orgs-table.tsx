"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

interface OrgRow {
  id: string;
  name: string;
  email: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  plan_id: string | null;
  created_at: string;
  student_count: number;
  owner_name: string | null;
  owner_email: string | null;
}

interface Props {
  rows: OrgRow[];
}

export function AdminOrgsTable({ rows }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.owner_name && r.owner_name.toLowerCase().includes(q)) ||
        (r.owner_email && r.owner_email.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  async function runAction(orgId: string, body: object, label: string) {
    if (!confirm(`¿Confirmar: ${label}?`)) return;
    setBusyId(orgId);
    const res = await fetch(`/api/admin/organizations/${orgId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(`Error: ${j.error ?? res.statusText}`);
      return;
    }
    router.refresh();
  }

  function daysUntil(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const a = new Date();
    a.setHours(0, 0, 0, 0);
    const b = new Date(dateStr);
    b.setHours(0, 0, 0, 0);
    return Math.round((b.getTime() - a.getTime()) / 86_400_000);
  }

  function statusBadge(row: OrgRow) {
    const days = daysUntil(row.trial_ends_at);
    if (row.subscription_status === "active")
      return <Badge variant="success">Activa</Badge>;
    if (row.subscription_status === "past_due")
      return <Badge variant="destructive">Impago</Badge>;
    if (row.subscription_status === "canceled")
      return <Badge variant="secondary">Cancelada</Badge>;
    // trialing
    if (days === null) return <Badge variant="secondary">Trial</Badge>;
    if (days < 0)
      return (
        <Badge variant="destructive">Trial expirado ({Math.abs(days)}d)</Badge>
      );
    if (days <= 7)
      return <Badge variant="warning">Trial ({days}d)</Badge>;
    return <Badge variant="secondary">Trial ({days}d)</Badge>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre de empresa, email o dueño..."
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} / {rows.length}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Empresa</th>
              <th className="px-4 py-3 text-left font-semibold">Dueño</th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
              <th className="px-4 py-3 text-left font-semibold">Trial hasta</th>
              <th className="px-4 py-3 text-right font-semibold">Alumnos</th>
              <th className="px-4 py-3 text-left font-semibold">Alta</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-accent/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{row.name}</p>
                  {row.email && (
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{row.owner_name ?? "—"}</p>
                  {row.owner_email && (
                    <p className="text-xs text-muted-foreground">
                      {row.owner_email}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">{statusBadge(row)}</td>
                <td className="px-4 py-3">
                  {row.trial_ends_at ? formatDate(row.trial_ends_at) : "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {row.student_count}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(row.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === row.id}
                      >
                        {busyId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Trial</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            row.id,
                            { kind: "extend_trial", months: 3 },
                            `Extender trial 3 meses (${row.name})`,
                          )
                        }
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Extender 3 meses
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            row.id,
                            { kind: "extend_trial", months: 6 },
                            `Extender trial 6 meses (${row.name})`,
                          )
                        }
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Extender 6 meses
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            row.id,
                            { kind: "extend_trial", months: 12 },
                            `Extender trial 1 año (${row.name})`,
                          )
                        }
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Extender 1 año
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            row.id,
                            { kind: "extend_trial", months: 24 },
                            `Extender trial 2 años (${row.name})`,
                          )
                        }
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Extender 2 años
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Suscripción</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            row.id,
                            { kind: "mark_active" },
                            `Marcar como Activa (${row.name})`,
                          )
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4 text-mint-700" />
                        Marcar como Activa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            row.id,
                            { kind: "reset_trial_now" },
                            `Terminar trial ahora (${row.name})`,
                          )
                        }
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Terminar trial ahora
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No hay organizaciones que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
