import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/collections";
import { SUBJECT_CONTENT } from "@/lib/subjects";
import { CITY_COSTS } from "@/lib/cities";
import { SITE_URL } from "@/lib/site-config";
import { listAllBlogPostSlugs } from "@/lib/queries/public-blog-posts";
import { listPublishedGuideSlugs } from "@/lib/queries/public-guides";
import { listPublishedProgramsForSitemap } from "@/lib/queries/public-programs";
import { listPublishedScholarshipSlugs } from "@/lib/queries/public-scholarships";
import { listPublishedSubjects } from "@/lib/queries/public-subjects";
import { listPublishedUniversitySlugs } from "@/lib/queries/public-universities";
import { listPublishedVisaSlugs } from "@/lib/queries/public-visas";

export const revalidate = 3600;

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/deadlines", priority: 0.9, changeFrequency: "daily" },
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
  { path: "/search", priority: 0.4, changeFrequency: "monthly" },
  { path: "/about", priority: 0.3, changeFrequency: "yearly" },
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
    programs,
  ] = await Promise.all([
    listPublishedUniversitySlugs(),
    listPublishedGuideSlugs({ excludeCategory: "comparison" }),
    listPublishedGuideSlugs({ category: "comparison" }),
    listAllBlogPostSlugs(),
    listPublishedVisaSlugs(),
    listPublishedScholarshipSlugs(),
    listPublishedProgramsForSitemap(),
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

  const programEntries: MetadataRoute.Sitemap = programs
    .filter((p) => p.university)
    .map((p) => ({
      url: `${SITE_URL}/universities/${p.university!.slug}/programs/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    ...staticEntries,
    ...universityEntries,
    ...guideEntries,
    ...comparisonEntries,
    ...blogEntries,
    ...visaEntries,
    ...scholarshipEntries,
    ...collectionEntries,
    ...subjectEntries,
    ...cityEntries,
    ...programEntries,
  ];
}
