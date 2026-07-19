"use client";

import { useState, type FormEvent } from "react";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CATEGORY_META, CURRENCIES, type Subscription, type SubscriptionInput } from "@/lib/types";

interface SubscriptionFormProps {
  initial?: Subscription;
  onSubmit: (values: SubscriptionInput) => Promise<void>;
  onCancel: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function SubscriptionForm({ initial, onSubmit, onCancel }: SubscriptionFormProps) {
  const supabase = createClient();
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "entertainment");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [billingCycle, setBillingCycle] = useState(initial?.billing_cycle ?? "monthly");
  const [startDate, setStartDate] = useState(initial?.start_date ?? todayIso());
  const [nextPaymentDate, setNextPaymentDate] = useState(initial?.next_payment_date ?? todayIso());
  const [reminderDays, setReminderDays] = useState(String(initial?.reminder_days ?? 3));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogoUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("subscription-logos")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("subscription-logos").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Name is required.");
    const parsedPrice = parseFloat(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) return setError("Enter a valid price.");

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category: category as SubscriptionInput["category"],
        price: parsedPrice,
        currency,
        billing_cycle: billingCycle as SubscriptionInput["billing_cycle"],
        start_date: startDate,
        next_payment_date: nextPaymentDate,
        reminder_days: parseInt(reminderDays, 10) || 0,
        notes: notes.trim() || null,
        logo_url: logoUrl || null,
        status: initial?.status ?? "active",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-muted">
              {name ? name.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted hover:text-ink">
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? "Uploading…" : "Upload logo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoUpload(file);
            }}
          />
        </label>
      </div>

      <Input
        id="name"
        label="Name"
        placeholder="Netflix"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="category"
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {Object.entries(CATEGORY_META).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </Select>
        <Select
          id="billingCycle"
          label="Billing cycle"
          value={billingCycle}
          onChange={(e) => setBillingCycle(e.target.value)}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="price"
          label="Price"
          type="number"
          step="0.01"
          min="0"
          placeholder="15.49"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Select
          id="currency"
          label="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="startDate"
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          id="nextPaymentDate"
          label="Next payment"
          type="date"
          value={nextPaymentDate}
          onChange={(e) => setNextPaymentDate(e.target.value)}
          required
        />
      </div>

      <Input
        id="reminderDays"
        label="Remind me (days before)"
        type="number"
        min="0"
        value={reminderDays}
        onChange={(e) => setReminderDays(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-ink">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Shared family plan, cancel before renewal, etc."
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>

      {error && <p className="text-sm text-coral">{error}</p>}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add subscription"}
        </Button>
      </div>
    </form>
  );
}
