"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/Card";
import { toMonthly } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type { Subscription } from "@/lib/types";

/**
 * Approximates historical monthly spend by checking, for each of the last
 * 6 months, which subscriptions had already started (start_date) and were
 * not cancelled. This is a reasonable estimate since we don't store a full
 * billing-event ledger — cancelled subscriptions are excluded throughout,
 * which slightly understates past months where they were still active.
 */
function buildMonthlySeries(subscriptions: Subscription[]) {
  const months: { label: string; total: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const total = subscriptions
      .filter((s) => s.status !== "cancelled" && new Date(s.start_date) <= monthEnd)
      .reduce((acc, s) => acc + toMonthly(s.price, s.billing_cycle), 0);

    months.push({
      label: monthDate.toLocaleDateString("en-US", { month: "short" }),
      total: Math.round(total * 100) / 100,
    });
  }
  return months;
}

export function MonthlyTrendChart({ subscriptions }: { subscriptions: Subscription[] }) {
  const currency = subscriptions[0]?.currency ?? "USD";
  const data = buildMonthlySeries(subscriptions);

  return (
    <Card className="p-5">
      <h3 className="mb-1 font-display text-base font-semibold text-ink">Monthly spend trend</h3>
      <p className="mb-4 text-xs text-muted">Last 6 months, monthly-equivalent cost</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8 }}>
            <CartesianGrid vertical={false} stroke="rgb(var(--border))" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
              tickFormatter={(v) => formatCurrency(v, currency).replace(/\.00$/, "")}
              width={64}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value, currency)}
              cursor={{ fill: "rgb(var(--surface2))" }}
              contentStyle={{
                background: "rgb(var(--surface))",
                border: "1px solid rgb(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Bar dataKey="total" fill="rgb(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
