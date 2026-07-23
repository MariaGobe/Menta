"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Props {
  documentId: string;
  shared: boolean;
}

export function DocumentShareToggle({ documentId, shared }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("CompanyDocuments");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(shared);

  async function toggle() {
    setLoading(true);
    const next = !current;
    const { error } = await supabase
      .from("documents")
      .update({ share_with_student: next })
      .eq("id", documentId);
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setCurrent(next);
    router.refresh();
  }

  return (
    <Button size="sm" variant={current ? "secondary" : "outline"} onClick={toggle} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : current ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      {current ? t("unshare_toggle") : t("share_toggle")}
    </Button>
  );
}
