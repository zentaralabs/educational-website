"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicProgramRow } from "@/lib/queries/public-programs";

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
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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

      {filtered.length === 0 ? (
        <p className="rounded-md border border-ink/10 px-4 py-6 text-center font-body text-sm text-slate">
          No programs match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {pageItems.map((p) => (
            <Link
              key={p.id}
              href={`/universities/${universitySlug}/programs/${p.slug}`}
              className="group flex items-center justify-between gap-4 rounded-md border border-ink/10 bg-paper py-3 pr-3 pl-3 text-sm transition-colors duration-150 hover:border-status-open/60 hover:bg-ink/[0.015]"
              style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-status-open)" }}
            >
              <div className="min-w-0">
                <p className="truncate text-ink">{p.name}</p>
                <p className="mt-0.5 truncate font-utility text-xs text-slate">
                  {[p.degree_level?.name, p.subject?.name].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="flex-shrink-0 text-slate transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-status-open"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      )}

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
