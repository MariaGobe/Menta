import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-mint-soft" />
      <div className="container relative py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <Badge variant="success" className="mb-6">
            Plataforma todo-en-uno
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Gestiona las prácticas de tu empresa{" "}
            <span className="text-gradient-mint">sin papeleo</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Centraliza alumnos, documentos, horas y evaluaciones de prácticas
            de FP, universidad y formaciones internas. Todo en un solo sitio.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/registro">
                Empieza gratis 1 mes <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/precios">Ver precios</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Configuración en minutos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
