import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportContent } from "./report-content";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

const REPORT_TITLES: Record<string, string> = {
  intermedio: "Informe intermedio",
  final_empresa: "Informe final para empresa",
  final_centro: "Informe final para centro educativo",
  memoria: "Memoria de prácticas",
};

export default async function InformePage({
  params,
}: {
  params: { studentId: string; type: string };
}) {
  const title = REPORT_TITLES[params.type];
  if (!title) notFound();

  const supabase = createClient();

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, dni, practice_type, institution_name, program_name, tutor_academic_name, tutor_company_name, start_date, end_date, total_hours, organizations(name, nif, address, city)",
    )
    .eq("id", params.studentId)
    .single();

  if (!student) notFound();

  const { data: plan } = await supabase
    .from("practice_plans")
    .select("id, title, description, objectives, total_hours")
    .eq("student_id", student.id)
    .maybeSingle();

  const { data: phases } = plan
    ? await supabase
        .from("practice_phases")
        .select("id, name, start_date, end_date, order_index")
        .eq("plan_id", plan.id)
        .order("order_index")
    : { data: [] };

  const { data: tasks } = await supabase
    .from("practice_tasks")
    .select(
      "title, status, due_date, completed_at, estimated_hours, phase_id",
    )
    .eq("student_id", student.id)
    .order("due_date");

  const { data: logs } = await supabase
    .from("daily_activity_logs")
    .select(
      "log_date, hours_worked, tasks_done, learnings, difficulties",
    )
    .eq("student_id", student.id)
    .order("log_date");

  const { data: deliverables } = await supabase
    .from("deliverables")
    .select("title, description, submitted_at, reviewed_at, feedback")
    .eq("student_id", student.id)
    .order("submitted_at");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/informes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a informes
        </Link>
        <PrintButton />
      </div>

      <ReportContent
        title={title}
        reportType={params.type}
        student={student}
        plan={plan ?? null}
        phases={phases ?? []}
        tasks={tasks ?? []}
        logs={logs ?? []}
        deliverables={deliverables ?? []}
      />
    </div>
  );
}
