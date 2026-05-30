import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export async function Navbar() {
  const tNav = await getTranslations("Navbar");
  const tCommon = await getTranslations("Common");
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="text-xl font-bold tracking-tight">Menta</span>
        </Link>

        <nav className="hidden gap-5 md:flex">
          <Link href="/#mentor" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {tNav("mentor")}
          </Link>
          <Link href="/#talento" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {tNav("talent")}
          </Link>
          <Link href="/#caracteristicas" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {tNav("features")}
          </Link>
          <Link href="/#precios" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {tNav("pricing")}
          </Link>
          <Link href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {tNav("faq")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{tCommon("log_in")}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/registro">{tCommon("sign_up")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
