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

// Launching country-by-country — see PROJECT_STATUS.md's 2026-08-27 note.
// Update this once a second country goes live (currently Australia only).
export const SITE_DESCRIPTION =
  "Application deadlines, admissions requirements, tuition costs, and scholarships for universities in Australia — plus how-to guides for personal statements, visas, and international applications.";
