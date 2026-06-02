import Link from "next/link";
import { Plus, Users, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PRACTICE_TYPE_LABELS, STATUS_LABELS } from "@/types/database";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlumnosPage() {
  const supabase = createClient();
  const t = await getTranslations("Students");
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, practice_type, institution_name, status, start_date, end_date")
    .order("created_at", { ascending: false });

  const n = students?.length ?? 0;
  const countLabel = n === 0 ? t("count_zero") : n === 1 ? t("count_one") : t("count_other", { n });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{countLabel}</p>
        </div>
        <Button asChild>
          <Link href="/alumnos/nuevo">
            <Plus className="h-4 w-4" /> {t("new_student")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("search_placeholder")} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {!students?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{t("empty_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("empty_subtitle")}</p>
            <Button className="mt-6" asChild>
              <Link href="/alumnos/nuevo">
                <Plus className="h-4 w-4" /> {t("empty_button")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">{t("th_student")}</th>
                  <th className="px-6 py-3 font-medium">{t("th_type")}</th>
                  <th className="px-6 py-3 font-medium">{t("th_institution")}</th>
                  <th className="px-6 py-3 font-medium">{t("th_period")}</th>
                  <th className="px-6 py-3 font-medium">{t("th_status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/30">
                    <td className="px-6 py-4">
                      <Link href={`/alumnos/${s.id}`} className="font-medium hover:text-primary">
                        {s.full_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {PRACTICE_TYPE_LABELS[s.practice_type]}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {s.institution_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(s.start_date)} - {formatDate(s.end_date)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={s.status === "active" ? "success" : "secondary"}>
                        {STATUS_LABELS[s.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
