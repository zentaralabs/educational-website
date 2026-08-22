"use client";

import type { ReactNode } from "react";
import { formatCurrency, formatEnglishScore } from "@/lib/format";
import { useStudentType } from "@/lib/student-type";
import { CoinIcon, GlobeIcon } from "@/components/site/icons";

function Widget({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group rounded-xl border border-ink/10 bg-ink/[0.02] p-4 transition-all duration-150 hover:border-status-open/30 hover:bg-ink/[0.03] hover:shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-status-open/10 text-status-open">
          {icon}
        </span>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-slate">{title}</p>
      </div>
      <div className="flex flex-col divide-y divide-ink/10">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <span className="font-body text-xs text-slate">{label}</span>
      <span className="font-utility text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

/**
 * Sidebar widget cards next to the program overview — cost/duration and
 * English test scores (hidden for domestic visitors) grouped into two
 * bordered boxes rather than one card per fact, so related numbers read
 * together instead of as a stack of near-identical small boxes.
 */
export function ProgramSidebar({
  durationYears,
  tuitionDomestic,
  tuitionDomesticIsCsp,
  tuitionInternational,
  currency,
  ieltsOverall,
  ieltsListening,
  ieltsReading,
  ieltsWriting,
  ieltsSpeaking,
  pteOverall,
  pteListening,
  pteReading,
  pteWriting,
  pteSpeaking,
}: {
  durationYears: number | null;
  tuitionDomestic: number | null;
  tuitionDomesticIsCsp: boolean | null;
  tuitionInternational: number | null;
  currency: string;
  ieltsOverall: number | null;
  ieltsListening: number | null;
  ieltsReading: number | null;
  ieltsWriting: number | null;
  ieltsSpeaking: number | null;
  pteOverall: number | null;
  pteListening: number | null;
  pteReading: number | null;
  pteWriting: number | null;
  pteSpeaking: number | null;
}) {
  const { resolved } = useStudentType();
  const showEnglish = resolved !== "domestic";

  const primary = resolved === "domestic" ? tuitionDomestic : tuitionInternational;
  const fallback = resolved === "domestic" ? tuitionInternational : tuitionDomestic;
  const tuitionAmount = primary ?? fallback;
  const usedFallback = primary === null && fallback !== null;
  const showingDomestic = resolved === "domestic" && !usedFallback;
  const tuitionLabel = `Tuition (${usedFallback ? (resolved === "domestic" ? "international" : "domestic") : resolved})`;

  const ieltsSummary = showEnglish
    ? formatEnglishScore(ieltsOverall, ieltsListening, ieltsReading, ieltsWriting, ieltsSpeaking)
    : null;
  const pteSummary = showEnglish
    ? formatEnglishScore(pteOverall, pteListening, pteReading, pteWriting, pteSpeaking)
    : null;

  return (
    <div className="flex flex-col gap-3">
      <Widget title="Cost & duration" icon={<CoinIcon className="h-3.5 w-3.5" />}>
        <Row label="Duration" value={durationYears ? `${durationYears} yr` : null} />
        <Row label={tuitionLabel} value={formatCurrency(tuitionAmount, currency)} />
      </Widget>
      {showingDomestic && tuitionDomesticIsCsp && (
        <p className="-mt-1.5 px-1 font-body text-xs text-slate">
          Commonwealth Supported Place rate — limited, not guaranteed; full domestic fee otherwise.
        </p>
      )}
      {(ieltsSummary || pteSummary) && (
        <Widget title="English test scores" icon={<GlobeIcon className="h-3.5 w-3.5" />}>
          <Row label="IELTS" value={ieltsSummary} />
          <Row label="PTE" value={pteSummary} />
        </Widget>
      )}
    </div>
  );
}
