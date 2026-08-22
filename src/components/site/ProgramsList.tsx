"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { useStudentType } from "@/lib/student-type";
import type { PublicProgramRow } from "@/lib/queries/public-programs";

const PAGE_SIZE = 10;

function formatEnglishScore(
  label: string,
  overall: number | null,
  listening: number | null,
  reading: number | null,
  writing: number | null,
  speaking: number | null,
): string | null {
  if (!overall) return null;
  const bands = [
    listening && `L${listening}`,
    reading && `R${reading}`,
    writing && `W${writing}`,
    speaking && `S${speaking}`,
  ]
    .filter(Boolean)
    .join(" ");
  return `${label} ${overall}${bands ? ` (${bands})` : ""}`;
}

export function ProgramsList({
  programs,
  universityFallback,
}: {
  programs: PublicProgramRow[];
  universityFallback: {
    tuition_domestic: number | null;
    tuition_domestic_is_csp: boolean | null;
    tuition_international: number | null;
    currency: string;
    apply_url: string | null;
    ielts_overall: number | null;
    ielts_listening: number | null;
    ielts_reading: number | null;
    ielts_writing: number | null;
    ielts_speaking: number | null;
    pte_overall: number | null;
    pte_listening: number | null;
    pte_reading: number | null;
    pte_writing: number | null;
    pte_speaking: number | null;
  };
}) {
  const { resolved } = useStudentType();
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
          {pageItems.map((p) => {
        const domestic = p.tuition_domestic ?? universityFallback.tuition_domestic;
        const international =
          p.tuition_international ?? universityFallback.tuition_international;
        const showingDomestic = resolved === "domestic" && domestic !== null;
        const amount = resolved === "domestic" ? (domestic ?? international) : (international ?? domestic);
        const currency = p.currency ?? universityFallback.currency;
        const applyUrl = p.application_url ?? universityFallback.apply_url;
        const isCsp =
          p.tuition_domestic_is_csp ?? universityFallback.tuition_domestic_is_csp;
        const ieltsText =
          resolved === "domestic"
            ? null
            : formatEnglishScore(
                "IELTS",
                p.ielts_overall ?? universityFallback.ielts_overall,
                p.ielts_listening ?? universityFallback.ielts_listening,
                p.ielts_reading ?? universityFallback.ielts_reading,
                p.ielts_writing ?? universityFallback.ielts_writing,
                p.ielts_speaking ?? universityFallback.ielts_speaking,
              );
        const pteText =
          resolved === "domestic"
            ? null
            : formatEnglishScore(
                "PTE",
                p.pte_overall ?? universityFallback.pte_overall,
                p.pte_listening ?? universityFallback.pte_listening,
                p.pte_reading ?? universityFallback.pte_reading,
                p.pte_writing ?? universityFallback.pte_writing,
                p.pte_speaking ?? universityFallback.pte_speaking,
              );

        return (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink/10 bg-paper py-3 pr-4 pl-3 text-sm"
            style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-status-open)" }}
          >
            <div>
              <span className="text-ink">
                {p.name}
                {p.degree_level && (
                  <span className="text-slate"> — {p.degree_level.name}</span>
                )}
                {p.subject && <span className="text-slate"> · {p.subject.name}</span>}
              </span>
              {p.last_verified_at && (
                <p className="mt-0.5 font-utility text-xs text-slate">
                  Fee last verified{" "}
                  {new Date(p.last_verified_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {p.source_url && (
                    <>
                      {" · "}
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="underline decoration-slate/40 underline-offset-2 hover:text-ink hover:decoration-ink"
                      >
                        source ↗
                      </a>
                    </>
                  )}
                </p>
              )}
              {showingDomestic && isCsp && (
                <p className="mt-0.5 font-utility text-xs text-slate">
                  Commonwealth Supported Place rate — places are limited and not guaranteed; without one you pay the full domestic fee.
                </p>
              )}
              {(p.admission_requirements ||
                (resolved !== "domestic" && p.english_requirements)) && (
                <p className="mt-1 max-w-md font-body text-xs text-slate">
                  {p.admission_requirements}
                  {p.admission_requirements &&
                    resolved !== "domestic" &&
                    p.english_requirements &&
                    " · "}
                  {resolved !== "domestic" && p.english_requirements}
                </p>
              )}
              {(ieltsText || pteText) && (
                <p className="mt-1 max-w-md font-body text-xs text-slate">
                  {ieltsText}
                  {ieltsText && pteText && " · "}
                  {pteText}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 font-utility text-xs text-slate">
              {p.duration_years && <span>{p.duration_years} yr</span>}
              <span>{formatCurrency(amount, currency) ?? "—"}</span>
              {applyUrl && (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-ink/20 px-2.5 py-1 font-body text-xs font-medium text-ink transition-colors duration-150 hover:border-status-open hover:text-status-open"
                >
                  Apply ↗
                </a>
              )}
            </div>
          </div>
        );
      })}
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
