"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Your subscriptions at a glance" },
  "/subscriptions": { title: "Subscriptions", subtitle: "Manage every recurring payment" },
  "/analytics": { title: "Analytics", subtitle: "Where your money actually goes" },
  "/settings": { title: "Settings", subtitle: "Your profile and preferences" },
};

export function DashboardShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const meta = TITLES[pathname] ?? { title: "Ledger", subtitle: undefined };

  return (
    <>
      <Navbar title={meta.title} subtitle={meta.subtitle} email={email} />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6 md:px-8 md:pb-10">
        {children}
      </main>
    </>
  );
}
