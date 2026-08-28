import { BestBrowser } from "@/components/site/BestBrowser";
import {
  BEST_CATEGORY_LABELS,
  BEST_CATEGORY_ORDER,
  COLLECTIONS,
} from "@/lib/collections";

export const revalidate = 3600;

export const metadata = {
  title: "Best universities in Australia for international students, by category",
  description:
    "Shortlists of Australian universities ranked by first-year cost, number of intakes, regional migration advantages, application fees, and automatic scholarships. Each list shows how it was built.",
  alternates: { canonical: "/best" },
};

export default function BestIndexPage() {
  const collections = COLLECTIONS.map((c) => ({
    slug: c.slug,
    title: c.title,
    blurb: c.intro[0],
    category: c.category,
  }));

  const present = new Set(collections.map((c) => c.category));
  const groups = BEST_CATEGORY_ORDER.filter((c) => present.has(c)).map((key) => ({
    key,
    label: BEST_CATEGORY_LABELS[key],
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Best universities in Australia, by category
      </h1>
      <p className="mt-2 max-w-2xl font-body text-base text-slate">
        There is no single &ldquo;best&rdquo; university, so this is a set of
        shortlists built from the data on this site: cheapest first year, most
        intakes per year, regional migration advantages, no application fee,
        automatic scholarships, and more. Each list shows how it was put
        together, not just the result.
      </p>

      <BestBrowser collections={collections} groups={groups} />
    </main>
  );
}
