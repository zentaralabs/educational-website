"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicProgramRow } from "@/lib/queries/public-programs";
import { formatCurrency } from "@/lib/format";

function formatDuration(years: number | null): string | null {
  if (years == null || years <= 0) return null;
  const isWholeOrHalf = Math.abs(years * 2 - Math.round(years * 2)) < 0.01;
  if (isWholeOrHalf && years >= 1) {
    const v = Math.round(years * 2) / 2;
    return `${v} year${v === 1 ? "" : "s"}`;
  }
  return `${Math.round(years * 12)} months`;
}

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");

/** A saved source link is shown only when its last path segment clearly names
 * this course. Many saved links point at a parent degree or a sibling award
 * (about a quarter of the merged rows checked), and a wrong "Official page"
 * link is worse than none. */
function linkNamesThisCourse(url: string | null, name: string, slug: string): boolean {
  if (!url) return false;
  const last = norm(url.replace(/[?#].*$/, "").replace(/\/+$/, "").split("/").pop() ?? "");
  if (last.length < 6) return false;
  const n = norm(name), sl = norm(slug);
  return n.includes(last) || last.includes(n) || sl.includes(last) || last.includes(sl);
}

const PAGE_SIZE = 10;

export function ProgramsList({
  programs,
  universitySlug,
}: {
  programs: PublicProgramRow[];
  universitySlug: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter((p) =>
      [p.name, p.degree_level?.name, p.subject?.name]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [programs, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  // Every program keeps a real <Link> in the DOM at all times so crawlers can
  // find and follow every program page, even though only the current
  // page/search result is visible to a person. Pagination and search here are
  // a client-side view filter, not a way to hide links from the crawl graph.
  const filteredIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered]);
  const pageIds = useMemo(() => new Set(pageItems.map((p) => p.id)), [pageItems]);

  if (programs.length === 0) return null;

  return (
    <div className="mt-4">
      {programs.length > PAGE_SIZE && (
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={`Search ${programs.length} programs by name, level, or subject…`}
          className="mb-3 w-full rounded-md border border-ink/20 px-3 py-2 font-body text-sm text-ink placeholder:text-slate/60 transition-colors duration-150 focus:border-status-open focus:outline-none"
        />
      )}

      {filtered.length === 0 && (
        <p className="rounded-md border border-ink/10 px-4 py-6 text-center font-body text-sm text-slate">
          No programs match &ldquo;{query}&rdquo;.
        </p>
      )}

      <div className="flex flex-col gap-2" hidden={filtered.length === 0}>
        {programs.map((p) => {
          const hidden = !(filteredIds.has(p.id) && pageIds.has(p.id));
          const label = (
            <div className="min-w-0">
              <p className="truncate text-ink">{p.name}</p>
              <p className="mt-0.5 truncate font-utility text-xs text-slate">
                {[p.degree_level?.name, p.subject?.name].filter(Boolean).join(" · ")}
              </p>
            </div>
          );
          const facts = [
            formatDuration(p.duration_years),
            p.tuition_international != null
              ? `Tuition ${formatCurrency(p.tuition_international, p.currency ?? "AUD")} (international)`
              : null,
          ].filter(Boolean).join(" · ");
          // Merged into this list (migration 0040): no page of our own yet, so
          // the row points at the course on the university's own site.
          if (!p.has_own_page) {
            const official = linkNamesThisCourse(p.source_url, p.name, p.slug) ? p.source_url : null;
            return (
              <div
                key={p.id}
                hidden={hidden}
                className="flex items-start justify-between gap-4 rounded-md border border-ink/10 bg-paper py-3 pr-3 pl-3 text-sm"
                style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-line)" }}
              >
                <div className="min-w-0">
                  {label}
                  {p.blurb && (
                    <p className="mt-1.5 line-clamp-2 font-body text-xs leading-relaxed text-slate">{p.blurb}</p>
                  )}
                  {facts && <p className="mt-1 font-utility text-xs text-slate">{facts}</p>}
                </div>
                {official && (
                  <a
                    href={official}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex-shrink-0 font-utility text-xs text-slate underline underline-offset-2 hover:text-ink"
                  >
                    Official page
                  </a>
                )}
              </div>
            );
          }
          return (
            <Link
              key={p.id}
              href={`/universities/${universitySlug}/programs/${p.slug}`}
              hidden={hidden}
              className="group flex items-center justify-between gap-4 rounded-md border border-ink/10 bg-paper py-3 pr-3 pl-3 text-sm transition-colors duration-150 hover:border-status-open/60 hover:bg-ink/[0.015]"
              style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-status-open)" }}
            >
              {label}
              <span
                aria-hidden="true"
                className="flex-shrink-0 text-slate transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-status-open"
              >
                →
              </span>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between">
          {currentPage > 1 ? (
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
            >
              ← Previous
            </button>
          ) : (
            <span />
          )}

          <span className="font-utility text-xs text-slate">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
            >
              Next →
            </button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
