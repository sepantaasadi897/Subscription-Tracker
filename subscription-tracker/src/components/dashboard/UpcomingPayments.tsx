import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { relativeDueLabel, daysUntil } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/types";
import type { Subscription } from "@/lib/types";

export function UpcomingPayments({ subscriptions }: { subscriptions: Subscription[] }) {
  const upcoming = subscriptions
    .filter((s) => s.status === "active")
    .sort((a, b) => a.next_payment_date.localeCompare(b.next_payment_date))
    .slice(0, 6);

  return (
    <Card className="p-5">
      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="font-display text-base font-semibold text-ink">Upcoming charges</h3>
        <Link href="/subscriptions" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={20} />}
          title="Nothing scheduled"
          description="Add a subscription to start seeing upcoming charges here."
        />
      ) : (
        <ul className="ledger-rail space-y-5 pl-5">
          {upcoming.map((sub) => {
            const days = daysUntil(sub.next_payment_date);
            const dotColor = days <= 2 ? "border-coral" : days <= 7 ? "border-amber" : "border-primary";
            return (
              <li key={sub.id} className="relative flex items-center justify-between gap-3">
                <span className={`absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full border-2 ${dotColor} bg-bg`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{sub.name}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge tone="muted">{CATEGORY_META[sub.category].label}</Badge>
                    <span className="text-xs text-muted">{relativeDueLabel(sub.next_payment_date)}</span>
                  </div>
                </div>
                <span className="tabular shrink-0 font-mono text-sm text-ink">
                  {formatCurrency(sub.price, sub.currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
