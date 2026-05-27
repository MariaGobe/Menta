const steps = [
  {
    n: "01",
    title: "Configura tu mentor virtual",
    description:
      "Cuéntale al mentor de qué va tu empresa, qué herramientas usáis y cómo trabajáis. Una vez, y sirve para todos tus alumnos.",
  },
  {
    n: "02",
    title: "Da de alta a tus alumnos",
    description:
      "Tipo de práctica (FP, universidad o formación interna), fechas y datos del tutor. Menta se adapta a cada caso.",
  },
  {
    n: "03",
    title: "Genera el plan de prácticas",
    description:
      "Pulsa un botón. Menta crea fases, tareas y deadlines. Tú lo revisas, ajustas y apruebas.",
  },
  {
    n: "04",
    title: "El alumno trabaja con el mentor",
    description:
      "Cada día el alumno consulta sus tareas, habla con el mentor cuando se atasca, sube entregables y registra su actividad.",
  },
  {
    n: "05",
    title: "Tú supervisas y firmas",
    description:
      "Menta te da una evaluación automática y los informes listos para la empresa, el centro educativo y la memoria del alumno.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Cómo funciona Menta
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          5 pasos para automatizar la gestión de prácticas en tu empresa.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={s.n}>
              <div className="group relative flex gap-5 rounded-2xl border bg-card p-6 transition hover:border-mint-300 hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mint-100 text-mint-700">
                  <span className="text-lg font-bold">{s.n}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="ml-11 h-4 w-px bg-mint-200" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
