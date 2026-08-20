"use client";

import { formatCurrency } from "@/lib/format";
import { useStudentType } from "@/lib/student-type";
import type { PublicProgramRow } from "@/lib/queries/public-programs";

export function ProgramsList({
  programs,
  universityFallback,
}: {
  programs: PublicProgramRow[];
  universityFallback: {
    tuition_domestic: number | null;
    tuition_international: number | null;
    currency: string;
    apply_url: string | null;
  };
}) {
  const { resolved } = useStudentType();

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-ink/15">
      {programs.map((p, i) => {
        const domestic = p.tuition_domestic ?? universityFallback.tuition_domestic;
        const international =
          p.tuition_international ?? universityFallback.tuition_international;
        const amount = resolved === "domestic" ? (domestic ?? international) : (international ?? domestic);
        const currency = p.currency ?? universityFallback.currency;
        const applyUrl = p.application_url ?? universityFallback.apply_url;

        return (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            style={{
              borderBottomWidth: i < programs.length - 1 ? 1 : 0,
              borderBottomColor: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
            }}
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
  );
}
