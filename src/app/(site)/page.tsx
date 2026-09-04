import Link from "next/link";
import { PostCard } from "@/components/site/PostCard";
import { ScrollCue } from "@/components/site/ScrollCue";
import { SearchBar } from "@/components/site/SearchBar";
import { StudentTypeToggle } from "@/components/site/StudentTypeToggle";
import { WhyTrust } from "@/components/site/WhyTrust";
import {
  BarsIcon,
  BookIcon,
  BuildingIcon,
  CalculatorIcon,
  CalendarIcon,
  CoinIcon,
  GlobeIcon,
  PassportIcon,
} from "@/components/site/icons";
import { deadlineBadgeStatus, formatDeadlineDate } from "@/lib/deadline-status";
import { formatCurrency } from "@/lib/format";
import { listRecentBlogPosts } from "@/lib/queries/public-blog-posts";
import { listPublicCountries } from "@/lib/queries/public-countries";
import { listUpcomingDeadlines } from "@/lib/queries/public-deadlines";
import { listRecentGuides } from "@/lib/queries/public-guides";
import {
  isFreshForHomepage,
  listLatestPolicyUpdate,
} from "@/lib/queries/public-policy-updates";
import { getHomepageStats } from "@/lib/queries/public-stats";
import { listFeaturedUniversities } from "@/lib/queries/public-universities";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SITE_YEAR } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

/**
 * WebSite + SearchAction: the Google sitelinks search box. Keep the @id
 * stable so page-level schema can reference #organization / #website.
 */
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `Study in Australia ${SITE_YEAR}: Deadlines, Costs & Universities`,
  description: SITE_DESCRIPTION,
  path: "/",
  type: "website",
});

// Task grid. The first six are the icon tiles; the last two run as text
// links below it. Every href here also lives in the header nav or footer.
const PRIMARY_TASKS = [
  { label: "Browse universities", href: "/universities", desc: "Every Australian university, by state, cost and entry.", Icon: BuildingIcon },
  { label: "Application deadlines", href: "/deadlines", desc: "Apply-by dates for every intake.", Icon: CalendarIcon },
  { label: "Compare universities", href: "/compare/universities", desc: "Tuition, selectivity and entry, side by side.", Icon: BarsIcon },
  { label: "Find scholarships", href: "/scholarships", desc: "Funding you can actually apply for.", Icon: CoinIcon },
  { label: "Visa pathways", href: "/visas", desc: "Student, graduate and skilled subclasses.", Icon: PassportIcon },
  { label: "Cost calculator", href: "/cost-calculator", desc: "Tuition, rent, visa and flights for your degree.", Icon: CalculatorIcon },
];

const SECONDARY_TASKS = [
  { label: "Browse courses by subject", href: "/study", Icon: BookIcon },
  { label: "Applying from a specific country", href: "/international", Icon: GlobeIcon },
];

const POPULAR = [
  { label: "February 2027 intake deadlines", href: "/deadlines/february-2027-intake" },
  { label: "July 2027 intake deadlines", href: "/deadlines/july-2027-intake" },
  {
    label: "Most affordable universities",
    href: "/best/affordable-australian-universities-for-international-students",
  },
  {
    label: "Regional universities for skilled migration",
    href: "/best/regional-australian-universities-for-skilled-migration",
  },
  {
    label: "Universities with no application fee",
    href: "/best/australian-universities-with-no-application-fee",
  },
  {
    label: "Universities with automatic scholarships",
    href: "/best/australian-universities-with-automatic-scholarships",
  },
  { label: "Applying from Nepal", href: "/international/nepal" },
  { label: "Applying from India", href: "/international/india" },
];

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

const eyebrowClass =
  "font-utility text-[0.7rem] font-semibold tracking-[0.16em] text-status-open uppercase";
const sectionTitleClass = "font-display text-2xl font-semibold text-ink text-balance";
const moreLinkClass =
  "font-body text-sm font-medium text-status-open underline underline-offset-2 whitespace-nowrap";
const thClass =
  "px-4 py-3 font-utility text-[0.68rem] font-semibold tracking-widest text-slate uppercase";

