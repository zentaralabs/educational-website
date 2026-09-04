import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ComparisonTable } from "@/components/site/ComparisonTable";
import { FaqSection } from "@/components/site/FaqSection";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { ArrowUpRightIcon, CheckBadgeIcon } from "@/components/site/icons";
import { GO8_SLUGS, isRegionalCity } from "@/lib/australia";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { COMPARISON_PAIRS, parseVsSlug, vsSlug } from "@/lib/comparisons";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import {
  authorInitials,
  formatCurrency,
  selectivityLabel,
  selectivityRank,
} from "@/lib/format";
import {
  listCollectionUniversities,
  type CollectionUniversity,
} from "@/lib/queries/public-collections";
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
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

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
    const title = composeTitle(`${a.name} vs ${b.name}`, [
      `Which to Choose (${SITE_YEAR})`,
      `Which to Choose`,
      `${SITE_YEAR}`,
    ]);
    return pageMetadata({
      title,
      description: `${a.name} compared with ${b.name} for international students: tuition, selectivity, entry requirements, and how the two differ.`,
      path: `/compare/${slug}`,
      type: "article",
    });
  }

  const guide = await getPublishedGuide(slug);
  if (!guide || guide.category !== "comparison") return {};
  return pageMetadata({
    title: guide.meta_title ?? guide.title,
    description: guide.excerpt ?? guide.content,
    path: `/compare/${slug}`,
    type: "article",
  });
}

type Uni = CollectionUniversity;

const isGo8 = (u: Uni) => GO8_SLUGS.has(u.slug);
const isRegional = (u: Uni) => isRegionalCity(u.city);
const cityOf = (u: Uni) => (u.city ? u.city.split(/[,/]/)[0].trim() : null);

function pairIntro(a: Uni, b: Uni): string[] {
  const paras: string[] = [];

  if (isGo8(a) && isGo8(b)) {
    paras.push(
      `${a.name} and ${b.name} are both Group of Eight universities, so both carry the research reputation and both sit near the top of the tuition range. The decision comes down to city, the strength of your specific course, cost, and whether you want the skilled-migration points that come with studying regionally.`,
    );
  } else if (isGo8(a) || isGo8(b)) {
    const go8 = isGo8(a) ? a : b;
    const other = isGo8(a) ? b : a;
    paras.push(
      `${go8.name} is a Group of Eight university: higher in the global rankings, more research-intensive, and in the top tuition band. ${other.name} is not, which usually means lower fees, a more applied and industry-linked approach, and often easier entry. For many fields the difference in graduate outcomes is smaller than the ranking gap suggests.`,
    );
  } else {
    paras.push(
      `Neither ${a.name} nor ${b.name} is in the Group of Eight, so both tend to be more affordable and more teaching-focused than the sandstone universities. The choice is mostly about city, the specific program, and cost.`,
    );
  }

  const at = a.minTuition;
  const bt = b.minTuition;
  if (at != null && bt != null && Math.abs(at - bt) >= 3000) {
    const [cheap, dear] = at < bt ? [a, b] : [b, a];
    paras.push(
      `On the lowest tuition on record, ${cheap.name} (from ${formatCurrency(Math.min(at, bt), "AUD")} a year) is the more affordable, below ${dear.name} (from ${formatCurrency(Math.max(at, bt), "AUD")}). Tuition varies widely by course, so price your specific program.`,
    );
  }

  const ac = cityOf(a);
  const bc = cityOf(b);
  if (ac && bc && ac !== bc) {
    paras.push(
      `${a.name} is in ${ac} and ${b.name} is in ${bc}. That affects your rent and lifestyle more than almost anything else on this page: see the cost-of-living comparison below.`,
    );
  } else if (ac && ac === bc) {
    paras.push(
      `Both are in ${ac}, so cost of living is roughly the same. The comparison is really about the universities themselves.`,
    );
  }

  const aReg = isRegional(a);
  const bReg = isRegional(b);
  if (aReg !== bReg) {
    const reg = aReg ? a : b;
    paras.push(
      `${reg.name}'s main campus counts as regional for skilled migration, which adds points on the skilled visa points test and opens the 491 and 190 nomination pathways. If permanent residence is part of your plan, that is a real advantage.`,
    );
  }

  return paras;
}

