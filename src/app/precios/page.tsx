import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Precios · Menta",
  description: "Prueba gratuita de 1 mes. Después 490€/año hasta 2 alumnos + 39€/año por cada alumno extra. IVA no incluido.",
};

export default function PreciosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
