const steps = [
  {
    n: "01",
    title: "Da de alta tu empresa",
    description:
      "Crea tu cuenta y empieza tu prueba gratuita de 1 mes. Sin tarjeta de crédito.",
  },
  {
    n: "02",
    title: "Añade a tus alumnos",
    description:
      "Indica el tipo de práctica (FP, universidad o interna), datos del centro y tutores.",
  },
  {
    n: "03",
    title: "Sube la documentación",
    description:
      "Carga convenios, seguros y anexos. El PFI solo si tu alumno viene de FP.",
  },
  {
    n: "04",
    title: "Haz el seguimiento",
    description:
      "Registra horas, programa evaluaciones y genera el informe final cuando acabe.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-mint-50/50 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            En 4 pasos tienes tus prácticas bajo control.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl bg-white p-6 shadow-sm">
              <span className="text-3xl font-bold text-mint-600">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
