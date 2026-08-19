"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { UniversityListRow } from "@/lib/queries/universities";
import {
  syncScholarshipUniversities,
  updateScholarship,
  type ScholarshipDetailRow,
} from "@/lib/queries/scholarships";
import { logActivity } from "@/lib/queries/activity";
import { createClient } from "@/lib/supabase/client";
import type { ContentStatus } from "@/lib/supabase/types";

const SCHOLARSHIP_SCOPES = [
  "university-specific",
  "national",
  "external/foundation",
];

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  scholarship: ScholarshipDetailRow;
  universities: UniversityListRow[];
}) {
  const router = useRouter();
  const [name, setName] = useState(scholarship.name);
  const [scope, setScope] = useState(scholarship.scope);
  const [amount, setAmount] = useState(scholarship.amount ?? "");
  const [eligibility, setEligibility] = useState(scholarship.eligibility ?? "");
  const [deadlineDate, setDeadlineDate] = useState(scholarship.deadline_date ?? "");
  const [externalUrl, setExternalUrl] = useState(scholarship.external_url ?? "");
  const [status, setStatus] = useState<ContentStatus>(scholarship.status);
  const [universityIds, setUniversityIds] = useState(
    new Set(scholarship.scholarship_universities.map((su) => su.university_id)),
  );
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function toggleUniversity(id: string) {
    setUniversityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save(targetStatus: ContentStatus, kind: "draft" | "publish") {
    setSaving(kind);
    setErrorMsg(null);
    setMessage(null);
    try {
      const supabase = createClient();
      await updateScholarship(supabase, scholarship.id, {
        name,
        scope,
        amount: amount || null,
        eligibility: eligibility || null,
        deadline_date: deadlineDate || null,
        external_url: externalUrl || null,
        status: targetStatus,
        ...(targetStatus === "published"
          ? { last_verified_at: new Date().toISOString().slice(0, 10) }
          : {}),
      });
      await syncScholarshipUniversities(
        supabase,
        scholarship.id,
        Array.from(universityIds),
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "scholarship",
        entity_id: scholarship.id,
        action: kind === "publish" ? "status_changed" : "updated",
        detail:
          kind === "publish" ? `Published ${name}` : `Saved draft: ${name}`,
      });
      setStatus(targetStatus);
      setMessage(targetStatus === "published" ? "Published." : "Draft saved.");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {scholarship.name}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ContentStatusBadge status={status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="font-body text-xs text-status-open">{message}</span>
          )}
          {errorMsg && (
            <span className="font-body text-xs text-status-closed">{errorMsg}</span>
          )}
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("draft", "draft")}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open disabled:opacity-50"
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("published", "publish")}
            className="rounded-md bg-status-open px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Name" value={name} onChange={setName} />

          <label className="block">
            <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Scope
            </span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
            >
              {SCHOLARSHIP_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <Field label="Amount" value={amount} onChange={setAmount} />
          <Field
            label="Deadline"
            value={deadlineDate}
            onChange={setDeadlineDate}
            hint="YYYY-MM-DD, leave blank if not fixed"
          />
          <div className="sm:col-span-2">
            <Field label="Eligibility" value={eligibility} onChange={setEligibility} />
          </div>
          <Field label="External URL" value={externalUrl} onChange={setExternalUrl} />
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
                    checked={universityIds.has(u.id)}
                    onChange={() => toggleUniversity(u.id)}
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
