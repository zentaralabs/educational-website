import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { deadlineBadgeStatus, formatDeadlineDate } from "@/lib/deadline-status";
import {
  listDeadlineFilterOptions,
  listPublishedDeadlines,
} from "@/lib/queries/public-deadlines";

export const metadata = {
  title: "Application Deadline Calendar",
  description:
    "Filterable, sourced application deadlines for universities in the US, UK, Canada, Australia, and New Zealand.",
};

function groupByMonth(
  deadlines: Awaited<ReturnType<typeof listPublishedDeadlines>>,
) {
  const groups = new Map<string, typeof deadlines>();
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

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; degreeLevel?: string; type?: string }>;
}) {
  const filters = await searchParams;

  const [deadlines, options] = await Promise.all([
    listPublishedDeadlines(filters),
    listDeadlineFilterOptions(),
  ]);

  const grouped = groupByMonth(deadlines);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "University application deadlines",
    description:
      "Aggregated, sourced application deadlines for universities in the US, UK, Canada, Australia, and New Zealand.",
    variableMeasured: "Application deadline date",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Application deadline calendar
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        {deadlines.length} sourced deadlines, filterable by country, degree
        level, and application type.
      </p>

      <form
        method="GET"
        className="mt-6 flex flex-wrap gap-3 border-y border-ink/10 py-4"
      >
        <select
          name="country"
          defaultValue={filters.country ?? ""}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
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
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="">All degree levels</option>
          {options.degreeLevels.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="">All deadline types</option>
          {options.deadlineTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-md border border-ink px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
        >
          Filter
        </button>
        {(filters.country || filters.degreeLevel || filters.type) && (
          <Link
            href="/deadlines"
            className="flex items-center font-body text-sm text-slate underline underline-offset-2"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 flex flex-col gap-8">
        {grouped.size === 0 && (
          <p className="py-8 text-center font-body text-sm text-slate">
            No deadlines match those filters.
          </p>
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
                      <span className="font-utility text-xs text-slate">
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
    </main>
  );
}
