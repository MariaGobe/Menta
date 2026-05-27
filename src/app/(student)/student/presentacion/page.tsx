import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PresentationEditor } from "./presentation-editor";

export const dynamic = "force-dynamic";

export default async function StudentPresentacionPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, organization_id")
    .eq("id", user!.id)
    .single();
  const studentId = profile?.student_id;
  const orgId = profile?.organization_id;

  if (!studentId || !orgId) return null;

  const { data: student } = await supabase
    .from("students")
    .select("full_name, practice_type, start_date, end_date, organizations(name)")
    .eq("id", studentId)
    .single();

  // Cargar / inicializar presentación
  let { data: presentation } = await supabase
    .from("final_presentations")
    .select("*")
    .eq("student_id", studentId)
    .maybeSingle();

  // Auto-borrador a partir de actividad: extraemos algunos elementos para sugerir
  if (!presentation) {
    const [{ data: tasks }, { data: logs }, { data: deliverables }] =
      await Promise.all([
        supabase
          .from("practice_tasks")
          .select("title")
          .eq("student_id", studentId)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(8),
        supabase
          .from("daily_activity_logs")
          .select("learnings")
          .eq("student_id", studentId)
          .not("learnings", "is", null)
          .order("log_date", { ascending: false })
          .limit(15),
        supabase
          .from("deliverables")
          .select("title")
          .eq("student_id", studentId),
      ]);

    const suggested = {
      title: `Prácticas en ${
        (student?.organizations as { name?: string } | null)?.name ?? "la empresa"
      }`,
      summary: `Resumen de mis prácticas como ${student?.practice_type ?? ""} entre ${student?.start_date ?? ""} y ${student?.end_date ?? ""}.`,
      achievements:
        (tasks ?? []).slice(0, 5).map((t) => ({ title: t.title })) ?? [],
      competencies: extractCompetencies(
        (logs ?? []).map((l) => l.learnings).filter(Boolean) as string[],
      ),
    };

    presentation = {
      id: "",
      organization_id: orgId,
      student_id: studentId,
      title: suggested.title,
      summary: suggested.summary,
      achievements: suggested.achievements,
      competencies: suggested.competencies,
      highlights: null,
      is_public: false,
      public_slug: null,
      published_at: null,
      created_at: "",
      updated_at: "",
    };
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Presentación final</h1>
        <p className="text-muted-foreground">
          Resume tus prácticas en una página. Puedes editarla, mantenerla
          privada o publicarla como portfolio profesional.
        </p>
      </div>

      <Card className="border-mint-200 bg-mint-50/40">
        <CardContent className="p-4 text-sm">
          <p className="text-mint-900">
            <strong>¿Cómo se genera?</strong> Menta usa tus tareas completadas,
            aprendizajes del diario y entregables como punto de partida. Tú la
            editas y la haces tuya.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tu presentación</CardTitle>
          <CardDescription>
            Edita el contenido y, cuando estés lista, márcala como pública para
            obtener un enlace para compartir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PresentationEditor
            studentId={studentId}
            organizationId={orgId}
            initial={presentation as never}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * A partir de los textos de aprendizajes, extrae un listado de competencias
 * candidatas. Es heurístico: cuenta palabras clave técnicas/blandas más comunes.
 */
function extractCompetencies(learnings: string[]): { name: string }[] {
  if (learnings.length === 0) return [];
  const text = learnings.join(" ").toLowerCase();
  const candidates = [
    "trabajo en equipo",
    "comunicación",
    "autonomía",
    "resolución de problemas",
    "react",
    "javascript",
    "python",
    "git",
    "sql",
    "diseño",
    "ux",
    "ui",
    "agile",
    "scrum",
    "testing",
    "documentación",
    "análisis",
    "presentación",
  ];
  return candidates
    .filter((c) => text.includes(c))
    .slice(0, 8)
    .map((name) => ({ name }));
}
