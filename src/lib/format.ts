export function formatCurrency(amount: number | null): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(rate: number | null): string | null {
  if (rate === null) return null;
  return `${rate}%`;
}

/** Joins a list into "A, B, and C" prose (Oxford comma). */
export function joinWithAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
