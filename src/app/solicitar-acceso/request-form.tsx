"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PracticeType = "fp" | "university" | "internal";

export function AccessRequestForm() {
  const t = useTranslations("AccessRequest");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<PracticeType[]>([]);

  function toggleType(v: PracticeType) {
    setTypes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/access-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: fd.get("company_name"),
        contactName: fd.get("contact_name"),
        contactEmail: fd.get("contact_email"),
        contactPhone: fd.get("contact_phone") || null,
        contactRole: fd.get("contact_role") || null,
        practiceTypes: types,
        estimatedStudents: fd.get("estimated_students")
          ? Number(fd.get("estimated_students"))
          : null,
        durationMonths: fd.get("duration_months")
          ? Number(fd.get("duration_months"))
          : null,
        startsWhen: fd.get("starts_when") || null,
        sector: fd.get("sector") || null,
        notes: fd.get("notes") || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError(t("error_generic"));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint-100">
          <CheckCircle2 className="h-7 w-7 text-mint-700" />
        </div>
        <h2 className="text-2xl font-bold">{t("success_title")}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{t("success_body")}</p>
        <Button className="mt-6" asChild>
          <Link href="/">{t("back_home")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border bg-card p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="company_name">{t("company_label")}</Label>
          <Input id="company_name" name="company_name" required placeholder={t("company_placeholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_name">{t("contact_name_label")}</Label>
          <Input id="contact_name" name="contact_name" required placeholder={t("contact_name_placeholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_role">{t("contact_role_label")}</Label>
          <Input id="contact_role" name="contact_role" placeholder={t("contact_role_placeholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email">{t("contact_email_label")}</Label>
          <Input id="contact_email" name="contact_email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone">{t("contact_phone_label")}</Label>
          <Input id="contact_phone" name="contact_phone" type="tel" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sector">{t("sector_label")}</Label>
          <Input id="sector" name="sector" placeholder={t("sector_placeholder")} />
        </div>
      </div>

      <div className="space-y-3">
        <Label>{t("practice_types_label")}</Label>
        <p className="text-xs text-muted-foreground">{t("practice_types_hint")}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["fp", "university", "internal"] as PracticeType[]).map((v) => (
            <label
              key={v}
              className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition ${
                types.includes(v) ? "border-primary bg-mint-50" : "hover:border-mint-300"
              }`}
            >
              <input
                type="checkbox"
                checked={types.includes(v)}
                onChange={() => toggleType(v)}
                className="h-4 w-4 accent-mint-600"
              />
              {t(`type_${v}` as "type_fp" | "type_university" | "type_internal")}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="estimated_students">{t("estimated_students_label")}</Label>
          <Input
            id="estimated_students"
            name="estimated_students"
            type="number"
            min="1"
            placeholder={t("estimated_students_placeholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_months">{t("duration_label")}</Label>
          <Input
            id="duration_months"
            name="duration_months"
            type="number"
            min="1"
            placeholder={t("duration_placeholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="starts_when">{t("starts_when_label")}</Label>
          <Input id="starts_when" name="starts_when" placeholder={t("starts_when_placeholder")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("notes_label")}</Label>
        <Textarea id="notes" name="notes" rows={4} placeholder={t("notes_placeholder")} />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
