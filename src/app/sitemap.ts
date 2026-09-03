import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/collections";
import { SUBJECT_CONTENT } from "@/lib/subjects";
import { CITY_COSTS } from "@/lib/cities";
import { COMPARISON_PAIRS, vsSlug } from "@/lib/comparisons";
import { SITE_URL } from "@/lib/site-config";
import { listAllBlogPostSlugsForSitemap } from "@/lib/queries/public-blog-posts";
import { listPublishedGuideSlugsForSitemap } from "@/lib/queries/public-guides";
import { AU_STATES } from "@/lib/australia";
import { DEADLINE_PAGE_INDEXED } from "@/lib/deadline-detail";
import { ORIGIN_COUNTRY_SLUGS } from "@/lib/origin-countries";
import { listPublishedScholarshipSlugsForSitemap } from "@/lib/queries/public-scholarships";
import { listPublishedSubjects } from "@/lib/queries/public-subjects";
import { listPublishedUniversitySlugsForSitemap } from "@/lib/queries/public-universities";
import { listPublishedVisaSlugsForSitemap } from "@/lib/queries/public-visas";
import { listPublishedProgramsForSitemap } from "@/lib/queries/public-programs";

/**
 * `lastModified` for config-driven routes (static pages, /best collections,
 * city and country pages, subject pages, auto comparison pairs). These change
 * only on deploy, so bump this when their source files (collections.ts,
 * cities.ts, subjects.ts, origin-countries.ts, comparisons.ts, this file)
 * meaningfully change. DB-backed routes use their row's real updated_at.
 */
const CONFIG_LAST_MODIFIED = new Date("2026-09-03T00:00:00Z");

// 6 hours. Longer than a page's 1h so cold regenerations (the only time a
// slow or failing origin can reach a crawler) are rarer; short enough that
// row-level updated_at values in the sitemap stay honest.
export const revalidate = 21600;

// A cold regeneration runs ~8 list queries plus a paginated 850+ row program
// query. Warm hits are edge-cached and instant, but the first hit after a
// deploy (or after a quiet period) pays the full cost against a possibly
// cold database. Raise the function ceiling well past that so a slow origin
// can never turn into the 504 that Search Console reports as "Couldn't fetch".
export const maxDuration = 60;

/**
 * Runs one sitemap data source, returning [] if it throws.
 *
 * Every entry here is optional: the sitemap route must never 500. Google
 * records a failed fetch as "Couldn't fetch" and then retries only slowly
 * (days, for a new domain), so one transient database blip during a cold
 * regeneration can keep the whole sitemap out of Search Console for a week.
 * A sitemap that is briefly missing a section self-heals on the next
 * revalidation; a sitemap that errors does not.
 */
