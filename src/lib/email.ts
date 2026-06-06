/**
 * Cliente ligero de Resend (sin SDK).
 * Llama directamente a la REST API para evitar añadir una dependencia más.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // En desarrollo o si la key no está configurada, no fallamos: solo log.
    console.warn("[email] RESEND_API_KEY no configurada, email omitido", { to, subject });
    return { ok: false, skipped: true };
  }

  const from = process.env.EMAIL_FROM ?? "Menta <menta@gobesoluciones.com>";

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend respondió con error", res.status, body);
      return { ok: false, error: body };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] fallo enviando email", err);
    return { ok: false, error: String(err) };
  }
}
