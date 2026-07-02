import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isSuperAdmin } from "@/lib/superadmin";
import { AdminOrgsTable } from "./orgs-table";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrgRow {
  id: string;
  name: string;
  email: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  plan_id: string | null;
  created_at: string;
  student_count: number;
  owner_name: string | null;
  owner_email: string | null;
}

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Doble check: no autenticado o no super admin → 404 (no revelamos que existe).
  if (!user || !isSuperAdmin(user.email)) {
    notFound();
  }

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
        <p className="text-sm text-destructive">
          SUPABASE_SERVICE_ROLE_KEY no configurada. El panel de admin necesita
          service role para saltarse RLS.
        </p>
      </div>
    );
  }
  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, email, subscription_status, trial_ends_at, plan_id, created_at")
    .order("created_at", { ascending: false });

  const orgIds = (orgs ?? []).map((o) => o.id);

  // Contar alumnos por org.
  const [{ data: studentCounts }, { data: owners }] = await Promise.all([
    admin
      .from("students")
      .select("organization_id")
      .in("organization_id", orgIds.length > 0 ? orgIds : ["00000000-0000-0000-0000-000000000000"]),
    admin
      .from("profiles")
      .select("organization_id, full_name, email, role")
      .in(
        "organization_id",
        orgIds.length > 0 ? orgIds : ["00000000-0000-0000-0000-000000000000"],
      )
      .in("role", ["owner", "admin"]),
  ]);

  const studentsPerOrg = new Map<string, number>();
  for (const s of studentCounts ?? []) {
    studentsPerOrg.set(s.organization_id, (studentsPerOrg.get(s.organization_id) ?? 0) + 1);
  }

  const ownerPerOrg = new Map<string, { full_name: string | null; email: string | null }>();
  for (const p of owners ?? []) {
    // Preferimos el owner sobre admin.
    if (!ownerPerOrg.has(p.organization_id) || p.role === "owner") {
      ownerPerOrg.set(p.organization_id, { full_name: p.full_name, email: p.email });
    }
  }

  const rows: OrgRow[] = (orgs ?? []).map((o) => ({
    id: o.id,
    name: o.name,
    email: o.email ?? null,
    subscription_status: o.subscription_status ?? null,
    trial_ends_at: o.trial_ends_at ?? null,
    plan_id: o.plan_id ?? null,
    created_at: o.created_at,
    student_count: studentsPerOrg.get(o.id) ?? 0,
    owner_name: ownerPerOrg.get(o.id)?.full_name ?? null,
    owner_email: ownerPerOrg.get(o.id)?.email ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-100">
          <ShieldCheck className="h-5 w-5 text-mint-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super admin</h1>
          <p className="text-muted-foreground">
            Gestión interna de organizaciones. Solo visible para usuarios en la
            whitelist.
          </p>
        </div>
      </div>

      <AdminOrgsTable rows={rows} />
    </div>
  );
}
