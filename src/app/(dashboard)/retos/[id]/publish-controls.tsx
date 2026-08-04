"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Globe,
  Linkedin,
  Loader2,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  buildChallengeLinkedInPost,
  buildChallengeResultsLinkedInPost,
  linkedInShareUrl,
} from "@/lib/challenges";

interface Props {
  challengeId: string;
  status: "draft" | "published" | "closed" | "archived";
  publicSlug: string | null;
}

export function PublishControls({ challengeId, status, publicSlug }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("PublishControls");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/challenges/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
    });
    const data = await res.json();

    if (data.requiresPayment) {
      const co = await fetch("/api/challenges/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      const checkoutData = await co.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
        return;
      }
      setError(checkoutData.error ?? t("error_create_payment"));
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? t("error_publish"));
      setLoading(false);
      return;
    }
    setLoading(false);
    router.refresh();
  }

  async function close() {
    if (!confirm(t("close_confirm"))) return;
    setLoading(true);
    await supabase
      .from("challenges")
      .update({ status: "closed" })
      .eq("id", challengeId);
    setLoading(false);
    router.refresh();
  }

  const publicUrl =
    publicSlug && typeof window !== "undefined"
      ? `${window.location.origin}/r/${publicSlug}`
      : null;

  if (status === "draft") {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button onClick={publish} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          {t("publish")}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  if (status === "published" && publicUrl) {
    return (
      <ShareBox
        challengeId={challengeId}
        publicUrl={publicUrl}
        mode="announce"
        onClose={close}
      />
    );
  }

  if (status === "closed" && publicUrl) {
    return <ShareBox challengeId={challengeId} publicUrl={publicUrl} mode="results" />;
  }

  return null;
}

function ShareBox({
  challengeId,
  publicUrl,
  mode,
  onClose,
}: {
  challengeId: string;
  publicUrl: string;
  mode: "announce" | "results";
  onClose?: () => void;
}) {
  const supabase = createClient();
  const t = useTranslations("PublishControls");
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState<string | null>(null);

  async function preparePost() {
    const { data: c } = await supabase
      .from("challenges")
      .select("title, short_description, start_date, end_date, tags, organizations(name)")
      .eq("id", challengeId)
      .single();
    const { count } = await supabase
      .from("challenge_applications")
      .select("*", { count: "exact", head: true })
      .eq("challenge_id", challengeId)
      .eq("highlighted", true);

    const companyName =
      (c?.organizations as { name?: string } | null)?.name ?? null;
    const text =
      mode === "announce"
        ? buildChallengeLinkedInPost({
            title: c?.title ?? "",
            shortDescription: c?.short_description ?? null,
            startDate: c?.start_date ?? "",
            endDate: c?.end_date ?? "",
            publicUrl,
            companyName,
            tags: c?.tags as string[] | null,
          })
        : buildChallengeResultsLinkedInPost({
            title: c?.title ?? "",
            publicUrl,
            companyName,
            highlightedCount: count ?? 0,
          });
    setPost(text);
  }

  async function copyPost() {
    if (!post) await preparePost();
    if (post) {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button variant="outline" onClick={copyPost}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? t("copied") : t("copy_linkedin")}
        </Button>
        <Button asChild>
          <a href={linkedInShareUrl(publicUrl)} target="_blank" rel="noreferrer">
            <Linkedin className="h-4 w-4" />
            {mode === "results" ? t("share_results") : t("share_linkedin")}
          </a>
        </Button>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            <XCircle className="h-4 w-4" /> {t("close_challenge")}
          </Button>
        )}
      </div>
      {post && (
        <pre className="max-h-64 max-w-md overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-xs">
          {post}
        </pre>
      )}
    </div>
  );
}
