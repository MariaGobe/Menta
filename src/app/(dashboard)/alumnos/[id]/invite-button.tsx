"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Mail, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  studentId: string;
  studentEmail: string | null;
  hasAccount: boolean;
}

export function InviteStudentButton({ studentId, studentEmail, hasAccount }: Props) {
  const t = useTranslations("StudentDetail");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<null | "invited" | "reset">(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sent) return;
    const tm = setTimeout(() => setSent(null), 4000);
    return () => clearTimeout(tm);
  }, [sent]);

  const label = hasAccount ? t("resend_link") : t("invite_portal");
  const Icon = hasAccount ? RefreshCw : Mail;

  async function action() {
    if (!studentEmail) {
      setError(t("invite_error_no_email"));
      return;
    }
    const message = hasAccount
      ? t("invite_confirm_resend", { email: studentEmail })
      : t("invite_confirm_invite", { email: studentEmail });
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
      setError(err.error ?? t("invite_error_default"));
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
          ? t("invite_sent")
          : sent === "reset"
            ? t("link_resent")
            : label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!studentEmail && (
        <p className="text-xs text-muted-foreground">{t("invite_no_email")}</p>
      )}
    </div>
  );
}
