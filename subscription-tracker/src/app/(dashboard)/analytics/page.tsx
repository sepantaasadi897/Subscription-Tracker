"use client";

import { useSubscriptions } from "@/hooks/useSubscriptions";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { TopSubscriptions } from "@/components/dashboard/TopSubscriptions";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";
import { sumMonthly, sumYearly } from "@/lib/utils";

export default function AnalyticsPage() {
  const { subscriptions, loading } = useSubscriptions();
  const active = subscriptions.filter((s) => s.status === "active");
  const currency = active[0]?.currency ?? "USD";

  if (loading) {
    return <p className="text-sm text-muted">Crunching your numbers…</p>;
  }

  if (subscriptions.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="font-display text-base font-semibold text-ink">Nothing to analyze yet</p>
        <p className="mt-1 text-sm text-muted">
          Add a few subscriptions and this page will fill in with trends and breakdowns.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs text-muted">Monthly total</p>
          <p className="tabular mt-1 font-display text-2xl font-semibold text-ink">
            {formatCurrency(sumMonthly(subscriptions), currency)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted">Yearly total</p>
          <p className="tabular mt-1 font-display text-2xl font-semibold text-ink">
            {formatCurrency(sumYearly(subscriptions), currency)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted">Active</p>
          <p className="tabular mt-1 font-display text-2xl font-semibold text-ink">{active.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted">Avg. cost / sub</p>
          <p className="tabular mt-1 font-display text-2xl font-semibold text-ink">
            {formatCurrency(active.length ? sumMonthly(subscriptions) / active.length : 0, currency)}
          </p>
        </Card>
      </div>

      <MonthlyTrendChart subscriptions={subscriptions} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryChart subscriptions={subscriptions} />
        <TopSubscriptions subscriptions={subscriptions} />
      </div>
    </div>
  );
}
