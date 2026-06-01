import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalLayout, LegalSection, LAST_UPDATED } from "@/components/legal/legal-layout";
import { CompanyBlock } from "@/components/legal/company-block";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LegalNotice");
  return { title: `${t("title")} · Menta` };
}

export default async function AvisoLegalPage() {
  const t = await getTranslations("LegalNotice");
  return (
    <LegalLayout title={t("title")} lastUpdated={LAST_UPDATED}>
      <p>{t("intro")}</p>
      <CompanyBlock />

      <LegalSection title={t("s_object_title")}>
        <p>{t("s_object_p1")}</p>
        <p>{t("s_object_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_use_title")}>
        <p>{t("s_use_p1")}</p>
        <p>{t("s_use_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_ip_title")}>
        <p>{t("s_ip_p1")}</p>
        <p>{t("s_ip_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_liability_title")}>
        <p>{t("s_liability_p1")}</p>
        <p>{t("s_liability_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_links_title")}>
        <p>{t("s_links_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_law_title")}>
        <p>{t("s_law_p1")}</p>
      </LegalSection>
    </LegalLayout>
  );
}
