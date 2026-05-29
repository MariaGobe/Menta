import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, ArrowLeft, Calendar, FileCheck2 } from "lucide-react";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { SubmissionForm } from "./submission-form";

export const dynamic = "force-dynamic";

/**
 * Espacio privado del aplicante. URL: /r/[slug]/aplicacion/[applicationId].
 * Se identifica por la combinación slug+applicationId. Sin login.
 */
export default async function ApplicantWorkspace({
  params,
}: {
  params: { slug: string; applicationId: string };
}) {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: challenge } = await supabase
    .from("challenges")
    .select(
      "id, title, end_date, status, deliverable_format, organization_id, public_slug",
    )
    .eq("public_slug", params.slug)
    .single();
  if (!challenge) notFound();

  const { data: application } = await supabase
    .from("challenge_applications")
    .select(
      "id, challenge_id, applicant_name, applicant_email, share_with_company, status, submitted_at",
    )
    .eq("id", params.applicationId)
    .eq("challenge_id", challenge.id)
    .single();
  if (!application) notFound();

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", challenge.organization_id)
    .single();

  const { data: submission } = await supabase
    .from("challenge_submissions")
    .select("content, external_url, storage_path, submitted_at")
    .eq("application_id", application.id)
    .maybeSingle();

  const isOpen = challenge.status === "published";
  const isExpired = new Date(challenge.end_date) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50/40 to-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-bold">Menta</span>
          </Link>
          <Link
            href={`/r/${challenge.public_slug}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Volver al reto
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl py-12 space-y-6">
        <div>
          <p className="text-xs text-muted-foreground">Tu espacio</p>
          <h1 className="text-3xl font-bold tracking-tight">{challenge.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hola, {application.applicant_name} ·{" "}
            {org?.name && `Reto de ${org.name}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Termina el {formatDate(challenge.end_date)}
            </span>
            <Badge variant={application.share_with_company ? "success" : "secondary"}>
              {application.share_with_company
                ? "Compartes datos con la empresa"
                : "Datos privados"}
            </Badge>
            {application.submitted_at && (
              <Badge variant="info" className="gap-1">
                <FileCheck2 className="h-3 w-3" />
                Entregado {formatDate(application.submitted_at)}
              </Badge>
            )}
          </div>
        </div>

        {challenge.deliverable_format && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Qué se espera de tu entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{challenge.deliverable_format}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tu propuesta</CardTitle>
            <CardDescription>
              Puedes describir tu solución, adjuntar un archivo o un enlace
              (Drive, GitHub, Figma...). Puedes actualizarla las veces que
              necesites antes de que termine el reto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isOpen && !isExpired ? (
              <SubmissionForm
                challengeId={challenge.id}
                applicationId={application.id}
                organizationId={challenge.organization_id}
                shareWithCompany={application.share_with_company}
                initialContent={submission?.content ?? ""}
                initialExternalUrl={submission?.external_url ?? ""}
                initialStoragePath={submission?.storage_path ?? null}
              />
            ) : (
              <p className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                Este reto ya está cerrado o ha terminado. Gracias por participar.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-mint-200 bg-mint-50/40">
          <CardContent className="flex items-center gap-3 p-4">
            <Award className="h-5 w-5 text-mint-700" />
            <p className="text-sm text-mint-900">
              <strong>Tip:</strong> guarda este enlace, es tu acceso privado.
              Si lo pierdes, puedes volver a aplicar al reto con el mismo email.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
