import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { StudentSidebar } from "@/components/student/student-sidebar";
import { StudentTopbar } from "@/components/student/student-topbar";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
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
    .select("full_name, email, role, student_id, organizations(name)")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") redirect("/dashboard");

  const tLayout = await getTranslations("StudentLayout");
  let studentName = profile.full_name ?? profile.email ?? tLayout("student_fallback");
  if (profile.student_id) {
    const { data: student } = await supabase
      .from("students")
      .select("full_name")
      .eq("id", profile.student_id)
      .single();
    studentName = student?.full_name ?? studentName;
  }

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <StudentTopbar
          studentName={studentName}
          organizationName={
            (profile.organizations as { name?: string } | null)?.name ?? tLayout("company_fallback")
          }
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
