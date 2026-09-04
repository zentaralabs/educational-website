import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DeadlineTable } from "@/components/site/DeadlineTable";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { listPageCanonical } from "@/lib/list-page-metadata";
import { SITE_NAME, SITE_URL, SITE_YEAR } from "@/lib/site-config";
import {
  listDeadlineFilterOptions,
  listPublishedDeadlines,
  type PublicDeadlineRow,
} from "@/lib/queries/public-deadlines";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

const SELECT_CLASS =
  "rounded-lg border border-ink/15 bg-paper px-3 py-2 font-body text-sm text-ink transition-colors duration-150 hover:border-ink/30 focus-visible:border-status-open focus-visible:outline-none";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    country?: string;
    degreeLevel?: string;
    type?: string;
    page?: string;
  }>;
}): Promise<Metadata> {
  const { country, degreeLevel, type, page: pageParam } = await searchParams;

  return {
    ...pageMetadata({
      title: `Australian University Application Deadlines ${SITE_YEAR + 1}`,
      description:
        "International application dates for every intake at Australian universities, by degree level: firm closing dates where they exist, recommended apply-by dates where admissions are rolling.",
      path: "/deadlines",
      type: "website",
    }),
    ...listPageCanonical({
      base: "/deadlines",
      isFiltered: Boolean(country || degreeLevel || type),
      page: Math.max(1, Number(pageParam) || 1),
    }),
  };
}

// Every row now shows a month, including the rolling ones (whose date is our
// recommended apply-by), so they all group by that month. A separate
// "Rolling" bucket would put a heading saying one thing over rows saying
// another.
function groupByMonth(deadlines: PublicDeadlineRow[]) {
  const groups = new Map<string, PublicDeadlineRow[]>();
  for (const d of deadlines) {
    const key = new Date(d.deadline_date).toLocaleDateString("en-US", {
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
    url: `${SITE_URL}/deadlines`,
    variableMeasured: "Application deadline date",
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    license: `${SITE_URL}/terms`,
  };

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Deadlines" }];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-wide text-status-open uppercase">
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
        or March, Semester 2 in July; a few use terms or trimesters). Some, such
        as the University of Sydney and ANU, publish a firm international closing
        date; others assess applications on a rolling basis and close courses
        once full, so the date shown is the recommended time to apply, roughly
        three to four months before the intake. Postgraduate coursework and
        competitive courses (medicine, law, portfolio-based programs) close
        earlier. Confirm the date for your specific course with the university.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {[
          { href: "/deadlines/february-2027-intake", label: "February 2027 intake" },
          { href: "/deadlines/july-2027-intake", label: "July 2027 intake" },
        ].map((hub) => (
          <Link
            key={hub.href}
            href={hub.href}
            className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-status-open/30 bg-status-open/[0.04] px-4 py-3 font-body text-sm transition-colors duration-150 hover:border-status-open/50"
          >
            <span className="text-ink">
              <span className="font-semibold">{hub.label}:</span> full table,
              timeline, and what changed
            </span>
            <span aria-hidden="true" className="text-status-open">
              &rarr;
            </span>
          </Link>
        ))}
      </div>

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
              No deadlines match those filters.{" "}
              <Link href="/deadlines" className="text-status-open underline underline-offset-2">
                Clear them
              </Link>{" "}
              to see the full calendar.
            </p>
          </div>
        )}
        {[...grouped.entries()].map(([month, rows]) => (
          <section key={month}>
            <h2 className="mb-2 font-utility text-xs font-semibold tracking-wide text-slate uppercase">
              {month}
            </h2>
            <DeadlineTable
              labelHeading="University"
              pulseOnOpen
              items={rows.map((d) => ({
                id: d.id,
                label: (
                  <>
                    <span className="font-medium text-ink">
                      {d.university?.name}
                    </span>
                    {" · "}
                    {d.deadline_type?.name}
                    {d.degree_level && ` (${d.degree_level.name})`}
                  </>
                ),
                deadlineDate: d.deadline_date,
                isRolling: d.is_rolling,
                dateKind: d.date_kind,
                ...(d.university
                  ? { href: `/universities/${d.university.slug}` }
                  : {}),
              }))}
            />
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
