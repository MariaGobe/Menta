"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const supabase = createClient();
  const t = useTranslations("Recover");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/establecer-contrasena`
        : undefined;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-mint-soft p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Logo size={40} />
        <span className="text-2xl font-bold">Menta</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-md bg-mint-50 p-3 text-sm text-mint-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-700" />
                <div>
                  <p className="font-semibold">{t("sent_title")}</p>
                  <p className="mt-1">{t("sent_message")}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">{t("back_to_login")}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("submit")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="hover:text-foreground">
                  {t("back_to_login")}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
