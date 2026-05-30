import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Menta · Gestión integral de prácticas en empresa",
  description:
    "Plataforma para gestionar prácticas formativas de alumnos de FP, universidad y formaciones internas. Documentación, seguimiento y evaluación en un solo sitio.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Menta · Gestión integral de prácticas en empresa",
    description:
      "Plataforma para gestionar prácticas formativas de alumnos de FP, universidad y formaciones internas.",
    type: "website",
    locale: "es_ES",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className={inter.variable}>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
