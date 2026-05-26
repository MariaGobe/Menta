import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ClipboardCheck, Clock, Mail, Phone, CalendarDays, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PRACTICE_TYPE_LABELS,
  STATUS_LABELS,
  REQUIRED_DOCUMENTS,
  DOCUMENT_TYPE_LABELS,
} from "@/types/database";
import { formatDate } from "@/lib/utils";
import { InviteStudentButton } from "./invite-button";

export const dynamic = "force-dynamic";

export default async function AlumnoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!student) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, type, name, uploaded_at")
    .eq("student_id", student.id)
    .order("uploaded_at", { ascending: false });

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("id, type, evaluation_date, score")
    .eq("student_id", student.id)
    .order("evaluation_date", { ascending: false });

  const { data: hoursAgg } = await supabase
    .from("hour_logs")
    .select("hours")
    .eq("student_id", student.id)
    .eq("approved", true);

  const loggedHours = (hoursAgg ?? []).reduce((sum, l) => sum + Number(l.hours), 0);

  const requiredDocs = REQUIRED_DOCUMENTS[student.practice_type];
  const uploadedTypes = new Set((documents ?? []).map((d) => d.type));
  const missingDocs = requiredDocs.filter((t) => !uploadedTypes.has(t));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/alumnos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a alumnos
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{student.full_name}</h1>
            <Badge variant={student.status === "active" ? "success" : "secondary"}>
              {STATUS_LABELS[student.status]}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {PRACTICE_TYPE_LABELS[student.practice_type]} ·{" "}
            {student.institution_name ?? "Sin centro"}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Button variant="outline" asChild>
            <Link href={`/planes/nuevo?student=${student.id}`}>Generar plan</Link>
          </Button>
          <InviteStudentButton
            studentId={student.id}
            studentEmail={student.email}
          />
        </div>
      </div>

      {missingDocs.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-900">
              Faltan documentos obligatorios:{" "}
              {missingDocs.map((t) => DOCUMENT_TYPE_LABELS[t]).join(", ")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> {student.email ?? "—"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {student.phone ?? "—"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" /> {student.program_name ?? "—"}
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">DNI</p>
            <p>{student.dni ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> {formatDate(student.start_date)} – {formatDate(student.end_date)}
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Horas totales</p>
            <p className="text-2xl font-bold">
              {loggedHours} <span className="text-sm font-normal text-muted-foreground">/ {student.total_hours} h</span>
            </p>
            <p className="text-xs text-muted-foreground">{student.weekly_hours ?? "—"} h/semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tutores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Tutor académico</p>
              <p>{student.tutor_academic_name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{student.tutor_academic_email ?? ""}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Tutor de empresa</p>
              <p>{student.tutor_company_name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{student.tutor_company_email ?? ""}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Documentos</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/documentos?student=${student.id}`}>
                <FileText className="h-4 w-4" /> Gestionar
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!documents?.length ? (
              <p className="text-sm text-muted-foreground">Sin documentos subidos.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {documents.slice(0, 5).map((d) => (
                  <li key={d.id} className="flex items-center justify-between">
                    <span>{DOCUMENT_TYPE_LABELS[d.type]}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(d.uploaded_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Evaluaciones</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/seguimiento?student=${student.id}`}>
                <ClipboardCheck className="h-4 w-4" /> Ver
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!evaluations?.length ? (
              <p className="text-sm text-muted-foreground">Sin evaluaciones.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {evaluations.map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <span className="capitalize">{e.type} · {formatDate(e.evaluation_date)}</span>
                    {e.score !== null && (
                      <Badge variant="secondary">{e.score}/10</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Horas</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/seguimiento?student=${student.id}&tab=hours`}>
                <Clock className="h-4 w-4" /> Registrar
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loggedHours}h</p>
            <p className="text-xs text-muted-foreground">
              de {student.total_hours}h previstas
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, (loggedHours / (student.total_hours || 1)) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {student.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{student.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
