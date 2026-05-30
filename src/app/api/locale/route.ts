import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { locale } = (await request.json().catch(() => ({}))) as {
    locale?: string;
  };
  if (!locale || !SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    return NextResponse.json({ error: "Locale no válido" }, { status: 400 });
  }
  cookies().set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 año
    sameSite: "lax",
  });
  return NextResponse.json({ ok: true, locale });
}
