import {
  Users,
  FileText,
  ClipboardCheck,
  GraduationCap,
  Building2,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestión de alumnos",
    description:
      "Da de alta alumnos de FP, universidad o formaciones internas. Asigna tutores y haz seguimiento.",
  },
  {
    icon: FileText,
    title: "Documentación centralizada",
    description:
      "Convenios, seguros, anexos, evaluaciones... y el PFI cuando sea necesario. Todo en la nube.",
  },
  {
    icon: ClipboardCheck,
    title: "Evaluaciones periódicas",
    description:
      "Registra evaluaciones iniciales, intermedias y finales con competencias y comentarios.",
  },
  {
    icon: Calendar,
    title: "Control de horas",
    description:
      "Lleva el registro horario de cada alumno y aprueba las horas trabajadas.",
  },
  {
    icon: GraduationCap,
    title: "Multi-itinerario",
    description:
      "Un mismo flujo válido para prácticas de FP, universitarias o formaciones internas.",
  },
  {
    icon: Building2,
    title: "Pensado para empresas",
    description:
      "Optimizado para empresas que reciben alumnos en prácticas, o que quieren realizar formaciones internas: onboarding, herramientas nuevas, formación de equipos…",
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
          Una plataforma diseñada para que el responsable de prácticas dedique
          su tiempo a formar, no a perseguir papeles.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mint-100 text-mint-700">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
