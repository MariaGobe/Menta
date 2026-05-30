"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("Register");
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { company_name: companyName, full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center gradient-mint-soft p-4">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="hidden lg:block">
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <Logo size={40} />
            <span className="text-2xl font-bold">Menta</span>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">
            {t("side_title_a")} <span className="text-gradient-mint">{t("side_title_b")}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("side_subtitle")}</p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              {t("side_b1")}
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              {t("side_b2")}
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              {t("side_b3")}
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              {t("side_b4")}
            </li>
          </ul>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">{t("company")}</Label>
                <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("full_name")}</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">{t("password_hint")}</p>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("submit")}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {t("agree")}{" "}
                <Link href="/condiciones" className="underline">{t("terms")}</Link> {t("and")}{" "}
                <Link href="/privacidad" className="underline">{t("privacy_policy")}</Link>.
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("already_account")}{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t("log_in")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
