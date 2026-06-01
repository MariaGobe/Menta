import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalLayout, LegalSection, LAST_UPDATED } from "@/components/legal/legal-layout";
import { CompanyBlock } from "@/components/legal/company-block";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms");
  return { title: `${t("title")} · Menta` };
}

export default async function CondicionesPage() {
  const t = await getTranslations("Terms");
  return (
    <LegalLayout title={t("title")} lastUpdated={LAST_UPDATED}>
      <p>{t("intro")}</p>
      <CompanyBlock />

      <LegalSection title={t("s_object_title")}>
        <p>{t("s_object_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_account_title")}>
        <p>{t("s_account_p1")}</p>
        <p>{t("s_account_p2")}</p>
        <p>{t("s_account_p3")}</p>
      </LegalSection>

      <LegalSection title={t("s_subscription_title")}>
        <p>{t("s_subscription_p1")}</p>
        <p>{t("s_subscription_p2")}</p>
        <p>{t("s_subscription_p3")}</p>
        <p>{t("s_subscription_p4")}</p>
      </LegalSection>

      <LegalSection title={t("s_challenges_title")}>
        <p>{t("s_challenges_p1")}</p>
        <p>{t("s_challenges_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_use_title")}>
        <p>{t("s_use_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_data_title")}>
        <p>{t("s_data_p1")}</p>
        <p>{t("s_data_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_ip_title")}>
        <p>{t("s_ip_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_warranty_title")}>
        <p>{t("s_warranty_p1")}</p>
        <p>{t("s_warranty_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_changes_title")}>
        <p>{t("s_changes_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_law_title")}>
        <p>{t("s_law_p1")}</p>
      </LegalSection>
    </LegalLayout>
  );
}
