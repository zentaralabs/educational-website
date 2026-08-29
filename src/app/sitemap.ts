import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/collections";
import { SUBJECT_CONTENT } from "@/lib/subjects";
import { CITY_COSTS } from "@/lib/cities";
import { SITE_URL } from "@/lib/site-config";
import { listAllBlogPostSlugs } from "@/lib/queries/public-blog-posts";
import { listPublishedGuideSlugs } from "@/lib/queries/public-guides";
import { AU_STATES } from "@/lib/australia";
import { DEADLINE_PAGE_INDEXED } from "@/lib/deadline-detail";
import { ORIGIN_COUNTRY_SLUGS } from "@/lib/origin-countries";
import { listPublishedScholarshipSlugs } from "@/lib/queries/public-scholarships";
import { listPublishedSubjects } from "@/lib/queries/public-subjects";
import { listPublishedUniversitySlugs } from "@/lib/queries/public-universities";
import { listPublishedVisaSlugs } from "@/lib/queries/public-visas";

export const revalidate = 3600;

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
  { path: "/editorial-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    universitySlugs,
    guideSlugs,
    comparisonSlugs,
    blogSlugs,
    visaSlugs,
    scholarshipSlugs,
  ] = await Promise.all([
    listPublishedUniversitySlugs(),
    listPublishedGuideSlugs({ excludeCategory: "comparison" }),
    listPublishedGuideSlugs({ category: "comparison" }),
    listAllBlogPostSlugs(),
    listPublishedVisaSlugs(),
    listPublishedScholarshipSlugs(),
  ]);

  const subjects = await listPublishedSubjects();

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const universityEntries: MetadataRoute.Sitemap = universitySlugs.map((slug) => ({
    url: `${SITE_URL}/universities/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Per-university deadline pages, only for universities with a firm date or
  // verified rolling guidance (the rest are noindex, see deadline-detail.ts).
  const universityDeadlineEntries: MetadataRoute.Sitemap = universitySlugs
    .filter((slug) => DEADLINE_PAGE_INDEXED.has(slug))
    .map((slug) => ({
      url: `${SITE_URL}/universities/${slug}/deadlines`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const guideEntries: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${SITE_URL}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Only the hand-written comparison guides. The auto-generated
  // /compare/{a}-vs-{b} stat pages are noindex, so they stay out of the sitemap.
  const comparisonEntries: MetadataRoute.Sitemap = comparisonSlugs.map((slug) => ({
    url: `${SITE_URL}/compare/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const visaEntries: MetadataRoute.Sitemap = visaSlugs.map((slug) => ({
    url: `${SITE_URL}/visas/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const scholarshipEntries: MetadataRoute.Sitemap = scholarshipSlugs.map((slug) => ({
    url: `${SITE_URL}/scholarships/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const collectionEntries: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({
    url: `${SITE_URL}/best/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const cityEntries: MetadataRoute.Sitemap = CITY_COSTS.map((c) => ({
    url: `${SITE_URL}/cost-of-living/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Only subjects with a curated write-up. Templated-fallback subject pages
  // are noindex, so they stay out of the sitemap.
  const subjectEntries: MetadataRoute.Sitemap = subjects
    .filter((s) => SUBJECT_CONTENT[s.slug])
    .map((s) => ({
      url: `${SITE_URL}/study/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const originCountryEntries: MetadataRoute.Sitemap = ORIGIN_COUNTRY_SLUGS.map(
    (slug) => ({
      url: `${SITE_URL}/international/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  const stateEntries: MetadataRoute.Sitemap = AU_STATES.map((s) => ({
    url: `${SITE_URL}/universities/in/${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Program pages (/universities/{slug}/programs/{id}) are deliberately kept
  // out of the sitemap and are noindex: today they are a thin data template
  // over an unverified dataset. They stay live for users and internal links.
  // When high-demand programs are rebuilt with real sourced content, add
  // those back here and remove their noindex.

  return [
    ...staticEntries,
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
  ];
}
