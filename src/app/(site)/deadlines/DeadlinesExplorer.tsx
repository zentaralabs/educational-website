"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DeadlineTable } from "@/components/site/DeadlineTable";
import type { PublicDeadlineRow } from "@/lib/queries/public-deadlines";

const SELECT_CLASS =
  "rounded-lg border border-ink/15 bg-paper px-3 py-2 font-body text-sm text-ink transition-colors duration-150 hover:border-ink/30 focus-visible:border-status-open focus-visible:outline-none";

type Filters = { country?: string; degreeLevel?: string; type?: string };
type FilterOptions = {
  countries: { code: string; name: string }[];
  degreeLevels: string[];
  deadlineTypes: string[];
};

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

function buildQuery(filters: Filters, page: number): string {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.degreeLevel) params.set("degreeLevel", filters.degreeLevel);
  if (filters.type) params.set("type", filters.type);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export function DeadlinesExplorer({
  initialRows,
  initialTotalCount,
  pageSize,
  options,
}: {
  initialRows: PublicDeadlineRow[];
  initialTotalCount: number;
  pageSize: number;
  options: FilterOptions;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    country: searchParams.get("country") ?? undefined,
    degreeLevel: searchParams.get("degreeLevel") ?? undefined,
    type: searchParams.get("type") ?? undefined,
  });
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get("page")) || 1));
  const [rows, setRows] = useState(initialRows);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [loading, setLoading] = useState(false);

  // The server already rendered the page=1/no-filter case; skip the redundant
  // fetch on mount so that view stays purely server-rendered.
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    const qs = buildQuery(filters, page);
    setLoading(true);
    fetch(`/api/deadlines${qs ? `?${qs}` : ""}`)
      .then((res) => res.json())
      .then((data: { rows: PublicDeadlineRow[]; totalCount: number }) => {
        setRows(data.rows);
        setTotalCount(data.totalCount);
      })
      .finally(() => setLoading(false));

    const path = qs ? `/deadlines?${qs}` : "/deadlines";
    router.replace(path, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const updateFilters = useCallback((next: Filters) => {
    setFilters(next);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const grouped = groupByMonth(rows);
  const hasFilters = Boolean(filters.country || filters.degreeLevel || filters.type);

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-ink/[0.02] p-4"
      >
        <select
          name="country"
          value={filters.country ?? ""}
          onChange={(e) =>
            updateFilters({ ...filters, country: e.target.value || undefined })
          }
          className={SELECT_CLASS}
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
          value={filters.degreeLevel ?? ""}
          onChange={(e) =>
            updateFilters({ ...filters, degreeLevel: e.target.value || undefined })
          }
          className={SELECT_CLASS}
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
          value={filters.type ?? ""}
          onChange={(e) =>
            updateFilters({ ...filters, type: e.target.value || undefined })
          }
          className={SELECT_CLASS}
        >
          <option value="">All deadline types</option>
          {options.deadlineTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => updateFilters({})}
            className="font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
          >
            Clear filters
          </button>
        )}
      </form>

      <div
        aria-live="polite"
        className={`mt-6 flex flex-col gap-8 transition-opacity duration-150 ${loading ? "opacity-60" : ""}`}
      >
        {grouped.size === 0 && (
          <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center">
            <p className="font-body text-base text-slate">
              No deadlines match those filters.{" "}
              <Link
                href="/deadlines"
                onClick={(e) => {
                  e.preventDefault();
                  updateFilters({});
                }}
                className="text-status-open underline underline-offset-2"
              >
                Clear them
              </Link>{" "}
              to see the full calendar.
            </p>
          </div>
        )}
        {[...grouped.entries()].map(([month, monthRows]) => (
          <section key={month}>
            <h2 className="mb-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
              {month}
            </h2>
            <DeadlineTable
              labelHeading="University"
              pulseOnOpen
              items={monthRows.map((d) => ({
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
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
            >
              ← Previous
            </button>
          ) : (
            <span />
          )}

          <span className="font-utility text-xs text-slate">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
            >
              Next →
            </button>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}
