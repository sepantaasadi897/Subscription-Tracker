"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  title: string;
  subtitle?: string;
  email?: string;
}

export function Navbar({ title, subtitle, email }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-bg px-4 md:px-8">
      <div>
        <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {email && (
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 sm:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {email.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[140px] truncate text-sm text-ink">{email}</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
