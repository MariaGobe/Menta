"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Linkedin, Star, EyeOff, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import {
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from "@/types/database";

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_linkedin: string | null;
  share_with_company: boolean;
  status: ApplicationStatus;
  score: number | null;
  highlighted: boolean;
  submitted_at: string | null;
}

export function ApplicationRow({ application }: { application: Application }) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("ApplicationRow");
  const [highlighted, setHighlighted] = useState(application.highlighted);

  async function toggleHighlight() {
    const next = !highlighted;
    setHighlighted(next);
    await supabase
      .from("challenge_applications")
      .update({
        highlighted: next,
        status: next ? "shortlisted" : application.status,
        shortlisted_at: next ? new Date().toISOString() : null,
      })
      .eq("id", application.id);
    router.refresh();
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {application.share_with_company
              ? application.applicant_name
              : t("anonymous")}
          </p>
          {application.share_with_company ? (
            <Badge variant="success" className="gap-1 text-xs">
              <Eye className="h-3 w-3" /> {t("shares_data")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 text-xs">
              <EyeOff className="h-3 w-3" /> {t("private")}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {application.share_with_company && (
            <>
              {application.applicant_email}
              {application.applicant_linkedin && (
                <>
                  {" · "}
                  <a
                    href={application.applicant_linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Linkedin className="h-3 w-3" /> LinkedIn
                  </a>
                </>
              )}
              {" · "}
            </>
          )}
          {application.submitted_at
            ? t("delivered_on", { date: formatDate(application.submitted_at) })
            : t("no_delivery")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {APPLICATION_STATUS_LABELS[application.status]}
        </Badge>
        <Button
          variant={highlighted ? "default" : "outline"}
          size="sm"
          onClick={toggleHighlight}
          title={t("highlight_title")}
        >
          <Star className="h-3.5 w-3.5" />
          {highlighted ? t("highlighted") : t("highlight")}
        </Button>
      </div>
    </li>
  );
}
