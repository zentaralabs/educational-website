/**
 * Central site identity — every canonical URL, sitemap entry, and OG tag
 * reads from here rather than being hardcoded. NEXT_PUBLIC_SITE_URL should
 * also be set in Vercel's project env vars to this same value; the fallback
 * here just keeps local dev and any deploy that forgets the env var correct.
 */
export const SITE_NAME = "Where To Apply";

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

// Australia only, and the public URL structure commits to it: routes are flat
// and un-prefixed (no /australia/ segment). A future second country would get
// its own path prefix (/uk/...) rather than triggering a site-wide migration.
// See PROJECT_STATUS.md Section 1 + 4 and SEO_CHANGELOG.md (2026-08-30).
// Update this string only once a second country actually goes live.
export const SITE_DESCRIPTION =
  "Application deadlines, admissions requirements, tuition costs, and scholarships for universities in Australia. Plus how-to guides for personal statements, visas, and international applications.";
