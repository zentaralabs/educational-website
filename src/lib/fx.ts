/**
 * Indicative AUD conversions for the source-country pages.
 *
 * Why this exists: every page that outranks us for "cost to study in Australia
 * from Nepal" leads with the number in the reader's own currency, and in South
 * Asia with the reader's own counting unit ("NPR 34 to 60 lakh"), because that
 * is how the question is asked. We publish only AUD, which is accurate and
 * useless to someone deciding whether they can afford it.
 *
 * Rates move, and this site's whole claim is that its figures are sourced and
 * dated, so conversions are always rendered as approximate and always shown
 * with `RATES_AS_OF` next to them. One table, one date: refreshing the rates is
 * a single edit, and nothing silently drifts.
 *
 * Source: exchangerate-api.com mid-market rates, AUD base.
 */

/** ISO date the rates below were taken. Shown to the reader. */
export const RATES_AS_OF = "2026-09-03";

/** Units of one local currency per 1 AUD. */
export const AUD_RATES: Record<string, number> = {
  BDT: 87.79,
  BRL: 3.68,
  BTN: 67.92,
  CNY: 4.81,
  COP: 2259,
  IDR: 12707,
  INR: 67.92,
  JPY: 113.93,
  KES: 92.59,
  KRW: 974.77,
  HKD: 5.62,
  KHR: 2883,
  LKR: 234.61,
  MMK: 1500,
  MNT: 2566,
  MYR: 2.89,
  NGN: 959.6,
  NPR: 108.68,
  PHP: 44.8,
  PKR: 198.59,
  THB: 23.77,
  TWD: 22.75,
  VND: 18540,
};

/**
 * Currencies whose speakers count large sums in lakh (10^5) and crore (10^7).
 * Writing "NPR 4,347,000" where a reader expects "about 43 lakh" reads as a
 * foreign document, which is exactly the impression the source-country pages
 * exist to avoid.
 */
const LAKH_CURRENCIES = new Set(["BDT", "BTN", "INR", "LKR", "NPR", "PKR"]);

function roundTo(value: number, significantish: number): number {
  // Round to a readable step for the magnitude: no false precision on a
  // number that is an estimate built on a moving exchange rate.
  const step = Math.pow(10, Math.max(0, Math.floor(Math.log10(value)) - significantish + 1));
  return Math.round(value / step) * step;
}

/** Formats one AUD amount in `currency`, in the units a local reader uses. */
export function formatLocal(aud: number, currency: string): string | null {
  const rate = AUD_RATES[currency];
  if (!rate) return null;
  const local = aud * rate;

  if (LAKH_CURRENCIES.has(currency)) {
    const crore = local / 1e7;
    if (crore >= 1) {
      return `${crore >= 10 ? Math.round(crore) : Number(crore.toFixed(1))} crore`;
    }
    const lakh = local / 1e5;
    return `${lakh >= 10 ? Math.round(lakh) : Number(lakh.toFixed(1))} lakh`;
  }

  if (local >= 1e9) return `${Number((local / 1e9).toFixed(1))} billion`;
  if (local >= 1e6) return `${Number((local / 1e6).toFixed(1))} million`;
  return roundTo(local, 3).toLocaleString("en-US");
}

/**
 * "about NPR 43 lakh to 87 lakh" for an AUD range, or null when the currency
 * has no rate on file.
 */
export function formatLocalRange(
  audLow: number,
  audHigh: number,
  currency: string,
): string | null {
  const low = formatLocal(audLow, currency);
  const high = formatLocal(audHigh, currency);
  if (!low || !high) return null;
  return `${currency} ${low} to ${high}`;
}
