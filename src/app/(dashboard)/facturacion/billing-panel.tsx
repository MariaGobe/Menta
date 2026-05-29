"use client";

import { useState } from "react";
import { Loader2, Minus, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePrice, formatCurrency } from "@/lib/utils";

interface Props {
  hasSubscription: boolean;
  currentExtras: number;
  currentStudents: number;
}

export function BillingPanel({ hasSubscription, currentExtras, currentStudents }: Props) {
  const [students, setStudents] = useState(Math.max(currentStudents, 2));
  const extras = Math.max(0, students - 2);
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extraStudents: extras }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  async function openPortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  if (hasSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gestionar suscripción</CardTitle>
          <CardDescription>
            Cambia tu método de pago, descarga facturas o cancela tu plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openPortal} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Abrir portal de cliente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activar plan Empresa</CardTitle>
        <CardDescription>
          Elige cuántos alumnos vas a gestionar y activa tu suscripción anual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Número de alumnos previsto</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setStudents((v) => Math.max(1, v - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-10 text-center text-lg font-semibold">{students}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setStudents((v) => v + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan Base (hasta 2 alumnos)</span>
              <span>690€</span>
            </div>
            {extras > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">+ {extras} alumno{extras > 1 ? "s" : ""} extra (49€ c/u)</span>
                <span>+ {extras * 49}€</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total / año</span>
              <span>{formatCurrency(calculatePrice(extras))} <span className="text-xs font-normal text-muted-foreground">+ IVA</span></span>
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={startCheckout} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuar al pago seguro
        </Button>
        <p className="text-xs text-muted-foreground">
          El pago se procesa a través de Stripe. Podrás cancelar en cualquier momento.
        </p>
      </CardContent>
    </Card>
  );
}
