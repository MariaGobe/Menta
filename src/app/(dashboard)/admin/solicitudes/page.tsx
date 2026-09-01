import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/superadmin";
import { formatDate } from "@/lib/utils";
import { StatusActions } from "./status-actions";

export const dynamic = "force-dynamic";

export default async function AccessRequestsAdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.email)) notFound();

  const t = await getTranslations("AccessRequestsAdmin");

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return (
      <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        SUPABASE_SERVICE_ROLE_KEY not configured.
      </p>
    );
  }
  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: rows } = await admin
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-100">
          <Inbox className="h-5 w-5 text-mint-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {!rows?.length ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">{t("no_requests")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r: any) => (
            <div key={r.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="font-semibold">{r.company_name}</h3>
                    {r.sector && (
                      <span className="text-xs text-muted-foreground">· {r.sector}</span>
                    )}
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">{r.contact_name}</span>
                    {r.contact_role && (
                      <span className="text-muted-foreground"> · {r.contact_role}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <a href={`mailto:${r.contact_email}`} className="hover:text-primary">
                      {r.contact_email}
                    </a>
                    {r.contact_phone && (
                      <>
                        {" · "}
                        <a href={`tel:${r.contact_phone}`} className="hover:text-primary">
                          {r.contact_phone}
                        </a>
                      </>
                    )}
                    {" · "}
                    {formatDate(r.created_at)}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    {r.practice_types && r.practice_types.length > 0 && (
                      <span className="rounded-full bg-mint-50 px-2 py-1 text-mint-800">
                        {t("types_prefix")} {r.practice_types.join(", ")}
                      </span>
                    )}
                    {r.estimated_students && (
                      <span className="rounded-full bg-muted px-2 py-1">
                        {t("students_count", { n: r.estimated_students })}
                      </span>
                    )}
                    {r.duration_months && (
                      <span className="rounded-full bg-muted px-2 py-1">
                        {t("duration_months", { n: r.duration_months })}
                      </span>
                    )}
                    {r.starts_when && (
                      <span className="rounded-full bg-muted px-2 py-1">
                        {r.starts_when}
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <p className="mt-2 whitespace-pre-wrap rounded bg-muted/30 p-2 text-sm">
                      {r.notes}
                    </p>
                  )}
                </div>
                <StatusActions id={r.id} status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
