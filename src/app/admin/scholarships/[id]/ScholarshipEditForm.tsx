"use client";

import { useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { MockUniversity } from "@/lib/mock-admin-data";
import {
  SCHOLARSHIP_SCOPES,
  type MockScholarship,
  type ScholarshipScope,
} from "@/lib/mock-scholarships-data";

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

export function ScholarshipEditForm({
  scholarship,
  universities,
}: {
  scholarship: MockScholarship;
  universities: MockUniversity[];
}) {
  const [scope, setScope] = useState<ScholarshipScope>(scholarship.scope);
  const [universitySlugs, setUniversitySlugs] = useState(
    new Set(scholarship.universitySlugs),
  );

  function toggleUniversity(slug: string) {
    setUniversitySlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {scholarship.name}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ContentStatusBadge status={scholarship.status} />
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

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Name" value={scholarship.name} />

          <label className="block">
            <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Scope
            </span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ScholarshipScope)}
              className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
            >
              {SCHOLARSHIP_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <Field label="Amount" value={scholarship.amount} />
          <Field
            label="Deadline"
            value={scholarship.deadlineDate ?? ""}
            hint="YYYY-MM-DD, leave blank if not fixed"
          />
          <div className="sm:col-span-2">
            <Field label="Eligibility" value={scholarship.eligibility} />
          </div>
          <Field label="Country" value={scholarship.country ?? ""} />
          <Field label="External URL" value={scholarship.externalUrl} />
        </div>

        <aside>
          <div className="rounded-md border border-ink/15 p-4">
            <h2 className="mb-1 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Universities
            </h2>
            <p className="mb-3 font-body text-xs text-slate">
              {scope === "university-specific"
                ? "Which universities offer this scholarship."
                : "Optional — national/external scholarships aren't tied to a single school, but can still link to relevant ones."}
            </p>
            <div className="flex flex-col gap-2">
              {universities.map((u) => (
                <label
                  key={u.id}
                  className="flex items-start gap-2 font-body text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={universitySlugs.has(u.slug)}
                    onChange={() => toggleUniversity(u.slug)}
                    className="mt-0.5"
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
