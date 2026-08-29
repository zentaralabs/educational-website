export function formatCurrency(
  amount: number | null,
  currency: string = "USD",
): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Australian universities don't publish official acceptance rates, and the
 * institution-wide third-party estimates we hold are too noisy to show as a
 * precise percentage. We map them to a qualitative selectivity band instead,
 * which is defensible where a bare "70%" is not. */
export function formatSelectivity(rate: number | null | string): string | null {
  const n = typeof rate === "string" ? Number(rate) : rate;
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  if (n < 40) return "Highly selective";
  if (n < 65) return "Selective";
  if (n < 85) return "Competitive";
  return "Broadly accessible";
}

/** Initials for a text avatar, e.g. "Roman Lama" → "RL". */
export function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Joins a list into "A, B, and C" prose (Oxford comma). */
export function joinWithAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** Formats an IELTS/PTE band score with per-skill breakdown, e.g. "7 overall (L6 R5.5 W7 S6)". */
export function formatEnglishScore(
  overall: number | null,
  listening: number | null,
  reading: number | null,
  writing: number | null,
  speaking: number | null,
): string | null {
  if (!overall) return null;
  const bands = [
    listening && `L${listening}`,
    reading && `R${reading}`,
    writing && `W${writing}`,
    speaking && `S${speaking}`,
  ]
    .filter(Boolean)
    .join(" ");
  return `${overall} overall${bands ? ` (${bands})` : ""}`;
}
