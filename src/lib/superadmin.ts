/**
 * Gestión de super admins de Menta.
 *
 * Un super admin es un usuario cuyo email figura en la variable de entorno
 * `MENTA_SUPERADMIN_EMAILS` (lista separada por comas). Los super admins tienen
 * acceso al panel `/admin` para gestionar organizaciones (extender trials,
 * cambiar estados de suscripción, etc.). No modifica RLS: el panel opera
 * server-side con service role.
 *
 * Ejemplo de valor en Vercel:
 *   MENTA_SUPERADMIN_EMAILS=maria.gonzalez@gobesoluciones.com,info@gobesoluciones.com
 */

export function getSuperAdminEmails(): string[] {
  const raw = process.env.MENTA_SUPERADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.toLowerCase());
}
