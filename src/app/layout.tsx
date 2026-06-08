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
  title: {
    default: "Menta · Gestión integral de prácticas en empresa",
    template: "%s · Menta",
  },
  description:
    "Plataforma para gestionar prácticas formativas de alumnos de FP, universidad y formaciones internas. Documentación, seguimiento y evaluación en un solo sitio.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  alternates: {
    canonical: "/",
    languages: {
      es: "/",
      en: "/",
    },
  },
  keywords: [
    "prácticas en empresa",
    "gestión de prácticas",
    "FP",
    "formación profesional",
    "universidad",
    "tutor virtual",
    "evaluación prácticas",
    "memoria prácticas",
  ],
  authors: [{ name: "Gobe Soluciones y Consultoría, SL" }],
  creator: "Menta",
  publisher: "Gobe Soluciones",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Menta · Gestión integral de prácticas en empresa",
    description:
      "Plataforma para gestionar prácticas formativas de alumnos de FP, universidad y formaciones internas.",
    type: "website",
    locale: "es_ES",
    siteName: "Menta",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menta · Gestión integral de prácticas en empresa",
    description:
      "La plataforma todo-en-uno para gestionar prácticas formativas en tu empresa.",
  },
  // Next.js detecta automáticamente src/app/icon.svg y src/app/apple-icon.svg
  // No hace falta declararlos aquí.
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