export default async function Home() {
  const [
    stats,
    countries,
    featured,
    upcoming,
    recentGuides,
    recentPosts,
    latestUpdate,
  ] = await Promise.all([
    getHomepageStats(),
    listPublicCountries(),
    listFeaturedUniversities(6),
    listUpcomingDeadlines(6),
    listRecentGuides(4),
    listRecentBlogPosts(4),
    listLatestPolicyUpdate(),
  ]);

  // Only surface a genuinely recent change; a stale "latest update" in the
  // hero undercuts the point of the feature. /updates keeps the full list.
  const heroUpdate =
    latestUpdate && isFreshForHomepage(latestUpdate) ? latestUpdate : null;
  const roundedCourses = Math.floor(stats.programCount / 100) * 100;

  return (
    <main className="w-full">
      <JsonLd data={websiteJsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

          {/* HERO */}
          <section className="grid items-center gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
            <div className="min-w-0">
              <p
                className={`animate-fade-up ${eyebrowClass}`}
                style={{ animationDelay: "0ms" }}
              >
                Study &middot; Work &middot; Visa &middot; Policy
              </p>

              {/* One H1. The title tag and schema carry the "Study in
                  Australia" entity phrase; the H1 leads with the promise. */}
              <h1
                className="animate-fade-up mt-3 font-display text-[2rem] leading-[1.1] font-semibold text-ink text-balance sm:text-4xl lg:text-[2.7rem]"
                style={{ animationDelay: "40ms" }}
              >
                The <span className="italic text-status-open">facts</span> on
                studying, working, and staying in Australia.
              </h1>

              <p
                className="animate-fade-up mt-4 max-w-xl font-body text-base text-slate sm:text-lg"
                style={{ animationDelay: "80ms" }}
              >
                Application deadlines, tuition, visa subclasses, and the policy
                changes that move them. Every figure traced to an official
                source and stamped with the date it was last checked.
              </p>

              <div
                className="animate-fade-up"
                style={{ animationDelay: "120ms" }}
              >
                <SearchBar className="mt-6 !mx-0 max-w-xl" />
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <StudentTypeToggle />
                  <span className="font-body text-sm text-slate">
                    or{" "}
                    <Link
                      href="/quiz"
                      className="font-medium text-ink underline decoration-status-pending/40 decoration-2 underline-offset-4 transition-colors hover:decoration-status-pending"
                    >
                      take the 2-minute course match
                    </Link>
                    . Not a lead-gen form, and free.
                  </span>
                </div>
              </div>

              {heroUpdate && (
                <Link
                  href="/updates"
                  className="animate-fade-up mt-5 flex max-w-xl items-center gap-2.5 rounded-full border border-line bg-mist px-4 py-2 transition-colors duration-150 hover:border-status-pending/40"
                  style={{ animationDelay: "160ms" }}
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-status-pending"
                  />
                  <span className="min-w-0 flex-1 truncate font-body text-sm text-ink">
                    <span className="font-utility text-[0.7rem] tracking-wide text-slate uppercase">
                      Latest update{" "}
                    </span>
                    {heroUpdate.title}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 font-utility text-xs text-slate"
                  >
                    {new Date(heroUpdate.announced_date).toLocaleDateString(
                      "en-AU",
                      { day: "numeric", month: "short" },
                    )}{" "}
                    &rarr;
                  </span>
                </Link>
              )}
            </div>

            <aside
              className="animate-fade-up min-w-0 rounded-2xl border border-line bg-mist p-5 sm:p-6"
              style={{ animationDelay: "120ms" }}
            >
              <h2 className="font-utility text-[0.7rem] font-semibold tracking-[0.14em] text-slate uppercase">
                Popular right now
              </h2>
              <ul className="mt-1 divide-y divide-line">
                {POPULAR.slice(0, 6).map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      className="block py-2.5 font-body text-[0.92rem] font-medium text-ink transition-colors hover:text-status-open"
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/best"
                className="mt-3 inline-block font-body text-sm font-semibold text-status-open"
              >
                Browse all shortlists &rarr;
              </Link>
            </aside>
          </section>

          {/* NEXT DEADLINES — the flagship data, always open */}
          {upcoming.length > 0 && (
            <section className="scroll-reveal mt-14">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className={sectionTitleClass}>Next application deadlines</h2>
                <Link href="/deadlines" className={moreLinkClass}>
                  Full calendar &rarr;
                </Link>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[36rem] border-collapse text-left">
                  <thead>
                    <tr className="bg-mist">
                      <th className={thClass}>University</th>
                      <th className={thClass}>Intake</th>
                      <th className={thClass}>Apply by</th>
                      <th className={thClass}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((d) => {
                      const rolling =
                        d.is_rolling ||
                        deadlineBadgeStatus(d.deadline_date, d.is_rolling) ===
                          "open";
                      const days = daysUntil(d.deadline_date);
                      const soon = !rolling && days <= 21;
                      return (
                        <tr key={d.id} className="border-t border-line">
                          <td className="px-4 py-3">
                            <Link
                              href={`/universities/${d.university?.slug}`}
                              className="font-body text-sm font-semibold text-ink hover:underline"
                            >
                              {d.university?.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-slate">
                            {d.deadline_type?.name}
                            {d.degree_level ? ` · ${d.degree_level.name}` : ""}
                          </td>
                          <td className="px-4 py-3 font-utility text-sm text-slate">
                            {rolling
                              ? "Rolling"
                              : formatDeadlineDate(d.deadline_date, d.date_kind)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-utility text-xs font-semibold ${
                                rolling
                                  ? "bg-status-open/10 text-status-open"
                                  : soon
                                    ? "border border-status-pending/30 bg-status-pending/10 text-status-pending"
                                    : "bg-mist text-slate"
                              }`}
                            >
                              {rolling
                                ? "Accepting now"
                                : soon
                                  ? `Closing in ${days}d`
                                  : "Upcoming"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 font-utility text-xs text-slate">
                Firm closing dates a university publishes. Each row links to
                that university&rsquo;s page and the source it came from.
              </p>
            </section>
          )}

          {/* START HERE */}
          <section className="scroll-reveal mt-14">
            <div className="rounded-2xl bg-mist p-5 sm:p-7">
              <h2 className={sectionTitleClass}>Start here</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PRIMARY_TASKS.map(({ label, href, desc, Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-paper p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/40"
                    >
                      <Icon className="h-5 w-5 text-status-open" />
                      <span className="mt-0.5 font-body text-[0.95rem] font-semibold text-ink group-hover:underline">
                        {label}
                      </span>
                      <span className="font-body text-[0.82rem] text-slate">
                        {desc}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {SECONDARY_TASKS.map(({ label, href, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center gap-2 font-body text-sm font-semibold text-status-open"
                  >
                    <Icon className="h-4 w-4 text-slate" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* EXPLORE UNIVERSITIES */}
          {featured.length > 0 && (
            <section className="scroll-reveal mt-14">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className={sectionTitleClass}>Explore universities</h2>
                <Link href="/compare/universities" className={moreLinkClass}>
                  Compare all
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {featured.map((u) => (
                  <li key={u.slug}>
                    <Link
                      href={`/universities/${u.slug}`}
                      className="card card-hover group flex h-full flex-col gap-1.5 p-4"
                    >
                      <span className="font-body text-[0.98rem] font-semibold text-ink group-hover:underline">
                        {u.name}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-utility text-xs text-slate">
                        {u.city && <span>{u.city}</span>}
                        {u.tuition_international != null && (
                          <span className="text-status-open">
                            from{" "}
                            {formatCurrency(
                              u.tuition_international,
                              u.currency ?? "AUD",
                            )}
                            /yr
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* GUIDES + UPDATES */}
          {(recentGuides.length > 0 || recentPosts.length > 0) && (
            <section className="scroll-reveal mt-14 grid gap-8 sm:grid-cols-2">
              {recentGuides.length > 0 && (
                <div className="min-w-0">
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <h2 className={sectionTitleClass}>From the guides</h2>
                    <Link href="/guides" className={moreLinkClass}>
                      All guides
                    </Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    {recentGuides.map((g) => (
                      <PostCard
                        key={g.slug}
                        href={`/guides/${g.slug}`}
                        eyebrow={g.country ? g.country.name : undefined}
                        title={g.title}
                        excerpt={g.excerpt}
                      />
                    ))}
                  </div>
                </div>
              )}

              {recentPosts.length > 0 && (
                <div className="min-w-0">
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <h2 className={sectionTitleClass}>Latest updates</h2>
                    <Link href="/blog" className={moreLinkClass}>
                      All posts
                    </Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    {recentPosts.map((p) => (
                      <PostCard
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        eyebrow={
                          p.published_at
                            ? new Date(p.published_at).toLocaleDateString(
                                "en-AU",
                                { day: "numeric", month: "short", year: "numeric" },
                              )
                            : undefined
                        }
                        title={p.title}
                        excerpt={p.excerpt}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Site scale + country coverage */}
          <p className="mt-12 font-utility text-xs text-slate">
            {stats.universityCount.toLocaleString()} universities &middot;{" "}
            {roundedCourses.toLocaleString()}+ courses &middot;{" "}
            {stats.deadlineCount.toLocaleString()} sourced deadlines.{" "}
            {countries.length > 1 ? (
              <>
                Browse by country:{" "}
                {countries.map((c, i) => (
                  <span key={c.code}>
                    <Link
                      href={`/deadlines?country=${c.code}`}
                      className="underline underline-offset-2 hover:text-ink"
                    >
                      {c.name}
                    </Link>
                    {i < countries.length - 1 ? " · " : ""}
                  </span>
                ))}
              </>
            ) : (
              <>Covering Australia in full; more destinations on the way.</>
            )}
          </p>

          <WhyTrust className="scroll-reveal mt-8" />
      </div>

      <ScrollCue />
    </main>
  );
}
