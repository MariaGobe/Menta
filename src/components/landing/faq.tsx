const faqs = [
  {
    q: "¿La plataforma sirve solo para prácticas de FP?",
    a: "No. Menta está pensada para todo tipo de prácticas en empresa: alumnos de FP, alumnos universitarios e incluso formaciones internas dentro de la propia empresa. El flujo se adapta automáticamente al tipo de práctica.",
  },
  {
    q: "¿El PFI es obligatorio?",
    a: "Solo si el alumno proviene de un centro de FP. Para el resto de itinerarios el PFI no es requerido y la plataforma no lo solicita.",
  },
  {
    q: "¿Cómo funciona la prueba gratuita?",
    a: "Dispones de 1 mes con acceso completo a todas las funcionalidades. No te pedimos tarjeta de crédito. Al finalizar puedes contratar el plan anual o seguir consultando tus datos en modo lectura durante 30 días más.",
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
    q: "¿Puedo migrar mis datos si dejo la plataforma?",
    a: "Por supuesto. Puedes exportar en cualquier momento todos los datos de tus alumnos, documentos y evaluaciones en formato Excel y PDF.",
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

      <div className="mx-auto mt-12 grid max-w-3xl gap-6">
        {faqs.map((item) => (
          <details key={item.q} className="group rounded-xl border bg-card p-6">
            <summary className="cursor-pointer list-none text-base font-semibold group-open:text-primary">
              {item.q}
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
