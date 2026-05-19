"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      options: {
        data: { company_name: companyName, full_name: fullName },
      },
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
            Empieza tu prueba <span className="text-gradient-mint">gratis 1 mes</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Crea tu cuenta en menos de 1 minuto. Sin tarjeta de crédito.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              Acceso total a todas las funcionalidades durante 30 días
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              Da de alta tantos alumnos como necesites en la prueba
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              Si decides continuar: 490€/año (hasta 2 alumnos) + IVA
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              Sin permanencia ni penalizaciones
            </li>
          </ul>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Crea tu cuenta</CardTitle>
            <CardDescription>Empieza tu prueba gratuita de 1 mes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Nombre de la empresa</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Tu nombre completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Crear cuenta gratuita
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Al registrarte aceptas nuestras{" "}
                <Link href="/condiciones" className="underline">condiciones</Link> y la{" "}
                <Link href="/privacidad" className="underline">política de privacidad</Link>.
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
