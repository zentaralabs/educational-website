"use client";

import { formatCurrency } from "@/lib/format";
import { useStudentType } from "@/lib/student-type";

/**
 * Shows the tuition figure matching the visitor's domestic/international
 * choice (falls back to whichever figure exists if only one is set).
 */
export function TuitionFact({
  domestic,
  domesticIsCsp,
  international,
  currency,
}: {
  domestic: number | null;
  domesticIsCsp?: boolean | null;
  international: number | null;
  currency: string;
}) {
  const { resolved } = useStudentType();

  const primary = resolved === "domestic" ? domestic : international;
  const fallback = resolved === "domestic" ? international : domestic;
  const amount = primary ?? fallback;
  const usedFallback = primary === null && fallback !== null;
  const showingDomestic = resolved === "domestic" && !usedFallback;

  const formatted = formatCurrency(amount, currency);
  if (!formatted) return null;

  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
        Tuition {usedFallback ? `(${resolved === "domestic" ? "international" : "domestic"})` : `(${resolved})`}
      </dt>
      <dd className="font-utility text-lg font-medium text-status-open">{formatted}</dd>
      {showingDomestic && domesticIsCsp && (
        <dd className="font-utility text-xs text-slate">
          Commonwealth Supported Place rate: limited, not guaranteed. Full domestic fee otherwise.
        </dd>
      )}
    </div>
  );
}
