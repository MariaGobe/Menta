import {
  Sparkles,
  ClipboardList,
  Calendar,
  BookOpen,
  FileText,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Mentor virtual configurable",
    description:
      "Alimenta al mentor con la información de tu empresa, herramientas y procesos. Acompañará a los alumnos sin que tú tengas que hacerlo.",
  },
  {
    icon: ClipboardList,
    title: "Plan de prácticas en un click",
    description:
      "Menta genera fases, tareas y entregables a partir de la información del alumno. Tú revisas y apruebas.",
  },
  {
    icon: Calendar,
    title: "Calendario compartido",
    description:
      "Hitos, deadlines, reuniones y entregas aparecen en el calendario del alumno y en el tuyo.",
  },
  {
    icon: BookOpen,
    title: "Diario de prácticas",
    description:
      "El alumno registra lo que hace cada día. Esa actividad alimenta evaluación, informes y memoria final automáticamente.",
  },
  {
    icon: TrendingUp,
    title: "Evaluación automática",
    description:
      "Menta detecta retrasos, calcula progreso y propone una evaluación basada en evidencias. Sin hojas de cálculo.",
  },
  {
    icon: FileText,
    title: "Informes listos para entregar",
    description:
      "Genera informes para la empresa, el centro educativo o la memoria del alumno. Listos para imprimir o guardar como PDF.",
  },
];

export function Features() {
  return (
    <section id="caracteristicas" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Todo lo que necesitas para gestionar prácticas
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Una plataforma diseñada para empresas que reciben alumnos en prácticas
          o que quieren formar a su propio equipo internamente.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-100 text-mint-700 group-hover:bg-mint-200">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
