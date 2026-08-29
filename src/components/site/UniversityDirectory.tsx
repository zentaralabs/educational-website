"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { AU_STATES } from "@/lib/australia";

export type DirectoryUniversity = {
  slug: string;
  name: string;
  city: string | null;
  states: string[];
  type: string | null;
  isGo8: boolean;
  isRegional: boolean;
  minTuition: number | null;
  ielts: number | null;
  hasJulyIntake: boolean;
  intakeCount: number;
};

type TuitionBand = "any" | "lt30" | "30to45" | "gte45";
type SortKey = "name" | "tuition" | "ielts";

const TUITION_BANDS: { key: TuitionBand; label: string; test: (n: number) => boolean }[] = [
  { key: "lt30", label: "Under A$30k", test: (n) => n < 30_000 },
  { key: "30to45", label: "A$30k to 45k", test: (n) => n >= 30_000 && n < 45_000 },
  { key: "gte45", label: "A$45k and up", test: (n) => n >= 45_000 },
];

const chip =
  "rounded-full border px-3 py-1.5 font-body text-sm transition-colors duration-150";
const chipOn = "border-status-open/50 bg-status-open/10 text-status-open";
const chipOff = "border-line bg-paper text-ink hover:border-status-open/40";

export function UniversityDirectory({
  universities,
}: {
  universities: DirectoryUniversity[];
}) {
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [type, setType] = useState<"" | "public" | "private">("");
  const [go8, setGo8] = useState(false);
  const [regional, setRegional] = useState(false);
  const [july, setJuly] = useState(false);
  const [ielts60, setIelts60] = useState(false);
  const [band, setBand] = useState<TuitionBand>("any");
  const [sort, setSort] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const bandDef = TUITION_BANDS.find((b) => b.key === band);

    const rows = universities.filter((u) => {
      if (needle && !u.name.toLowerCase().includes(needle)) return false;
      if (state && !u.states.includes(state)) return false;
      if (type && u.type !== type) return false;
      if (go8 && !u.isGo8) return false;
      if (regional && !u.isRegional) return false;
      if (july && !u.hasJulyIntake) return false;
      if (ielts60 && !(u.ielts != null && u.ielts <= 6.0)) return false;
      if (bandDef) {
        if (u.minTuition == null || !bandDef.test(u.minTuition)) return false;
      }
      return true;
    });

    rows.sort((a, b) => {
      if (sort === "tuition") {
        const av = a.minTuition ?? Number.POSITIVE_INFINITY;
        const bv = b.minTuition ?? Number.POSITIVE_INFINITY;
        if (av !== bv) return av - bv;
      }
      if (sort === "ielts") {
        const av = a.ielts ?? Number.POSITIVE_INFINITY;
        const bv = b.ielts ?? Number.POSITIVE_INFINITY;
        if (av !== bv) return av - bv;
      }
      return a.name.localeCompare(b.name);
    });

    return rows;
  }, [universities, q, state, type, go8, regional, july, ielts60, band, sort]);

  const anyFilter =
    q || state || type || go8 || regional || july || ielts60 || band !== "any";

  function reset() {
    setQ("");
    setState("");
    setType("");
    setGo8(false);
    setRegional(false);
    setJuly(false);
    setIelts60(false);
    setBand("any");
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-mist p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name"
            className="min-w-[10rem] flex-1 rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-status-open/50"
          />
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-status-open/50"
          >
            <option value="">All states</option>
            {AU_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "" | "public" | "private")}
            className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-status-open/50"
          >
            <option value="">Public &amp; private</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-status-open/50"
          >
            <option value="name">Sort: name</option>
            <option value="tuition">Sort: tuition (low to high)</option>
            <option value="ielts">Sort: IELTS (low to high)</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGo8((v) => !v)}
            className={`${chip} ${go8 ? chipOn : chipOff}`}
          >
            Group of Eight
          </button>
          <button
            type="button"
            onClick={() => setRegional((v) => !v)}
            className={`${chip} ${regional ? chipOn : chipOff}`}
          >
            Regional (migration points)
          </button>
          <button
            type="button"
            onClick={() => setJuly((v) => !v)}
            className={`${chip} ${july ? chipOn : chipOff}`}
          >
            Mid-year (July) intake
          </button>
          <button
            type="button"
            onClick={() => setIelts60((v) => !v)}
            className={`${chip} ${ielts60 ? chipOn : chipOff}`}
          >
            Accepts IELTS 6.0
          </button>
          <span className="mx-1 w-px self-stretch bg-line" aria-hidden />
          {TUITION_BANDS.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBand((v) => (v === b.key ? "any" : b.key))}
              className={`${chip} ${band === b.key ? chipOn : chipOff}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 font-body text-sm text-slate">
        <span>
          {filtered.length} of {universities.length} universities
        </span>
        {anyFilter && (
          <button
            type="button"
            onClick={reset}
            className="underline underline-offset-2 hover:text-ink"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line bg-mist p-6 font-body text-base text-slate">
          No universities match those filters. Try removing one.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {filtered.map((u) => (
            <li key={u.slug}>
              <Link
                href={`/universities/${u.slug}`}
                className="card card-hover group flex h-full flex-col gap-2 p-4"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display text-[1.05rem] font-semibold text-ink group-hover:underline">
                    {u.name}
                  </span>
                  {u.isGo8 && (
                    <span className="flex-shrink-0 rounded-full bg-ink/[0.06] px-2 py-0.5 font-utility text-[10px] font-semibold tracking-wide text-slate uppercase">
                      Go8
                    </span>
                  )}
                </span>
                <span className="font-utility text-xs text-slate">
                  {u.city}
                  {u.type ? ` · ${u.type}` : ""}
                  {u.isRegional ? " · regional" : ""}
                </span>
                <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 font-utility text-xs text-slate">
                  {u.minTuition != null && (
                    <span className="text-status-open">
                      from {formatCurrency(u.minTuition, "AUD")}/yr
                    </span>
                  )}
                  {u.ielts != null && <span>IELTS {u.ielts.toFixed(1)}</span>}
                  {u.hasJulyIntake && <span>Feb &amp; Jul intake</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
