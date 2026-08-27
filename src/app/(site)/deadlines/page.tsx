import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { deadlineBadgeStatus, formatDeadlineDate } from "@/lib/deadline-status";
import {
  listDeadlineFilterOptions,
  listPublishedDeadlines,
  type PublicDeadlineRow,
} from "@/lib/queries/public-deadlines";

const SELECT_CLASS =
  "rounded-lg border border-ink/15 bg-paper px-3 py-2 font-body text-sm text-ink transition-colors duration-150 hover:border-ink/30 focus-visible:border-status-open focus-visible:outline-none";

export const metadata = {
  title: "Application Deadline Calendar",
  description:
    "Recommended international application dates for every intake at Australian universities, by degree level. Filterable by country, level, and intake.",
  alternates: { canonical: "/deadlines" },
};

function groupByMonth(deadlines: PublicDeadlineRow[]) {
  const groups = new Map<string, PublicDeadlineRow[]>();
  for (const d of deadlines) {
    const key = d.is_rolling
      ? "Rolling"
      : new Date(d.deadline_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }
  return groups;
}

function buildPageHref(
  filters: { country?: string; degreeLevel?: string; type?: string },
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.degreeLevel) params.set("degreeLevel", filters.degreeLevel);
  if (filters.type) params.set("type", filters.type);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/deadlines?${qs}` : "/deadlines";
}

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{
    country?: string;
    degreeLevel?: string;
    type?: string;
    page?: string;
  }>;
}) {
  const { page: pageParam, ...filters } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ rows: deadlines, totalCount, pageSize }, options] = await Promise.all([
    listPublishedDeadlines(filters, page),
    listDeadlineFilterOptions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const grouped = groupByMonth(deadlines);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "University application deadlines",
    description: "Aggregated, sourced application deadlines for universities in Australia.",
    variableMeasured: "Application deadline date",
  };

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Deadlines" }];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {totalCount} sourced deadlines
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          Application deadline calendar
        </h1>
        <p className="mt-2 font-body text-base text-slate">
          Recommended international application dates for each intake, filterable
          by country, degree level, and intake.
        </p>
      </div>

      <p className="mt-4 rounded-xl border border-status-pending/25 bg-status-pending/5 px-4 py-3 font-body text-sm text-slate">
        Australian universities run fixed intakes (Semester 1 starts in February
        or March, Semester 2 in July) and, rather than one hard cut-off, publish
        a recommended time to apply: roughly three to four months before the
        intake. Postgraduate coursework and competitive courses (medicine, law,
        portfolio-based programs) close earlier. Later applications are often
        still accepted while places and visa-processing time remain. Confirm the
        date for your specific course with the university.
      </p>

      <form
        method="GET"
        className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-ink/[0.02] p-4"
      >
        <select name="country" defaultValue={filters.country ?? ""} className={SELECT_CLASS}>
          <option value="">All countries</option>
          {options.countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          name="degreeLevel"
          defaultValue={filters.degreeLevel ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">All degree levels</option>
          {options.degreeLevels.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select name="type" defaultValue={filters.type ?? ""} className={SELECT_CLASS}>
          <option value="">All deadline types</option>
          {options.deadlineTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-lg bg-ink px-4 py-2 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          Filter
        </button>
        {(filters.country || filters.degreeLevel || filters.type) && (
          <Link
            href="/deadlines"
            className="font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
          >
            Clear filters
          </Link>
        )}
      </form>

      <div className="mt-6 flex flex-col gap-8">
        {grouped.size === 0 && (
          <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center">
            <p className="font-body text-base text-slate">
              No deadlines match those filters —{" "}
              <Link href="/deadlines" className="text-status-open underline underline-offset-2">
                clear them
              </Link>{" "}
              to see the full calendar.
            </p>
          </div>
        )}
        {[...grouped.entries()].map(([month, rows]) => (
          <section key={month}>
            <h2 className="mb-2 font-utility text-xs font-semibold tracking-widest text-slate uppercase">
              {month}
            </h2>
            <div className="overflow-hidden rounded-md border border-ink/15">
              {rows.map((d, i) => {
                const status = deadlineBadgeStatus(d.deadline_date, d.is_rolling);
                return (
                  <Link
                    key={d.id}
                    href={d.university ? `/universities/${d.university.slug}` : "#"}
                    className="flex items-center justify-between gap-4 border-l-4 px-4 py-3 text-sm transition-colors duration-150 hover:bg-ink/[0.03]"
                    style={{
                      borderLeftColor: `var(--color-status-${status})`,
                      borderBottomWidth: i < rows.length - 1 ? 1 : 0,
                      borderBottomColor:
                        "color-mix(in srgb, var(--color-ink) 10%, transparent)",
                    }}
                  >
                    <span className="text-ink">
                      <span className="font-medium">{d.university?.name}</span>
                      {" — "}
                      {d.deadline_type?.name}
                      {d.degree_level && ` (${d.degree_level.name})`}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 font-utility text-xs text-slate">
                        {status === "open" && (
                          <span
                            aria-hidden="true"
                            className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-status-open"
                          />
                        )}
                        {formatDeadlineDate(d.deadline_date, d.is_rolling)}
                      </span>
                      <StatusBadge status={status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-4">
          {page > 1 ? (
            <Link
              href={buildPageHref(filters, page - 1)}
              className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          <span className="font-utility text-xs text-slate">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={buildPageHref(filters, page + 1)}
              className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </main>
  );
}
