// Helpers PUROS para retos. No importan supabase server.
// Las funciones server-only están en `lib/challenges-server.ts`.

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
    `Cualquier alumno o estudiante puede apuntarse y enviar su propuesta. Reto abierto del ${input.startDate} al ${input.endDate}.`,
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
