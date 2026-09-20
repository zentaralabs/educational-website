import { COLLECTIONS } from "@/lib/collections";
import { SUBJECT_CONTENT } from "@/lib/subjects";
import { CITY_COSTS } from "@/lib/cities";
import { COMPARISON_PAIRS, vsSlug } from "@/lib/comparisons";
import { SITE_URL } from "@/lib/site-config";
import { listAllBlogPostSlugsForSitemap } from "@/lib/queries/public-blog-posts";
import { listPublishedGuideSlugsForSitemap } from "@/lib/queries/public-guides";
import { AU_STATES } from "@/lib/australia";
import { DEADLINE_PAGE_INDEXED } from "@/lib/deadline-detail";
import { INTAKE_HUB_SLUGS } from "@/lib/intakes";
import { APPLY_GUIDE_SLUGS } from "@/lib/apply-guides";
import { ORIGIN_COUNTRY_SLUGS } from "@/lib/origin-countries";
import { listPublishedScholarshipSlugsForSitemap } from "@/lib/queries/public-scholarships";
import { listPublishedSubjects } from "@/lib/queries/public-subjects";
import { listPublishedUniversitySlugsForSitemap } from "@/lib/queries/public-universities";
import { listPublishedVisaSlugsForSitemap } from "@/lib/queries/public-visas";
import { listPublishedOccupationSlugsForSitemap } from "@/lib/queries/public-occupations";

/**
 * The site's primary sitemap — everything but program pages (those live in
 * `/sitemap-programs.xml`, split out for the reasons documented there).
 *
 * This is a hand-rolled route at `/sitemap-pages.xml`, not the Next.js
 * `sitemap.ts` file-convention route (which is hardwired to always answer at
 * `/sitemap.xml` and cannot be renamed). It replaces what used to live at
 * `/sitemap.xml`: Search Console recorded that URL as "Couldn't fetch" during
 * an old window when it ran a slow paginated program query, and — as
 * documented in `sitemap-index.xml/route.ts` — a failed sitemap's record
 * does not clear on resubmission, no matter how many times you resubmit the
 * same URL (confirmed repeatedly in production: live URL tests, direct
 * fetches, and Googlebot's own crawl history all showed the file fetching
 * cleanly, while Search Console's Sitemaps report kept showing "Couldn't
 * fetch" against `/sitemap.xml` specifically, unmoved by any resubmission).
 * The `sitemap-index.xml` workaround (2026-09-03) only fixed this for
 * itself and for `/sitemap-programs.xml` — both brand-new URLs with no
 * history. `/sitemap.xml` itself was still the same poisoned URL underneath,
 * so its ~416 pages (including much of `/best/*`, `/study/*`, `/visas/*`,
 * and the country/guide content) were never confirmed reaching Google via
 * sitemap discovery at all. Moving the content to a URL with no failure
 * history is the same fix already proven for programs; `/sitemap.xml` itself
 * is retired (see `src/app/sitemap.xml/route.ts`, a `410 Gone`).
 */
export const revalidate = 21600; // 6h, same cadence as the other sitemaps
export const maxDuration = 60;

const CONFIG_LAST_MODIFIED = new Date("2026-09-16T00:00:00Z");

type Entry = {
  loc: string;
  lastmod: Date;
  changefreq: string;
  priority: number;
};

