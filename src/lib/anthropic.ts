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
