import { BestBrowser } from "@/components/site/BestBrowser";
import {
  BEST_CATEGORY_LABELS,
  BEST_CATEGORY_ORDER,
  COLLECTIONS,
} from "@/lib/collections";
import { pageMetadata } from "@/lib/page-metadata";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { itemListJsonLd } from "@/lib/itemlist-jsonld";
import { JsonLd } from "@/lib/json-ld";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Best Universities in Australia for International Students",
  description:
    "Shortlists of Australian universities ranked by first-year cost, number of intakes, regional migration advantages, application fees, and automatic scholarships. Each list shows how it was built.",
  path: "/best",
  type: "website",
});

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

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Best universities" }];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd
        data={itemListJsonLd({
          name: "Shortlists of Australian universities for international students",
          items: collections.map((c) => ({ path: `/best/${c.slug}`, name: c.title })),
        })}
      />

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Best universities in Australia, by category
      </h1>
      <div className="mt-2 flex max-w-2xl flex-col gap-3 font-body text-base leading-relaxed text-slate">
        <p>
          There is no single &ldquo;best&rdquo; university, so this is a set of
          shortlists built from the data on this site: cheapest first year, most
          intakes per year, regional campuses that earn migration points, no
          application fee, automatic scholarships, and more.
        </p>
        <p>
          Each list ranks on one measurable thing and shows its working, so you
          can see why a university placed where it did and decide whether that
          factor matters to you. They are a starting point, not a league table.
          They do not score teaching quality, research reputation, or graduate
          outcomes, and a university can top one list while sitting near the
          bottom of another.
        </p>
        <p>
          The lists are most useful in combination. Decide which two or three
          factors actually drive your choice, commonly cost, intake timing, and
          whether the campus counts as regional for migration, then open each
          university for its full profile: deadlines, first-year budget, entry
          requirements, and scholarships.
        </p>
      </div>

      <BestBrowser collections={collections} groups={groups} />
    </main>
  );
}
