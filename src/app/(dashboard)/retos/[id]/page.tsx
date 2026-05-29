import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Users, ExternalLink, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  CHALLENGE_STATUS_LABELS,
  APPLICATION_STATUS_LABELS,
  type ChallengeStatus,
  type ApplicationStatus,
} from "@/types/database";
import { PublishControls } from "./publish-controls";
import { ApplicationRow } from "./application-row";

export const dynamic = "force-dynamic";

export default async function ChallengeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!challenge) notFound();

  const { data: applications } = await supabase
    .from("challenge_applications")
    .select(
      "id, applicant_name, applicant_email, applicant_linkedin, share_with_company, status, score, highlighted, applied_at, submitted_at",
    )
    .eq("challenge_id", challenge.id)
    .order("applied_at", { ascending: false });

  const submitted = (applications ?? []).filter(
    (a) => a.status === "submitted" || a.status === "shortlisted",
  );
  const shareable = (applications ?? []).filter((a) => a.share_with_company);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/retos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a retos
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{challenge.title}</h1>
            <Badge
              variant={
                challenge.status === "published"
                  ? "success"
                  : challenge.status === "closed"
                    ? "info"
                    : "secondary"
              }
            >
              {CHALLENGE_STATUS_LABELS[challenge.status as ChallengeStatus]}
            </Badge>
          </div>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(challenge.start_date)} – {formatDate(challenge.end_date)}
          </p>
        </div>
        <PublishControls
          challengeId={challenge.id}
          status={challenge.status}
          publicSlug={challenge.public_slug}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aplicantes</CardDescription>
            <CardTitle className="text-2xl">{applications?.length ?? 0}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            registrados al reto
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Han entregado</CardDescription>
            <CardTitle className="text-2xl">{submitted.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            con propuesta enviada
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Comparten datos</CardDescription>
            <CardTitle className="text-2xl">{shareable.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            visibles para selección
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aplicantes</CardTitle>
          <CardDescription>
            Marca los destacados y revisa entregas. Solo los que han marcado
            &ldquo;compartir con la empresa&rdquo; te dejan ver sus datos
            completos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!applications?.length ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Aún no hay aplicantes</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Comparte el reto en LinkedIn para que llegue a más alumnos.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {applications.map((a) => (
                <ApplicationRow
                  key={a.id}
                  application={{
                    id: a.id,
                    applicant_name: a.applicant_name,
                    applicant_email: a.applicant_email,
                    applicant_linkedin: a.applicant_linkedin,
                    share_with_company: a.share_with_company,
                    status: a.status as ApplicationStatus,
                    score: a.score,
                    highlighted: a.highlighted,
                    submitted_at: a.submitted_at,
                  }}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {challenge.problem_statement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Planteamiento del reto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">
              {challenge.problem_statement}
            </p>
          </CardContent>
        </Card>
      )}

      {challenge.public_slug && challenge.status === "published" && (
        <Card className="border-mint-200 bg-mint-50/40">
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm">
              <p className="font-medium">Tu reto está en abierto:</p>
              <p className="text-mint-800">/r/{challenge.public_slug}</p>
            </div>
            <Button variant="outline" asChild>
              <a href={`/r/${challenge.public_slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> Ver pública
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
