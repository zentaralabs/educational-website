"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BUDGET_OPTIONS = [
  { label: "Under $20,000", value: "20000" },
  { label: "Under $40,000", value: "40000" },
  { label: "Under $60,000", value: "60000" },
  { label: "No budget limit", value: "" },
];

const IELTS_OPTIONS = [
  { label: "Not sure yet", value: "" },
  { label: "5.5", value: "5.5" },
  { label: "6.0", value: "6.0" },
  { label: "6.5", value: "6.5" },
  { label: "7.0+", value: "7.0" },
];

const PTE_OPTIONS = [
  { label: "Not sure yet", value: "" },
  { label: "42", value: "42" },
  { label: "50", value: "50" },
  { label: "58", value: "58" },
  { label: "65+", value: "65" },
];

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 font-body text-sm font-semibold tracking-wide text-ink uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`rounded-md border px-3 py-1.5 font-body text-sm transition-colors duration-150 ${
              value === o.value
                ? "border-status-open bg-status-open/10 text-ink"
                : "border-ink/20 text-slate hover:border-ink/40 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuizForm({
  degreeLevels,
  subjects,
  cities,
}: {
  degreeLevels: string[];
  subjects: { slug: string; name: string }[];
  cities: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [degreeLevel, setDegreeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [budget, setBudget] = useState("");
  const [ielts, setIelts] = useState("");
  const [pte, setPte] = useState("");
  const [city, setCity] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [regional, setRegional] = useState("");
  const [scholarship, setScholarship] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (degreeLevel) params.set("degree", degreeLevel);
    if (subject) params.set("subject", subject);
    if (budget) params.set("budget", budget);
    if (ielts) params.set("ielts", ielts);
    if (pte) params.set("pte", pte);
    if (city) params.set("city", city);
    if (institutionType) params.set("type", institutionType);
    if (regional) params.set("regional", "1");
    if (scholarship) params.set("scholarship", "1");
    router.push(`/quiz/results?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
      <OptionGroup
        label="Degree level"
        value={degreeLevel}
        onChange={setDegreeLevel}
        options={[
          { label: "Any level", value: "" },
          ...degreeLevels.map((d) => ({ label: d, value: d })),
        ]}
      />

      <div>
        <p className="mb-2 font-body text-sm font-semibold tracking-wide text-ink uppercase">
          Field of study
        </p>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full max-w-sm rounded-md border border-ink/20 bg-paper px-3 py-2 font-body text-sm text-ink focus:border-status-open focus:outline-none"
        >
          <option value="">Any field</option>
          {subjects.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <OptionGroup
        label="Annual budget (international tuition)"
        value={budget}
        onChange={setBudget}
        options={BUDGET_OPTIONS}
      />

      <OptionGroup
        label="Your IELTS (or expected)"
        value={ielts}
        onChange={setIelts}
        options={IELTS_OPTIONS}
      />

      <OptionGroup
        label="Or your PTE Academic score"
        value={pte}
        onChange={setPte}
        options={PTE_OPTIONS}
      />

      <OptionGroup
        label="Preferred city"
        value={city}
        onChange={setCity}
        options={[
          { label: "Any city", value: "" },
          ...cities.map((c) => ({ label: c.name, value: c.slug })),
        ]}
      />

      <OptionGroup
        label="Institution type"
        value={institutionType}
        onChange={setInstitutionType}
        options={[
          { label: "No preference", value: "" },
          { label: "Public", value: "public" },
          { label: "Private", value: "private" },
        ]}
      />

      <OptionGroup
        label="Regional campus (extra migration points)"
        value={regional}
        onChange={setRegional}
        options={[
          { label: "No preference", value: "" },
          { label: "Prefer a regional campus", value: "1" },
        ]}
      />

      <OptionGroup
        label="Scholarships"
        value={scholarship}
        onChange={setScholarship}
        options={[
          { label: "Show all", value: "" },
          { label: "Only with an automatic scholarship", value: "1" },
        ]}
      />

      <button
        type="submit"
        className="self-start rounded-md bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
      >
        Show my matches
      </button>
    </form>
  );
}
