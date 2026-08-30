import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { VisasBrowser } from "@/components/site/VisasBrowser";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { itemListJsonLd } from "@/lib/itemlist-jsonld";
import { listPublishedVisas } from "@/lib/queries/public-visas";
import { VISA_CATEGORY_LABELS, VISA_CATEGORY_ORDER } from "@/lib/visa-categories";

export const revalidate = 3600;

export const metadata = {
  title: "Australian Student & Skilled Visa Subclasses Explained",
  description:
    "Plain-English breakdowns of Australia's student, graduate, skilled, and employer-sponsored visa subclasses covering eligibility, points, costs, and the pathway to permanent residence.",
  alternates: { canonical: "/visas" },
};

export default async function VisasIndexPage() {
  const visas = await listPublishedVisas();

  const presentCategories = new Set(visas.map((v) => v.category));
  const groups = [
    ...VISA_CATEGORY_ORDER.filter((c) => presentCategories.has(c)),
    ...[...presentCategories].filter((c) => !VISA_CATEGORY_ORDER.includes(c)),
  ].map((key) => ({ key, label: VISA_CATEGORY_LABELS[key] ?? key }));

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Visas" }];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      {visas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              itemListJsonLd({
                name: "Australian student, graduate, and skilled visa subclasses",
                items: visas.map((v) => ({ path: `/visas/${v.slug}`, name: v.name })),
              }),
            ),
          }}
        />
      )}

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Australian student and skilled visa subclasses
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        What each subclass is for, who qualifies, what it costs, and whether it
        leads to permanent residence. Every figure is dated and sourced.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/visas/points-calculator"
          className="flex items-center justify-between gap-3 rounded-2xl border border-status-open/30 bg-status-open/5 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <span>
            <span className="font-display text-lg font-semibold text-ink">
              Points calculator
            </span>
            <span className="mt-1 block font-body text-sm text-slate">
              Add up your score for the 189, 190, and 491 skilled visas.
            </span>
          </span>
          <ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-slate" />
        </Link>
        <Link
          href="/visas/invitation-rounds"
          className="flex items-center justify-between gap-3 rounded-2xl border border-status-pending/30 bg-status-pending/5 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <span>
            <span className="font-display text-lg font-semibold text-ink">
              Invitation rounds
            </span>
            <span className="mt-1 block font-body text-sm text-slate">
              Round-by-round history of invitations issued and points cut-offs.
            </span>
          </span>
          <ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-slate" />
        </Link>
      </div>

      {visas.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No visa subclasses published yet.
        </p>
      ) : (
        <VisasBrowser visas={visas} groups={groups} />
      )}
    </main>
  );
}
