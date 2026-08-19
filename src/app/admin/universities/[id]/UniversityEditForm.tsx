"use client";

import { useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { MockUniversity } from "@/lib/mock-admin-data";

const TABS = [
  "Overview",
  "Admissions",
  "Cost & Aid",
  "Academic",
  "Narrative",
  "Meta",
] as const;
type Tab = (typeof TABS)[number];

function Field({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {label}
      </span>
      <input
        defaultValue={value}
        className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
      />
      {hint && <span className="mt-1 block text-xs text-slate">{hint}</span>}
    </label>
  );
}

function TextAreaField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {label}
      </span>
      <textarea
        defaultValue={value}
        rows={6}
        placeholder="Real, human-edited substance — not a data table with a paragraph wrapper."
        className="w-full resize-y rounded-md border border-ink/20 bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-slate/50 focus-visible:border-status-open"
      />
    </label>
  );
}

export function UniversityEditForm({
  university,
}: {
  university: MockUniversity;
}) {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {university.name}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ContentStatusBadge status={university.status} />
            <span className="font-utility text-xs text-slate">
              /{university.slug}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
          >
            Save draft
          </button>
          <button
            type="button"
            className="rounded-md bg-status-open px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-ink/15">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 font-body text-sm transition-colors duration-150 ${
              tab === t
                ? "border-ink font-medium text-ink"
                : "border-transparent text-slate hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Name" value={university.name} />
          <Field label="Slug" value={university.slug} />
          <Field label="City" value={university.city} />
          <Field label="Country" value={university.country} />
          <Field label="Institution type" value={university.institutionType} />
          <Field label="Website" value={university.websiteUrl} />
        </div>
      )}

      {tab === "Admissions" && (
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field
            label="Acceptance rate"
            value={
              university.acceptanceRate !== null
                ? String(university.acceptanceRate)
                : ""
            }
            hint="Percent, e.g. 8.6"
          />
          <Field
            label="GPA requirement"
            value={university.gpaRequirement ?? ""}
          />
          <Field
            label="Required tests"
            value={university.requiredTests.join(", ")}
            hint="Comma-separated, e.g. SAT, ACT"
          />
        </div>
      )}

      {tab === "Cost & Aid" && (
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field
            label="Tuition (in-state)"
            value={
              university.tuitionInState !== null
                ? String(university.tuitionInState)
                : ""
            }
          />
          <Field
            label="Tuition (out-of-state)"
            value={
              university.tuitionOutState !== null
                ? String(university.tuitionOutState)
                : ""
            }
          />
          <Field
            label="Tuition (international)"
            value={
              university.tuitionInternational !== null
                ? String(university.tuitionInternational)
                : ""
            }
          />
        </div>
      )}

      {tab === "Academic" && (
        <div className="max-w-2xl">
          <p className="font-body text-sm text-slate">
            Popular majors, student-faculty ratio, degree levels offered —
            same pattern as the other tabs, not modeled in this mock yet.
          </p>
        </div>
      )}

      {tab === "Narrative" && (
        <div className="grid max-w-2xl gap-5">
          <TextAreaField
            label="Distinctive summary"
            value={university.distinctiveSummary}
          />
          <TextAreaField
            label="International student notes"
            value={university.internationalStudentNotes}
          />
        </div>
      )}

      {tab === "Meta" && (
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Author" value={university.author} />
          <Field
            label="Last verified"
            value={university.lastVerifiedAt ?? ""}
          />
          <Field label="Status" value={university.status} />
        </div>
      )}
    </div>
  );
}
