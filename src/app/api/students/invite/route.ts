import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Invita a un alumno al portal mediante magic link de Supabase Auth.
 * Pasa metadata { student_id, organization_id, full_name } al token, y el
 * trigger handle_new_user crea el profile con role 'student' al confirmar.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId } = (await request.json().catch(() => ({}))) as {
    studentId?: string;
  };
  if (!studentId)
    return NextResponse.json({ error: "studentId requerido" }, { status: 400 });

  // Verificamos que el alumno pertenece a la organización del usuario
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .select("id, organization_id, full_name, email")
    .eq("id", studentId)
    .single();

  if (studentErr || !student) {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
  }
  if (!student.email) {
    return NextResponse.json(
      { error: "El alumno no tiene email registrado" },
      { status: 400 },
    );
  }

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Servicio de invitaciones no configurado" },
      { status: 500 },
    );
  }

  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-theta.vercel.app"}/student/dashboard`;

  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
    student.email,
    {
      data: {
        student_id: student.id,
        organization_id: student.organization_id,
        full_name: student.full_name,
      },
      redirectTo,
    },
  );

  if (inviteErr) {
    return NextResponse.json({ error: inviteErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email: student.email });
}
