import Link from "next/link";
import { Linkedin, Trophy, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TalentSection() {
  return (
    <section id="talento" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white px-3 py-1 text-xs font-medium text-mint-800">
          <Trophy className="h-3.5 w-3.5" />
          Captación de talento
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Convierte tus prácticas en una <span className="text-gradient-mint">cantera de talento</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Los alumnos ya ganan visibilidad profesional desde su portal. Y tú
          puedes lanzar retos abiertos para descubrir candidatos antes de que
          empiecen a buscar trabajo.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
        {/* Card hitos LinkedIn */}
        <article className="rounded-2xl border bg-card p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-100 text-mint-700">
            <Linkedin className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">
            Hitos y recomendaciones en LinkedIn
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Cada vez que el alumno resuelve un problema o termina un proyecto,
            puede crear un hito con preview profesional para compartir en
            LinkedIn. La empresa también puede escribir recomendaciones que el
            alumno publica como portfolio.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <Bullet>Hitos del alumno con preview en LinkedIn</Bullet>
            <Bullet>Recomendaciones firmadas por la empresa</Bullet>
            <Bullet>Portfolio público con URL propia</Bullet>
            <Bullet>
              Texto sugerido automático y hashtags relevantes
            </Bullet>
          </ul>
        </article>

        {/* Card retos abiertos */}
        <article className="rounded-2xl border bg-card p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-100 text-mint-700">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">
            Retos abiertos para captar candidatos
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Publica un reto temporal (1 mes) en abierto. Estudiantes y alumnos
            de prácticas se apuntan, envían su propuesta y los que destacan
            quedan en tu radar. Tú decides a quién contactar.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <Bullet>1 reto gratis al año</Bullet>
            <Bullet>Retos adicionales: 84€ + IVA</Bullet>
            <Bullet>Página pública del reto con preview LinkedIn</Bullet>
            <Bullet>
              Resumen automático de aplicantes destacados al cerrar
            </Bullet>
          </ul>
        </article>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/registro">
            Empezar gratis 1 mes <Sparkles className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/#precios">Ver precios</Link>
        </Button>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-muted-foreground">
      <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}
