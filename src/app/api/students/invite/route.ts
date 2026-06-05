import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Invita o reenvía acceso al portal del alumno.
 *
 * - Si el alumno aún no tiene cuenta (no existe profile con su student_id),
 *   usa `inviteUserByEmail` (magic link de invitación).
 * - Si ya tiene cuenta, usa `resetPasswordForEmail` para que pueda volver
 *   a establecer su contraseña a través del enlace recibido.
 *
 * Devuelve { ok: true, mode: "invited" | "reset", email }.
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

  // Verificamos que el alumno pertenece a la organización del usuario (RLS lo asegura)
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

  // ¿Ya tiene cuenta creada en Menta?
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("student_id", student.id)
    .maybeSingle();

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

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-theta.vercel.app"}/auth/establecer-contrasena`;

  if (existingProfile) {
    // Caso B: cuenta ya creada → recovery link para re-establecer contraseña
    const { error: resetErr } = await admin.auth.resetPasswordForEmail(student.email, {
      redirectTo,
    });
    if (resetErr) {
      return NextResponse.json({ error: resetErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, mode: "reset", email: student.email });
  }

  // Caso A: primera invitación
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

  return NextResponse.json({ ok: true, mode: "invited", email: student.email });
}