function chooseIf(a: Uni, b: Uni): { name: string; reasons: string[] }[] {
  function reasons(x: Uni, y: Uni): string[] {
    const out: string[] = [];
    if (isGo8(x) && !isGo8(y))
      out.push("You want the Group of Eight name and research reputation");
    if (
      x.minTuition != null &&
      y.minTuition != null &&
      x.minTuition < y.minTuition - 3000
    )
      out.push(
        `Lower tuition matters (from ${formatCurrency(x.minTuition, "AUD")} vs ${formatCurrency(y.minTuition, "AUD")})`,
      );
    if (isRegional(x) && !isRegional(y))
      out.push("You want the regional skilled-migration points");
    if (
      x.ieltsOverall != null &&
      y.ieltsOverall != null &&
      x.ieltsOverall < y.ieltsOverall
    )
      out.push(`A lower English bar helps (IELTS ${x.ieltsOverall.toFixed(1)})`);
    if (
      x.selectivityBand === "broadly-accessible" &&
      y.selectivityBand !== "broadly-accessible"
    )
      out.push("You want more open admissions");
    if (x.intakes.includes("July") && !y.intakes.includes("July"))
      out.push("You need a mid-year (July) start");
    if (x.applicationFee === 0 && (y.applicationFee ?? 0) > 0)
      out.push("You would rather not pay an application fee");
    if ((x.automaticScholarships?.length ?? 0) > (y.automaticScholarships?.length ?? 0))
      out.push("Automatic entry scholarships appeal to you");
    const xc = cityOf(x);
    if (xc && xc !== cityOf(y)) out.push(`You want to live in ${xc}`);
    return out.slice(0, 5);
  }
  return [
    { name: a.name, reasons: reasons(a, b) },
    { name: b.name, reasons: reasons(b, a) },
  ].filter((c) => c.reasons.length > 0);
}

