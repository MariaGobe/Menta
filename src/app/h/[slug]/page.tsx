import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MILESTONE_TYPE_LABELS, type MilestoneType } from "@/types/database";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: m } = await supabase
    .from("milestones")
    .select("title, description, student_id, type")
    .eq("public_slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!m) {
    return { title: "Hito no encontrado · Menta" };
  }

  const { data: student } = await supabase
    .from("students")
    .select("full_name, organizations(name)")
    .eq("id", m.student_id)
    .single();

  const studentName = student?.full_name ?? "Alumno";
  const companyName =
    (student?.organizations as { name?: string } | null)?.name ?? null;
  const description =
    m.description?.slice(0, 200) ??
    `${MILESTONE_TYPE_LABELS[m.type as MilestoneType]} de ${studentName}${companyName ? ` en ${companyName}` : ""}.`;
  const title = `${m.title} · ${studentName}`;

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
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicMilestonePage({ params }: PageProps) {
  const supabase = createClient();
  const { data: m } = await supabase
    .from("milestones")
    .select("*")
    .eq("public_slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!m) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("full_name, practice_type, start_date, end_date, organizations(name)")
    .eq("id", m.student_id)
    .single();

  const companyName =
    (student?.organizations as { name?: string } | null)?.name ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50/50 to-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-bold">Menta</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Hitos profesionales
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl py-12">
        <article className="space-y-10">
          <header>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white px-3 py-1 text-xs font-medium text-mint-800">
              {m.endorsed_at ? (
                <>
                  <Award className="h-3.5 w-3.5" />
                  Recomendación de empresa
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {MILESTONE_TYPE_LABELS[m.type as MilestoneType]}
                </>
              )}
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              {m.title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {student?.full_name}
              {companyName && ` · Prácticas en ${companyName}`}
              {m.published_at && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(m.published_at)}
                </span>
              )}
            </p>
          </header>

          {m.description && (
            <section>
              <p className="whitespace-pre-line text-lg leading-relaxed text-foreground">
                {m.description}
              </p>
            </section>
          )}

          {m.endorsed_at && m.company_endorsement && (
            <section className="rounded-2xl border border-mint-200 bg-mint-50/60 p-6">
              <div className="flex items-center gap-2 text-mint-800">
                <Award className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  Palabras del equipo {companyName && `de ${companyName}`}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line italic text-mint-900">
                &ldquo;{m.company_endorsement}&rdquo;
              </p>
            </section>
          )}

          {m.tags && m.tags.length > 0 && (
            <section>
              <div className="flex flex-wrap gap-2">
                {(m.tags as string[]).map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-mint-100 px-3 py-1 text-xs font-medium text-mint-800"
                  >
                    #{t.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>
            </section>
          )}
        </article>

        <Card className="mt-12 border-mint-200 bg-mint-50/40">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-medium">
                ¿Tu empresa también acoge alumnos en prácticas?
              </p>
              <p className="text-xs text-muted-foreground">
                Con Menta automatizas el plan, el seguimiento y los informes.
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
