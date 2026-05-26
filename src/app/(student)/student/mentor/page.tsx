import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MentorChat } from "./mentor-chat";

export const dynamic = "force-dynamic";

export default async function StudentMentorPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, full_name")
    .eq("id", user!.id)
    .single();
  const studentId = profile?.student_id;

  const { data: history } = await supabase
    .from("mentor_messages")
    .select("id, role, content, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mentor virtual</h1>
        <p className="text-muted-foreground">
          Tu asistente para resolver dudas, planificar el día y desbloquear
          problemas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversación</CardTitle>
          <CardDescription>
            Pregúntale al mentor cualquier duda sobre tus tareas o aprendizaje.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentId && (
            <MentorChat
              studentId={studentId}
              studentName={profile?.full_name ?? "alumno"}
              initialMessages={history ?? []}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
