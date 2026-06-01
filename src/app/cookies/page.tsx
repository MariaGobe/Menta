import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalLayout, LegalSection, LAST_UPDATED } from "@/components/legal/legal-layout";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cookies");
  return { title: `${t("title")} · Menta` };
}

export default async function CookiesPage() {
  const t = await getTranslations("Cookies");
  return (
    <LegalLayout title={t("title")} lastUpdated={LAST_UPDATED}>
      <p>{t("intro")}</p>

      <LegalSection title={t("s_what_title")}>
        <p>{t("s_what_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_types_title")}>
        <p>{t("s_types_p1")}</p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 font-medium">{t("s_table_cookie")}</th>
                <th className="px-3 py-2 font-medium">{t("s_table_purpose")}</th>
                <th className="px-3 py-2 font-medium">{t("s_table_duration")}</th>
                <th className="px-3 py-2 font-medium">{t("s_table_type")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-mono text-xs">sb-access-token</td>
                <td className="px-3 py-2">{t("c1_purpose")}</td>
                <td className="px-3 py-2">{t("c1_duration")}</td>
                <td className="px-3 py-2">{t("c1_type")}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">NEXT_LOCALE</td>
                <td className="px-3 py-2">{t("c2_purpose")}</td>
                <td className="px-3 py-2">{t("c2_duration")}</td>
                <td className="px-3 py-2">{t("c2_type")}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">__next-csrf</td>
                <td className="px-3 py-2">{t("c3_purpose")}</td>
                <td className="px-3 py-2">{t("c3_duration")}</td>
                <td className="px-3 py-2">{t("c3_type")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title={t("s_third_title")}>
        <p>{t("s_third_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_manage_title")}>
        <p>{t("s_manage_p1")}</p>
        <p>
          {t("s_manage_p2")}{" "}
          <a
            className="text-primary hover:underline"
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noreferrer"
          >
            Chrome
          </a>
          {", "}
          <a
            className="text-primary hover:underline"
            href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer"
            target="_blank"
            rel="noreferrer"
          >
            Firefox
          </a>
          {", "}
          <a
            className="text-primary hover:underline"
            href="https://support.apple.com/safari"
            target="_blank"
            rel="noreferrer"
          >
            Safari
          </a>
          {", "}
          <a
            className="text-primary hover:underline"
            href="https://support.microsoft.com/microsoft-edge"
            target="_blank"
            rel="noreferrer"
          >
            Edge
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title={t("s_changes_title")}>
        <p>{t("s_changes_p1")}</p>
      </LegalSection>
    </LegalLayout>
  );
}
