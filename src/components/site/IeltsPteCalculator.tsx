"use client";

import { useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  IELTS_PTE_CONCORDANCE,
  PTE_MAX_MAPPED,
  PTE_MIN_MAPPED,
  cefrForPte,
  ieltsRowForPte,
  rowForIelts,
} from "@/lib/english-test-scores";

type Direction = "ielts-to-pte" | "pte-to-ielts";

const inputCls =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-status-open/50";
const labelCls = "font-body text-xs font-semibold tracking-wide text-slate uppercase";

export function IeltsPteCalculator() {
  const [direction, setDirection] = useState<Direction>("ielts-to-pte");
  const [ielts, setIelts] = useState<number>(6.5);
  const [pte, setPte] = useState<number | "">(58);

  const usedRef = useRef(false);
  const markUsed = () => {
    if (usedRef.current) return;
    usedRef.current = true;
    trackEvent("calculator_used", { calculator: "ielts_pte" });
  };

  const result = useMemo(() => {
    if (direction === "ielts-to-pte") {
      const row = rowForIelts(ielts);
      if (!row) return null;
      return { row, cefr: cefrForPte(row.pteMax) };
    }
    if (pte === "") return null;
    const row = ieltsRowForPte(Number(pte));
    if (!row) return null;
    return { row, cefr: cefrForPte(Number(pte)) };
  }, [direction, ielts, pte]);

  const outOfRange = direction === "pte-to-ielts" && pte !== "" && !result;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            markUsed();
            setDirection("ielts-to-pte");
          }}
          aria-pressed={direction === "ielts-to-pte"}
          className={`rounded-lg border px-3 py-1.5 font-body text-sm font-medium transition-colors duration-150 ${
            direction === "ielts-to-pte"
              ? "border-status-open/50 bg-status-open/10 text-status-open"
              : "border-line text-slate hover:border-status-open/50 hover:text-status-open"
          }`}
        >
          I have an IELTS score
        </button>
        <button
          type="button"
          onClick={() => {
            markUsed();
            setDirection("pte-to-ielts");
          }}
          aria-pressed={direction === "pte-to-ielts"}
          className={`rounded-lg border px-3 py-1.5 font-body text-sm font-medium transition-colors duration-150 ${
            direction === "pte-to-ielts"
              ? "border-status-open/50 bg-status-open/10 text-status-open"
              : "border-line text-slate hover:border-status-open/50 hover:text-status-open"
          }`}
        >
          I have a PTE score
        </button>
      </div>

      {direction === "ielts-to-pte" ? (
        <div className="max-w-[10rem]">
          <label className={labelCls} htmlFor="ielts-select">
            IELTS Academic overall
          </label>
          <select
            id="ielts-select"
            value={ielts}
            onChange={(e) => {
              markUsed();
              setIelts(Number(e.target.value));
            }}
            className={`${inputCls} mt-1`}
          >
            {IELTS_PTE_CONCORDANCE.map((row) => (
              <option key={row.ielts} value={row.ielts}>
                {row.ielts.toFixed(1)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="max-w-[10rem]">
          <label className={labelCls} htmlFor="pte-input">
            PTE Academic overall
          </label>
          <input
            id="pte-input"
            type="number"
            min={10}
            max={90}
            value={pte}
            onChange={(e) => {
              markUsed();
              setPte(e.target.value === "" ? "" : Number(e.target.value));
            }}
            className={`${inputCls} mt-1`}
          />
        </div>
      )}

      {result ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-status-open/30 bg-status-open/5 p-5">
            <p className={labelCls}>IELTS Academic overall</p>
            <p className="mt-1 font-display text-3xl font-semibold text-status-open">
              {result.row.ielts.toFixed(1)}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-mist p-5">
            <p className={labelCls}>Equivalent PTE range</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">
              {result.row.pteMin === result.row.pteMax
                ? result.row.pteMin
                : `${result.row.pteMin}–${result.row.pteMax}`}
            </p>
            <p className="mt-1 font-body text-xs text-slate">
              PTE Academic overall score
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-mist p-5">
            <p className={labelCls}>CEFR level</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">{result.cefr}</p>
          </div>
        </div>
      ) : outOfRange ? (
        <p className="rounded-xl border border-line bg-mist px-4 py-6 text-center font-body text-sm text-slate">
          Pearson only publishes an official concordance for PTE scores{" "}
          {PTE_MIN_MAPPED}–{PTE_MAX_MAPPED} (IELTS 4.5–9.0). A score of {pte} falls
          outside that published range.
        </p>
      ) : (
        <p className="rounded-xl border border-line bg-mist px-4 py-6 text-center font-body text-sm text-slate">
          Enter a PTE score to see the equivalent IELTS band.
        </p>
      )}

      <p className="font-body text-xs text-slate">
        Based on Pearson&rsquo;s official PTE Academic ↔ IELTS Academic concordance
        (July 2025 Score Guide). Pearson publishes each IELTS band as a range of
        PTE scores, not a single number, and says score relationships between
        tests are always an approximation, not an exact formula. The institution
        or visa route you&rsquo;re applying to sets its own accepted score and can
        override this table, so confirm the exact requirement with them before
        relying on this conversion.
      </p>
    </div>
  );
}
