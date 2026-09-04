import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ComparisonTable } from "@/components/site/ComparisonTable";
import { UniversityPicker } from "@/components/site/UniversityPicker";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import {
  getUniversitiesForComparisonBySlugs,
  listPublishedUniversityOptions,
} from "@/lib/queries/public-universities";
import { listPageCanonical } from "@/lib/list-page-metadata";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}): Promise<Metadata> {
  const { u } = await searchParams;

  return {
    ...pageMetadata({
      title: "Compare Australian Universities Side by Side",
      description:
        "Pick any two or more Australian universities and compare tuition, admission requirements, deadlines, and selectivity in one table.",
      path: "/compare/universities",
      type: "website",
    }),
    ...listPageCanonical({
      base: "/compare/universities",
      isFiltered: Boolean(u?.trim()),
    }),
  };
}

export default async function CompareUniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}) {
  const { u = "" } = await searchParams;
  const slugs = u
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [universities, options] = await Promise.all([
    getUniversitiesForComparisonBySlugs(slugs),
    listPublishedUniversityOptions(),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
    { label: "Universities" },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-8 pb-16">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={breadcrumbs} />

        <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
          <p className="flex items-center gap-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
            Side-by-side
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
            Compare universities
          </h1>
          <p className="mt-2 font-body text-base text-ink/80">
            Pick any two or more universities to compare tuition, selectivity, and requirements.
          </p>
        </div>

        {slugs.length > 0 && universities.length < 2 && (
          <p className="mt-4 font-body text-sm text-status-closed">
            Couldn&rsquo;t find enough of those universities to compare. Pick again below.
          </p>
        )}
      </div>

      {universities.length >= 2 && (
        <div className="mt-6">
          <ComparisonTable universities={universities} />
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <div className="mt-8">
          <UniversityPicker
            universities={options}
            initialSelection={universities.map((u) => u.slug)}
          />
        </div>

        <Link
          href="/compare"
          className="mt-8 inline-block font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
        >
          ← Back to comparisons
        </Link>
      </div>
    </main>
  );
}
