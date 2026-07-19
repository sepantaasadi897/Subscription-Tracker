import type { Subscription } from "./types";

const HEADERS = [
  "Name",
  "Category",
  "Price",
  "Currency",
  "Billing Cycle",
  "Start Date",
  "Next Payment Date",
  "Reminder Days",
  "Status",
  "Notes",
] as const;

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportSubscriptionsToCsv(subscriptions: Subscription[]) {
  const rows = subscriptions.map((s) =>
    [
      s.name,
      s.category,
      String(s.price),
      s.currency,
      s.billing_cycle,
      s.start_date,
      s.next_payment_date,
      String(s.reminder_days),
      s.status,
      s.notes ?? "",
    ].map(escapeCsvField)
  );

  const csv = [HEADERS.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
