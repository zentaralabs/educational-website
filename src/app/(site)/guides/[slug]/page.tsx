import { notFound, redirect } from "next/navigation";
import { ArticleMeta } from "@/components/site/ArticleMeta";
import { ArticleShell } from "@/components/site/ArticleShell";
import { FaqSection } from "@/components/site/FaqSection";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { CheckBadgeIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { extractFaqItems } from "@/lib/extract-faq";
import { faqJsonLd } from "@/lib/faq";
import { GUIDE_CATEGORY_LABELS } from "@/lib/guide-categories";
import {
  getGuideRelatedContent,
  getPublishedGuide,
  listPublishedGuideSlugs,
} from "@/lib/queries/public-guides";
import { readingMinutes } from "@/lib/reading";
import { guideRelated } from "@/lib/related-content";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { extractToc } from "@/lib/toc";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listPublishedGuideSlugs({ excludeCategory: "comparison" });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getPublishedGuide(slug);
  if (!guide) return {};
  const title = guide.title;
  const description = guide.excerpt ?? guide.content.slice(0, 155);
  const url = `/guides/${slug}`;
  const ogImage = `${url}/og`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getPublishedGuide(slug);
  if (!guide) notFound();

  // Comparison guides live at /compare/[slug] — keep one canonical URL per guide.
  if (guide.category === "comparison") redirect(`/compare/${guide.slug}`);

  const related = await getGuideRelatedContent(guide.id);
  const faqItems = extractFaqItems(guide.content).map((f) => ({ q: f.question, a: f.answer }));
  const toc = extractToc(guide.content);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    { label: guide.title },
  ];

  const guideUrl = `${SITE_URL}/guides/${guide.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt ?? undefined,
    url: guideUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": guideUrl },
    image: `${guideUrl}/og`,
    datePublished: guide.created_at ?? undefined,
    // last_verified_at is the real content-freshness signal; updated_at can
    // move on incidental row writes, so it's only a fallback.
    dateModified:
      guide.last_verified_at ?? guide.updated_at ?? guide.created_at ?? undefined,
    author: guide.author
      ? {
          "@type": "Person",
          name: guide.author.name,
          description: guide.author.credentials ?? undefined,
        }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  const jsonLdBlocks: Record<string, unknown>[] = [
    articleJsonLd,
    breadcrumbJsonLd(breadcrumbs),
  ];
  if (faqItems.length > 0) jsonLdBlocks.push(faqJsonLd(faqItems));

  return (
    <>
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <ArticleShell
        breadcrumbs={breadcrumbs}
        eyebrow={
          <>
            {GUIDE_CATEGORY_LABELS[guide.category] ?? guide.category}
            {guide.country && ` · ${guide.country.name}`}
          </>
        }
        title={guide.title}
        meta={
          <ArticleMeta
            author={guide.author}
            reviewedBy={guide.reviewed_by}
            readingMinutes={readingMinutes(guide.content)}
            date={guide.last_verified_at}
            dateLabel="Updated"
          />
        }
        toc={toc}
        footer={
          <>
            <div className="mt-10 flex items-start gap-2 rounded-xl bg-status-open/5 px-4 py-3">
              <CheckBadgeIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-status-open" />
              <LastVerified date={guide.last_verified_at} sources={guide.source_urls} />
            </div>

            {faqItems.length > 0 && (
              <FaqSection heading="Common questions" items={faqItems} />
            )}

            <RelatedLinks
              className="mt-12 border-t border-line pt-8"
              items={(() => {
                const dbLinks = [
                  ...related.guides.map((g) => ({
                    href: `/guides/${g.slug}`,
                    label: g.title,
                  })),
                  ...related.universities.map((u) => ({
                    href: `/universities/${u.slug}`,
                    label: u.name,
                  })),
                ];
                const seen = new Set(dbLinks.map((l) => l.href));
                const curated = guideRelated(guide.slug).filter(
                  (l) => !seen.has(l.href),
                );
                return [...dbLinks, ...curated].slice(0, 6);
              })()}
            />
          </>
        }
      >
        <GuideContent content={guide.content} />
      </ArticleShell>
    </>
  );
}
