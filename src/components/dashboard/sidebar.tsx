"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  FileStack,
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  isSuperAdmin?: boolean;
}

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  badge?: string;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

export function Sidebar({ isSuperAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("CompanySidebar");

  const groups: NavGroup[] = [
    {
      items: [{ href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") }],
    },
    {
      label: t("group_people"),
      items: [
        { href: "/alumnos", icon: Users, label: t("students") },
        {
          href: "#",
          icon: UserCog,
          label: t("employees"),
          disabled: true,
          badge: t("coming_soon"),
        },
      ],
    },
    {
      label: t("group_management"),
      items: [
        { href: "/planes", icon: ClipboardList, label: t("plans") },
        { href: "/plantillas", icon: FileStack, label: t("templates") },
        { href: "/calendario", icon: Calendar, label: t("calendar") },
        { href: "/entregables", icon: Inbox, label: t("deliverables") },
        { href: "/seguimiento", icon: ClipboardCheck, label: t("tracking") },
        { href: "/evaluacion", icon: TrendingUp, label: t("evaluation") },
      ],
    },
    {
      label: t("group_content"),
      items: [
        { href: "/retos", icon: Trophy, label: t("challenges") },
        { href: "/informes", icon: FileSpreadsheet, label: t("reports") },
        { href: "/documentos", icon: FileText, label: t("documents") },
      ],
    },
    {
      label: t("group_settings"),
      items: [
        { href: "/facturacion", icon: CreditCard, label: t("billing") },
        { href: "/configuracion", icon: Settings, label: t("settings") },
      ],
    },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Logo size={36} />
        <span className="text-xl font-bold">Menta</span>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {groups.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {group.label && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active =
                !item.disabled &&
                (item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href));
              const content = (
                <>
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              );
              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60"
                  >
                    {content}
                  </div>
                );
              }
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
                  {content}
                </Link>
              );
            })}
          </div>
        ))}
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