async function safe<T>(label: string, fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[sitemap] "${label}" failed, continuing without it:`, err);
    return [];
  }
}

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/universities", priority: 0.9, changeFrequency: "weekly" },
  { path: "/international", priority: 0.7, changeFrequency: "monthly" },
  { path: "/deadlines", priority: 0.9, changeFrequency: "daily" },
  { path: "/cost-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/guides", priority: 0.8, changeFrequency: "weekly" },
  { path: "/compare", priority: 0.7, changeFrequency: "weekly" },
  { path: "/compare/universities", priority: 0.6, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/scholarships", priority: 0.8, changeFrequency: "weekly" },
  { path: "/best", priority: 0.7, changeFrequency: "weekly" },
  { path: "/study", priority: 0.8, changeFrequency: "weekly" },
  { path: "/cost-of-living", priority: 0.7, changeFrequency: "monthly" },
  { path: "/visas", priority: 0.8, changeFrequency: "weekly" },
  { path: "/visas/invitation-rounds", priority: 0.7, changeFrequency: "weekly" },
  { path: "/visas/points-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/quiz", priority: 0.6, changeFrequency: "monthly" },
  // /search is noindex (a query-driven results page with no standalone value),
  // so it is deliberately kept out of the sitemap.
  { path: "/about", priority: 0.3, changeFrequency: "yearly" },
  { path: "/methodology", priority: 0.4, changeFrequency: "monthly" },
  { path: "/editorial-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.2, changeFrequency: "yearly" },
];

const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
  url: `${SITE_URL}${route.path}`,
  lastModified: CONFIG_LAST_MODIFIED,
  changeFrequency: route.changeFrequency,
  priority: route.priority,
}));

async function buildDynamicEntries(): Promise<MetadataRoute.Sitemap> {
  const [
    universities,
    guides,
    comparisonGuides,
    blogPosts,
    visas,
    scholarships,
    subjects,
    programRows,
  ] = await Promise.all([
    safe("universities", listPublishedUniversitySlugsForSitemap),
    safe("guides", () =>
      listPublishedGuideSlugsForSitemap({ excludeCategory: "comparison" }),
    ),
    safe("comparison guides", () =>
      listPublishedGuideSlugsForSitemap({ category: "comparison" }),
    ),
    safe("blog posts", listAllBlogPostSlugsForSitemap),
    safe("visas", listPublishedVisaSlugsForSitemap),
    safe("scholarships", listPublishedScholarshipSlugsForSitemap),
    safe("subjects", listPublishedSubjects),
    safe("programs", listPublishedProgramsForSitemap),
  ]);

  const modOr = (updatedAt: string | null) =>
    updatedAt ? new Date(updatedAt) : CONFIG_LAST_MODIFIED;

  const universityDate = new Map(
    universities.map((u) => [u.slug, modOr(u.updatedAt)]),
  );

  const universityEntries: MetadataRoute.Sitemap = universities.map((u) => ({
    url: `${SITE_URL}/universities/${u.slug}`,
    lastModified: modOr(u.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Per-university deadline pages, only for universities with a firm date or
  // verified rolling guidance (the rest are noindex, see deadline-detail.ts).
  const universityDeadlineEntries: MetadataRoute.Sitemap = universities
    .filter((u) => DEADLINE_PAGE_INDEXED.has(u.slug))
    .map((u) => ({
      url: `${SITE_URL}/universities/${u.slug}/deadlines`,
      lastModified: universityDate.get(u.slug) ?? CONFIG_LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: modOr(g.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Hand-written comparison guides (real updated_at), plus the curated
  // /compare/{a}-vs-{b} head-to-heads (config-built, indexed).
  const comparisonEntries: MetadataRoute.Sitemap = [
    ...comparisonGuides.map((g) => ({
      url: `${SITE_URL}/compare/${g.slug}`,
      lastModified: modOr(g.updatedAt),
    })),
    ...COMPARISON_PAIRS.map(([a, b]) => ({
      url: `${SITE_URL}/compare/${vsSlug(a, b)}`,
      lastModified: CONFIG_LAST_MODIFIED,
    })),
  ].map((e) => ({
    ...e,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: modOr(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const visaEntries: MetadataRoute.Sitemap = visas.map((v) => ({
    url: `${SITE_URL}/visas/${v.slug}`,
    lastModified: modOr(v.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const scholarshipEntries: MetadataRoute.Sitemap = scholarships.map((s) => ({
    url: `${SITE_URL}/scholarships/${s.slug}`,
    lastModified: modOr(s.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const collectionEntries: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({
    url: `${SITE_URL}/best/${c.slug}`,
    lastModified: CONFIG_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const cityEntries: MetadataRoute.Sitemap = CITY_COSTS.map((c) => ({
    url: `${SITE_URL}/cost-of-living/${c.slug}`,
    lastModified: CONFIG_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Only subjects with a curated write-up. Templated-fallback subject pages
  // are noindex, so they stay out of the sitemap. Subject copy lives in
  // subjects.ts (config), so these use CONFIG_LAST_MODIFIED.
  const subjectEntries: MetadataRoute.Sitemap = subjects
    .filter((s) => SUBJECT_CONTENT[s.slug])
    .map((s) => ({
      url: `${SITE_URL}/study/${s.slug}`,
      lastModified: CONFIG_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const originCountryEntries: MetadataRoute.Sitemap = ORIGIN_COUNTRY_SLUGS.map(
    (slug) => ({
      url: `${SITE_URL}/international/${slug}`,
      lastModified: CONFIG_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  const stateEntries: MetadataRoute.Sitemap = AU_STATES.map((s) => ({
    url: `${SITE_URL}/universities/in/${s.slug}`,
    lastModified: CONFIG_LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Program pages (/universities/{slug}/programs/{program-slug}): the query
  // already filters to `content_indexable` rows (migration 0023, mirrors
  // isProgramIndexable). Short templated long-tail cards stay noindex and out
  // of the sitemap, still live for users and internal links.
  const programEntries: MetadataRoute.Sitemap = programRows
    .filter((p) => p.university?.slug && p.university.status === "published")
    .map((p) => ({
      url: `${SITE_URL}/universities/${p.university!.slug}/programs/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : CONFIG_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    ...universityEntries,
    ...universityDeadlineEntries,
    ...guideEntries,
    ...comparisonEntries,
    ...blogEntries,
    ...visaEntries,
    ...scholarshipEntries,
    ...collectionEntries,
    ...subjectEntries,
    ...cityEntries,
    ...originCountryEntries,
    ...stateEntries,
    ...programEntries,
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Last-resort guard: if the dynamic build throws for any reason, still
  // serve a valid sitemap of the core config-driven routes rather than a
  // 500. `buildDynamicEntries` already degrades each section on its own, so
  // this should never trigger, but the sitemap is too load-bearing to leave
  // a single unhandled path.
  try {
    return [...staticEntries, ...(await buildDynamicEntries())];
  } catch (err) {
    console.error("[sitemap] dynamic build failed entirely, serving static routes only:", err);
    return staticEntries;
  }
}
