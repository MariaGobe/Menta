import { notFound } from "next/navigation";
import Link from "next/link";
import { Sprout, Award, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Página pública de presentación. La RLS permite SELECT cuando is_public = true.
 */
export default async function PublicPresentationPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: presentation } = await supabase
    .from("final_presentations")
    .select(
      "title, summary, achievements, competencies, published_at, student_id, organization_id, is_public",
    )
    .eq("public_slug", params.slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!presentation) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("full_name, practice_type, start_date, end_date, organizations(name)")
    .eq("id", presentation.student_id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50/50 to-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-bold">Menta</span>
          </Link>
          <span className="text-xs text-muted-foreground">
            Portfolio profesional
          </span>
        </div>
      </header>

      <main className="container max-w-3xl py-12">
        <article className="space-y-10">
          <header>
            <p className="text-sm text-muted-foreground">
              {(student?.organizations as { name?: string } | null)?.name &&
                `Prácticas en ${(student!.organizations as { name?: string }).name}`}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              {presentation.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {student?.full_name}
              {student?.start_date && ` · ${formatDate(student.start_date)}`}
              {student?.end_date && ` – ${formatDate(student.end_date)}`}
            </p>
          </header>

          {presentation.summary && (
            <section>
              <p className="text-lg leading-relaxed text-foreground">
                {presentation.summary}
              </p>
            </section>
          )}

          {presentation.achievements && presentation.achievements.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Logros principales
              </h2>
              <ul className="mt-4 space-y-3">
                {(presentation.achievements as { title: string }[]).map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border bg-card p-4"
                  >
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-mint-700" />
                    <span className="text-sm">{a.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {presentation.competencies && presentation.competencies.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Competencias
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(presentation.competencies as { name: string }[]).map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-3 py-1 text-xs font-medium text-mint-800"
                  >
                    <Sparkles className="h-3 w-3" />
                    {c.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {presentation.published_at && (
            <p className="text-xs text-muted-foreground">
              Publicado el {formatDate(presentation.published_at)}
            </p>
          )}
        </article>

        <Card className="mt-12 border-mint-200 bg-mint-50/40">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-medium">
                ¿Quieres crear tu propio portfolio de prácticas?
              </p>
              <p className="text-xs text-muted-foreground">
                Menta ayuda a empresas y alumnos a gestionar sus prácticas y
                generar portfolios profesionales.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Conoce Menta
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
