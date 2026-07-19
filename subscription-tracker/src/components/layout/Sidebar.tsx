"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, BarChart3, Settings, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Subscriptions", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
          <Receipt size={14} />
        </div>
        <span className="font-display text-base font-semibold text-ink">Ledger</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted hover:bg-surface2 hover:text-ink"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4 text-xs text-muted">
        Every charge, accounted for.
      </div>
    </aside>
  );
}
