/**
 * Curated head-to-head university comparisons, each rendered as a static
 * page at /compare/{a}-vs-{b}. Chosen for real search demand ("monash vs
 * unsw", "melbourne vs sydney university", ...). Order is the URL order.
 */
export const COMPARISON_PAIRS: [string, string][] = [
  ["university-of-melbourne", "university-of-sydney"],
  ["monash-university", "unsw-sydney"],
  ["university-of-melbourne", "monash-university"],
  ["university-of-sydney", "unsw-sydney"],
  ["australian-national-university", "university-of-melbourne"],
  ["university-of-queensland", "university-of-sydney"],
  ["monash-university", "university-of-queensland"],
  ["university-of-technology-sydney", "unsw-sydney"],
  ["rmit-university", "university-of-technology-sydney"],
  ["deakin-university", "monash-university"],
  ["macquarie-university", "university-of-sydney"],
  ["curtin-university", "university-of-western-australia"],
  ["griffith-university", "queensland-university-of-technology"],
  ["la-trobe-university", "rmit-university"],
  ["western-sydney-university", "university-of-technology-sydney"],
  ["bond-university", "university-of-queensland"],
  ["university-of-wollongong", "unsw-sydney"],
  ["deakin-university", "rmit-university"],
  ["adelaide-university", "university-of-melbourne"],
  ["swinburne-university-of-technology", "rmit-university"],
  // Second batch (2026-08-29): more Go8 head-to-heads and same-city rivalries
  // with real search demand.
  ["university-of-melbourne", "unsw-sydney"],
  ["australian-national-university", "university-of-sydney"],
  ["monash-university", "university-of-sydney"],
  ["australian-national-university", "unsw-sydney"],
  ["university-of-queensland", "queensland-university-of-technology"],
  ["rmit-university", "monash-university"],
  ["university-of-technology-sydney", "university-of-sydney"],
  ["macquarie-university", "unsw-sydney"],
  ["adelaide-university", "flinders-university"],
  ["university-of-newcastle", "university-of-wollongong"],
  ["griffith-university", "university-of-queensland"],
  ["deakin-university", "swinburne-university-of-technology"],
  ["university-of-western-australia", "university-of-melbourne"],
  ["la-trobe-university", "deakin-university"],
];

/** Split a "{a}-vs-{b}" slug. University slugs contain hyphens, so we split
 *  on the literal "-vs-" delimiter. */
export function parseVsSlug(slug: string): [string, string] | null {
  const i = slug.indexOf("-vs-");
  if (i === -1) return null;
  const a = slug.slice(0, i);
  const b = slug.slice(i + 4);
  if (!a || !b) return null;
  return [a, b];
}

export function vsSlug(a: string, b: string): string {
  return `${a}-vs-${b}`;
}
