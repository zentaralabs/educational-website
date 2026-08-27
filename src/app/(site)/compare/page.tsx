import Link from "next/link";
import { UniversityPicker } from "@/components/site/UniversityPicker";
import { listPublishedGuides } from "@/lib/queries/public-guides";
import { listPublishedUniversityOptions } from "@/lib/queries/public-universities";

export const revalidate = 3600;

export const metadata = {
  title: "Compare Universities",
  description:
    "Cross-country and cross-university comparisons — costs, acceptance rates, and requirements side by side.",
  alternates: { canonical: "/compare" },
};

export default async function CompareIndexPage() {
  const [comparisons, options] = await Promise.all([
    listPublishedGuides({ category: "comparison" }),
    listPublishedUniversityOptions(),
  ]);

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
        Written comparisons
      </h2>

      {comparisons.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No comparisons published yet.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
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
      )}
    </main>
  );
}
