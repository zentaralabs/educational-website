/** Shared Australia-specific helpers used by collections and FAQ builders. */

export const GO8_SLUGS = new Set([
  "australian-national-university",
  "university-of-melbourne",
  "university-of-sydney",
  "unsw-sydney",
  "university-of-queensland",
  "monash-university",
  "university-of-western-australia",
  "adelaide-university",
]);

const REGIONAL_RE =
  /(Perth|Adelaide|Canberra|Hobart|Launceston|Darwin|Gold Coast|Sunshine Coast|Sippy Downs|Newcastle|Wollongong|Ballarat|Armidale|Toowoomba|Lismore|Coffs|Townsville|Cairns|Bathurst|Wagga|Bendigo|Geelong|Cooranbong|regional| WA| SA| TAS| NT| ACT)/i;

/**
 * True if the campus city sits in a designated regional area for skilled
 * migration (everywhere except Greater Sydney, Melbourne, and Brisbane).
 * A heuristic on the free-text `city` field, not the official postcode list.
 */
export function isRegionalCity(city: string | null): boolean {
  if (!city) return false;
  if (/Sydney|Melbourne/i.test(city)) return false;
  if (/^Brisbane,/i.test(city)) return false;
  return REGIONAL_RE.test(city);
}
