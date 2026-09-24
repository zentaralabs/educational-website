/**
 * Central site identity — every canonical URL, sitemap entry, and OG tag
 * reads from here rather than being hardcoded. NEXT_PUBLIC_SITE_URL should
 * also be set in Vercel's project env vars to this same value; the fallback
 * here just keeps local dev and any deploy that forgets the env var correct.
 */
export const SITE_NAME = "Where To Apply";

/**
 * Official profiles for the site's brand entity. Emitted as `sameAs` on the
 * Organization schema so search and answer engines can tie the site to a
 * known entity. Add new ones only once the profile is actually live.
 */
export const SITE_SAME_AS = [
  "https://www.linkedin.com/company/wheretoapply",
  "https://www.f6s.com/where-to-apply",
  "https://www.indiehackers.com/product/where-to-apply",
];

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.wheretoapply.xyz"
).replace(/\/$/, "");

/**
 * The year international students actually search with ("... in australia
 * 2026"). Evaluated at build / ISR-revalidate time, so pages self-update
 * each new year without a manual edit. Used only in <title>/description
 * strings, never in visible page copy or dated facts.
 */
export const SITE_YEAR = new Date().getFullYear();

/**
 * The intake year deadline content actually refers to: by the time anyone
 * is checking a deadline, the current year's intakes have mostly already
 * closed, so "when do I apply" content means next year's dates. Unlike
 * SITE_YEAR, this is a real content fact used in visible copy and titles
 * (a deadlines page's own H1 says "application deadlines {INTAKE_YEAR}"),
 * not just a freshness signal — keep every "Deadlines {year}" claim on
 * this constant so a parent page and its deadlines child page can't drift
 * apart the way university overview pages did before this was centralised
 * (sxo.md Finding 4, 2026-09-20 SEO audit: overview said "Deadlines 2026",
 * its own deadlines subpage said "Deadlines 2027").
 */
export const INTAKE_YEAR = SITE_YEAR + 1;

// Australia only, and the public URL structure commits to it: routes are flat
// and un-prefixed (no /australia/ segment). A future second country would get
// its own path prefix (/uk/...) rather than triggering a site-wide migration.
// See PROJECT_STATUS.md Section 1 + 4 and SEO_CHANGELOG.md (2026-08-30).
// Update this string only once a second country actually goes live.
export const SITE_DESCRIPTION =
  "Application deadlines, admissions requirements, tuition costs, and scholarships for universities in Australia. Plus how-to guides for personal statements, visas, and international applications.";
