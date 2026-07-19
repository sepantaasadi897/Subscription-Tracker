"use client";

import { useState } from "react";
import { MoreVertical, Pause, Play, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/currency";
import { relativeDueLabel, formatDate } from "@/lib/utils";
import { CATEGORY_META, type Subscription } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggleStatus,
}: SubscriptionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = CATEGORY_META[subscription.category];
  const isPaused = subscription.status === "paused";

  return (
    <Card className={cn("relative p-5 transition-opacity", isPaused && "opacity-60")}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface2">
            {subscription.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={subscription.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-sm font-semibold"
                style={{ color: meta.color }}
              >
                {subscription.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{subscription.name}</p>
            <Badge tone="muted" className="mt-1">{meta.label}</Badge>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Subscription actions"
            className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-ink"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-border bg-surface shadow-popover">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface2"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onToggleStatus(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface2"
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  {isPaused ? "Activate" : "Pause"}
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-coral hover:bg-coral/10"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="tabular font-mono text-xl font-semibold text-ink">
            {formatCurrency(subscription.price, subscription.currency)}
          </p>
          <p className="text-xs capitalize text-muted">{subscription.billing_cycle}</p>
        </div>
        <div className="text-right">
          {isPaused ? (
            <Badge tone="muted">Paused</Badge>
          ) : (
            <Badge tone={relativeDueLabel(subscription.next_payment_date).includes("overdue") ? "coral" : "primary"}>
              {relativeDueLabel(subscription.next_payment_date)}
            </Badge>
          )}
          <p className="mt-1 text-xs text-muted">{formatDate(subscription.next_payment_date)}</p>
        </div>
      </div>

      {subscription.notes && (
        <p className="mt-3 truncate border-t border-border pt-3 text-xs text-muted">
          {subscription.notes}
        </p>
      )}
    </Card>
  );
}
