"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewOrgButton() {
  const router = useRouter();
  const t = useTranslations("AdminNewOrg");
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [trialMonths, setTrialMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/organizations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgName,
        orgEmail: orgEmail || null,
        ownerEmail,
        ownerName: ownerName || null,
        trialMonths,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? t("error"));
      return;
    }
    setDone(true);
    setOrgName("");
    setOrgEmail("");
    setOwnerEmail("");
    setOwnerName("");
    router.refresh();
    setTimeout(() => {
      setOpen(false);
      setDone(false);
    }, 2000);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {t("button")}
      </Button>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border bg-card p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold">{t("title")}</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="o_name">{t("org_name_label")}</Label>
          <Input
            id="o_name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="o_email">{t("org_email_label")}</Label>
          <Input
            id="o_email"
            type="email"
            value={orgEmail}
            onChange={(e) => setOrgEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tr_months">{t("trial_months_label")}</Label>
          <Input
            id="tr_months"
            type="number"
            min={1}
            max={24}
            value={trialMonths}
            onChange={(e) => setTrialMonths(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ow_email">{t("owner_email_label")}</Label>
          <Input
            id="ow_email"
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ow_name">{t("owner_name_label")}</Label>
          <Input
            id="ow_name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
      )}
      {done && (
        <p className="rounded-md bg-mint-50 p-2 text-sm text-mint-800">{t("success")}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
          {t("cancel")}
        </Button>
        <Button onClick={create} disabled={loading || !orgName.trim() || !ownerEmail.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : done ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {loading ? t("creating") : t("create")}
        </Button>
      </div>
    </div>
  );
}
