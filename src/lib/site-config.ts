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

// Launching country-by-country — see PROJECT_STATUS.md's 2026-08-27 note.
// Update this once a second country goes live (currently Australia only).
export const SITE_DESCRIPTION =
  "Application deadlines, admissions requirements, tuition costs, and scholarships for universities in Australia. Plus how-to guides for personal statements, visas, and international applications.";
