import Link from "next/link";
import { FileText, Eye } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_TYPE_LABELS } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { UploadDocumentForm } from "./upload-form";
import { DocumentShareToggle } from "./share-toggle";

export const dynamic = "force-dynamic";

export default async function DocumentosPage() {
  const supabase = createClient();
  const tShare = await getTranslations("CompanyDocuments");

  const [{ data: documents }, { data: students }] = await Promise.all([
    supabase
      .from("documents")
      .select(
        "id, type, name, file_size, uploaded_at, student_id, share_with_student, students(full_name)",
      )
      .order("uploaded_at", { ascending: false }),
    supabase.from("students").select("id, full_name").order("full_name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
        <p className="text-muted-foreground">
          Centraliza convenios, seguros, PFI (cuando aplique) y demás documentación.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Subir documento</CardTitle>
            <CardDescription>Adjunta un nuevo documento.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadDocumentForm students={students ?? []} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Histórico</CardTitle>
            <CardDescription>{documents?.length ?? 0} documentos.</CardDescription>
          </CardHeader>
          <CardContent>
            {!documents?.length ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Aún no hay documentos</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sube el primer documento usando el formulario.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {documents.map((d) => {
                  const student = d.students as { full_name?: string } | null;
                  return (
                    <div key={d.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-100 text-mint-700">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student?.full_name ? (
                              <Link href={`/alumnos/${d.student_id}`} className="hover:underline">
                                {student.full_name}
                              </Link>
                            ) : (
                              "General"
                            )}{" "}
                            · {formatDate(d.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[d.type]}</Badge>
                        {d.share_with_student && (
                          <Badge variant="success" className="gap-1">
                            <Eye className="h-3 w-3" />
                            {tShare("shared_badge")}
                          </Badge>
                        )}
                        <DocumentShareToggle
                          documentId={d.id}
                          shared={!!d.share_with_student}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
