const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currency = "USD"): string {
  const key = currency;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    });
    formatterCache.set(key, formatter);
  }
  try {
    return formatter.format(amount);
  } catch {
    // Fallback for unusual currency codes
    return `${amount.toFixed(2)} ${currency}`;
  }
}
