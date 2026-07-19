import { Wallet, CalendarClock, Layers, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";
import { sumMonthly, sumYearly } from "@/lib/utils";
import type { Subscription } from "@/lib/types";

export function StatsCards({ subscriptions }: { subscriptions: Subscription[] }) {
  const active = subscriptions.filter((s) => s.status === "active");
  const monthly = sumMonthly(subscriptions);
  const yearly = sumYearly(subscriptions);
  const upcoming7d = active.filter((s) => {
    const days = (new Date(s.next_payment_date).getTime() - Date.now()) / 86_400_000;
    return days >= 0 && days <= 7;
  }).length;

  const stats = [
    {
      label: "Monthly cost",
      value: formatCurrency(monthly, active[0]?.currency ?? "USD"),
      icon: Wallet,
      tone: "text-primary bg-primary/12",
    },
    {
      label: "Yearly estimate",
      value: formatCurrency(yearly, active[0]?.currency ?? "USD"),
      icon: TrendingUp,
      tone: "text-mint bg-mint/12",
    },
    {
      label: "Active subscriptions",
      value: String(active.length),
      icon: Layers,
      tone: "text-amber bg-amber/15",
    },
    {
      label: "Due within 7 days",
      value: String(upcoming7d),
      icon: CalendarClock,
      tone: "text-coral bg-coral/12",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label} className="p-5">
          <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
            <Icon size={17} />
          </div>
          <p className="tabular font-display text-2xl font-semibold text-ink">{value}</p>
          <p className="mt-0.5 text-xs text-muted">{label}</p>
        </Card>
      ))}
    </div>
  );
}
