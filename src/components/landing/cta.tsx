import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="container py-20 md:py-28">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl gradient-mint p-10 text-center text-white md:p-16">
        <h2 className="text-3xl font-bold md:text-4xl">
          Empieza hoy. Tu equipo lo agradecerá.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base opacity-95 md:text-lg">
          Configura Menta en menos de 30 minutos y libera al tutor de tu empresa
          de las tareas repetitivas de las prácticas.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/registro">
              Empieza gratis 1 mes <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
            asChild
          >
            <Link href="/precios">Ver precios</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs opacity-80">
          Sin tarjeta de crédito · Cancela cuando quieras
        </p>
      </div>
    </section>
  );
}
