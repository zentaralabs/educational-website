"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BUDGET_OPTIONS = [
  { label: "Under $20,000", value: "20000" },
  { label: "Under $40,000", value: "40000" },
  { label: "Under $60,000", value: "60000" },
  { label: "No budget limit", value: "" },
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
  countries,
  degreeLevels,
}: {
  countries: { code: string; name: string }[];
  degreeLevels: string[];
}) {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");
  const [budget, setBudget] = useState("");
  const [institutionType, setInstitutionType] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (degreeLevel) params.set("degree", degreeLevel);
    if (budget) params.set("budget", budget);
    if (institutionType) params.set("type", institutionType);
    router.push(`/quiz/results?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
      <OptionGroup
        label="Which country?"
        value={country}
        onChange={setCountry}
        options={[
          { label: "Any country", value: "" },
          ...countries.map((c) => ({ label: c.name, value: c.code })),
        ]}
      />

      <OptionGroup
        label="Degree level"
        value={degreeLevel}
        onChange={setDegreeLevel}
        options={[
          { label: "Any level", value: "" },
          ...degreeLevels.map((d) => ({ label: d, value: d })),
        ]}
      />

      <OptionGroup
        label="Annual budget (international tuition)"
        value={budget}
        onChange={setBudget}
        options={BUDGET_OPTIONS}
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

      <button
        type="submit"
        className="self-start rounded-md bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
      >
        Show my matches
      </button>
    </form>
  );
}
