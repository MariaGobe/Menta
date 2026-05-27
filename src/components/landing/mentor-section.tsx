import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MentorSection() {
  return (
    <section id="mentor" className="relative overflow-hidden bg-mint-50/40">
      <div className="container py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          {/* Texto */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white px-3 py-1 text-xs font-medium text-mint-800">
              <Sparkles className="h-3.5 w-3.5" />
              El núcleo de Menta
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Un mentor virtual que <span className="text-gradient-mint">tú entrenas</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tu empresa alimenta al mentor con su forma de trabajar,
              herramientas y procesos. A partir de ahí, atiende a tus alumnos
              en prácticas día a día, sin que tu equipo dedique horas a cada
              uno.
            </p>

            <ul className="mt-8 space-y-3">
              <Feature
                title="La empresa lo configura una vez"
                description="Descripción de la empresa, tono, herramientas, normas internas y enlaces útiles."
              />
              <Feature
                title="El alumno habla con él cuando lo necesita"
                description="Resuelve dudas, planifica el día, desbloquea problemas y recuerda deadlines."
              />
              <Feature
                title="Tú recibes el resumen"
                description="Sin atender mil consultas: tú revisas la evaluación automática y firmas los informes."
              />
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/registro">Probar el mentor gratis</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/#caracteristicas">Ver todas las funcionalidades</Link>
              </Button>
            </div>
          </div>

          {/* Mockup conversación */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-mint-200/40 to-mint-100/20 blur-2xl" />
            <div className="relative rounded-2xl border bg-card shadow-xl">
              <div className="flex items-center gap-2 border-b bg-mint-50/60 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-200 text-mint-800">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Mentor virtual</p>
                  <p className="text-xs text-mint-700">en línea</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <ChatBubble
                  role="assistant"
                  text="Hola Lucía 👋 Hoy te toca arrancar la pantalla de login. Tienes el mock en Figma (te paso el enlace) y el componente Button ya hecho en /components/ui."
                />
                <ChatBubble
                  role="user"
                  text="¿Y para conectar con la API de auth?"
                />
                <ChatBubble
                  role="assistant"
                  text="En nuestra empresa usamos Supabase Auth. Tienes el hook useAuth() en /lib/auth.ts. Si te atascas más de 30 min, pídele revisión a Ana (CTO)."
                />
                <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-center text-xs text-muted-foreground">
                  El mentor responde con el conocimiento que <strong>tu empresa</strong>{" "}
                  le ha configurado.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}

function ChatBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  return (
    <div className={role === "user" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          role === "user"
            ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
            : "max-w-[85%] rounded-2xl rounded-tl-sm border bg-white px-4 py-2 text-sm"
        }
      >
        {text}
      </div>
    </div>
  );
}
