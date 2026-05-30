import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  pickLocaleFromAcceptLanguage,
  type SupportedLocale,
} from "./config";

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const headerStore = headers();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as
    | SupportedLocale
    | undefined;

  let locale: SupportedLocale;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    locale = pickLocaleFromAcceptLanguage(headerStore.get("accept-language"));
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return {
    locale,
    messages,
    timeZone: "Europe/Madrid",
    now: new Date(),
  };
});
