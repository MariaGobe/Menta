/** Configuración compartida cliente/servidor para i18n. */
export const SUPPORTED_LOCALES = ["es", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "es";

/** Detecta locale a partir de header Accept-Language. */
export function pickLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const langs = acceptLanguage
    .split(",")
    .map((l) => l.trim().split(";")[0].toLowerCase());
  for (const lang of langs) {
    if (lang.startsWith("es")) return "es";
    if (lang.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}
