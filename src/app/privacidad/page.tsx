import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalLayout, LegalSection, LAST_UPDATED } from "@/components/legal/legal-layout";
import { CompanyBlock } from "@/components/legal/company-block";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Privacy");
  return { title: `${t("title")} · Menta` };
}

export default async function PrivacidadPage() {
  const t = await getTranslations("Privacy");
  return (
    <LegalLayout title={t("title")} lastUpdated={LAST_UPDATED}>
      <p>{t("intro")}</p>
      <CompanyBlock />

      <LegalSection title={t("s_responsable_title")}>
        <p>{t("s_responsable_text")}</p>
      </LegalSection>

      <LegalSection title={t("s_dpo_title")}>
        <p>{t("s_dpo_text")}</p>
      </LegalSection>

      <LegalSection title={t("s_data_title")}>
        <p>{t("s_data_p1")}</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>{t("s_data_b1")}</li>
          <li>{t("s_data_b2")}</li>
          <li>{t("s_data_b3")}</li>
          <li>{t("s_data_b4")}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("s_purpose_title")}>
        <ul className="ml-5 list-disc space-y-2">
          <li>{t("s_purpose_b1")}</li>
          <li>{t("s_purpose_b2")}</li>
          <li>{t("s_purpose_b3")}</li>
          <li>{t("s_purpose_b4")}</li>
          <li>{t("s_purpose_b5")}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("s_legal_title")}>
        <ul className="ml-5 list-disc space-y-2">
          <li>{t("s_legal_b1")}</li>
          <li>{t("s_legal_b2")}</li>
          <li>{t("s_legal_b3")}</li>
          <li>{t("s_legal_b4")}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("s_retention_title")}>
        <p>{t("s_retention_p1")}</p>
        <p>{t("s_retention_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_processors_title")}>
        <p>{t("s_processors_p1")}</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>{t("s_processors_b1")}</li>
          <li>{t("s_processors_b2")}</li>
          <li>{t("s_processors_b3")}</li>
          <li>{t("s_processors_b4")}</li>
          <li>{t("s_processors_b5")}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("s_ai_title")}>
        <p>{t("s_ai_p1")}</p>
        <p>{t("s_ai_p2")}</p>
        <p>{t("s_ai_p3")}</p>
      </LegalSection>

      <LegalSection title={t("s_transfers_title")}>
        <p>{t("s_transfers_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_rights_title")}>
        <p>{t("s_rights_p1")}</p>
        <p>{t("s_rights_p2")}</p>
      </LegalSection>

      <LegalSection title={t("s_minors_title")}>
        <p>{t("s_minors_p1")}</p>
      </LegalSection>

      <LegalSection title={t("s_security_title")}>
        <p>{t("s_security_p1")}</p>
      </LegalSection>
    </LegalLayout>
  );
}
