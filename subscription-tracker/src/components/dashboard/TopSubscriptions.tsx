import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/currency";
import { toMonthly } from "@/lib/utils";
import { CATEGORY_META, type Subscription } from "@/lib/types";

export function TopSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  const ranked = [...subscriptions]
    .filter((s) => s.status === "active")
    .sort((a, b) => toMonthly(b.price, b.billing_cycle) - toMonthly(a.price, a.billing_cycle))
    .slice(0, 5);

  return (
    <Card className="p-5">
      <h3 className="mb-4 font-display text-base font-semibold text-ink">Most expensive</h3>
      {ranked.length === 0 ? (
        <p className="text-sm text-muted">No active subscriptions yet.</p>
      ) : (
        <ol className="space-y-4">
          {ranked.map((sub, i) => {
            const monthly = toMonthly(sub.price, sub.billing_cycle);
            const share = ranked[0] ? (monthly / toMonthly(ranked[0].price, ranked[0].billing_cycle)) * 100 : 0;
            return (
              <li key={sub.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <span className="font-mono text-xs text-muted">{i + 1}</span>
                    {sub.name}
                    <Badge tone="muted">{CATEGORY_META[sub.category].label}</Badge>
                  </span>
                  <span className="tabular font-mono text-ink">
                    {formatCurrency(monthly, sub.currency)}/mo
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(share, 6)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
