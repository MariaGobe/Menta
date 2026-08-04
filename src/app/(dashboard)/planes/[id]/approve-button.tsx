"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ApprovePlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("PlanApprove");
  const [loading, setLoading] = useState(false);

  async function approve() {
    if (!confirm(t("confirm"))) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("practice_plans")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user?.id ?? null,
      })
      .eq("id", planId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button onClick={approve} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      {t("button")}
    </Button>
  );
}
