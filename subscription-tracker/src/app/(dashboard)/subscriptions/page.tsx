"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Download, Inbox } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORY_META, type Subscription } from "@/lib/types";
import { exportSubscriptionsToCsv } from "@/lib/export";

type SortKey = "next_payment_date" | "price" | "name";

export default function SubscriptionsPage() {
  const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription, toggleStatus } =
    useSubscriptions();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("next_payment_date");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);

  const filtered = useMemo(() => {
    let list = subscriptions.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    if (category !== "all") list = list.filter((s) => s.category === category);
    if (status !== "all") list = list.filter((s) => s.status === status);

    return [...list].sort((a, b) => {
      if (sortKey === "price") return b.price - a.price;
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return a.next_payment_date.localeCompare(b.next_payment_date);
    });
  }, [subscriptions, search, category, status, sortKey]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditing(sub);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search subscriptions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-auto">
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </Select>
        <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="w-auto">
          <option value="next_payment_date">Sort: Next payment</option>
          <option value="price">Sort: Price (high–low)</option>
          <option value="name">Sort: Name (A–Z)</option>
        </Select>
        <Button
          variant="secondary"
          size="md"
          onClick={() => exportSubscriptionsToCsv(filtered)}
          disabled={filtered.length === 0}
        >
          <Download size={16} /> Export
        </Button>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add subscription
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading subscriptions…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox size={20} />}
          title={subscriptions.length === 0 ? "No subscriptions yet" : "No matches"}
          description={
            subscriptions.length === 0
              ? "Add your first subscription to start tracking spend and renewals."
              : "Try a different search term or filter."
          }
          action={
            subscriptions.length === 0 ? (
              <Button size="sm" onClick={openAdd}>
                <Plus size={15} /> Add subscription
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={() => openEdit(sub)}
              onDelete={() => setDeleting(sub)}
              onToggleStatus={() => toggleStatus(sub.id, sub.status)}
            />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit subscription" : "Add subscription"}
      >
        <SubscriptionForm
          initial={editing ?? undefined}
          onSubmit={async (values) => {
            if (editing) {
              await updateSubscription(editing.id, values);
            } else {
              await addSubscription(values);
            }
            setFormOpen(false);
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete subscription"
        description={`This permanently removes ${deleting?.name ?? "this subscription"} and its reminders. This can't be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await deleteSubscription(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
