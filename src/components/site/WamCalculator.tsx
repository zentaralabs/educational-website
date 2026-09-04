"use client";

import { useId, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Subject = {
  id: string;
  name: string;
  mark: number | "";
  creditPoints: number | "";
};

let nextId = 0;
function makeSubject(overrides: Partial<Subject> = {}): Subject {
  nextId += 1;
  return { id: `s${nextId}`, name: "", mark: "", creditPoints: 6, ...overrides };
}

const STARTER: Subject[] = [
  makeSubject({ name: "Subject 1" }),
  makeSubject({ name: "Subject 2" }),
  makeSubject({ name: "Subject 3" }),
];

const BANDS = [
  { min: 85, label: "High Distinction", grade: "HD", gpa: 7 },
  { min: 75, label: "Distinction", grade: "D", gpa: 6 },
  { min: 65, label: "Credit", grade: "C", gpa: 5 },
  { min: 50, label: "Pass", grade: "P", gpa: 4 },
  { min: 0, label: "Fail", grade: "F", gpa: 0 },
];

function bandFor(mark: number) {
  return BANDS.find((b) => mark >= b.min) ?? BANDS[BANDS.length - 1];
}

const inputCls =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-status-open/50";
const labelCls = "font-body text-xs font-semibold tracking-wide text-slate uppercase";

export function WamCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>(STARTER);
  const headingId = useId();

  const usedRef = useRef(false);
  const markUsed = () => {
    if (usedRef.current) return;
    usedRef.current = true;
    trackEvent("calculator_used", { calculator: "wam" });
  };

  function updateSubject(id: string, patch: Partial<Subject>) {
    markUsed();
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSubject() {
    setSubjects((prev) => [...prev, makeSubject({ name: `Subject ${prev.length + 1}` })]);
  }

  function removeSubject(id: string) {
    setSubjects((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  }

  const result = useMemo(() => {
    const valid = subjects.filter(
      (s) => s.mark !== "" && s.creditPoints !== "" && Number(s.creditPoints) > 0,
    );
    const totalCredits = valid.reduce((sum, s) => sum + Number(s.creditPoints), 0);
    if (totalCredits === 0) return null;

    const weightedSum = valid.reduce(
      (sum, s) => sum + Number(s.mark) * Number(s.creditPoints),
      0,
    );
    const wam = weightedSum / totalCredits;
    const band = bandFor(wam);

    return {
      wam: Math.round(wam * 100) / 100,
      totalCredits,
      subjectCount: valid.length,
      band,
    };
  }, [subjects]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="grid grid-cols-[1fr_5.5rem_5.5rem_2.25rem] gap-2 px-1 pb-1 sm:grid-cols-[1fr_7rem_7rem_2.25rem]">
          <span className={labelCls}>Subject</span>
          <span className={labelCls}>Mark (%)</span>
          <span className={labelCls}>Credit pts</span>
          <span aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2" aria-labelledby={headingId}>
          {subjects.map((s, i) => (
            <div
              key={s.id}
              className="grid grid-cols-[1fr_5.5rem_5.5rem_2.25rem] items-center gap-2 sm:grid-cols-[1fr_7rem_7rem_2.25rem]"
            >
              <input
                type="text"
                value={s.name}
                onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                placeholder={`Subject ${i + 1}`}
                aria-label={`Subject ${i + 1} name`}
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={s.mark}
                onChange={(e) =>
                  updateSubject(s.id, {
                    mark: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                aria-label={`Subject ${i + 1} mark out of 100`}
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                step={1}
                value={s.creditPoints}
                onChange={(e) =>
                  updateSubject(s.id, {
                    creditPoints: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                aria-label={`Subject ${i + 1} credit points`}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => removeSubject(s.id)}
                disabled={subjects.length <= 1}
                aria-label={`Remove subject ${i + 1}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-slate transition-colors duration-150 hover:border-status-closed/50 hover:text-status-closed disabled:cursor-not-allowed disabled:opacity-30"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSubject}
          className="mt-3 rounded-lg border border-line px-3 py-1.5 font-body text-sm font-medium text-ink transition-colors duration-150 hover:border-status-open/50 hover:text-status-open"
        >
          + Add subject
        </button>
      </div>

      {result ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-status-open/30 bg-status-open/5 p-5">
            <p className={labelCls}>Your WAM</p>
            <p className="mt-1 font-display text-3xl font-semibold text-status-open">
              {result.wam}
            </p>
            <p className="mt-1 font-body text-xs text-slate">
              Across {result.subjectCount} subject{result.subjectCount === 1 ? "" : "s"},{" "}
              {result.totalCredits} credit points.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-mist p-5">
            <p className={labelCls}>Grade band</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">
              {result.band.grade}{" "}
              <span className="font-body text-base font-normal text-slate">
                {result.band.label}
              </span>
            </p>
            <p className="mt-1 font-body text-xs text-slate">
              About {result.band.gpa}.0 on the standard 7-point GPA scale.
            </p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-mist px-4 py-6 text-center font-body text-sm text-slate">
          Add a mark and credit points for at least one subject to see your WAM.
        </p>
      )}

      <p className="font-body text-xs text-slate">
        WAM = the sum of each subject&rsquo;s mark multiplied by its credit points,
        divided by total credit points. Most undergraduate subjects at most
        universities are 6 credit points; check your enrolment if unsure. This is
        the standard calculation used for admission purposes; some universities
        weight later years more heavily when calculating WAM for honours entry,
        so check your specific university&rsquo;s policy for that use case. The
        grade bands and GPA mapping above are the common Australian convention,
        not every university's exact published cut-offs.
      </p>
    </div>
  );
}
