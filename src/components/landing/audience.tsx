import { GraduationCap, Building2, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Audience() {
  const t = await getTranslations("Audience");
  const audiences = [
    { icon: GraduationCap, title: t("fp_title"), description: t("fp_desc") },
    { icon: Users, title: t("univ_title"), description: t("univ_desc") },
    { icon: Building2, title: t("internal_title"), description: t("internal_desc") },
  ];
  return (
    <section className="bg-mint-50/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {audiences.map((a) => (
            <div key={a.title} className="rounded-2xl border bg-white p-6 text-center">
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
