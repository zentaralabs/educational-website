import Link from "next/link";
import { UniversityPicker } from "@/components/site/UniversityPicker";
import { COMPARISON_PAIRS, vsSlug } from "@/lib/comparisons";
import { listPublishedGuides } from "@/lib/queries/public-guides";
import { listPublishedUniversityOptions } from "@/lib/queries/public-universities";

export const revalidate = 3600;

export const metadata = {
  title: "Compare Australian Universities: Cost, Entry & Deadlines",
  description:
    "Side-by-side comparisons of Australian universities for international students: tuition, selectivity, entry requirements, and application deadlines.",
  alternates: { canonical: "/compare" },
};

export default async function CompareIndexPage() {
  const [comparisons, options] = await Promise.all([
    listPublishedGuides({ category: "comparison" }),
    listPublishedUniversityOptions(),
  ]);
  const nameBySlug = new Map(options.map((o) => [o.slug, o.name]));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Compare
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        Cross-country and cross-university comparisons, with real cost and
        admissions data side by side.
      </p>

      <div className="mt-8">
        <UniversityPicker universities={options} />
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">
        Popular head-to-heads
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {COMPARISON_PAIRS.map(([a, b]) => (
          <li key={vsSlug(a, b)}>
            <Link
              href={`/compare/${vsSlug(a, b)}`}
              className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
            >
              {nameBySlug.get(a) ?? a} vs {nameBySlug.get(b) ?? b}
            </Link>
          </li>
        ))}
      </ul>

      {comparisons.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-lg font-semibold text-ink">
            Written comparisons
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {comparisons.map((c) => (
            <li key={c.slug} className="border-b border-ink/10 pb-4">
              <Link href={`/compare/${c.slug}`} className="group">
                <h3 className="font-display text-lg font-semibold text-ink group-hover:underline">
                  {c.title}
                </h3>
                {c.excerpt && (
                  <p className="mt-1 font-body text-base text-slate">{c.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
          </ul>
        </>
      )}
    </main>
  );
}
