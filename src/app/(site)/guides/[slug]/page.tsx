import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { ArrowUpRightIcon, CheckBadgeIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { extractFaqItems } from "@/lib/extract-faq";
import { authorInitials } from "@/lib/format";
import { GUIDE_CATEGORY_LABELS } from "@/lib/guide-categories";
import {
  getGuideRelatedContent,
  getPublishedGuide,
  listPublishedGuideSlugs,
} from "@/lib/queries/public-guides";

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
  const faqItems = extractFaqItems(guide.content);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    { label: guide.title },
  ];

  const jsonLdBlocks: Record<string, unknown>[] = [breadcrumbJsonLd(breadcrumbs)];
  if (faqItems.length > 0) {
    jsonLdBlocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {GUIDE_CATEGORY_LABELS[guide.category] ?? guide.category}
          {guide.country && ` · ${guide.country.name}`}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          {guide.title}
        </h1>

        {guide.author && (
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink font-utility text-xs font-semibold text-paper">
              {authorInitials(guide.author.name)}
            </span>
            <p className="font-body text-sm text-slate">
              By <span className="font-medium text-ink">{guide.author.name}</span>
              {guide.author.credentials && `, ${guide.author.credentials}`}
              {guide.reviewed_by && <>, reviewed by {guide.reviewed_by.name}</>}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <GuideContent content={guide.content} />
      </div>

      <div className="mt-10 flex items-center gap-2 rounded-xl bg-status-open/5 px-4 py-3">
        <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-status-open" />
        <LastVerified date={guide.last_verified_at} sources={guide.source_urls} />
      </div>

      {(related.guides.length > 0 || related.universities.length > 0) && (
        <div className="mt-10 border-t border-ink/10 pt-6">
          <h2 className="mb-4 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Related
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-mist px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
                >
                  <span className="font-body text-sm font-medium text-ink">{g.title}</span>
                  <ArrowUpRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                </Link>
              </li>
            ))}
            {related.universities.map((u) => (
              <li key={u.slug}>
                <Link
                  href={`/universities/${u.slug}`}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-mist px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
                >
                  <span className="font-body text-sm font-medium text-ink">{u.name}</span>
                  <ArrowUpRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
