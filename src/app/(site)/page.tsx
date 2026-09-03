import Link from "next/link";
import { Collapsible } from "@/components/site/Collapsible";
import { PostCard } from "@/components/site/PostCard";
import { SearchBar } from "@/components/site/SearchBar";
import { StudentTypeToggle } from "@/components/site/StudentTypeToggle";
import { WhyTrust } from "@/components/site/WhyTrust";
import { deadlineBadgeStatus } from "@/lib/deadline-status";
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
import { flagEmoji } from "@/lib/flag";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SITE_YEAR } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

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

const TASKS = [
  {
    label: "Browse all universities",
    href: "/universities",
    desc: "Every Australian university, filterable by state, cost and entry",
  },
  {
    label: "Check application deadlines",
    href: "/deadlines",
    desc: "Recommended apply-by dates for every intake",
  },
  {
    label: "Compare universities",
    href: "/compare/universities",
    desc: "Tuition, selectivity and requirements side by side",
  },
  {
    label: "Browse courses by subject",
    href: "/study",
    desc: "Find programs and the universities that run them",
  },
  {
    label: "Find scholarships",
    href: "/scholarships",
    desc: "Funding you can actually apply for",
  },
  {
    label: "Understand visa pathways",
    href: "/visas",
    desc: "Student, graduate and skilled visa subclasses",
  },
  {
    label: "Calculate the total cost",
    href: "/cost-calculator",
    desc: "Tuition, rent, visa and flights for your degree",
  },
  {
    label: "Applying from your country",
    href: "/international",
    desc: "What is different for India, Nepal, China and more",
  },
];

