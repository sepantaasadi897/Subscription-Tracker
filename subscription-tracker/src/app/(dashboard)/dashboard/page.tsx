"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function DashboardPage() {
  const { subscriptions, loading, addSubscription } = useSubscriptions();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading ? "Loading your subscriptions…" : `${subscriptions.length} total subscriptions tracked`}
        </p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add subscription
        </Button>
      </div>

      <StatsCards subscriptions={subscriptions} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <UpcomingPayments subscriptions={subscriptions} />
        </div>
        <div className="lg:col-span-3">
          <CategoryChart subscriptions={subscriptions} />
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add subscription">
        <SubscriptionForm
          onSubmit={async (values) => {
            await addSubscription(values);
            setAddOpen(false);
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </div>
  );
}
