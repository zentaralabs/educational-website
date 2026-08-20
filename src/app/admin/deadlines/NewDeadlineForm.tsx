"use client";

import { useState } from "react";
import { createDeadline } from "@/lib/queries/deadlines";
import { logActivity } from "@/lib/queries/activity";
import { createClient } from "@/lib/supabase/client";
import type { Lookups } from "./DeadlinesTable";

export function NewDeadlineForm({
  lookups,
  onCreated,
}: {
  lookups: Lookups;
  onCreated: () => void;
}) {
  const [universityId, setUniversityId] = useState(lookups.universities[0]?.id ?? "");
  const [degreeLevelId, setDegreeLevelId] = useState(
    String(lookups.degreeLevels[0]?.id ?? ""),
  );
  const [deadlineTypeId, setDeadlineTypeId] = useState(
    String(lookups.deadlineTypes[0]?.id ?? ""),
  );
  const [applicationPlatformId, setApplicationPlatformId] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!universityId || !degreeLevelId || !deadlineTypeId) {
      setErrorMsg("University, degree level, and deadline type are required");
      return;
    }
    if (!isRolling && !deadlineDate) {
      setErrorMsg("Set a date, or mark this as rolling");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const university = lookups.universities.find((u) => u.id === universityId);
      const id = await createDeadline(supabase, {
        university_id: universityId,
        degree_level_id: Number(degreeLevelId),
        deadline_type_id: Number(deadlineTypeId),
        deadline_date: isRolling ? new Date().toISOString().slice(0, 10) : deadlineDate,
        application_platform_id: applicationPlatformId
          ? Number(applicationPlatformId)
          : null,
        is_rolling: isRolling,
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "deadline",
        entity_id: id,
        action: "created",
        detail: `Created draft deadline for ${university?.name ?? "university"}`,
      });
      onCreated();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not create deadline");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-ink/15 bg-ink/[0.02] p-4"
    >
      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          University
        </span>
        <select
          value={universityId}
          onChange={(e) => setUniversityId(e.target.value)}
          className="min-w-48 rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink"
        >
          {lookups.universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Degree level
        </span>
        <select
          value={degreeLevelId}
          onChange={(e) => setDegreeLevelId(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink"
        >
          {lookups.degreeLevels.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Type
        </span>
        <select
          value={deadlineTypeId}
          onChange={(e) => setDeadlineTypeId(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink"
        >
          {lookups.deadlineTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Platform (optional)
        </span>
        <select
          value={applicationPlatformId}
          onChange={(e) => setApplicationPlatformId(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink"
        >
          <option value="">None</option>
          {lookups.applicationPlatforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Date
        </span>
        <input
          type="date"
          value={deadlineDate}
          disabled={isRolling}
          onChange={(e) => setDeadlineDate(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-utility text-sm text-ink disabled:opacity-50"
        />
      </label>

      <label className="flex items-center gap-1.5 pb-1.5 font-body text-sm text-ink">
        <input
          type="checkbox"
          checked={isRolling}
          onChange={(e) => setIsRolling(e.target.checked)}
        />
        Rolling
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create draft"}
      </button>

      {errorMsg && (
        <p className="w-full font-body text-xs text-status-closed">{errorMsg}</p>
      )}
    </form>
  );
}
