import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-mint-soft" />
      <div
        className="absolute inset-x-0 top-0 -z-0 h-[420px] opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, hsl(162 30% 70%) 0%, transparent 40%), radial-gradient(circle at 70% 60%, hsl(178 30% 70%) 0%, transparent 40%)",
        }}
      />
      <div className="container relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <Badge variant="success" className="mb-6">
            Plataforma todo-en-uno con mentor virtual
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Gestiona prácticas en empresa{" "}
            <span className="text-gradient-mint">sin perder tiempo</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Da de alta a tus alumnos. Menta genera el plan, los acompaña día a
            día con un mentor virtual y produce los informes finales.
            <span className="font-medium text-foreground"> Tú solo supervisas.</span>
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/registro">
                Empieza gratis 1 mes <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#como-funciona">Cómo funciona</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Listo en minutos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Cancela cuando quieras
            </span>
          </div>
        </div>

        {/* Ahorro de tiempo destacado */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-4 md:grid-cols-3">
          <Stat number="80%" label="menos tiempo del tutor por alumno" />
          <Stat number="24/7" label="acompañamiento del mentor al alumno" />
          <Stat number="1 click" label="informes listos para el centro" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border bg-card/80 p-5 text-center backdrop-blur">
      <p className="text-3xl font-bold text-gradient-mint">{number}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