async function safe<T>(label: string, fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[sitemap-pages] "${label}" failed, continuing without it:`, err);
    return [];
  }
}

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: string }> = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/universities", priority: 0.9, changeFrequency: "weekly" },
  { path: "/international", priority: 0.7, changeFrequency: "monthly" },
  { path: "/deadlines", priority: 0.9, changeFrequency: "daily" },
  { path: "/cost-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/wam-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/ielts-pte-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/guides", priority: 0.8, changeFrequency: "weekly" },
  { path: "/compare", priority: 0.7, changeFrequency: "weekly" },
  { path: "/compare/universities", priority: 0.6, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/scholarships", priority: 0.8, changeFrequency: "weekly" },
  { path: "/best", priority: 0.7, changeFrequency: "weekly" },
  { path: "/study", priority: 0.8, changeFrequency: "weekly" },
  { path: "/cost-of-living", priority: 0.7, changeFrequency: "monthly" },
  { path: "/visas", priority: 0.8, changeFrequency: "weekly" },
  { path: "/occupations", priority: 0.7, changeFrequency: "weekly" },
  { path: "/visas/invitation-rounds", priority: 0.7, changeFrequency: "weekly" },
  { path: "/visas/points-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/updates", priority: 0.7, changeFrequency: "weekly" },
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

const staticEntries: Entry[] = STATIC_ROUTES.map((route) => ({
  loc: `${SITE_URL}${route.path}`,
  lastmod: CONFIG_LAST_MODIFIED,
  changefreq: route.changeFrequency,
  priority: route.priority,
}));

async function buildDynamicEntries(): Promise<Entry[]> {
  const [
    universities,
    guides,
    comparisonGuides,
    blogPosts,
    visas,
    occupations,
    scholarships,
    subjects,
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
    safe("occupations", listPublishedOccupationSlugsForSitemap),
    safe("scholarships", listPublishedScholarshipSlugsForSitemap),
    safe("subjects", listPublishedSubjects),
  ]);

  const modOr = (updatedAt: string | null) =>
    updatedAt ? new Date(updatedAt) : CONFIG_LAST_MODIFIED;

  const universityDate = new Map(
    universities.map((u) => [u.slug, modOr(u.updatedAt)]),
  );

  const universityEntries: Entry[] = universities.map((u) => ({
    loc: `${SITE_URL}/universities/${u.slug}`,
    lastmod: modOr(u.updatedAt),
    changefreq: "weekly",
    priority: 0.8,
  }));

  const universityDeadlineEntries: Entry[] = universities
    .filter((u) => DEADLINE_PAGE_INDEXED.has(u.slug))
    .map((u) => ({
      loc: `${SITE_URL}/universities/${u.slug}/deadlines`,
      lastmod: universityDate.get(u.slug) ?? CONFIG_LAST_MODIFIED,
      changefreq: "weekly",
      priority: 0.7,
    }));

  const intakeHubEntries: Entry[] = INTAKE_HUB_SLUGS.map((slug) => ({
    loc: `${SITE_URL}/deadlines/${slug}`,
    lastmod: CONFIG_LAST_MODIFIED,
    changefreq: "weekly",
    priority: 0.8,
  }));

  const guideEntries: Entry[] = guides.map((g) => ({
    loc: `${SITE_URL}/guides/${g.slug}`,
    lastmod: modOr(g.updatedAt),
    changefreq: "monthly",
    priority: 0.6,
  }));

  const comparisonEntries: Entry[] = [
    ...comparisonGuides.map((g) => ({
      loc: `${SITE_URL}/compare/${g.slug}`,
      lastmod: modOr(g.updatedAt),
    })),
    ...COMPARISON_PAIRS.map(([a, b]) => ({
      loc: `${SITE_URL}/compare/${vsSlug(a, b)}`,
      lastmod: CONFIG_LAST_MODIFIED,
    })),
  ].map((e) => ({ ...e, changefreq: "monthly", priority: 0.6 }));

  const blogEntries: Entry[] = blogPosts.map((p) => ({
    loc: `${SITE_URL}/blog/${p.slug}`,
    lastmod: modOr(p.updatedAt),
    changefreq: "monthly",
    priority: 0.5,
  }));

  const visaEntries: Entry[] = visas.map((v) => ({
    loc: `${SITE_URL}/visas/${v.slug}`,
    lastmod: modOr(v.updatedAt),
    changefreq: "monthly",
    priority: 0.7,
  }));

  const occupationEntries: Entry[] = occupations.map((o) => ({
    loc: `${SITE_URL}/occupations/${o.slug}`,
    lastmod: modOr(o.updatedAt),
    changefreq: "monthly",
    priority: 0.6,
  }));

  const scholarshipEntries: Entry[] = scholarships.map((s) => ({
    loc: `${SITE_URL}/scholarships/${s.slug}`,
    lastmod: modOr(s.updatedAt),
    changefreq: "monthly",
    priority: 0.6,
  }));

  const collectionEntries: Entry[] = COLLECTIONS.map((c) => ({
    loc: `${SITE_URL}/best/${c.slug}`,
    lastmod: CONFIG_LAST_MODIFIED,
    changefreq: "weekly",
    priority: 0.6,
  }));

  const cityEntries: Entry[] = CITY_COSTS.map((c) => ({
    loc: `${SITE_URL}/cost-of-living/${c.slug}`,
    lastmod: CONFIG_LAST_MODIFIED,
    changefreq: "monthly",
    priority: 0.6,
  }));

  const subjectEntries: Entry[] = subjects
    .filter((s) => SUBJECT_CONTENT[s.slug])
    .map((s) => ({
      loc: `${SITE_URL}/study/${s.slug}`,
      lastmod: CONFIG_LAST_MODIFIED,
      changefreq: "weekly",
      priority: 0.7,
    }));

  const originCountryEntries: Entry[] = ORIGIN_COUNTRY_SLUGS.map((slug) => ({
    loc: `${SITE_URL}/international/${slug}`,
    lastmod: CONFIG_LAST_MODIFIED,
    changefreq: "monthly",
    priority: 0.7,
  }));

  const applyGuideEntries: Entry[] = APPLY_GUIDE_SLUGS.map((slug) => ({
    loc: `${SITE_URL}/international/${slug}/how-to-apply`,
    lastmod: CONFIG_LAST_MODIFIED,
    changefreq: "monthly",
    priority: 0.7,
  }));

  const stateEntries: Entry[] = AU_STATES.map((s) => ({
    loc: `${SITE_URL}/universities/in/${s.slug}`,
    lastmod: CONFIG_LAST_MODIFIED,
    changefreq: "weekly",
    priority: 0.7,
  }));

  return [
    ...universityEntries,
    ...universityDeadlineEntries,
    ...intakeHubEntries,
    ...guideEntries,
    ...comparisonEntries,
    ...blogEntries,
    ...visaEntries,
    ...occupationEntries,
    ...scholarshipEntries,
    ...collectionEntries,
    ...subjectEntries,
    ...cityEntries,
    ...originCountryEntries,
    ...applyGuideEntries,
    ...stateEntries,
  ];
}

function toXml(entries: Entry[]): string {
  const body = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod.toISOString()}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export async function GET() {
  let entries: Entry[] = staticEntries;
  try {
    entries = [...staticEntries, ...(await buildDynamicEntries())];
  } catch (err) {
    // Last-resort guard: if the dynamic build throws for any reason, still
    // serve a valid sitemap of the core config-driven routes rather than a
    // 500, which Search Console would record as a fresh "Couldn't fetch"
    // against this URL too.
    console.error("[sitemap-pages] dynamic build failed entirely, serving static routes only:", err);
  }

  return new Response(toXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}
