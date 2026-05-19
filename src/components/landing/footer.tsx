import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Logo size={36} />
              <span className="text-xl font-bold">Menta</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Gestión integral de prácticas en empresa.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Un producto de Gobe Soluciones.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Producto</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#caracteristicas" className="hover:text-foreground">Características</Link></li>
              <li><Link href="/precios" className="hover:text-foreground">Precios</Link></li>
              <li><Link href="/#como-funciona" className="hover:text-foreground">Cómo funciona</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/aviso-legal" className="hover:text-foreground">Aviso legal</Link></li>
              <li><Link href="/privacidad" className="hover:text-foreground">Privacidad</Link></li>
              <li><Link href="/cookies" className="hover:text-foreground">Cookies</Link></li>
              <li><Link href="/condiciones" className="hover:text-foreground">Condiciones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Contacto</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:hola@menta.app" className="hover:text-foreground">hola@menta.app</a></li>
              <li>
                <a href="https://gobesoluciones.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
                  gobesoluciones.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Menta by Gobe Soluciones. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
