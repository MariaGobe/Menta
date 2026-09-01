"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Phone, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  id: string;
  status: "pending" | "contacted" | "approved" | "rejected";
}

export function StatusActions({ id, status }: Props) {
  const router = useRouter();
  const t = useTranslations("AccessRequestsAdmin");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(next: Props["status"]) {
    setBusy(next);
    const res = await fetch(`/api/admin/access-requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Error");
      return;
    }
    router.refresh();
  }

  const StatusBadge = () => {
    if (status === "approved")
      return <Badge variant="success">{t("status_approved")}</Badge>;
    if (status === "rejected")
      return <Badge variant="destructive">{t("status_rejected")}</Badge>;
    if (status === "contacted")
      return <Badge variant="info">{t("status_contacted")}</Badge>;
    return <Badge variant="warning">{t("status_pending")}</Badge>;
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <StatusBadge />
      {status !== "approved" && status !== "rejected" && (
        <div className="flex flex-wrap justify-end gap-1">
          {status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => run("contacted")}
              disabled={busy !== null}
            >
              {busy === "contacted" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Phone className="h-3 w-3" />
              )}
              {t("mark_contacted")}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => run("approved")}
            disabled={busy !== null}
          >
            {busy === "approved" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {t("mark_approved")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => run("rejected")}
            disabled={busy !== null}
          >
            {busy === "rejected" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {t("mark_rejected")}
          </Button>
        </div>
      )}
    </div>
  );
}
