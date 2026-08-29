import Link from "next/link";
import { Collapsible } from "@/components/site/Collapsible";
import { SearchBar } from "@/components/site/SearchBar";
import { StudentTypeToggle } from "@/components/site/StudentTypeToggle";
import { deadlineBadgeStatus } from "@/lib/deadline-status";
import { formatCurrency } from "@/lib/format";
import { listPublicCountries } from "@/lib/queries/public-countries";
import { listUpcomingDeadlines } from "@/lib/queries/public-deadlines";
import { getHomepageStats } from "@/lib/queries/public-stats";
import { listFeaturedUniversities } from "@/lib/queries/public-universities";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
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

export const metadata = {
  title: {
    absolute:
      "University Application Deadlines, Admissions & Costs | Where To Apply",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const TASKS = [
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
    label: "Compare living costs",
    href: "/cost-of-living",
    desc: "Monthly student budgets by city",
  },
];

const POPULAR = [
  { label: "2027 application deadlines", href: "/deadlines" },
  {
    label: "Most affordable universities for international students",
    href: "/best/affordable-australian-universities-for-international-students",
  },
  {
    label: "Universities accepting IELTS 6.0",
    href: "/best/australian-universities-accepting-ielts-6-0-for-international-students",
  },
  {
    label: "Universities with multiple intakes a year",
    href: "/best/australian-universities-with-multiple-intakes-per-year",
  },
  {
    label: "Universities with no application fee",
    href: "/best/australian-universities-with-no-application-fee",
  },
  {
    label: "Universities with automatic scholarships",
    href: "/best/australian-universities-with-automatic-scholarships",
  },
  {
    label: "Melbourne vs Sydney",
    href: "/compare/university-of-melbourne-vs-university-of-sydney",
  },
  {
    label: "Monash vs UNSW",
    href: "/compare/monash-university-vs-unsw-sydney",
  },
];

export default async function Home() {
  const [stats, countries, featured, upcoming] = await Promise.all([
    getHomepageStats(),
    listPublicCountries(),
    listFeaturedUniversities(6),
    listUpcomingDeadlines(6),
  ]);

  return (
    <main className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--color-status-open)_10%,transparent),transparent)]"
        />
        <div className="relative mx-auto w-full max-w-3xl px-6 pt-8 pb-8 text-center sm:pt-12">
          <p
            className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-mist px-3 py-1 font-utility text-[0.7rem] font-semibold tracking-widest text-status-open uppercase"
            style={{ animationDelay: "0ms" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full bg-status-open" />
            </span>
            {stats.universityCount.toLocaleString()} universities ·{" "}
            {stats.deadlineCount.toLocaleString()} deadlines tracked
          </p>

          <h1
            className="animate-fade-up font-display text-[2.5rem] leading-[1.05] font-semibold text-ink text-balance sm:text-6xl"
            style={{ animationDelay: "40ms" }}
          >
            Where should you apply?
          </h1>

          <p
            className="animate-fade-up mx-auto mt-4 max-w-xl font-body text-base text-slate text-balance sm:text-lg"
            style={{ animationDelay: "80ms" }}
          >
            Compare universities, application deadlines, tuition, entry
            requirements, and scholarships for Australia in one place.
          </p>

          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <SearchBar />
            <div className="mt-3 flex justify-center">
              <StudentTypeToggle />
            </div>
          </div>

          <p
            className="animate-fade-up mt-6 font-body text-sm text-slate"
            style={{ animationDelay: "160ms" }}
          >
            Or browse by country:{" "}
            {countries.map((c, i) => (
              <span key={c.code}>
                <Link
                  href={`/deadlines?country=${c.code}`}
                  className="font-medium text-ink underline decoration-status-pending/30 decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-status-pending"
                >
                  {c.name}
                </Link>
                {i < countries.length - 1 && " · "}
              </span>
            ))}
            {"  ·  "}
            <Link
              href="/quiz"
              className="font-medium text-ink underline decoration-status-pending/30 decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-status-pending"
            >
              Find the right university for me
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pb-16">
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

        <div className="scroll-reveal mt-10 flex flex-col items-center gap-2 rounded-2xl border border-line bg-mist px-6 py-6 text-center">
          <p className="font-body text-sm font-medium text-ink">
            Researched from official university sources and regularly verified.
          </p>
          <Link
            href="/about"
            className="font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
          >
            Independent, not affiliated with any university →
          </Link>
        </div>
      </div>
    </main>
  );
}
