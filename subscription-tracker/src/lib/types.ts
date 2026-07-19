export type BillingCycle = "weekly" | "monthly" | "yearly";

export type SubscriptionCategory =
  | "entertainment"
  | "internet"
  | "insurance"
  | "fitness"
  | "software"
  | "other";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  category: SubscriptionCategory;
  price: number;
  currency: string;
  billing_cycle: BillingCycle;
  start_date: string; // ISO date
  next_payment_date: string; // ISO date
  reminder_days: number;
  notes: string | null;
  logo_url: string | null;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export type SubscriptionInput = Omit<
  Subscription,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface NotificationRow {
  id: string;
  user_id: string;
  subscription_id: string;
  type: "renewal_reminder" | "payment_due" | "trial_ending";
  message: string;
  scheduled_for: string;
  sent_at: string | null;
  read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  default_currency: string;
  theme_preference: "light" | "dark" | "system";
  created_at: string;
}

export const CATEGORY_META: Record<
  SubscriptionCategory,
  { label: string; color: string }
> = {
  entertainment: { label: "Entertainment", color: "#5B8DEF" },
  internet: { label: "Internet", color: "#4ECB8F" },
  insurance: { label: "Insurance", color: "#F2B84B" },
  fitness: { label: "Fitness", color: "#E5637A" },
  software: { label: "Software", color: "#9B7BE8" },
  other: { label: "Other", color: "#8B93A1" },
};

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY"] as const;
