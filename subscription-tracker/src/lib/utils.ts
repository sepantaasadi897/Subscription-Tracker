import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import type { BillingCycle, Subscription } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normalize any billing cycle price to a monthly equivalent. */
export function toMonthly(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly":
      return price * 4.345; // avg weeks/month
    case "yearly":
      return price / 12;
    case "monthly":
    default:
      return price;
  }
}

export function toYearly(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly":
      return price * 52;
    case "monthly":
      return price * 12;
    case "yearly":
    default:
      return price;
  }
}

export function daysUntil(dateIso: string): number {
  return differenceInCalendarDays(parseISO(dateIso), new Date());
}

export function formatDate(dateIso: string, pattern = "MMM d, yyyy"): string {
  return format(parseISO(dateIso), pattern);
}

export function relativeDueLabel(dateIso: string): string {
  const days = daysUntil(dateIso);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
}

export function sumMonthly(subs: Subscription[]): number {
  return subs
    .filter((s) => s.status === "active")
    .reduce((acc, s) => acc + toMonthly(s.price, s.billing_cycle), 0);
}

export function sumYearly(subs: Subscription[]): number {
  return subs
    .filter((s) => s.status === "active")
    .reduce((acc, s) => acc + toYearly(s.price, s.billing_cycle), 0);
}
