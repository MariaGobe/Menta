import { getTranslations } from "next-intl/server";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { DOCUMENT_TYPE_LABELS } from "@/types/database";
import { StudentDocumentCard } from "./document-card";

export const dynamic = "force-dynamic";

export default async function StudentDocumentosPage() {
  const supabase = createClient();
  const t = await getTranslations("StudentDocuments");

  // RLS: el alumno solo ve documents con share_with_student=true
  // que sean suyos o generales de la organización.
  const { data: documents } = await supabase
    .from("documents")
    .select("id, type, name, storage_path, uploaded_at, student_id")
    .order("uploaded_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id")
    .eq("id", user!.id)
    .single();
  const myStudentId = profile?.student_id;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {!documents?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{t("empty_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("empty_hint")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((d) => (
            <StudentDocumentCard
              key={d.id}
              id={d.id}
              name={d.name}
              type={d.type}
              typeLabel={DOCUMENT_TYPE_LABELS[d.type as keyof typeof DOCUMENT_TYPE_LABELS] ?? d.type}
              storage_path={d.storage_path}
              uploaded_at={d.uploaded_at}
              studentSpecific={d.student_id === myStudentId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
