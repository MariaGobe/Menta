import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/logo";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Navbar");
  const tCommon = await getTranslations("Common");
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Logo size={36} />
              <span className="text-xl font-bold">Menta</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">{t("tagline")}</p>
            <p className="mt-3 text-xs text-muted-foreground">{t("by_gobe")}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{t("product")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#caracteristicas" className="hover:text-foreground">{tNav("features")}</Link></li>
              <li><Link href="/#precios" className="hover:text-foreground">{tNav("pricing")}</Link></li>
              <li><Link href="/#como-funciona" className="hover:text-foreground">{tCommon("how_it_works")}</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground">{tNav("faq")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{t("legal")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/aviso-legal" className="hover:text-foreground">{t("legal_notice")}</Link></li>
              <li><Link href="/privacidad" className="hover:text-foreground">{t("privacy")}</Link></li>
              <li><Link href="/cookies" className="hover:text-foreground">{t("cookies")}</Link></li>
              <li><Link href="/condiciones" className="hover:text-foreground">{t("terms")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{t("contact")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:menta@gobesoluciones.com" className="hover:text-foreground">menta@gobesoluciones.com</a></li>
              <li>
                <a href="https://gobesoluciones.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
                  gobesoluciones.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          {t("rights", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
