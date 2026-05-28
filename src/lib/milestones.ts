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
 * Construye un sugerido para el alumno al compartir en LinkedIn.
 * Devuelve un texto que el alumno puede copiar/pegar tal cual.
 */
export function buildLinkedInPost(input: {
  title: string;
  description: string | null;
  type:
    | "problem_solved"
    | "project_completed"
    | "practice_completed"
    | "company_recommendation"
    | "custom";
  studentName: string | null;
  companyName: string | null;
  endorsement: string | null;
  publicUrl: string;
  tags: string[] | null;
}): string {
  const opener = {
    problem_solved: "Acabo de resolver un reto interesante en mis prácticas 🚀",
    project_completed: "He completado un nuevo proyecto durante mis prácticas 🎯",
    practice_completed: "He terminado mis prácticas 🎓",
    company_recommendation: "Comparto una recomendación que me hace muchísima ilusión 💚",
    custom: "Un hito importante de mis prácticas",
  }[input.type];

  const company = input.companyName ? ` en ${input.companyName}` : "";
  const lines: string[] = [];
  lines.push(`${opener}${company}.`);
  lines.push("");
  lines.push(input.title);
  if (input.description) {
    lines.push("");
    lines.push(input.description.slice(0, 600));
  }
  if (input.endorsement) {
    lines.push("");
    lines.push(`Palabras del equipo:`);
    lines.push(`"${input.endorsement.slice(0, 400)}"`);
  }
  lines.push("");
  lines.push(`Resumen completo aquí: ${input.publicUrl}`);
  if (input.tags && input.tags.length > 0) {
    lines.push("");
    lines.push(input.tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" "));
  }
  lines.push("");
  lines.push("#prácticas #aprendizaje #Menta");

  return lines.join("\n");
}

export function linkedInShareUrl(publicUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
}
