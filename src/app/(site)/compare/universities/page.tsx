import Link from "next/link";
import { ComparisonTable } from "@/components/site/ComparisonTable";
import { UniversityPicker } from "@/components/site/UniversityPicker";
import {
  getUniversitiesForComparisonBySlugs,
  listPublishedUniversityOptions,
} from "@/lib/queries/public-universities";

export const metadata = {
  title: "Compare Universities",
  description:
    "Compare tuition, admission requirements, deadlines, and acceptance rates for any two or more universities side by side.",
  alternates: { canonical: "/compare/universities" },
};

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

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Compare universities
      </h1>

      {slugs.length > 0 && universities.length < 2 && (
        <p className="mt-4 font-body text-sm text-status-closed">
          Couldn&rsquo;t find enough of those universities to compare — pick again below.
        </p>
      )}

      {universities.length >= 2 && (
        <div className="mt-6">
          <ComparisonTable universities={universities} />
        </div>
      )}

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
    </main>
  );
}
