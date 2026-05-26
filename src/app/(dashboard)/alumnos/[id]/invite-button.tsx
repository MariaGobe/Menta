"use client";

import { useState } from "react";
import { Loader2, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  studentId: string;
  studentEmail: string | null;
}

export function InviteStudentButton({ studentId, studentEmail }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function invite() {
    if (!studentEmail) {
      setError("El alumno no tiene email registrado");
      return;
    }
    if (
      !confirm(
        `Se enviará un correo a ${studentEmail} con un enlace para que el alumno acceda a su portal personal. ¿Continuar?`,
      )
    )
      return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/students/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setError(err.error ?? "No se pudo enviar la invitación");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Button variant="outline" disabled>
        <Check className="h-4 w-4" /> Invitación enviada
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={invite} disabled={loading || !studentEmail} variant="outline">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        Invitar al portal
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!studentEmail && (
        <p className="text-xs text-muted-foreground">Añade un email al alumno primero</p>
      )}
    </div>
  );
}
