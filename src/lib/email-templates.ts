/**
 * Plantillas HTML de email branded.
 * Todas devuelven { subject, html } listo para pasar a sendEmail().
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f9f9f9;
  margin: 0;
  padding: 40px 20px;
`;
const cardStyles = `
  max-width: 560px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  margin: 0 auto;
`;
const buttonStyles = `
  background: #62A691;
  color: white;
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  display: inline-block;
`;
const logoStyles = `
  display: inline-block;
  background: #62A691;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  line-height: 48px;
  font-weight: bold;
  font-size: 22px;
  text-align: center;
`;

function shell(inner: string): string {
  return `<!DOCTYPE html>
<html><body style="${baseStyles}">
<table cellpadding="0" cellspacing="0" border="0" align="center" style="${cardStyles}">
  <tr><td>
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="${logoStyles}">M</div>
    </div>
    ${inner}
    <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
    <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
      Menta · gestión integral de prácticas en empresa
    </p>
  </td></tr>
</table>
</body></html>`;
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 1. Alumno sube entregable → email al tutor de empresa                    */
/* ──────────────────────────────────────────────────────────────────────── */
export function deliverableSubmittedEmail(p: {
  tutorName: string | null;
  studentName: string;
  deliverableTitle: string;
  taskTitle?: string | null;
  studentDetailUrl: string;
}) {
  const greet = p.tutorName ? `Hola ${p.tutorName.split(" ")[0]},` : "Hola,";
  return {
    subject: `${p.studentName} ha entregado: ${p.deliverableTitle}`,
    html: shell(`
      <h1 style="color: #1a1a1a; font-size: 22px; margin: 0 0 16px;">Nuevo entregable</h1>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">${greet}</p>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        <strong>${p.studentName}</strong> acaba de subir un nuevo entregable:
      </p>
      <div style="background: #f5f7f7; border-left: 3px solid #62A691; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${p.deliverableTitle}</p>
        ${p.taskTitle ? `<p style="margin: 4px 0 0; font-size: 13px; color: #888;">Tarea: ${p.taskTitle}</p>` : ""}
      </div>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        Revísalo y déjale tu feedback cuanto antes.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${p.studentDetailUrl}" style="${buttonStyles}">Ver en Menta</a>
      </div>
    `),
  };
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 2. Empresa revisa entregable → email al alumno                           */
/* ──────────────────────────────────────────────────────────────────────── */
export function deliverableReviewedEmail(p: {
  studentName: string;
  deliverableTitle: string;
  feedback: string | null;
  reviewerName: string | null;
}) {
  return {
    subject: `Tu entregable "${p.deliverableTitle}" ha sido revisado`,
    html: shell(`
      <h1 style="color: #1a1a1a; font-size: 22px; margin: 0 0 16px;">Tu entregable está revisado</h1>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        Hola ${p.studentName.split(" ")[0]},
      </p>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        ${p.reviewerName ? `<strong>${p.reviewerName}</strong>` : "Tu tutor"} ha revisado tu entregable
        <strong>"${p.deliverableTitle}"</strong>.
      </p>
      ${
        p.feedback
          ? `
        <div style="background: #f5f7f7; border-left: 3px solid #62A691; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Feedback</p>
          <p style="margin: 0; color: #1a1a1a; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(p.feedback)}</p>
        </div>
      `
          : ""
      }
      <div style="text-align: center; margin: 32px 0;">
        <a href="${APP_URL}/student/entregables" style="${buttonStyles}">Ver entregable</a>
      </div>
    `),
  };
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 3. Aplicación a reto → email al aplicante (confirmación)                 */
/* ──────────────────────────────────────────────────────────────────────── */
export function challengeApplicationConfirmationEmail(p: {
  applicantName: string;
  challengeTitle: string;
  companyName: string;
  workspaceUrl: string;
}) {
  return {
    subject: `Recibida tu solicitud al reto: ${p.challengeTitle}`,
    html: shell(`
      <h1 style="color: #1a1a1a; font-size: 22px; margin: 0 0 16px;">¡Solicitud recibida!</h1>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        Hola ${p.applicantName.split(" ")[0]},
      </p>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        Hemos recibido tu solicitud al reto <strong>"${p.challengeTitle}"</strong>
        de <strong>${p.companyName}</strong>.
      </p>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        Desde tu espacio personal puedes seguir el estado de tu candidatura y subir tu solución cuando estés preparado.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${p.workspaceUrl}" style="${buttonStyles}">Ir a mi espacio</a>
      </div>
      <p style="color: #888; font-size: 13px; line-height: 1.6;">
        Guarda este email: contiene el enlace privado a tu candidatura.
      </p>
    `),
  };
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 4. Aplicación a reto → email a la empresa (nueva candidatura)            */
/* ──────────────────────────────────────────────────────────────────────── */
export function challengeApplicationCompanyEmail(p: {
  challengeTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantLinkedin: string | null;
  companyChallengesUrl: string;
}) {
  return {
    subject: `Nueva candidatura a ${p.challengeTitle}`,
    html: shell(`
      <h1 style="color: #1a1a1a; font-size: 22px; margin: 0 0 16px;">Nueva candidatura</h1>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        Acabáis de recibir una solicitud para vuestro reto <strong>"${p.challengeTitle}"</strong>.
      </p>
      <div style="background: #f5f7f7; border-left: 3px solid #62A691; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${p.applicantName}</p>
        <p style="margin: 4px 0 0; font-size: 14px; color: #555;">${p.applicantEmail}</p>
        ${p.applicantLinkedin ? `<p style="margin: 4px 0 0; font-size: 14px;"><a href="${p.applicantLinkedin}" style="color: #62A691;">LinkedIn</a></p>` : ""}
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${p.companyChallengesUrl}" style="${buttonStyles}">Ver candidatura</a>
      </div>
    `),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
