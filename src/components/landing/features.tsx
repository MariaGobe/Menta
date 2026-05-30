import {
  Sparkles,
  ClipboardList,
  Calendar,
  BookOpen,
  FileText,
  TrendingUp,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Features() {
  const t = await getTranslations("Features");
  const features = [
    { icon: Sparkles, title: t("f1_title"), description: t("f1_desc") },
    { icon: ClipboardList, title: t("f2_title"), description: t("f2_desc") },
    { icon: Calendar, title: t("f3_title"), description: t("f3_desc") },
    { icon: BookOpen, title: t("f4_title"), description: t("f4_desc") },
    { icon: TrendingUp, title: t("f5_title"), description: t("f5_desc") },
    { icon: FileText, title: t("f6_title"), description: t("f6_desc") },
  ];
  return (
    <section id="caracteristicas" className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
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
