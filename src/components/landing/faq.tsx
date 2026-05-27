const faqs = [
  {
    q: "¿Qué es exactamente el mentor virtual?",
    a: "Es un asistente que acompaña al alumno día a día (dudas, planificación, desbloqueos). Lo configura la empresa una sola vez con su información (cómo trabajáis, herramientas, normas, recursos) y a partir de ahí atiende a todos vuestros alumnos sin que el tutor humano dedique tiempo.",
  },
  {
    q: "¿Sustituye al tutor humano de la empresa?",
    a: "No. El tutor sigue existiendo como referente final y firma documentos legales. Pero el día a día (preguntas, planificación, dudas técnicas) lo absorbe el mentor virtual. Tú decides qué temas se redirigen al humano.",
  },
  {
    q: "¿La plataforma sirve solo para prácticas de FP?",
    a: "No. Menta está pensada para prácticas en empresa: alumnos de FP, alumnos universitarios e incluso formaciones internas (onboarding, herramientas nuevas, formación de equipos). El flujo se adapta al tipo de práctica.",
  },
  {
    q: "¿El PFI es obligatorio?",
    a: "Solo si el alumno proviene de un centro de FP. Para el resto de itinerarios no se solicita.",
  },
  {
    q: "¿Cómo funciona la prueba gratuita?",
    a: "1 mes con acceso completo a todas las funcionalidades, sin tarjeta de crédito. Al finalizar puedes contratar el plan anual o seguir consultando tus datos en modo lectura durante 30 días más.",
  },
  {
    q: "¿Qué incluye el precio?",
    a: "490€/año + IVA cubre hasta 2 alumnos activos. Cada alumno adicional cuesta 39€/año + IVA. Sin permanencia y cancelable en cualquier momento.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Toda la información se aloja en servidores europeos cumpliendo el RGPD. Hacemos backups diarios y nunca compartimos tus datos con terceros.",
  },
  {
    q: "¿Puedo exportar mis datos si dejo la plataforma?",
    a: "Por supuesto. Puedes exportar en cualquier momento alumnos, documentos, evaluaciones e informes en formato PDF y Excel.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Preguntas frecuentes
        </h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-4">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border bg-card p-6 transition hover:border-mint-300"
          >
            <summary className="flex cursor-pointer items-center justify-between list-none text-base font-semibold group-open:text-primary">
              <span>{item.q}</span>
              <span className="ml-4 text-2xl leading-none text-mint-700 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
