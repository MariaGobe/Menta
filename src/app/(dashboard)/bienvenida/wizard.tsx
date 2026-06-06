"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Tone = "cercano" | "profesional" | "formal" | "didactico";
type PracticeType = "fp" | "university" | "internal";

interface Props {
  initial: {
    name: string;
    nif: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
  };
}

export function OnboardingWizard({ initial }: Props) {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Paso 1: empresa
  const [name, setName] = useState(initial.name);
  const [nif, setNif] = useState(initial.nif ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [postalCode, setPostalCode] = useState(initial.postal_code ?? "");

  // Paso 2: mentor
  const [companyDescription, setCompanyDescription] = useState("");
  const [tone, setTone] = useState<Tone>("cercano");

  // Paso 3: primer alumno (opcional)
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [practiceType, setPracticeType] = useState<PracticeType>("fp");

  const steps = [t("step_company"), t("step_mentor"), t("step_student")];

  async function finish(includeStudent: boolean) {
    setSaving(true);
    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: {
          name,
          nif: nif || null,
          address: address || null,
          city: city || null,
          postal_code: postalCode || null,
        },
        mentor: {
          company_description: companyDescription || null,
          tone,
        },
        student:
          includeStudent && studentName && studentEmail
            ? { full_name: studentName, email: studentEmail, practice_type: practiceType }
            : null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Error guardando");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < step
                  ? "bg-mint-500 text-white"
                  : i === step
                    ? "bg-mint-100 text-mint-800 ring-2 ring-mint-500"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Paso 1: empresa */}
      {step === 0 && (
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("company_name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nif">{t("company_nif")}</Label>
              <Input id="nif" value={nif} onChange={(e) => setNif(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">{t("company_postal_code")}</Label>
              <Input
                id="postal_code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t("company_address")}</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("company_city")}</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(1)} disabled={!name}>
              {t("next")}
            </Button>
          </div>
        </div>
      )}

      {/* Paso 2: mentor */}
      {step === 1 && (
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="mentor_desc">{t("mentor_description_label")}</Label>
            <Textarea
              id="mentor_desc"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={4}
              placeholder="Ej. Somos una agencia de diseño UX que trabaja con clientes de salud y educación..."
            />
            <p className="text-xs text-muted-foreground">{t("mentor_description_hint")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone">{t("mentor_tone_label")}</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cercano">{t("mentor_tone_cercano")}</SelectItem>
                <SelectItem value="profesional">{t("mentor_tone_profesional")}</SelectItem>
                <SelectItem value="formal">{t("mentor_tone_formal")}</SelectItem>
                <SelectItem value="didactico">{t("mentor_tone_didactico")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              {t("back")}
            </Button>
            <Button onClick={() => setStep(2)}>{t("next")}</Button>
          </div>
        </div>
      )}

      {/* Paso 3: alumno */}
      {step === 2 && (
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="student_name">{t("student_name")}</Label>
            <Input
              id="student_name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student_email">{t("student_email")}</Label>
            <Input
              id="student_email"
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ptype">{t("student_practice_type")}</Label>
            <Select value={practiceType} onValueChange={(v) => setPracticeType(v as PracticeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fp">{t("fp")}</SelectItem>
                <SelectItem value="university">{t("university")}</SelectItem>
                <SelectItem value="internal">{t("internal")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              {t("back")}
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => finish(false)} disabled={saving}>
                {t("skip_student")}
              </Button>
              <Button
                onClick={() => finish(true)}
                disabled={saving || !studentName || !studentEmail}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("finish")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
