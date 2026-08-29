import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqSection } from "@/components/site/FaqSection";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd } from "@/lib/faq";
import {
  AU_STATES,
  AU_STATE_CONTENT,
  GO8_SLUGS,
  isRegionalCity,
  stateBySlug,
  statesFromCity,
} from "@/lib/australia";
import { formatCurrency } from "@/lib/format";
import { SITE_URL, SITE_YEAR } from "@/lib/site-config";
import { listCollectionUniversities } from "@/lib/queries/public-collections";

export const revalidate = 3600;

/** "the Australian Capital Territory" / "the Northern Territory" read
 * correctly; the states do not take an article. */
function withArticle(code: string, name: string) {
  return code === "ACT" || code === "NT" ? `the ${name}` : name;
}

export function generateStaticParams() {
  return AU_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const s = stateBySlug(state);
  if (!s) return {};
  const name = withArticle(s.code, s.name);
  const title = `Universities in ${name} for International Students (${SITE_YEAR})`;
  const description = `Every university in ${name}, with international tuition, English requirements, intakes, and whether the campus counts as regional for skilled-migration points.`;
  const url = `/universities/in/${state}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function UniversitiesByStatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const s = stateBySlug(state);
  if (!s) notFound();

  const content = AU_STATE_CONTENT[s.code];
  const name = withArticle(s.code, s.name);
  const all = await listCollectionUniversities();
  const unis = all
    .filter((u) => statesFromCity(u.city).includes(s.code))
    .sort((a, b) => a.name.localeCompare(b.name));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Universities", href: "/universities" },
    { label: s.name },
  ];

  const faq = [
    {
      q: `How many universities are there in ${name}?`,
      a: `This directory lists ${unis.length} ${
        unis.length === 1 ? "university" : "universities"
      } in ${name} that enrol international students. Some multi-state universities also operate campuses here but are listed under their home state.`,
    },
    {
      q: `Does studying in ${name} count as regional for skilled migration?`,
      a: content.migration,
    },
    {
      q: `Which is the cheapest university in ${name}?`,
      a: `Tuition varies by course more than by university, but the regional and newer universities are generally cheaper than the Group of Eight. Each card below shows the lowest tuition on record; the affordable-universities shortlist ranks them nationally.`,
    },
  ];

  const jsonLd: Record<string, unknown>[] = [
    breadcrumbJsonLd(breadcrumbs),
    faqJsonLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Universities in ${s.name}`,
      numberOfItems: unis.length,
      itemListElement: unis.map((u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/universities/${u.slug}`,
        name: u.name,
      })),
    },
  ];

  const otherStates = AU_STATES.filter((x) => x.slug !== s.slug);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Universities in {withArticle(s.code, s.name)}
      </h1>

      <div className="mt-4 flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
        <p>{content.intro}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-status-open/25 bg-status-open/5 p-5">
        <h2 className="font-body text-xs font-semibold tracking-widest text-slate uppercase">
          Regional migration
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-ink">
          {content.migration}{" "}
          <Link
            href="/visas/points-calculator"
            className="font-medium text-status-open underline underline-offset-2"
          >
            Check your points
          </Link>
          .
        </p>
      </div>

      {unis.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No universities are currently listed for {s.name}.
        </p>
      ) : (
        <ol className="mt-8 flex flex-col gap-3">
          {unis.map((u) => (
            <li key={u.slug}>
              <Link
                href={`/universities/${u.slug}`}
                className="card card-hover group flex flex-col gap-1.5 p-5"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-display text-lg font-semibold text-ink group-hover:underline">
                    {u.name}
                  </span>
                  <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                </span>
                <span className="font-utility text-xs text-slate">
                  {u.city}
                  {u.institution_type ? ` · ${u.institution_type}` : ""}
                  {GO8_SLUGS.has(u.slug) ? " · Group of Eight" : ""}
                  {isRegionalCity(u.city) ? " · regional" : ""}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-utility text-xs text-slate">
                  {u.minTuition != null && (
                    <span className="text-status-open">
                      from {formatCurrency(u.minTuition, "AUD")}/yr
                    </span>
                  )}
                  {u.ieltsOverall != null && (
                    <span>IELTS {u.ieltsOverall.toFixed(1)}</span>
                  )}
                  {u.intakes.includes("July") && <span>Feb &amp; Jul intake</span>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 flex flex-col gap-2 font-body text-sm text-slate">
        <p>
          Compare any of these in the{" "}
          <Link
            href="/compare/universities"
            className="font-medium text-status-open underline underline-offset-2"
          >
            comparison tool
          </Link>
          , check the{" "}
          <Link
            href="/deadlines"
            className="font-medium text-status-open underline underline-offset-2"
          >
            application deadlines
          </Link>
          , or see the cost of living in{" "}
          <Link
            href="/cost-of-living"
            className="font-medium text-status-open underline underline-offset-2"
          >
            {content.cities.split(",")[0]}
          </Link>
          .
        </p>
      </div>

      <FaqSection heading={`Universities in ${name}: common questions`} items={faq} />

      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Universities in other states
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {otherStates.map((x) => (
            <li key={x.slug}>
              <Link
                href={`/universities/in/${x.slug}`}
                className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
              >
                Universities in {x.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/universities"
              className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-status-open transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
            >
              All Australian universities
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
