import { getTranslations } from "next-intl/server";

export async function HowItWorks() {
  const t = await getTranslations("HowItWorks");
  const steps = [
    { n: "01", title: t("s1_title"), description: t("s1_desc") },
    { n: "02", title: t("s2_title"), description: t("s2_desc") },
    { n: "03", title: t("s3_title"), description: t("s3_desc") },
    { n: "04", title: t("s4_title"), description: t("s4_desc") },
    { n: "05", title: t("s5_title"), description: t("s5_desc") },
  ];
  return (
    <section id="como-funciona" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
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
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && <div className="ml-11 h-4 w-px bg-mint-200" aria-hidden />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
