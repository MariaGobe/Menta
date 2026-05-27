"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  ClipboardCheck,
  TrendingUp,
  FileSpreadsheet,
  CreditCard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const items = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/alumnos", icon: Users, label: "Alumnos" },
  { href: "/planes", icon: ClipboardList, label: "Planes" },
  { href: "/calendario", icon: Calendar, label: "Calendario" },
  { href: "/seguimiento", icon: ClipboardCheck, label: "Seguimiento" },
  { href: "/evaluacion", icon: TrendingUp, label: "Evaluación" },
  { href: "/informes", icon: FileSpreadsheet, label: "Informes" },
  { href: "/documentos", icon: FileText, label: "Documentos" },
  { href: "/facturacion", icon: CreditCard, label: "Facturación" },
  { href: "/configuracion", icon: Settings, label: "Configuración" },
];

export function Sidebar() {
  const pathname = usePathname();

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

      <div className="border-t p-4">
        <Link
          href="/precios"
          className="block rounded-lg bg-mint-50 p-3 text-xs"
        >
          <p className="font-semibold text-mint-800">Estás en período de prueba</p>
          <p className="mt-1 text-mint-700">Activa tu suscripción cuando quieras.</p>
        </Link>
      </div>
    </aside>
  );
}
