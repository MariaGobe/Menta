import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { formatDate } from "@/lib/utils";

interface Props {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="container max-w-3xl py-16 md:py-20">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDate(lastUpdated)}
          </p>
          <div className="prose prose-mint mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ title, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

export const GOBE_INFO = {
  name: "Gobe Soluciones y Consultoría, SL",
  cif: "B72509169",
  address: "Avenida de Burgos 26, 28036 Madrid",
  email: "info@gobesoluciones.com",
  privacyEmail: "info@gobesoluciones.com",
  productEmail: "menta@gobesoluciones.com",
  website: "https://gobesoluciones.com",
};

export const LAST_UPDATED = "2026-06-01";
