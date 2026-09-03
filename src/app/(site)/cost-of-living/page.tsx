import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import {
  CITY_COSTS,
  annualHigh,
  annualLow,
} from "@/lib/cities";
import { formatCurrency } from "@/lib/format";
import { SITE_YEAR } from "@/lib/site-config";
import { pageMetadata } from "@/lib/page-metadata";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { itemListJsonLd } from "@/lib/itemlist-jsonld";
import { JsonLd } from "@/lib/json-ld";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `Cost of Living in Australia for Students ${SITE_YEAR}`,
  description:
    "Estimated annual cost of living for international students in Sydney, Melbourne, Brisbane, Perth, Adelaide, and Canberra, broken down by rent, food, transport, and other essentials.",
  path: "/cost-of-living",
  type: "website",
});

export default function CostOfLivingIndexPage() {
  const ordered = [...CITY_COSTS].sort((a, b) => annualLow(a) - annualLow(b));

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Cost of living" }];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd
        data={itemListJsonLd({
          name: "Cost of living for international students by Australian city",
          items: ordered.map((c) => ({
            path: `/cost-of-living/${c.slug}`,
            name: `Cost of living in ${c.name}`,
          })),
        })}
      />

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Cost of living in Australia for international students
      </h1>
      <p className="mt-3 font-body text-base leading-relaxed text-slate">
        Rent is the one thing that really moves your budget between cities;
        food, transport, and everything else costs about the same across the
        country. These are estimated annual totals sharing accommodation,
        cheapest city first. The Australian Government&rsquo;s minimum for a
        student visa is {formatCurrency(29710, "AUD")} a year.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {ordered.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/cost-of-living/${c.slug}`}
              className="card card-hover group flex items-center justify-between gap-4 p-5"
            >
              <span>
                <span className="font-display text-lg font-semibold text-ink group-hover:underline">
                  {c.name}
                </span>
                <span className="mt-0.5 block font-body text-sm text-slate">
                  {c.blurb}
                </span>
              </span>
              <span className="flex flex-shrink-0 flex-col items-end">
                <span className="font-utility text-sm font-semibold text-status-open">
                  {formatCurrency(annualLow(c), "AUD")}
                </span>
                <span className="font-utility text-xs text-slate">
                  to {formatCurrency(annualHigh(c), "AUD")}/yr
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 flex items-center gap-2 font-body text-sm text-slate">
        <ArrowUpRightIcon className="h-3.5 w-3.5 text-slate" />
        See also:{" "}
        <Link
          href="/guides/real-cost-of-studying-in-australia"
          className="text-status-open underline underline-offset-2"
        >
          the full cost of studying in Australia
        </Link>
      </p>
    </main>
  );
}
