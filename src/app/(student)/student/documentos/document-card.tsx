"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, FileText, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface Props {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  storage_path: string;
  uploaded_at: string;
  studentSpecific: boolean;
}

export function StudentDocumentCard(p: Props) {
  const supabase = createClient();
  const t = useTranslations("StudentDocuments");
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(p.storage_path, 60);
    setLoading(false);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else if (error) {
      alert(error.message);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-accent/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-100 text-mint-700">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("uploaded_at", { date: formatDate(p.uploaded_at) })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{p.typeLabel}</Badge>
        <Badge variant={p.studentSpecific ? "success" : "info"} className="gap-1">
          <User className="h-3 w-3" />
          {p.studentSpecific ? t("shared_with_you") : t("shared_general")}
        </Badge>
        <Button size="sm" variant="outline" onClick={download} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t("download")}
        </Button>
      </div>
    </div>
  );
}