function pairFaq(a: Uni, b: Uni): FaqItem[] {
  const items: FaqItem[] = [];
  const at = a.minTuition;
  const bt = b.minTuition;
  if (at != null && bt != null) {
    const [cheap] = at <= bt ? [a, b] : [b, a];
    items.push({
      q: `Is ${a.name} or ${b.name} cheaper for international students?`,
      a:
        Math.abs(at - bt) < 3000
          ? `They are close. The lowest tuition on record is ${formatCurrency(Math.min(at, bt), "AUD")} at one and ${formatCurrency(Math.max(at, bt), "AUD")} at the other, and course choice moves the number more than the university does.`
          : `${cheap.name} is generally cheaper, from ${formatCurrency(Math.min(at, bt), "AUD")} a year against ${formatCurrency(Math.max(at, bt), "AUD")}. Add cost of living: ${cityOf(a) === cityOf(b) ? "both are in the same city, so that part is a wash" : `${cityOf(a)} and ${cityOf(b)} differ, mostly on rent`}.`,
    });
  }
  items.push({
    q: `Which is harder to get into, ${a.name} or ${b.name}?`,
    a: (() => {
      const sa = selectivityLabel(a.selectivityBand);
      const sb = selectivityLabel(b.selectivityBand);
      if (sa && sb && sa !== sb) {
        const harder =
          selectivityRank(a.selectivityBand) < selectivityRank(b.selectivityBand)
            ? a
            : b;
        return `On the institution-wide picture, ${harder.name} is the more selective. Australian universities do not publish official acceptance rates, and specific competitive courses (medicine, law, some design) are hard to enter at both regardless.`;
      }
      return `They are broadly similar on selectivity. Entry depends far more on the specific course than on the university, so check the requirements for the program you want.`;
    })(),
  });
  items.push({
    q: `Which is better for permanent residence, ${a.name} or ${b.name}?`,
    a:
      isRegional(a) !== isRegional(b)
        ? `${isRegional(a) ? a.name : b.name} has the edge for a PR plan: its main campus is in a designated regional area, so studying there earns regional points and opens the 491 and 190 nomination streams. Neither guarantees PR; that depends on your occupation and points.`
        : `Neither has a structural advantage. ${isRegional(a) ? "Both count as regional for migration points." : "Neither is regional, so neither earns the regional study points."} PR depends on your occupation, points, and the invitation rounds, not the university.`,
  });
  items.push({
    q: `Which is more prestigious, ${a.name} or ${b.name}?`,
    a:
      isGo8(a) === isGo8(b)
        ? `Both sit in a similar tier. Prestige is not a strong tie-breaker here; look at rankings in your specific field and where you want to work afterward.`
        : `${isGo8(a) ? a.name : b.name} is a Group of Eight university and carries more of a research-reputation halo, especially with employers outside Australia. For many fields the practical difference in outcomes is small.`,
  });
  items.push({
    q: `Can I apply to both ${a.name} and ${b.name}?`,
    a: `Yes. Australian universities assess applications independently and many charge international students no application fee, so applying to both and comparing your offers is normal.`,
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
    const [options, collection] = await Promise.all([
      listPublishedUniversityOptions(),
      listCollectionUniversities(),
    ]);
    const ca = collection.find((c) => c.slug === a.slug);
    const cb = collection.find((c) => c.slug === b.slug);
    if (!ca || !cb) notFound();

    const nameBySlug = new Map(options.map((o) => [o.slug, o.name]));
    const breadcrumbs = [
      { label: "Home", href: "/" },
      { label: "Compare", href: "/compare" },
      { label: `${a.name} vs ${b.name}` },
    ];
    const intro = pairIntro(ca, cb);
    const faq = pairFaq(ca, cb);
    const choices = chooseIf(ca, cb);

    const budget = (u: Uni) =>
      u.firstYearBudget != null
        ? `${formatCurrency(u.firstYearBudget, "AUD")} to ${formatCurrency(
            Math.round((u.firstYearBudget * 1.15) / 1000) * 1000,
            "AUD",
          )}`
        : null;

    const rows: { label: string; a: string | null; b: string | null }[] = [
      { label: "City", a: cityOf(ca), b: cityOf(cb) },
      {
        label: "Group of Eight",
        a: isGo8(ca) ? "Yes" : "No",
        b: isGo8(cb) ? "Yes" : "No",
      },
      {
        label: "Regional (migration)",
        a: isRegional(ca) ? "Yes" : "No",
        b: isRegional(cb) ? "Yes" : "No",
      },
      {
        label: "International tuition",
        a: ca.minTuition != null ? `from ${formatCurrency(ca.minTuition, "AUD")}/yr` : null,
        b: cb.minTuition != null ? `from ${formatCurrency(cb.minTuition, "AUD")}/yr` : null,
      },
      { label: "First-year budget", a: budget(ca), b: budget(cb) },
      {
        label: "English (IELTS)",
        a: ca.ieltsOverall != null ? ca.ieltsOverall.toFixed(1) : null,
        b: cb.ieltsOverall != null ? cb.ieltsOverall.toFixed(1) : null,
      },
      {
        label: "Application fee",
        a:
          ca.applicationFee == null
            ? null
            : ca.applicationFee === 0
              ? "None"
              : formatCurrency(ca.applicationFee, "AUD"),
        b:
          cb.applicationFee == null
            ? null
            : cb.applicationFee === 0
              ? "None"
              : formatCurrency(cb.applicationFee, "AUD"),
      },
      {
        label: "Intakes",
        a: ca.intakes.length ? ca.intakes.join(", ") : null,
        b: cb.intakes.length ? cb.intakes.join(", ") : null,
      },
      {
        label: "Selectivity",
        a: selectivityLabel(ca.selectivityBand),
        b: selectivityLabel(cb.selectivityBand),
      },
    ];

    return (
      <main className="mx-auto w-full max-w-4xl px-6 pt-8 pb-16">
        <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
        <JsonLd data={faqJsonLd(faq)} />

        <div>
          <Breadcrumbs items={breadcrumbs} />
          <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
            <p className="flex items-center gap-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
              Comparison
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
              {a.name} vs {b.name}
            </h1>
          </div>

          <div className="mt-6 flex max-w-2xl flex-col gap-3">
            {intro.map((p) => (
              <p key={p} className="font-body text-base leading-relaxed text-ink">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/15">
                  <th className="py-2 pr-3 text-left font-body text-xs font-semibold tracking-wide text-slate uppercase" />
                  <th className="py-2 px-3 text-left font-display text-sm font-semibold text-ink">
                    {a.name}
                  </th>
                  <th className="py-2 pl-3 text-left font-display text-sm font-semibold text-ink">
                    {b.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-ink/10">
                    <td className="py-2.5 pr-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                      {r.label}
                    </td>
                    <td className="py-2.5 px-3 font-utility text-ink">{r.a ?? "not listed"}</td>
                    <td className="py-2.5 pl-3 font-utility text-ink">{r.b ?? "not listed"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {choices.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {choices.map((c) => (
                <div key={c.name} className="rounded-xl border border-line bg-mist p-4">
                  <p className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
                    Choose {c.name} if
                  </p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {c.reasons.map((reason) => (
                      <li key={reason} className="flex gap-2 font-body text-sm text-ink">
                        <span aria-hidden className="text-status-open">
                          ✓
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {(ca.who_is_it_for || cb.who_is_it_for) && (
            <div className="mt-8 flex max-w-2xl flex-col gap-5">
              {[ca, cb].map(
                (u) =>
                  u.who_is_it_for && (
                    <div key={u.slug}>
                      <h2 className="mb-1.5 font-display text-lg font-semibold text-ink">
                        Who {u.name} suits
                      </h2>
                      <p className="font-body text-base leading-relaxed text-ink">
                        {u.who_is_it_for}
                      </p>
                    </div>
                  ),
              )}
            </div>
          )}

          <FaqSection heading={`${a.name} vs ${b.name}: common questions`} items={faq} />

          <div className="mt-10 border-t border-line pt-6">
            <h2 className="mb-3 font-body text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
              Go deeper
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {pair.flatMap((u) => [
                {
                  href: `/universities/${u.slug}`,
                  label: `${u.name} full profile`,
                },
                {
                  href: `/universities/${u.slug}/deadlines`,
                  label: `${u.name} deadlines`,
                },
              ]).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 font-body text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
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
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={breadcrumbs} />

        <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
          <p className="flex items-center gap-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
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
            <h2 className="mb-4 font-body text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
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
