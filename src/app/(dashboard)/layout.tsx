import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { isSuperAdmin } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, organizations(name)")
    .eq("id", user.id)
    .single();

  // Defensa en profundidad: si un alumno llega hasta aquí (middleware falló,
  // cookie rara, cache, etc.) lo mandamos a su portal. Si no podemos leer el
  // profile por lo que sea, forzamos login para no dejar pasar por defecto.
  if (!profile) redirect("/login");
  if (profile.role === "student") redirect("/student/dashboard");

  const superAdmin = isSuperAdmin(user.email);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isSuperAdmin={superAdmin} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          organizationName={
            (profile?.organizations as { name?: string } | null)?.name ?? "Mi empresa"
          }
          userName={profile?.full_name ?? profile?.email ?? "Usuario"}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
