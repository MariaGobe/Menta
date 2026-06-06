"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2, ShieldAlert } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import {
  MENTOR_TONE_LABELS,
  type MentorConfig,
  type MentorTone,
} from "@/types/database";

interface Props {
  organizationId: string;
  config: MentorConfig | null;
}

export function MentorConfigForm({ organizationId, config }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const tWarn = useTranslations("MentorConfig");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tone, setTone] = useState<MentorTone>(
    (config?.tone as MentorTone) ?? "cercano",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const fd = new FormData(e.currentTarget);
    const resourcesRaw = fd.get("resources_text") as string;
    const resources = resourcesRaw
      ? resourcesRaw
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            const m = line.match(/^(.+?)\s+(https?:\/\/\S+)$/);
            if (m) return { label: m[1].trim(), url: m[2] };
            return { label: line, url: line };
          })
      : [];

    const payload = {
      organization_id: organizationId,
      company_description: (fd.get("company_description") as string) || null,
      industry: (fd.get("industry") as string) || null,
      tone,
      mentor_personality: (fd.get("mentor_personality") as string) || null,
      knowledge_base: (fd.get("knowledge_base") as string) || null,
      resources: resources.length > 0 ? resources : null,
      custom_instructions: (fd.get("custom_instructions") as string) || null,
    };

    await supabase.from("mentor_configs").upsert(payload, {
      onConflict: "organization_id",
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  const resourcesText = (config?.resources ?? [])
    .map((r) => (r.label === r.url ? r.url : `${r.label} ${r.url}`))
    .join("\n");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="company_description">Sobre la empresa</Label>
        <Textarea
          id="company_description"
          name="company_description"
          rows={3}
          defaultValue={config?.company_description ?? ""}
          placeholder="A qué se dedica tu empresa, equipo, valores y forma de trabajar"
        />
        <p className="text-xs text-muted-foreground">
          El mentor lo usará para situar al alumno y responder con coherencia.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Sector o área</Label>
          <Input
            id="industry"
            name="industry"
            defaultValue={config?.industry ?? ""}
            placeholder="SaaS, marketing digital, automoción..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tone">Tono del mentor</Label>
          <Select
            name="tone"
            value={tone}
            onValueChange={(v) => setTone(v as MentorTone)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MENTOR_TONE_LABELS) as MentorTone[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {MENTOR_TONE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mentor_personality">Personalidad del mentor</Label>
        <Textarea
          id="mentor_personality"
          name="mentor_personality"
          rows={2}
          defaultValue={config?.mentor_personality ?? ""}
          placeholder="Ej. paciente, directo, motivador, exigente con la calidad pero comprensivo con el aprendizaje"
        />
      </div>

      <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div>
          <p className="font-semibold text-amber-900">{tWarn("knowledge_warning_title")}</p>
          <p className="mt-1 text-amber-800">{tWarn("knowledge_warning")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="knowledge_base">
          Base de conocimiento (procesos, herramientas, normas internas)
        </Label>
        <Textarea
          id="knowledge_base"
          name="knowledge_base"
          rows={6}
          defaultValue={config?.knowledge_base ?? ""}
          placeholder={`Herramientas que usamos: Slack, GitHub, Notion, Figma.
Cómo se hace una PR aquí: rama feature/, descripción clara, revisor asignado, mergea quien aprueba.
Horario: 9-18 con flexibilidad. Lunes daily a las 10.
Quién es quién: Ana (CTO), Luis (Lead), Marta (Product).`}
        />
        <p className="text-xs text-muted-foreground">
          Cualquier información práctica que el alumno necesitará. Puede ser
          extensa: cuanto más, mejor.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resources_text">
          Recursos útiles (uno por línea, formato: nombre URL)
        </Label>
        <Textarea
          id="resources_text"
          name="resources_text"
          rows={3}
          defaultValue={resourcesText}
          placeholder={`Wiki interna https://wiki.miempresa.com
Guía de estilo https://miempresa.notion.site/style
Repo principal https://github.com/miempresa/app`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_instructions">
          Instrucciones específicas para el mentor
        </Label>
        <Textarea
          id="custom_instructions"
          name="custom_instructions"
          rows={3}
          defaultValue={config?.custom_instructions ?? ""}
          placeholder={`Si el alumno pregunta por algo confidencial, redirígelo al tutor humano.
No respondas dudas legales ni de contrato.
Anima al alumno a redactar el diario al final del día.`}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-mint-700">
            <Check className="h-4 w-4" /> Mentor actualizado
          </span>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar configuración
        </Button>
      </div>
    </form>
  );
}
