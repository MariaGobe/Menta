import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StudentForm } from "@/components/students/student-form";

export const dynamic = "force-dynamic";

export default async function EditAlumnoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const t = await getTranslations("StudentEdit");
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!student) notFound();

  const { data: schedules } = await supabase
    .from("student_hour_schedules")
    .select("id, student_id, from_date, to_date, weekly_hours, notes, created_at")
    .eq("student_id", params.id)
    .order("from_date", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/alumnos/${student.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{student.full_name}</p>
      </div>

      <StudentForm mode="edit" initial={student} initialSchedules={schedules ?? []} />
    </div>
  );
}
