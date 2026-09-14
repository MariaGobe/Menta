/**
 * Cliente ligero de Anthropic (sin SDK).
 * Llama directamente a la REST API. Si no hay key configurada, devuelve null
 * y el caller debe gestionar el fallback (p. ej. respuesta heurística).
 */

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";

export interface CompleteParams {
  system: string;
  userMessage: string;
  maxTokens?: number;
  /** Conversación previa (turnos), excluyendo el último mensaje del usuario. */
  history?: { role: "user" | "assistant"; content: string }[];
  temperature?: number;
}

export interface CompleteResult {
  ok: true;
  text: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export type CompleteError = { ok: false; error: string; skipped?: boolean };

/**
 * Llama a Claude con un system prompt y un mensaje de usuario.
 * Devuelve { ok: true, text } o { ok: false, error }.
 */
/**
 * Extrae texto plano de un archivo binario (PDF, imagen escaneada) usando la
 * capacidad nativa de documentos de Claude. Devuelve el texto extraído tal cual
 * aparece en el archivo, sin resumir ni interpretar.
 */
export async function claudeExtractText(params: {
  base64: string;
  mediaType: string;
  filename: string;
}): Promise<CompleteResult | CompleteError> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY no configurada", skipped: true };
  }

  const model = DEFAULT_MODEL;
  const isPdf = params.mediaType === "application/pdf";
  const isImage = params.mediaType.startsWith("image/");

  if (!isPdf && !isImage) {
    return { ok: false, error: `mime no soportado: ${params.mediaType}` };
  }

  const content: unknown[] = [
    {
      type: "document",
      source: {
        type: "base64",
        media_type: params.mediaType,
        data: params.base64,
      },
    },
    {
      type: "text",
      text: `Extrae el TEXTO COMPLETO de este documento titulado "${params.filename}". Devuelve solo el texto tal como aparece en el documento, sin resumir, sin añadir comentarios ni encabezados propios. Preserva la estructura básica (párrafos, listas) usando saltos de línea. Si hay tablas, transcríbelas en formato markdown. No incluyas texto tuyo como "aquí está el texto" o "he extraído".`,
    },
  ];

  // Para imágenes usar type:image en vez de document.
  if (isImage) {
    (content[0] as { type: string }).type = "image";
  }

  try {
    const res = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8000,
        messages: [{ role: "user", content }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Anthropic ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as {
      content?: { type: string; text: string }[];
      usage?: { input_tokens: number; output_tokens: number };
    };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
    if (!text) return { ok: false, error: "Respuesta vacía" };
    return { ok: true, text, usage: data.usage };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function claudeComplete(
  params: CompleteParams,
): Promise<CompleteResult | CompleteError> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY no configurada", skipped: true };
  }

  const messages = [
    ...(params.history ?? []).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: params.userMessage },
  ];

  try {
    const res = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: params.maxTokens ?? 600,
        temperature: params.temperature ?? 0.7,
        system: params.system,
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[anthropic] HTTP", res.status, body);
      return { ok: false, error: `Anthropic ${res.status}` };
    }

    const data = (await res.json()) as {
      content?: { type: string; text: string }[];
      usage?: { input_tokens: number; output_tokens: number };
    };

    const text =
      data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
    if (!text) {
      return { ok: false, error: "Respuesta vacía" };
    }
    return { ok: true, text, usage: data.usage };
  } catch (err) {
    console.error("[anthropic] fallo", err);
    return { ok: false, error: String(err) };
  }
}
