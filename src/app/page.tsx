import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { MentorSection } from "@/components/landing/mentor-section";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Audience } from "@/components/landing/audience";
import { TalentSection } from "@/components/landing/talent-section";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <MentorSection />
        <Features />
        <HowItWorks />
        <Audience />
        <TalentSection />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
