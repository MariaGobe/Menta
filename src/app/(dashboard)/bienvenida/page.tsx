import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function BienvenidaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id || profile.role === "student") {
    redirect("/dashboard");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, nif, address, city, postal_code, onboarded_at")
    .eq("id", profile.organization_id)
    .single();

  // Si ya hizo el onboarding, no volvemos a mostrarlo.
  if (org?.onboarded_at) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizard
      initial={{
        name: org?.name ?? "",
        nif: org?.nif ?? null,
        address: org?.address ?? null,
        city: org?.city ?? null,
        postal_code: org?.postal_code ?? null,
      }}
    />
  );
}
