import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function MentorSection() {
  const t = await getTranslations("Mentor");
  return (
    <section id="mentor" className="relative overflow-hidden bg-mint-50/40">
      <div className="container py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white px-3 py-1 text-xs font-medium text-mint-800">
              <Sparkles className="h-3.5 w-3.5" />
              {t("eyebrow")}
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              {t("title_a")} <span className="text-gradient-mint">{t("title_b")}</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>

            <ul className="mt-8 space-y-3">
              <Feature title={t("feature_setup_title")} description={t("feature_setup_desc")} />
              <Feature title={t("feature_chat_title")} description={t("feature_chat_desc")} />
              <Feature title={t("feature_summary_title")} description={t("feature_summary_desc")} />
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/registro">{t("cta_try")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/#caracteristicas">{t("cta_features")}</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-mint-200/40 to-mint-100/20 blur-2xl" />
            <div className="relative rounded-2xl border bg-card shadow-xl">
              <div className="flex items-center gap-2 border-b bg-mint-50/60 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-200 text-mint-800">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t("chat_name")}</p>
                  <p className="text-xs text-mint-700">{t("chat_status")}</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <ChatBubble role="assistant" text={t("chat_msg1")} />
                <ChatBubble role="user" text={t("chat_msg2")} />
                <ChatBubble role="assistant" text={t("chat_msg3")} />
                <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-center text-xs text-muted-foreground">
                  {t("chat_caption")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}

function ChatBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  return (
    <div className={role === "user" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          role === "user"
            ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
            : "max-w-[85%] rounded-2xl rounded-tl-sm border bg-white px-4 py-2 text-sm"
        }
      >
        {text}
      </div>
    </div>
  );
}