const POPULAR = [
  { label: "February 2027 intake deadlines", href: "/deadlines/february-2027-intake" },
  { label: "July 2027 intake deadlines", href: "/deadlines/july-2027-intake" },
  {
    label: "Most affordable universities for international students",
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
  { label: "Study in Australia from Nepal", href: "/international/nepal" },
  { label: "Study in Australia from India", href: "/international/india" },
];

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

  // Only surface a recent change under the search box. Past ~8 weeks the
  // /updates page still lists it, but a stale "latest update" in the hero
  // undercuts the point of the feature.
  const heroUpdate =
    latestUpdate && isFreshForHomepage(latestUpdate) ? latestUpdate : null;

  return (
    <main className="w-full">
      <JsonLd data={websiteJsonLd} />
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--color-status-open)_10%,transparent),transparent)]"
        />
        <div className="relative mx-auto w-full max-w-3xl px-6 pt-8 pb-8 text-center sm:pt-12">
          <p
            className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-mist px-3.5 py-1 font-utility text-[0.7rem] font-semibold tracking-widest text-status-open uppercase"
            style={{ animationDelay: "0ms" }}
          >
            <span aria-hidden="true" className="text-sm leading-none">
              {flagEmoji("AU")}
            </span>
            Australia · {stats.universityCount.toLocaleString()} universities ·{" "}
            {(Math.floor(stats.programCount / 100) * 100).toLocaleString()}+ courses ·{" "}
            {stats.deadlineCount.toLocaleString()} deadlines
          </p>

          {/* The H1 carries the entity the page is about ("study in
              Australia") rather than the brand line it used to lead with.
              "Where should you apply?" was the strongest signal on the
              homepage and said nothing a search engine could match a query
              to; it now runs as the second line, where it still sets the
              tone without spending the page's one H1 on it. */}
          <h1
            className="animate-fade-up font-display text-[2.5rem] leading-[1.05] font-semibold text-ink text-balance sm:text-6xl"
            style={{ animationDelay: "40ms" }}
          >
            Study in Australia
            <span className="block text-slate">Where should you apply?</span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-4 max-w-xl font-body text-base text-slate text-balance sm:text-lg"
            style={{ animationDelay: "80ms" }}
          >
            Compare Australian universities and courses for international
            students: application deadlines, tuition, entry requirements,
            scholarships, and student visas, all in one place.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-col items-center gap-2.5"
            style={{ animationDelay: "120ms" }}
          >
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-2.5 rounded-full bg-status-open px-9 py-4 font-body text-[1.05rem] font-semibold text-white shadow-[0_14px_32px_-10px_color-mix(in_srgb,var(--color-status-open)_65%,transparent)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_color-mix(in_srgb,var(--color-status-open)_75%,transparent)]"
            >
              Find my universities
              <span
                aria-hidden="true"
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <span className="font-utility text-xs text-slate">
              8 quick questions · matched to real data · not a lead-gen form
            </span>
          </div>

          <div className="animate-fade-up mt-12" style={{ animationDelay: "160ms" }}>
            <p className="mb-2.5 font-body text-sm text-slate">
              Already know the university, course, or visa? Search for it:
            </p>
            <SearchBar className="mt-0" />
            <div className="mt-3 flex justify-center">
              <StudentTypeToggle />
            </div>
          </div>

          {heroUpdate && (
            <Link
              href="/updates"
              className="animate-fade-up mt-4 mx-auto flex max-w-xl items-center gap-2.5 rounded-full border border-line bg-mist px-4 py-2 text-left transition-colors duration-150 hover:border-status-pending/40"
              style={{ animationDelay: "180ms" }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-status-pending"
              />
              <span className="min-w-0 flex-1 truncate font-body text-sm text-ink">
                <span className="text-slate">Latest update: </span>
                {heroUpdate.title}
              </span>
              <span
                aria-hidden="true"
                className="flex-shrink-0 font-utility text-xs text-slate"
              >
                {new Date(heroUpdate.announced_date).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                &rarr;
              </span>
            </Link>
          )}

          <p
            className="animate-fade-up mt-6 font-body text-sm text-slate"
            style={{ animationDelay: "200ms" }}
          >
            {countries.length > 1 ? (
              <>
                Or browse by country:{" "}
                {countries.map((c, i) => (
                  <span key={c.code}>
                    <Link
                      href={`/deadlines?country=${c.code}`}
                      className="font-medium text-ink underline decoration-status-pending/30 decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-status-pending"
                    >
                      <span className="no-underline">{flagEmoji(c.code)}</span>{" "}
                      {c.name}
                    </Link>
                    {i < countries.length - 1 && " · "}
                  </span>
                ))}
              </>
            ) : (
              <>
                {flagEmoji("AU")} Covering Australia in full. Other study
                destinations are on the way.
              </>
            )}
          </p>

          <a
            href="#explore"
            aria-label="Scroll down to explore"
            className="animate-fade-up mt-8 inline-flex text-slate transition-colors duration-150 hover:text-ink"
            style={{ animationDelay: "280ms" }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="animate-scroll-hint"
            >
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>

      <div id="explore" className="mx-auto w-full max-w-3xl scroll-mt-6 px-6 pb-16">
        <section className="scroll-reveal mt-2">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">
            What are you looking for?
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {TASKS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="card card-hover group flex h-full flex-col gap-1 p-4"
                >
                  <span className="font-body text-[0.95rem] font-semibold text-ink group-hover:underline">
                    {t.label}
                  </span>
                  <span className="font-utility text-xs text-slate">
                    {t.desc}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="scroll-reveal mt-10">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">
            Popular right now
          </h2>
          <ul className="flex flex-wrap gap-2.5">
            {POPULAR.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="inline-block rounded-lg border border-line bg-paper px-4 py-2 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open/40 hover:text-status-open"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {upcoming.length > 0 && (
          <div
            className="animate-fade-up mt-4"
            style={{ animationDelay: "240ms" }}
          >
            <Collapsible
              label="Next application dates"
              sublabel={`${upcoming.length} intakes closing soon`}
            >
              <ul className="divide-y divide-line">
                {upcoming.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/universities/${d.university?.slug}`}
                      className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-ink/[0.02] sm:px-5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-body text-sm font-semibold text-ink group-hover:underline">
                          {d.university?.name}
                        </span>
                        <span className="font-utility text-xs text-slate">
                          {d.deadline_type?.name}
                          {d.degree_level && ` · ${d.degree_level.name}`}
                        </span>
                      </span>
                      <span className="flex flex-shrink-0 items-center gap-2 font-utility text-xs font-medium text-ink">
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            deadlineBadgeStatus(d.deadline_date, d.is_rolling) ===
                            "open"
                              ? "bg-status-open"
                              : "bg-status-pending"
                          }`}
                        />
                        {new Date(d.deadline_date).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/deadlines"
                className="block border-t border-line px-4 py-3 text-center font-body text-sm font-medium text-status-open transition-colors hover:bg-status-open/5 sm:px-5"
              >
                View the full calendar →
              </Link>
            </Collapsible>
          </div>
        )}

        {featured.length > 0 && (
          <section className="scroll-reveal mt-10">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">
                Explore universities
              </h2>
              <Link
                href="/compare/universities"
                className="font-body text-sm font-medium text-status-open underline underline-offset-2"
              >
                Compare all
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {featured.map((u) => (
                <li key={u.slug}>
                  <Link
                    href={`/universities/${u.slug}`}
                    className="card card-hover group flex h-full flex-col justify-between gap-2 p-4"
                  >
                    <span className="font-body text-[0.95rem] font-semibold text-ink group-hover:underline">
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

        {(recentGuides.length > 0 || recentPosts.length > 0) && (
          <section className="scroll-reveal mt-10 grid gap-8 sm:grid-cols-2">
            {recentGuides.length > 0 && (
              <div>
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    From the guides
                  </h2>
                  <Link
                    href="/guides"
                    className="font-body text-sm font-medium text-status-open underline underline-offset-2"
                  >
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
              <div>
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Latest updates
                  </h2>
                  <Link
                    href="/blog"
                    className="font-body text-sm font-medium text-status-open underline underline-offset-2"
                  >
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
                          ? new Date(p.published_at).toLocaleDateString("en-AU", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
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

        <WhyTrust className="scroll-reveal mt-10" />
      </div>
    </main>
  );
}
