import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArticleMeta } from "@/components/site/ArticleMeta";
import { ArticleShell } from "@/components/site/ArticleShell";
import { FaqSection } from "@/components/site/FaqSection";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { ArrowUpRightIcon, CheckBadgeIcon } from "@/components/site/icons";
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

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description },
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
    datePublished: guide.created_at ?? undefined,
    dateModified:
      guide.updated_at ?? guide.last_verified_at ?? guide.created_at ?? undefined,
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

            {(related.guides.length > 0 || related.universities.length > 0) && (
              <div className="mt-12 border-t border-line pt-8">
                <h2 className="mb-4 font-body text-xs font-semibold tracking-widest text-slate uppercase">
                  Keep reading
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {related.guides.map((g) => (
                    <RelatedLink key={g.slug} href={`/guides/${g.slug}`} label={g.title} />
                  ))}
                  {related.universities.map((u) => (
                    <RelatedLink key={u.slug} href={`/universities/${u.slug}`} label={u.name} />
                  ))}
                </ul>
              </div>
            )}
          </>
        }
      >
        <GuideContent content={guide.content} />
      </ArticleShell>
    </>
  );
}

function RelatedLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-paper px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/40 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
      >
        <span className="font-body text-sm font-medium text-ink">{label}</span>
        <ArrowUpRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
      </Link>
    </li>
  );
}
