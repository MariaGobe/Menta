import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Trophy, Users, Award, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ApplyForm } from "./apply-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: c } = await supabase
    .from("challenges")
    .select("title, short_description, organization_id")
    .eq("public_slug", params.slug)
    .in("status", ["published", "closed"])
    .maybeSingle();

  if (!c) return { title: "Reto · Menta" };

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", c.organization_id)
    .single();

  const description =
    c.short_description ??
    `Reto abierto${org?.name ? ` por ${org.name}` : ""}. Apúntate, resuelve y muestra tu talento.`;
  const title = `${c.title}${org?.name ? ` · ${org.name}` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "es_ES",
      siteName: "Menta",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicChallengePage({ params }: PageProps) {
  const supabase = createClient();
  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("public_slug", params.slug)
    .in("status", ["published", "closed"])
    .maybeSingle();
  if (!challenge) notFound();

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", challenge.organization_id)
    .single();

  const { count: applicantsCount } = await supabase
    .from("challenge_applications")
    .select("*", { count: "exact", head: true })
    .eq("challenge_id", challenge.id);

  const isClosed = challenge.status === "closed";

  // Si está cerrado, mostrar destacados públicos
  let highlights: { applicant_name: string; score: number | null }[] = [];
  if (isClosed) {
    const { data } = await supabase
      .from("challenge_applications")
      .select("applicant_name, score, share_with_company")
      .eq("challenge_id", challenge.id)
      .eq("highlighted", true)
      .eq("share_with_company", true);
    highlights = data ?? [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50/40 to-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-bold">Menta</span>
          </Link>
          <span className="text-xs text-muted-foreground">Reto abierto</span>
        </div>
      </header>

      <main className="container max-w-3xl py-12">
        <article className="space-y-8">
          <header>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white px-3 py-1 text-xs font-medium text-mint-800">
              <Trophy className="h-3.5 w-3.5" />
              Reto abierto {org?.name && `de ${org.name}`}
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              {challenge.title}
            </h1>
            {challenge.short_description && (
              <p className="mt-3 text-lg text-muted-foreground">
                {challenge.short_description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(challenge.start_date)} – {formatDate(challenge.end_date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {applicantsCount ?? 0} aplicante
                {applicantsCount === 1 ? "" : "s"}
              </span>
              {isClosed && (
                <Badge variant="info">Reto cerrado</Badge>
              )}
            </div>
          </header>

          {challenge.problem_statement && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                El reto
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed">
                {challenge.problem_statement}
              </p>
            </section>
          )}

          {challenge.requirements && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Para quién
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed">
                {challenge.requirements}
              </p>
            </section>
          )}

          {challenge.deliverable_format && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Qué se entrega
              </h2>
              <p className="mt-3 text-base leading-relaxed">
                {challenge.deliverable_format}
              </p>
            </section>
          )}

          {challenge.evaluation_criteria && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Cómo se evalúa
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed">
                {challenge.evaluation_criteria}
              </p>
            </section>
          )}

          {challenge.tags && (challenge.tags as string[]).length > 0 && (
            <section>
              <div className="flex flex-wrap gap-2">
                {(challenge.tags as string[]).map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex rounded-full bg-mint-100 px-3 py-1 text-xs font-medium text-mint-800"
                  >
                    #{t.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Form de aplicación */}
          {!isClosed ? (
            <section id="apply">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">Apúntate al reto</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Rellena tus datos. Recibirás un enlace por email para
                    entregar tu propuesta.
                  </p>
                  <div className="mt-5">
                    <ApplyForm challengeId={challenge.id} />
                  </div>
                </CardContent>
              </Card>
            </section>
          ) : (
            <section>
              <Card className="border-mint-200 bg-mint-50/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-mint-700" />
                    <h2 className="text-xl font-bold">Reto finalizado</h2>
                  </div>
                  {highlights.length > 0 ? (
                    <>
                      <p className="mt-2 text-sm text-mint-900">
                        Estas son las propuestas destacadas por {org?.name ?? "la empresa"}:
                      </p>
                      <ul className="mt-4 space-y-2">
                        {highlights.map((h, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-white p-3"
                          >
                            <span className="text-sm font-medium">
                              {h.applicant_name}
                            </span>
                            {h.score !== null && (
                              <Badge variant="success">{h.score}/10</Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-mint-900">
                      Gracias a todos los aplicantes por participar.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          )}
        </article>

        <Card className="mt-12 border-mint-200 bg-mint-50/40">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-medium">
                ¿Tu empresa también busca talento joven?
              </p>
              <p className="text-xs text-muted-foreground">
                Lanza tu propio reto con Menta y conecta con alumnos motivados.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Conoce Menta <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
