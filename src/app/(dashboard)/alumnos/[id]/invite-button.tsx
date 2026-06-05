"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  studentId: string;
  studentEmail: string | null;
  hasAccount: boolean;
}

export function InviteStudentButton({ studentId, studentEmail, hasAccount }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<null | "invited" | "reset">(null);
  const [error, setError] = useState<string | null>(null);

  // Limpia el badge "enviado" tras 4 segundos para permitir reenvíos.
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(null), 4000);
    return () => clearTimeout(t);
  }, [sent]);

  const label = hasAccount ? "Reenviar enlace de acceso" : "Invitar al portal";
  const Icon = hasAccount ? RefreshCw : Mail;

  async function action() {
    if (!studentEmail) {
      setError("El alumno no tiene email registrado");
      return;
    }
    const message = hasAccount
      ? `Se enviará un correo a ${studentEmail} con un nuevo enlace para entrar al portal (re-establecer contraseña). ¿Continuar?`
      : `Se enviará un correo a ${studentEmail} con un enlace para que el alumno acceda a su portal personal. ¿Continuar?`;
    if (!confirm(message)) return;

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
      setError(err.error ?? "No se pudo enviar el enlace");
      return;
    }
    const data = (await res.json()) as { mode: "invited" | "reset" };
    setSent(data.mode);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={action} disabled={loading || !studentEmail} variant="outline">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : sent ? (
          <Check className="h-4 w-4 text-mint-700" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {sent === "invited"
          ? "Invitación enviada"
          : sent === "reset"
            ? "Enlace reenviado"
            : label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!studentEmail && (
        <p className="text-xs text-muted-foreground">Añade un email al alumno primero</p>
      )}
    </div>
  );
}
