/**
 * Central site identity — swap NEXT_PUBLIC_SITE_URL once a domain is
 * registered (see PROJECT_STATUS.md Section 10.2); every canonical URL,
 * sitemap entry, and OG tag reads from here rather than being hardcoded.
 */
export const SITE_NAME = "Where To Apply";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.wheretoapply.com"
).replace(/\/$/, "");

export const SITE_DESCRIPTION =
  "Application deadlines, admissions requirements, tuition costs, and scholarships for universities in the US, UK, Canada, and Australia — plus how-to guides for personal statements, visas, and international applications.";
