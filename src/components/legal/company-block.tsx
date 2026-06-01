import { getTranslations } from "next-intl/server";
import { GOBE_INFO } from "./legal-layout";

export async function CompanyBlock() {
  const t = await getTranslations("Legal");
  return (
    <aside className="rounded-2xl border bg-mint-50/40 p-5 text-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-mint-800">
        {t("company_block_title")}
      </h3>
      <dl className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr]">
        <dt className="text-muted-foreground">{t("company_name_label")}</dt>
        <dd className="font-medium">{GOBE_INFO.name}</dd>
        <dt className="text-muted-foreground">{t("company_cif_label")}</dt>
        <dd className="font-medium">{GOBE_INFO.cif}</dd>
        <dt className="text-muted-foreground">{t("company_address_label")}</dt>
        <dd>{GOBE_INFO.address}</dd>
        <dt className="text-muted-foreground">{t("company_email_label")}</dt>
        <dd>
          <a className="text-primary hover:underline" href={`mailto:${GOBE_INFO.email}`}>
            {GOBE_INFO.email}
          </a>
        </dd>
        <dt className="text-muted-foreground">{t("company_product_label")}</dt>
        <dd>
          <a className="text-primary hover:underline" href={`mailto:${GOBE_INFO.productEmail}`}>
            {GOBE_INFO.productEmail}
          </a>
        </dd>
      </dl>
    </aside>
  );
}
