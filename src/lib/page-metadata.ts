import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

/**
 * Title and description budgets, and the one place that spends them.
 *
 * Google renders roughly 600px of a result title, which works out at about
 * 60 characters for this site's mix of words, and around 155-160 characters
 * of a description. Past that the text is cut with an ellipsis, or Google
 * rewrites the title itself from on-page text.
 *
 * That mattered here more than it looks: an audit of the live site found 324
 * of 341 indexable pages with titles over 65 characters. The visa pages were
 * the worst case — "Skilled Employer Sponsored Regional (Provisional) visa
 * (Subclass 494): ..." pushed "Subclass 494", the phrase people actually
 * search, past character 55, so it never appeared in the snippet at all.
 *
 * The fix is a budget, not a hard truncation: `composeTitle` keeps the part
 * that must rank and drops the trimmings that don't fit.
 */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

const BRAND_SUFFIX = ` | ${SITE_NAME}`;

/**
 * Builds a title that fits the SERP budget.
 *
 * `core` is the part that carries the query and is never dropped (it is
 * clipped only if it alone busts the budget). Each `optional` fragment is
 * appended, in order, for as long as there is room — so a short university
 * name keeps its full "Fees, Entry & Deadlines 2026" tail while a long one
 * quietly sheds it instead of being cut mid-word by Google.
 *
 *   composeTitle("Subclass 494 Visa", "Eligibility, Cost & Requirements", "2026")
 *     -> "Subclass 494 Visa: Eligibility, Cost & Requirements 2026"
 */
/**
 * Builds a title that fits the SERP budget.
 *
 * `core` is the part that carries the query and is never dropped (it is
 * clipped only if it alone busts the budget). Each following argument is a
 * fragment to append while there is room; pass an array to offer alternatives
 * and the first one that fits wins. That is what lets one template serve both
 * "Wollongong" and "Queensland University of Technology" without either
 * losing its qualifier or getting cut mid-word by Google.
 *
 *   composeTitle("Subclass 494 Visa", "Eligibility, Requirements & Cost 2026")
 *     -> "Subclass 494 Visa: Eligibility, Requirements & Cost 2026"
 *
 *   composeTitle(uni.name, ["Fees, Entry Requirements & Deadlines 2026",
 *                           "Fees, Entry & Deadlines 2026",
 *                           "Fees & Entry 2026"])
 */
export function composeTitle(
  core: string,
  ...fragments: Array<string | string[]>
): string {
  let title = core.trim();

  if (title.length > TITLE_MAX) {
    // Clip on a word boundary rather than mid-word.
    const clipped = title.slice(0, TITLE_MAX - 1);
    const lastSpace = clipped.lastIndexOf(" ");
    return (lastSpace > TITLE_MAX * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd();
  }

  let joiner = ": "; // first fragment reads as a subtitle, later ones as qualifiers
  for (const fragment of fragments) {
    const options = Array.isArray(fragment) ? fragment : [fragment];
    for (const option of options) {
      const piece = option.trim();
      if (!piece) continue;
      const candidate = `${title}${joiner}${piece}`;
      if (candidate.length <= TITLE_MAX) {
        title = candidate;
        joiner = " ";
        break; // first alternative that fits wins
      }
    }
  }

  return title;
}

/**
 * Decides whether the ` | Where To Apply` suffix is affordable.
 *
 * The brand costs 17 characters. On a short title it is worth it (recognition,
 * and it keeps the SERP looking like a publisher rather than a scraper). On a
 * title already at the budget it would only push the page's own words out of
 * the snippet, so the page keeps every character for itself — Google appends
 * the site name on its own in many results anyway.
 */
export function titleField(title: string): Metadata["title"] {
  return title.length + BRAND_SUFFIX.length <= TITLE_MAX
    ? title // the root layout's `%s | Where To Apply` template applies
    : { absolute: title };
}

/** Clips a description to the snippet budget on a sentence or word boundary. */
export function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= DESCRIPTION_MAX) return clean;

  const window = clean.slice(0, DESCRIPTION_MAX);
  // Prefer ending on a full sentence if one lands late enough to still be useful.
  const lastStop = Math.max(window.lastIndexOf(". "), window.lastIndexOf("? "));
  if (lastStop > DESCRIPTION_MAX * 0.6) return window.slice(0, lastStop + 1);

  const lastSpace = window.lastIndexOf(" ");
  return `${(lastSpace > 0 ? window.slice(0, lastSpace) : window).trimEnd()}…`;
}

/**
 * The single builder every page's `generateMetadata` should return.
 *
 * Besides applying the two budgets above it fixes a silent bug: a page that
 * declares its own `openGraph` object replaces the one inherited from the
 * root layout, and with it the root `opengraph-image.tsx`. Every page that
 * set `openGraph: { title, description, url, type }` without an `images` key
 * was therefore shipping *no* `og:image` at all — 216 of 341 live pages had
 * no social card. Defaulting `image` to the root card closes that for good.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  /** Site-relative path, e.g. `/visas/student-500`. Used for the canonical. */
  path: string;
  type?: "article" | "website";
  /** Site-relative path to a per-page OG route; falls back to the site card. */
  image?: string;
  robots?: Metadata["robots"];
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const title = opts.title;
  const description = clampDescription(opts.description);
  const images = [opts.image ?? "/opengraph-image"];

  return {
    title: titleField(title),
    description,
    alternates: { canonical: opts.path },
    ...(opts.robots ? { robots: opts.robots } : {}),
    openGraph: {
      title,
      description,
      url: opts.path,
      type: opts.type ?? "article",
      images,
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
