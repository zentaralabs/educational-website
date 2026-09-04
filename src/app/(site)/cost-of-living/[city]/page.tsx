import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqSection } from "@/components/site/FaqSection";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import {
  CITY_COSTS,
  annualHigh,
  annualLow,
  getCity,
  OSHC_WEEKLY,
  weeklyHigh,
  weeklyLow,
} from "@/lib/cities";
import { faqJsonLd } from "@/lib/faq";
import { formatCurrency } from "@/lib/format";
import { listPublishedUniversityOptions } from "@/lib/queries/public-universities";
import { SITE_YEAR } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return CITY_COSTS.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return {};
  const title = composeTitle(`Cost of Living in ${c.name} ${SITE_YEAR}`, [
    "International Student Budget",
    "Student Budget",
  ]);
  const description = `What it costs to live in ${c.name} as an international student: rent, food, transport, and bills, with an estimated annual total of ${formatCurrency(annualLow(c), "AUD")} to ${formatCurrency(annualHigh(c), "AUD")} sharing accommodation.`;
  return pageMetadata({
    title,
    description,
    path: `/cost-of-living/${city}`,
    type: "article",
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="font-body text-sm text-ink">{label}</span>
      <span className="font-utility text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

const range = (lo: number, hi: number) =>
  lo === hi
    ? `${formatCurrency(lo, "AUD")}`
    : `${formatCurrency(lo, "AUD")} to ${formatCurrency(hi, "AUD")}`;

export default async function CityCostPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();

  const options = await listPublishedUniversityOptions();
  const nameBySlug = new Map(options.map((o) => [o.slug, o.name]));
  const unis = c.universitySlugs
    .map((slug) => ({ slug, name: nameBySlug.get(slug) }))
    .filter((u): u is { slug: string; name: string } => Boolean(u.name));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Cost of living", href: "/cost-of-living" },
    { label: c.name },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd data={faqJsonLd(c.faq)} />

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-wide text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {c.state} · Cost of living
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          Cost of living in {c.name}
        </h1>
        <p className="mt-4 font-body text-base leading-relaxed text-slate">
          {c.blurb}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-status-open/25 bg-status-open/5 p-5">
        <p className="font-utility text-xs font-semibold tracking-wide text-slate uppercase">
          Estimated annual cost, sharing accommodation
        </p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink">
          {formatCurrency(annualLow(c), "AUD")} to{" "}
          {formatCurrency(annualHigh(c), "AUD")}
        </p>
        <p className="mt-2 font-body text-sm text-slate">
          That is roughly {formatCurrency(weeklyLow(c), "AUD")} to{" "}
          {formatCurrency(weeklyHigh(c), "AUD")} a week. Add your tuition on top.
          The Australian Government requires you to show{" "}
          {formatCurrency(29710, "AUD")} in living funds for the student visa.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          Weekly breakdown
        </h2>
        <div className="overflow-hidden rounded-xl border border-line divide-y divide-line">
          <Row
            label="Rent, room in a shared house"
            value={`${range(c.rentSharedLow, c.rentSharedHigh)}/wk`}
          />
          <Row
            label="Rent, own studio or one-bedroom"
            value={`${range(c.rentStudioLow, c.rentStudioHigh)}/wk`}
          />
          <Row label="Groceries and eating out" value={`${formatCurrency(c.food, "AUD")}/wk`} />
          <Row label="Public transport" value={`${formatCurrency(c.transport, "AUD")}/wk`} />
          <Row label="Electricity, gas, water" value={`${formatCurrency(c.utilities, "AUD")}/wk`} />
          <Row label="Phone and internet" value={`${formatCurrency(c.phoneInternet, "AUD")}/wk`} />
          <Row label="Overseas Student Health Cover" value={`about ${formatCurrency(OSHC_WEEKLY, "AUD")}/wk`} />
          <Row label="Going out, activities, incidentals" value={`${formatCurrency(c.entertainment, "AUD")}/wk`} />
        </div>
        <p className="mt-2 font-body text-xs text-slate">
          Estimates for {SITE_YEAR}, based on published international-student
          cost ranges. Rent is the figure that varies most, by suburb and by how
          close you are to campus.
        </p>
      </section>

      {unis.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">
            Universities in {c.name}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {unis.map((u) => (
              <li key={u.slug}>
                <Link
                  href={`/universities/${u.slug}`}
                  className="inline-block rounded-full border border-line bg-mist px-3.5 py-1.5 font-body text-sm text-ink transition-colors hover:border-status-open/40 hover:underline"
                >
                  {u.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-body text-sm text-slate">
            See the{" "}
            <Link
              href={`/best/cheapest-universities-in-${c.slug}-for-international-students`}
              className="text-status-open underline underline-offset-2"
            >
              cheapest universities in {c.name}
            </Link>{" "}
            ranked by first-year budget.
          </p>
        </section>
      )}

      <FaqSection heading={`Cost of living in ${c.name}: common questions`} items={c.faq} />

      <div className="mt-10 border-t border-line pt-6">
        <Link
          href="/cost-of-living"
          className="font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
        >
          ← All cities
        </Link>
      </div>
    </main>
  );
}
