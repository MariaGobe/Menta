"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  Inbox,
  ClipboardCheck,
  TrendingUp,
  FileSpreadsheet,
  Trophy,
  CreditCard,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  isSuperAdmin?: boolean;
}

export function Sidebar({ isSuperAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("CompanySidebar");

  const items = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/alumnos", icon: Users, label: t("students") },
    { href: "/planes", icon: ClipboardList, label: t("plans") },
    { href: "/calendario", icon: Calendar, label: t("calendar") },
    { href: "/entregables", icon: Inbox, label: t("deliverables") },
    { href: "/seguimiento", icon: ClipboardCheck, label: t("tracking") },
    { href: "/evaluacion", icon: TrendingUp, label: t("evaluation") },
    { href: "/retos", icon: Trophy, label: t("challenges") },
    { href: "/informes", icon: FileSpreadsheet, label: t("reports") },
    { href: "/documentos", icon: FileText, label: t("documents") },
    { href: "/facturacion", icon: CreditCard, label: t("billing") },
    { href: "/configuracion", icon: Settings, label: t("settings") },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Logo size={36} />
        <span className="text-xl font-bold">Menta</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-mint-100 text-mint-800"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isSuperAdmin && (
        <div className="border-t p-4">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-amber-100 text-amber-900"
                : "text-amber-700 hover:bg-amber-50",
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Super admin
          </Link>
        </div>
      )}

      <div className="border-t p-4">
        <Link href="/precios" className="block rounded-lg bg-mint-50 p-3 text-xs">
          <p className="font-semibold text-mint-800">{t("trial_title")}</p>
          <p className="mt-1 text-mint-700">{t("trial_hint")}</p>
        </Link>
      </div>
    </aside>
  );
}
