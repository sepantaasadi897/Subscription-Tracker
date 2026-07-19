"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { CATEGORY_META, type Subscription, type SubscriptionCategory } from "@/lib/types";
import { toMonthly } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

export function CategoryChart({ subscriptions }: { subscriptions: Subscription[] }) {
  const active = subscriptions.filter((s) => s.status === "active");
  const currency = active[0]?.currency ?? "USD";

  const totals = active.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + toMonthly(s.price, s.billing_cycle);
    return acc;
  }, {} as Record<SubscriptionCategory, number>);

  const data = Object.entries(totals)
    .map(([category, value]) => ({
      category: category as SubscriptionCategory,
      name: CATEGORY_META[category as SubscriptionCategory].label,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_META[category as SubscriptionCategory].color,
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <Card className="flex h-72 items-center justify-center p-5 text-sm text-muted">
        Add subscriptions to see your category breakdown.
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="mb-1 font-display text-base font-semibold text-ink">Spend by category</h3>
      <p className="mb-4 text-xs text-muted">Monthly equivalent, active subscriptions only</p>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency)}
                contentStyle={{
                  background: "rgb(var(--surface))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2.5">
          {data.map((entry) => (
            <li key={entry.category} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="tabular font-mono text-muted">
                {formatCurrency(entry.value, currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
