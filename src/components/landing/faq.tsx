import { getTranslations } from "next-intl/server";

export async function Faq() {
  const t = await getTranslations("Faq");
  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
    { q: t("q7"), a: t("a7") },
    { q: t("q8"), a: t("a8") },
  ];
  return (
    <section id="faq" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
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
