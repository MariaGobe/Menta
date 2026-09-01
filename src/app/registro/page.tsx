import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RegistroClosed");
  return { title: t("title") };
}

export default async function RegistroPage() {
  const t = await getTranslations("RegistroClosed");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-mint-soft p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Logo size={40} />
        <span className="text-2xl font-bold">Menta</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-mint-100 text-mint-700">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" asChild>
            <Link href="/solicitar-acceso">{t("request_button")}</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">{t("already_have_account")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
