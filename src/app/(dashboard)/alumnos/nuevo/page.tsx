import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StudentForm } from "@/components/students/student-form";

export default async function NuevoAlumnoPage() {
  const t = await getTranslations("StudentNew");
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/alumnos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <StudentForm mode="create" />
    </div>
  );
}
