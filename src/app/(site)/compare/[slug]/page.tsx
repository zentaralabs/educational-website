import Link from "next/link";
import { notFound } from "next/navigation";
import { ComparisonTable } from "@/components/site/ComparisonTable";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import {
  getGuideRelatedContent,
  getPublishedGuide,
  listPublishedGuideSlugs,
} from "@/lib/queries/public-guides";
import { getUniversitiesForComparison } from "@/lib/queries/public-universities";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listPublishedGuideSlugs({ category: "comparison" });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getPublishedGuide(slug);
  if (!guide || guide.category !== "comparison") return {};
  return {
    title: guide.title,
    description: guide.excerpt ?? guide.content.slice(0, 155),
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getPublishedGuide(slug);
  if (!guide || guide.category !== "comparison") notFound();

  const related = await getGuideRelatedContent(guide.id);
  const universities = await getUniversitiesForComparison(
    related.universities.map((u) => u.id),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <p className="font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
        Comparison
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

      {universities.length >= 2 && (
        <div className="mt-6">
          <ComparisonTable universities={universities} />
        </div>
      )}

      <div className="mt-8">
        <GuideContent content={guide.content} />
      </div>

      <div className="mt-10 border-t border-ink/10 pt-4">
        <LastVerified date={guide.last_verified_at} sources={guide.source_urls} />
      </div>

      {related.guides.length > 0 && (
        <div className="mt-8 border-t border-ink/10 pt-6">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Related guides
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
          </ul>
        </div>
      )}
    </main>
  );
}
