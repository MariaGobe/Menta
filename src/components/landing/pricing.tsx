"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculatePrice, formatCurrency } from "@/lib/utils";

const includedFeatures = [
  "Gestión ilimitada de alumnos",
  "Documentación centralizada (convenio, PFI, seguros, etc.)",
  "Multi-itinerario: FP, universidad, formación interna",
  "Registro de horas y evaluaciones",
  "Informes finales descargables",
  "Soporte por email",
];

export function Pricing() {
  const [students, setStudents] = useState(2);
  const extra = Math.max(0, students - 2);
  const total = calculatePrice(extra);

  return (
    <section id="precios" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="success" className="mb-4">
          Precios simples y transparentes
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Empieza gratis. Paga solo lo que necesitas.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          1 mes de prueba gratis. Sin permanencia. Cancela cuando quieras.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
        {/* Trial card */}
        <Card className="flex flex-col p-8">
          <div>
            <h3 className="text-xl font-bold">Prueba gratuita</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Descubre la plataforma sin compromiso.
            </p>
          </div>
          <div className="mt-6">
            <span className="text-5xl font-bold">0€</span>
            <span className="ml-1 text-muted-foreground">durante 1 mes</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            <li className="flex gap-2">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              Acceso completo a todas las funcionalidades
            </li>
            <li className="flex gap-2">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              Sin tarjeta de crédito
            </li>
            <li className="flex gap-2">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              Migra tus datos cuando quieras pasar a plan de pago
            </li>
          </ul>
          <Button className="mt-8" variant="outline" size="lg" asChild>
            <Link href="/registro">Empezar prueba</Link>
          </Button>
        </Card>

        {/* Paid card */}
        <Card className="relative flex flex-col border-primary/20 bg-mint-50/50 p-8 shadow-md">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge>Más popular</Badge>
          </div>
          <div>
            <h3 className="text-xl font-bold">Plan Empresa</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Para empresas que reciben alumnos cada año.
            </p>
          </div>
          <div className="mt-6">
            <span className="text-5xl font-bold">{formatCurrency(total)}</span>
            <span className="ml-1 text-muted-foreground">/ año</span>
            <p className="mt-1 text-xs text-muted-foreground">IVA no incluido</p>
          </div>

          {/* Slider de alumnos */}
          <div className="mt-6 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Número de alumnos</span>
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
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Plan base (hasta 2 alumnos)</span>
                <span>490€</span>
              </div>
              {extra > 0 && (
                <div className="flex justify-between">
                  <span>+ {extra} alumno{extra > 1 ? "s" : ""} extra (39€/año c/u)</span>
                  <span>+ {extra * 39}€</span>
                </div>
              )}
            </div>
          </div>

          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {includedFeatures.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button className="mt-8" size="lg" asChild>
            <Link href="/registro">Empezar 1 mes gratis</Link>
          </Button>
        </Card>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        ¿Necesitas más de 20 alumnos o funcionalidades específicas?{" "}
        <Link href="mailto:hola@menta.app" className="font-medium text-primary hover:underline">
          Contáctanos
        </Link>
        .
      </p>
    </section>
  );
}
