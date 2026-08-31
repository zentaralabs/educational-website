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

/** Selectivity is a hand-assigned editorial band (see /methodology and
 * scripts/seed_university_selectivity.mjs), not a value derived from an
 * acceptance rate. Australian universities do not publish US-style admission
 * rates, so a percentage there would be false precision. */
export const SELECTIVITY_BANDS = [
  "highly-selective",
  "selective",
  "competitive",
  "broadly-accessible",
] as const;
export type SelectivityBand = (typeof SELECTIVITY_BANDS)[number];

const SELECTIVITY_LABELS: Record<SelectivityBand, string> = {
  "highly-selective": "Highly selective",
  selective: "Selective",
  competitive: "Competitive",
  "broadly-accessible": "Broadly accessible",
};

/** Display label for a stored selectivity band, or null if unset/unknown. */
export function selectivityLabel(band: string | null | undefined): string | null {
  if (!band) return null;
  return SELECTIVITY_LABELS[band as SelectivityBand] ?? null;
}

/** Sort key for a band: 0 = hardest to enter, 3 = most open. Unknown sorts
 * last (treated as most open), matching the old numeric behaviour. */
export function selectivityRank(band: string | null | undefined): number {
  const i = SELECTIVITY_BANDS.indexOf(band as SelectivityBand);
  return i === -1 ? SELECTIVITY_BANDS.length : i;
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
