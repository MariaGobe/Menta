import { GraduationCap, Building2, Users } from "lucide-react";

const audiences = [
  {
    icon: GraduationCap,
    title: "Alumnos de FP",
    description:
      "Convenios, PFI, seguros, evaluaciones y memoria — todo guiado por el mentor.",
  },
  {
    icon: Users,
    title: "Alumnos universitarios",
    description:
      "Proyecto principal, tutor académico, memoria y defensa. Sin PFI, sin papeleo innecesario.",
  },
  {
    icon: Building2,
    title: "Formación interna",
    description:
      "Onboarding de nuevos empleados, aprendizaje de herramientas o formación de equipos.",
  },
];

export function Audience() {
  return (
    <section className="bg-mint-50/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Para cualquier tipo de práctica o formación
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Un mismo flujo se adapta a alumnos de FP, universidad o
            formaciones internas. Sin reconfigurar nada.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl border bg-white p-6 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-100 text-mint-700">
                <a.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
