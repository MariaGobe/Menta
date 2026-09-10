import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/superadmin";
import { MembersManager } from "./members-manager";

export const dynamic = "force-dynamic";

export default async function AdminOrgMembersPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.email)) notFound();

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) notFound();

  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [{ data: org }, { data: members }, { data: authUsers }] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, email")
      .eq("id", params.orgId)
      .single(),
    admin
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .eq("organization_id", params.orgId)
      .order("role", { ascending: false })
      .order("created_at", { ascending: true }),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  if (!org) notFound();

  const t = await getTranslations("AdminMembers");

  // Enriquecer con last_sign_in_at si podemos
  const authMap = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, u.last_sign_in_at]),
  );
  const enriched = (members ?? []).map((m) => ({
    ...m,
    last_sign_in_at: authMap.get(m.id) ?? null,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-100">
          <ShieldCheck className="h-5 w-5 text-mint-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{org.name}</span>
            {org.email && <span> · {org.email}</span>}
          </p>
        </div>
      </div>

      <MembersManager
        orgId={params.orgId}
        orgName={org.name}
        currentUserId={user.id}
        members={enriched}
      />
    </div>
  );
}
