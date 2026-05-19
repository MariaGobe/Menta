import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="text-xl font-bold tracking-tight">Menta</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/#caracteristicas" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Características
          </Link>
          <Link href="/#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href="/precios" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Precios
          </Link>
          <Link href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/registro">Prueba gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
