import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ComparisonTable } from "@/components/site/ComparisonTable";
import { FaqSection } from "@/components/site/FaqSection";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { ArrowUpRightIcon, CheckBadgeIcon } from "@/components/site/icons";
import { GO8_SLUGS } from "@/lib/australia";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { COMPARISON_PAIRS, parseVsSlug, vsSlug } from "@/lib/comparisons";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import { authorInitials, formatCurrency } from "@/lib/format";
import {
  getGuideRelatedContent,
  getPublishedGuide,
  listPublishedGuideSlugs,
} from "@/lib/queries/public-guides";
import {
  getUniversitiesForComparison,
  getUniversitiesForComparisonBySlugs,
  listPublishedUniversityOptions,
  type ComparisonUniversityRow,
} from "@/lib/queries/public-universities";
import { SITE_YEAR } from "@/lib/site-config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const guideSlugs = await listPublishedGuideSlugs({ category: "comparison" });
  return [
    ...guideSlugs.map((slug) => ({ slug })),
    ...COMPARISON_PAIRS.map(([a, b]) => ({ slug: vsSlug(a, b) })),
  ];
}

async function loadPair(slug: string): Promise<ComparisonUniversityRow[] | null> {
  const parsed = parseVsSlug(slug);
  if (!parsed) return null;
  const rows = await getUniversitiesForComparisonBySlugs(parsed);
  // Keep the URL order.
  const ordered = parsed
    .map((s) => rows.find((r) => r.slug === s))
    .filter((r): r is ComparisonUniversityRow => Boolean(r));
  return ordered.length === 2 ? ordered : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const pair = await loadPair(slug);
  if (pair) {
    const [a, b] = pair;
    const title = `${a.name} vs ${b.name}: Which to Choose (${SITE_YEAR})`;
    const description = `${a.name} compared with ${b.name} for international students: tuition, selectivity, entry requirements, and how the two differ.`;
    const url = `/compare/${slug}`;
    return {
      title,
      description,
      alternates: { canonical: url },
      // Auto-generated head-to-head from DB stats. Useful for visitors and
      // internal linking, but templated, so kept out of the index to stay
      // clear of "scaled content". The hand-written comparison guides below
      // stay indexed.
      robots: { index: false, follow: true },
      openGraph: { title, description, url, type: "article" },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const guide = await getPublishedGuide(slug);
  if (!guide || guide.category !== "comparison") return {};
  const title = guide.title;
  const description = guide.excerpt ?? guide.content.slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: { title, description, url: `/compare/${slug}`, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function pairIntro(a: ComparisonUniversityRow, b: ComparisonUniversityRow): string[] {
  const aGo8 = GO8_SLUGS.has(a.slug);
  const bGo8 = GO8_SLUGS.has(b.slug);
  const paras: string[] = [];

  if (aGo8 && bGo8) {
    paras.push(
      `${a.name} and ${b.name} are both Group of Eight universities, so both carry the research reputation and both sit in the highest tuition band. The choice usually comes down to city, specific course strengths, and cost.`,
    );
  } else if (aGo8 || bGo8) {
    const go8 = aGo8 ? a : b;
    const other = aGo8 ? b : a;
    paras.push(
      `${go8.name} is a Group of Eight university, with the ranking and research budget that brings. ${other.name} is not, which usually means lower fees and, often, a more applied, industry-linked approach. Neither is automatically the better choice; it depends on your field and budget.`,
    );
  } else {
    paras.push(
      `Neither ${a.name} nor ${b.name} is in the Group of Eight, so both tend to be more affordable and more teaching-focused than the sandstone universities. Compare them on course fit, city, and the specific program.`,
    );
  }

  const at = a.tuition_international;
  const bt = b.tuition_international;
  if (at != null && bt != null && Math.abs(at - bt) > 1500) {
    const [cheap, dear] = at < bt ? [a, b] : [b, a];
    paras.push(
      `On the cheapest tuition we have on record, ${cheap.name} (from ${formatCurrency(
        Math.min(at, bt),
        cheap.currency,
      )} a year) is the more affordable of the two, below ${dear.name} (from ${formatCurrency(
        Math.max(at, bt),
        dear.currency,
      )}). Tuition varies widely by course, so check your specific program.`,
    );
  }

  const ar = a.acceptance_rate;
  const br = b.acceptance_rate;
  if (ar != null && br != null && Math.abs(ar - br) >= 15) {
    const [, sel] = ar > br ? [a, b] : [b, a];
    paras.push(
      `On the institution-wide admission estimates available, ${sel.name} is the more selective of the two. Australian universities do not publish official acceptance rates, and competitive courses stay hard to enter at both regardless.`,
    );
  }

  return paras;
}

function pairFaq(a: ComparisonUniversityRow, b: ComparisonUniversityRow): FaqItem[] {
  const items: FaqItem[] = [];
  const at = a.tuition_international;
  const bt = b.tuition_international;
  if (at != null && bt != null) {
    const [cheap] = at <= bt ? [a, b] : [b, a];
    items.push({
      q: `Is ${a.name} or ${b.name} cheaper for international students?`,
      a:
        Math.abs(at - bt) <= 1500
          ? `They are close. The cheapest tuition on record is ${formatCurrency(Math.min(at, bt), "AUD")} at one and ${formatCurrency(Math.max(at, bt), "AUD")} at the other, but the gap is small and course choice matters more.`
          : `${cheap.name} is generally cheaper, with tuition from ${formatCurrency(Math.min(at, bt), "AUD")} a year against ${formatCurrency(Math.max(at, bt), "AUD")}. Living costs depend on the city, and specific courses vary widely.`,
    });
  }
  items.push({
    q: `Which is more prestigious, ${a.name} or ${b.name}?`,
    a:
      GO8_SLUGS.has(a.slug) === GO8_SLUGS.has(b.slug)
        ? `Both sit in a similar tier, so prestige is not a strong tie-breaker. Look at rankings in your specific field and where you want to work afterward.`
        : `${GO8_SLUGS.has(a.slug) ? a.name : b.name} is a Group of Eight university and carries more of a research-reputation halo, especially with employers outside Australia. For many fields the practical difference in outcomes is small.`,
  });
  items.push({
    q: `Can I apply to both ${a.name} and ${b.name}?`,
    a: `Yes. Australian universities assess applications independently and most charge international students no application fee, so applying to both and comparing your offers is normal and sensible.`,
  });
  return items;
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const pair = await loadPair(slug);
  if (pair) {
    const [a, b] = pair;
    const options = await listPublishedUniversityOptions();
    const nameBySlug = new Map(options.map((o) => [o.slug, o.name]));
    const breadcrumbs = [
      { label: "Home", href: "/" },
      { label: "Compare", href: "/compare" },
      { label: `${a.name} vs ${b.name}` },
    ];
    const intro = pairIntro(a, b);
    const faq = pairFaq(a, b);

    return (
      <main className="mx-auto w-full max-w-5xl px-6 pt-8 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
        />

        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={breadcrumbs} />
          <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
            <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
              Comparison
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
              {a.name} vs {b.name}
            </h1>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {intro.map((p) => (
              <p key={p.slice(0, 20)} className="font-body text-base leading-relaxed text-ink">
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <ComparisonTable universities={pair} />
        </div>

        <div className="mx-auto max-w-3xl">
          <FaqSection heading={`${a.name} vs ${b.name}: common questions`} items={faq} />

          <div className="mt-10 border-t border-line pt-6">
            <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Full profiles
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {pair.map((u) => (
                <li key={u.slug}>
                  <Link
                    href={`/universities/${u.slug}`}
                    className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
                  >
                    {u.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Other comparisons
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {COMPARISON_PAIRS.filter(([x, y]) => vsSlug(x, y) !== slug)
                .slice(0, 6)
                .map(([x, y]) => (
                  <li key={vsSlug(x, y)}>
                    <Link
                      href={`/compare/${vsSlug(x, y)}`}
                      className="block truncate rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm text-ink hover:underline"
                    >
                      {nameBySlug.get(x) ?? x} vs {nameBySlug.get(y) ?? y}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <p className="mt-8 font-body text-xs text-slate">
            Tuition figures are approximate and drawn from this site&rsquo;s
            database, and selectivity is a band, not an official rate. This is
            general information, not admissions advice.
          </p>
        </div>
      </main>
    );
  }

  const guide = await getPublishedGuide(slug);
  if (!guide || guide.category !== "comparison") notFound();

  const related = await getGuideRelatedContent(guide.id);
  const universities = await getUniversitiesForComparison(
    related.universities.map((u) => u.id),
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
    { label: guide.title },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={breadcrumbs} />

        <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
          <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
            Comparison
            {guide.country && ` · ${guide.country.name}`}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
            {guide.title}
          </h1>

          {guide.author && (
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink font-utility text-xs font-semibold text-paper">
                {authorInitials(guide.author.name)}
              </span>
              <p className="font-body text-sm text-slate">
                By <span className="font-medium text-ink">{guide.author.name}</span>
                {guide.author.credentials && `, ${guide.author.credentials}`}
                {guide.reviewed_by && <>, reviewed by {guide.reviewed_by.name}</>}
              </p>
            </div>
          )}
        </div>
      </div>

      {universities.length >= 2 && (
        <div className="mt-8">
          <ComparisonTable universities={universities} />
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <div className="mt-8">
          <GuideContent content={guide.content} />
        </div>

        <div className="mt-10 flex items-center gap-2 rounded-xl bg-status-open/5 px-4 py-3">
          <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-status-open" />
          <LastVerified date={guide.last_verified_at} sources={guide.source_urls} />
        </div>

        {related.guides.length > 0 && (
          <div className="mt-10 border-t border-ink/10 pt-6">
            <h2 className="mb-4 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Related guides
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-mist px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
                  >
                    <span className="font-body text-sm font-medium text-ink">{g.title}</span>
                    <ArrowUpRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
