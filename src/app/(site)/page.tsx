import Link from "next/link";
import { SearchBar } from "@/components/site/SearchBar";
import { StudentTypeToggle } from "@/components/site/StudentTypeToggle";
import { formatCurrency } from "@/lib/format";
import { listPublicCountries } from "@/lib/queries/public-countries";
import { getHomepageStats } from "@/lib/queries/public-stats";
import { listFeaturedUniversities } from "@/lib/queries/public-universities";
import { SITE_DESCRIPTION } from "@/lib/site-config";

export const revalidate = 3600;

export const metadata = {
  title: {
    absolute:
      "University Application Deadlines, Admissions & Costs — Where To Apply",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const CTAS = [
  { label: "Browse deadlines", href: "/deadlines" },
  { label: "Compare universities", href: "/compare/universities" },
  { label: "Application guides", href: "/guides" },
  { label: "Visa subclasses", href: "/visas" },
];

export default async function Home() {
  const [stats, countries, featured] = await Promise.all([
    getHomepageStats(),
    listPublicCountries(),
    listFeaturedUniversities(6),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="animate-fade-up text-center" style={{ animationDelay: "0ms" }}>
        <p className="mb-3 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          {stats.universityCount.toLocaleString()} universities ·{" "}
          {stats.deadlineCount.toLocaleString()} deadlines tracked
        </p>

        <h1 className="font-display text-4xl font-semibold text-ink text-balance">
          Where should you apply?
        </h1>

        <p className="mx-auto mt-3 max-w-xl font-body text-base text-slate text-balance">
          Compare universities, application deadlines, tuition, entry
          requirements, and scholarships for Australia in one place.
        </p>

        <SearchBar />

        <div className="mt-3 flex justify-center">
          <StudentTypeToggle />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CTAS.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className="rounded-md border border-ink/15 px-4 py-2 font-body text-sm font-medium text-ink/80 transition-colors duration-150 hover:border-status-open hover:text-ink"
            >
              {cta.label}
            </Link>
          ))}
        </div>

        <p className="mt-5 font-body text-sm text-slate">
          Or browse by country:{" "}
          {countries.map((c, i) => (
            <span key={c.code}>
              <Link
                href={`/deadlines?country=${c.code}`}
                className="underline decoration-status-pending/0 decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-status-pending"
              >
                {c.name}
              </Link>
              {i < countries.length - 1 && " · "}
            </span>
          ))}
          {"  ·  "}
          <Link
            href="/quiz"
            className="underline decoration-status-pending/0 decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-status-pending"
          >
            Find the right university for me
          </Link>
        </p>
      </div>

      {featured.length > 0 && (
        <section
          className="animate-fade-up mt-12"
          style={{ animationDelay: "80ms" }}
        >
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-body text-xs font-semibold tracking-widest text-slate uppercase">
              Explore universities
            </h2>
            <Link
              href="/compare/universities"
              className="font-body text-sm text-status-open underline underline-offset-2"
            >
              Compare all
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {featured.map((u) => (
              <li key={u.slug}>
                <Link
                  href={`/universities/${u.slug}`}
                  className="group flex h-full flex-col justify-between gap-2 rounded-xl border border-ink/10 bg-ink/[0.02] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:bg-ink/[0.03] hover:shadow-sm"
                >
                  <span className="font-body text-sm font-semibold text-ink group-hover:underline">
                    {u.name}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-utility text-xs text-slate">
                    {u.city && <span>{u.city}</span>}
                    {u.tuition_international != null && (
                      <span>
                        Intl tuition from{" "}
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

      <p
        className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-body text-xs text-slate"
        style={{ animationDelay: "120ms" }}
      >
        <span>Researched from official university sources and regularly verified.</span>
        <Link href="/about" className="underline underline-offset-2 hover:text-ink">
          Independent, not affiliated with any university.
        </Link>
      </p>
    </main>
  );
}
