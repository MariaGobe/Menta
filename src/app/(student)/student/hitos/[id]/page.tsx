import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MILESTONE_TYPE_LABELS, type MilestoneType } from "@/types/database";
import { MilestoneEditor } from "./milestone-editor";

export const dynamic = "force-dynamic";

export default async function MilestoneDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id")
    .eq("id", user!.id)
    .single();

  const { data: milestone } = await supabase
    .from("milestones")
    .select("*")
    .eq("id", params.id)
    .eq("student_id", profile?.student_id ?? "")
    .single();

  if (!milestone) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("full_name, organizations(name)")
    .eq("id", milestone.student_id)
    .single();

  const companyName =
    (student?.organizations as { name?: string } | null)?.name ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/student/hitos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a hitos
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {milestone.title}
          </h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          <Badge variant="secondary" className="mr-2">
            {MILESTONE_TYPE_LABELS[milestone.type as MilestoneType]}
          </Badge>
          {milestone.endorsed_at && (
            <Badge variant="success" className="gap-1">
              <Award className="h-3 w-3" /> Recomendado por la empresa
            </Badge>
          )}
        </p>
      </div>

      {milestone.endorsed_at && milestone.company_endorsement && (
        <Card className="border-mint-200 bg-mint-50/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-mint-700" />
              Recomendación recibida
            </CardTitle>
            <CardDescription>
              Texto escrito por la empresa que te acoge.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line italic text-mint-900">
              &ldquo;{milestone.company_endorsement}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editar hito</CardTitle>
          <CardDescription>
            Cuando lo marques como público, podrás compartirlo en LinkedIn con
            previsualización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MilestoneEditor
            milestone={milestone as never}
            studentName={student?.full_name ?? null}
            companyName={companyName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
