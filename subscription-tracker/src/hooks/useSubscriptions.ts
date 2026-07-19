"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subscription, SubscriptionInput } from "@/lib/types";

export function useSubscriptions() {
  const supabase = createClient();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("next_payment_date", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setSubscriptions((data ?? []) as Subscription[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addSubscription(input: SubscriptionInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    setSubscriptions((prev) =>
      [...prev, data as Subscription].sort((a, b) =>
        a.next_payment_date.localeCompare(b.next_payment_date)
      )
    );
    return data as Subscription;
  }

  async function updateSubscription(id: string, input: Partial<SubscriptionInput>) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? (data as Subscription) : s))
    );
    return data as Subscription;
  }

  async function deleteSubscription(id: string) {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) throw error;
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  async function toggleStatus(id: string, current: Subscription["status"]) {
    const next = current === "active" ? "paused" : "active";
    return updateSubscription(id, { status: next });
  }

  return {
    subscriptions,
    loading,
    error,
    refresh,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleStatus,
  };
}
