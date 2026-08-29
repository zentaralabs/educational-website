/**
 * Universities whose `/universities/{slug}/deadlines` page is worth
 * indexing: they publish a firm international closing date, or carry
 * verified university-specific rolling guidance, or run a distinct intake
 * structure. The rest still get the page (so a link from the profile
 * works) but noindex and out of the sitemap, because their deadline note
 * is the generic "assesses on a rolling basis" text and a standalone page
 * would add little over the profile's own deadlines section.
 *
 * Mirrors PER_UNI + ROLLING + a couple of OVERRIDES in
 * scripts/seed_deadlines.mjs. Keep in sync when that changes.
 */
export const DEADLINE_PAGE_INDEXED = new Set<string>([
  // Firm published dates
  "university-of-sydney",
  "australian-national-university",
  "university-of-melbourne",
  "university-of-western-australia",
  "university-of-technology-sydney",
  // Rolling / terms, but with a distinct structure or verified guidance
  "unsw-sydney",
  "university-of-queensland",
  "adelaide-university",
  "monash-university",
  "bond-university",
  "nida",
  // Verified per-university rolling guidance
  "macquarie-university",
  "university-of-newcastle",
  "curtin-university",
  "university-of-wollongong",
  "queensland-university-of-technology",
  "rmit-university",
  "deakin-university",
  "griffith-university",
  "western-sydney-university",
  "university-of-tasmania",
  "flinders-university",
  "australian-catholic-university",
  "swinburne-university-of-technology",
  "edith-cowan-university",
  "james-cook-university",
  "charles-darwin-university",
  "cquniversity-australia",
  "university-of-canberra",
  "southern-cross-university",
  "university-of-the-sunshine-coast",
  "university-of-southern-queensland",
  "university-of-new-england",
  "charles-sturt-university",
  "federation-university-australia",
  "victoria-university",
  "murdoch-university",
  "la-trobe-university",
]);
