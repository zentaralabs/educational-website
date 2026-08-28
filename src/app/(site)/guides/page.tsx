import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { PostCard } from "@/components/site/PostCard";
import { GUIDE_CATEGORY_LABELS } from "@/lib/guide-categories";
import { listPublishedGuides, type PublicGuideListRow } from "@/lib/queries/public-guides";

export const revalidate = 3600;

export const metadata = {
  title: "Guides",
  description:
    "How-to guides for personal statements, letters of recommendation, transfers, financial aid, and international applications.",
  alternates: { canonical: "/guides" },
};

// Display order for the category sections.
const CATEGORY_ORDER = ["how-to", "country-guide", "test-prep"] as const;

const CATEGORY_BLURB: Record<string, string> = {
  "how-to": "Step-by-step walkthroughs of the parts of an application you actually write.",
  "country-guide": "How the system works in Australia: fees, visas, accreditation, and the path to PR.",
  "test-prep": "Choosing and preparing for the English and admissions tests universities ask for.",
};

export default async function GuidesIndexPage() {
  const guides = await listPublishedGuides({ excludeCategory: "comparison" });

  const byCategory = new Map<string, PublicGuideListRow[]>();
  for (const g of guides) {
    const list = byCategory.get(g.category) ?? [];
    list.push(g);
    byCategory.set(g.category, list);
  }
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
    ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c as (typeof CATEGORY_ORDER)[number])),
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Guides
      </h1>
      <p className="mt-2 max-w-2xl font-body text-base text-slate">
        Personal statements, letters of recommendation, transfers, financial aid,
        test prep, and more. Every guide is fact-checked and dated.
      </p>

      <Link
        href="/best"
        className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-line bg-mist px-5 py-4 transition-colors duration-150 hover:border-status-open/40"
      >
        <span>
          <span className="font-body text-sm font-semibold text-ink">
            Looking for decision guides?
          </span>
          <span className="mt-0.5 block font-body text-sm text-slate">
            Ranked shortlists of Australian universities by cost, intakes, and migration advantages.
          </span>
        </span>
        <ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-slate" />
      </Link>

      {guides.length === 0 ? (
        <p className="mt-10 font-body text-base text-slate">No guides published yet.</p>
      ) : (
        <div className="mt-12 flex flex-col gap-12">
          {orderedCategories.map((category) => {
            const items = byCategory.get(category) ?? [];
            return (
              <section key={category}>
                <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-2">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    {GUIDE_CATEGORY_LABELS[category] ?? category}
                  </h2>
                  <span className="font-utility text-xs text-slate">
                    {items.length} {items.length === 1 ? "guide" : "guides"}
                  </span>
                </div>
                {CATEGORY_BLURB[category] && (
                  <p className="mb-5 font-body text-sm text-slate">{CATEGORY_BLURB[category]}</p>
                )}
                <div className="flex flex-col gap-3">
                  {items.map((g) => (
                    <PostCard
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      eyebrow={g.country ? g.country.name : undefined}
                      title={g.title}
                      excerpt={g.excerpt}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
