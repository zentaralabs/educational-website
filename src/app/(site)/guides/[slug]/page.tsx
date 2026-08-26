import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { extractFaqItems } from "@/lib/extract-faq";
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
    twitter: { card: "summary", title, description },
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
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <p className="font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
        {guide.category}
        {guide.country && ` · ${guide.country.name}`}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink text-balance">
        {guide.title}
      </h1>

      {guide.author && (
        <p className="mt-3 font-body text-sm text-slate">
          By {guide.author.name}
          {guide.author.credentials && ` — ${guide.author.credentials}`}
          {guide.reviewed_by && <>, reviewed by {guide.reviewed_by.name}</>}
        </p>
      )}

      <div className="mt-6">
        <GuideContent content={guide.content} />
      </div>

      <div className="mt-10 border-t border-ink/10 pt-4">
        <LastVerified date={guide.last_verified_at} sources={guide.source_urls} />
      </div>

      {(related.guides.length > 0 || related.universities.length > 0) && (
        <div className="mt-8 border-t border-ink/10 pt-6">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Related
          </h2>
          <ul className="flex flex-col gap-2">
            {related.guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="font-body text-sm text-status-open underline underline-offset-2"
                >
                  {g.title}
                </Link>
              </li>
            ))}
            {related.universities.map((u) => (
              <li key={u.slug}>
                <Link
                  href={`/universities/${u.slug}`}
                  className="font-body text-sm text-status-open underline underline-offset-2"
                >
                  {u.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
