"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BookOpen,
  Sparkles,
  Upload,
  Presentation,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const items = [
  { href: "/student/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/student/mi-plan", icon: ClipboardList, label: "Mi plan" },
  { href: "/student/calendario", icon: Calendar, label: "Mi calendario" },
  { href: "/student/tareas", icon: ClipboardList, label: "Tareas de hoy" },
  { href: "/student/diario", icon: BookOpen, label: "Diario" },
  { href: "/student/mentor", icon: Sparkles, label: "Mentor virtual" },
  { href: "/student/entregables", icon: Upload, label: "Entregables" },
  { href: "/student/hitos", icon: Award, label: "Hitos / LinkedIn" },
  { href: "/student/presentacion", icon: Presentation, label: "Presentación" },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Logo size={36} />
        <span className="text-xl font-bold">Menta</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
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
        <div className="rounded-lg bg-mint-50 p-3 text-xs">
          <p className="font-semibold text-mint-800">Portal del alumno</p>
          <p className="mt-1 text-mint-700">
            Tu espacio personal de prácticas.
          </p>
        </div>
      </div>
    </aside>
  );
}
