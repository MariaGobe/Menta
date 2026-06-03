"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Props {
  studentId: string;
  studentName: string;
}

export function DeleteStudentButton({ studentId, studentName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    // Doble confirmación: escribir el nombre exacto
    const typed = window.prompt(
      `Esta acción eliminará permanentemente al alumno "${studentName}" y todos sus datos relacionados (plan, tareas, diario, entregables, hitos, evaluaciones).\n\nEscribe el nombre del alumno exactamente para confirmar:`,
    );
    if (typed === null) return;
    if (typed.trim() !== studentName.trim()) {
      setError("El nombre introducido no coincide. Cancelado.");
      return;
    }

    setLoading(true);
    setError(null);

    // Si el alumno tiene perfil vinculado (estuvo invitado), también lo limpiamos
    await supabase.from("profiles").update({ student_id: null }).eq("student_id", studentId);

    const { error: err } = await supabase.from("students").delete().eq("id", studentId);
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    router.push("/alumnos");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        onClick={handleDelete}
        disabled={loading}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Eliminar alumno
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
