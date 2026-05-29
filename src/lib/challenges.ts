import { createClient } from "@/lib/supabase/server";

export const CHALLENGE_DURATION_DAYS = 30;
export const CHALLENGE_ADDON_PRICE_EUR = 84;
export const FREE_CHALLENGES_PER_YEAR = 1;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/**
 * Devuelve cuántos retos ha publicado la empresa en los últimos 365 días
 * (excluyendo borradores). Solo cuentan los que ya están publicados o ya
 * tienen pago confirmado.
 */
export async function countChallengesThisYear(
  organizationId: string,
): Promise<number> {
  const supabase = createClient();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { count } = await supabase
    .from("challenges")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .in("status", ["published", "closed", "archived"])
    .gte("created_at", oneYearAgo.toISOString());

  return count ?? 0;
}

export interface ChallengeAvailability {
  hasFree: boolean;
  usedThisYear: number;
  priceEur: number;
}

export async function checkChallengeAvailability(
  organizationId: string,
): Promise<ChallengeAvailability> {
  const used = await countChallengesThisYear(organizationId);
  return {
    hasFree: used < FREE_CHALLENGES_PER_YEAR,
    usedThisYear: used,
    priceEur: CHALLENGE_ADDON_PRICE_EUR,
  };
}

/** Texto sugerido para LinkedIn al publicar un reto */
export function buildChallengeLinkedInPost(input: {
  title: string;
  shortDescription: string | null;
  startDate: string;
  endDate: string;
  publicUrl: string;
  companyName: string | null;
  tags: string[] | null;
}): string {
  const lines: string[] = [];
  lines.push(`🚀 Lanzamos un reto abierto${input.companyName ? ` en ${input.companyName}` : ""}`);
  lines.push("");
  lines.push(input.title);
  if (input.shortDescription) {
    lines.push("");
    lines.push(input.shortDescription.slice(0, 500));
  }
  lines.push("");
  lines.push(
    `Cualquier alumno o estudiante puede apuntarse y enviar su propuesta. El reto está abierto del ${input.startDate} al ${input.endDate}.`,
  );
  lines.push("");
  lines.push(`Apúntate aquí: ${input.publicUrl}`);
  if (input.tags && input.tags.length > 0) {
    lines.push("");
    lines.push(input.tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" "));
  }
  lines.push("");
  lines.push("#retoMenta #captacióndetalento #aprendizaje");
  return lines.join("\n");
}

/** Texto sugerido para LinkedIn al cerrar el reto con los destacados */
export function buildChallengeResultsLinkedInPost(input: {
  title: string;
  publicUrl: string;
  companyName: string | null;
  highlightedCount: number;
}): string {
  const lines: string[] = [];
  lines.push(
    `✨ Cerramos el reto${input.companyName ? ` de ${input.companyName}` : ""} y queremos compartir los trabajos destacados.`,
  );
  lines.push("");
  lines.push(input.title);
  lines.push("");
  lines.push(
    `Hemos seleccionado ${input.highlightedCount} propuesta${input.highlightedCount === 1 ? "" : "s"} que nos han llamado la atención por su calidad y creatividad.`,
  );
  lines.push("");
  lines.push(`Mira los resultados: ${input.publicUrl}`);
  lines.push("");
  lines.push("#retoMenta #talento");
  return lines.join("\n");
}

export function linkedInShareUrl(publicUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
}
