import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FileStack, ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_TEMPLATES } from "@/lib/plan-templates";
import type { PracticeType } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PlantillasPage() {
  const t = await getTranslations("Templates");

  const typeLabelKey: Record<PracticeType, string> = {
    fp: "type_fp",
    university: "type_university",
    internal: "type_internal",
  };

  const typeTone: Record<PracticeType, "success" | "info" | "secondary"> = {
    fp: "success",
    university: "info",
    internal: "secondary",
  };

  const templates = (Object.keys(PLAN_TEMPLATES) as PracticeType[]).map((k) => ({
    type: k,
    template: PLAN_TEMPLATES[k],
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-100">
          <FileStack className="h-5 w-5 text-mint-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Plantillas base */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{t("base_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("base_hint")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map(({ type, template }) => {
            const totalTasks = template.phases.reduce((acc, p) => acc + p.tasks.length, 0);
            return (
              <Card key={type} className="flex flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={typeTone[type]}>{t(typeLabelKey[type])}</Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-3">
                      {template.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-1 font-medium">
                        {t("phases_count", { n: template.phases.length })}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1 font-medium">
                        {t("tasks_count", { n: totalTasks })}
                      </span>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Target className="h-3 w-3" />
                        {t("objectives")}
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {template.default_objectives.slice(0, 3).map((obj, i) => (
                          <li key={i} className="line-clamp-1">
                            · {obj}
                          </li>
                        ))}
                        {template.default_objectives.length > 3 && (
                          <li className="text-xs">
                            {t("objectives_count", { n: template.default_objectives.length })}
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("phases_count", { n: template.phases.length })}
                      </p>
                      <ol className="space-y-1 text-sm">
                        {template.phases.map((p) => (
                          <li key={p.name} className="flex items-baseline gap-2 text-muted-foreground">
                            <span className="text-mint-700">{p.weight_pct}%</span>
                            <span className="line-clamp-1">{p.name}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link href={`/planes/nuevo?type=${type}`}>
                      {t("use_template")} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Plantillas propias (placeholder para futuro) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{t("custom_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("custom_hint")}</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <FileStack className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">{t("custom_empty")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
