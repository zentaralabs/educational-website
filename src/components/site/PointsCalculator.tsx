"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Opt = { label: string; points: number };

type Field = {
  key: string;
  label: string;
  help?: string;
  options: Opt[];
};

const FIELDS: Field[] = [
  {
    key: "age",
    label: "Age at invitation",
    options: [
      { label: "18 to 24", points: 25 },
      { label: "25 to 32", points: 30 },
      { label: "33 to 39", points: 25 },
      { label: "40 to 44", points: 15 },
      { label: "45 or older", points: 0 },
    ],
  },
  {
    key: "english",
    label: "English level",
    help: "Competent = IELTS 6 / PTE 50. Proficient = IELTS 7 / PTE 65. Superior = IELTS 8 / PTE 79.",
    options: [
      { label: "Competent", points: 0 },
      { label: "Proficient", points: 10 },
      { label: "Superior", points: 20 },
    ],
  },
  {
    key: "expOverseas",
    label: "Skilled employment outside Australia (last 10 years)",
    options: [
      { label: "Less than 3 years", points: 0 },
      { label: "3 to 4 years", points: 5 },
      { label: "5 to 7 years", points: 10 },
      { label: "8 years or more", points: 15 },
    ],
  },
  {
    key: "expAustralia",
    label: "Skilled employment in Australia (last 10 years)",
    help: "Australian and overseas experience points are added, then capped at 20 in total.",
    options: [
      { label: "Less than 1 year", points: 0 },
      { label: "1 to 2 years", points: 5 },
      { label: "3 to 4 years", points: 10 },
      { label: "5 to 7 years", points: 15 },
      { label: "8 years or more", points: 20 },
    ],
  },
  {
    key: "qualification",
    label: "Highest qualification",
    options: [
      { label: "None of these", points: 0 },
      { label: "Diploma or trade qualification (Australian)", points: 10 },
      { label: "Qualification recognised by your assessing authority", points: 10 },
      { label: "Bachelor or Master degree", points: 15 },
      { label: "Doctorate (PhD)", points: 20 },
    ],
  },
  {
    key: "ausStudy",
    label: "Australian study requirement",
    help: "At least two academic years of study in Australia toward the degree, diploma, or trade qualification you use.",
    options: [
      { label: "Not met", points: 0 },
      { label: "Met (2+ years studied in Australia)", points: 5 },
    ],
  },
  {
    key: "specialist",
    label: "Specialist education qualification",
    help: "A Master by research or a Doctorate from an Australian institution in a science, technology, engineering, mathematics, or specified IT field, with 2+ years of study in Australia.",
    options: [
      { label: "No", points: 0 },
      { label: "Yes", points: 10 },
    ],
  },
  {
    key: "regionalStudy",
    label: "Studied in a designated regional area",
    options: [
      { label: "No", points: 0 },
      { label: "Yes", points: 5 },
    ],
  },
  {
    key: "professionalYear",
    label: "Completed a Professional Year in Australia",
    help: "A 12-month Professional Year program in accounting, engineering, or IT.",
    options: [
      { label: "No", points: 0 },
      { label: "Yes", points: 5 },
    ],
  },
  {
    key: "naati",
    label: "Credentialled community language (NAATI)",
    options: [
      { label: "No", points: 0 },
      { label: "Yes", points: 5 },
    ],
  },
  {
    key: "partner",
    label: "Partner",
    options: [
      { label: "Partner is not skilled and does not have competent English", points: 0 },
      { label: "Partner has competent English only", points: 5 },
      { label: "Single, or partner is an Australian citizen or permanent resident", points: 10 },
      { label: "Skilled partner (under 45, competent English, positive skills assessment)", points: 10 },
    ],
  },
  {
    key: "nomination",
    label: "Nomination or sponsorship",
    help: "State nomination applies to the subclass 190. Regional nomination or eligible family sponsorship applies to the subclass 491.",
    options: [
      { label: "None (subclass 189)", points: 0 },
      { label: "State or territory nomination (subclass 190)", points: 5 },
      { label: "Regional nomination or family sponsorship (subclass 491)", points: 15 },
    ],
  },
];

function outcome(total: number, nominationPoints: number) {
  if (total < 65) {
    return {
      tone: "closed" as const,
      title: `${total} points: below the minimum`,
      body: "You need at least 65 points to submit an Expression of Interest in SkillSelect. The quickest ways to add points are usually a higher English test result, a skilled partner assessment, more skilled work experience, or state or regional nomination.",
    };
  }
  const visa =
    nominationPoints === 15
      ? "subclass 491"
      : nominationPoints === 5
        ? "subclass 190"
        : "subclass 189";
  return {
    tone: total >= 80 ? "open" : ("pending" as const),
    title: `${total} points`,
    body: `You meet the 65-point minimum to submit an Expression of Interest for the ${visa}. Reaching the minimum is not the same as being invited: recent 189 rounds have invited trades occupations near 65, most professional occupations from about 75, and ICT and accounting from 90 or higher. State nomination for the 190 and 491 usually invites at lower scores.`,
  };
}

const TONE_BG: Record<string, string> = {
  open: "border-status-open/30 bg-status-open/5",
  pending: "border-status-pending/30 bg-status-pending/5",
  closed: "border-status-closed/30 bg-status-closed/5",
};

export function PointsCalculator() {
  // Store the selected option index per field (option point values are not
  // unique, so a value-keyed <select> would mis-select). Start every field
  // at its lowest-point option so the score builds up from zero.
  const [idx, setIdx] = useState<Record<string, number>>(
    Object.fromEntries(
      FIELDS.map((f) => {
        let min = 0;
        f.options.forEach((o, i) => {
          if (o.points < f.options[min].points) min = i;
        });
        return [f.key, min];
      }),
    ),
  );

  const pts = (key: string) => {
    const field = FIELDS.find((f) => f.key === key);
    return field?.options[idx[key] ?? 0]?.points ?? 0;
  };

  const { total, nominationPoints } = useMemo(() => {
    const work = Math.min(pts("expOverseas") + pts("expAustralia"), 20);
    let sum = work;
    for (const f of FIELDS) {
      if (f.key === "expOverseas" || f.key === "expAustralia") continue;
      sum += pts(f.key);
    }
    return { total: sum, nominationPoints: pts("nomination") };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const result = outcome(total, nominationPoints);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
              {f.label}
            </span>
            <select
              value={idx[f.key] ?? 0}
              onChange={(e) =>
                setIdx((v) => ({ ...v, [f.key]: Number(e.target.value) }))
              }
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink focus-visible:border-status-open focus-visible:outline-none"
            >
              {f.options.map((o, i) => (
                <option key={i} value={i}>
                  {o.label} ({o.points} pt{o.points === 1 ? "" : "s"})
                </option>
              ))}
            </select>
            {f.help && (
              <span className="mt-1 block font-body text-xs text-slate">{f.help}</span>
            )}
          </label>
        ))}
      </div>

      <div
        className={`mt-8 rounded-2xl border p-6 ${TONE_BG[result.tone]}`}
        aria-live="polite"
      >
        <p className="font-display text-3xl font-semibold text-ink">
          {result.title}
        </p>
        <p className="mt-2 font-body text-sm leading-relaxed text-ink">
          {result.body}
        </p>
        <p className="mt-3 font-body text-sm text-slate">
          See the{" "}
          <Link
            href="/visas/invitation-rounds"
            className="text-status-open underline underline-offset-2"
          >
            invitation rounds history
          </Link>{" "}
          for the scores that have actually been invited, and the{" "}
          <Link
            href="/visas/skilled-independent-189"
            className="text-status-open underline underline-offset-2"
          >
            189
          </Link>
          ,{" "}
          <Link
            href="/visas/skilled-nominated-190"
            className="text-status-open underline underline-offset-2"
          >
            190
          </Link>
          , and{" "}
          <Link
            href="/visas/skilled-work-regional-491"
            className="text-status-open underline underline-offset-2"
          >
            491
          </Link>{" "}
          pages for the full eligibility rules.
        </p>
      </div>

      <p className="mt-4 font-body text-xs text-slate">
        This calculator uses the current published points values and is a guide
        only. It does not check whether your occupation is on a skilled list,
        whether your skills assessment is valid, or your age at the exact date of
        invitation. Confirm with the Department of Home Affairs points tool or a
        registered migration agent before you rely on a score.
      </p>
    </div>
  );
}
