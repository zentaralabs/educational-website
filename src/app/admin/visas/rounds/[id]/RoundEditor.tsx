"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { InvitationRoundDetailRow } from "@/lib/queries/visas";
import { updateInvitationRound } from "@/lib/queries/visas";
import { createClient } from "@/lib/supabase/client";
import type { ContentStatus } from "@/lib/supabase/types";
import { revalidateInvitationRounds } from "../../actions";

const inputCls =
  "w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open";
const labelCls =
  "mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase";

export function RoundEditor({
  round,
  visaOptions,
}: {
  round: InvitationRoundDetailRow;
  visaOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [f, setF] = useState({
    round_date: round.round_date,
    visa_code: round.visa_code,
    visa_subclass_id: round.visa_subclass_id ?? "",
    stream: round.stream ?? "",
    invitations_issued: round.invitations_issued?.toString() ?? "",
    min_points: round.min_points?.toString() ?? "",
    occupation_notes: round.occupation_notes ?? "",
    program_year: round.program_year ?? "",
    notes: round.notes ?? "",
    is_estimated: round.is_estimated,
    source_url: round.source_url ?? "",
  });
  const [status, setStatus] = useState<ContentStatus>(round.status);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function set<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  async function save(targetStatus: ContentStatus, kind: "draft" | "publish") {
    setSaving(kind);
    setErrorMsg(null);
    setMessage(null);
    try {
      const supabase = createClient();
      await updateInvitationRound(supabase, round.id, {
        round_date: f.round_date,
        visa_code: f.visa_code,
        visa_subclass_id: f.visa_subclass_id || null,
        stream: f.stream || null,
        invitations_issued: f.invitations_issued
          ? Number(f.invitations_issued)
          : null,
        min_points: f.min_points ? Number(f.min_points) : null,
        occupation_notes: f.occupation_notes || null,
        program_year: f.program_year || null,
        notes: f.notes || null,
        is_estimated: f.is_estimated,
        source_url: f.source_url || null,
        status: targetStatus,
        ...(targetStatus === "published"
          ? { last_verified_at: new Date().toISOString().slice(0, 10) }
          : {}),
      });
      await revalidateInvitationRounds();
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {f.visa_code} round · {f.round_date}
          </h1>
          <div className="mt-1">
            <ContentStatusBadge status={status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="font-body text-xs text-status-open">{message}</span>
          )}
          {errorMsg && (
            <span className="font-body text-xs text-status-closed">
              {errorMsg}
            </span>
          )}
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("draft", "draft")}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink hover:border-status-open disabled:opacity-50"
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("published", "publish")}
            className="rounded-md bg-status-open px-3 py-1.5 font-body text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid max-w-2xl gap-x-6 gap-y-4 sm:grid-cols-2">
        <label>
          <span className={labelCls}>Round date</span>
          <input type="date" value={f.round_date} onChange={(e) => set("round_date", e.target.value)} className={`${inputCls} font-utility`} />
        </label>
        <label>
          <span className={labelCls}>Visa code</span>
          <input value={f.visa_code} onChange={(e) => set("visa_code", e.target.value)} className={`${inputCls} font-utility`} />
        </label>
        <label>
          <span className={labelCls}>Linked subclass page</span>
          <select value={f.visa_subclass_id} onChange={(e) => set("visa_subclass_id", e.target.value)} className={inputCls}>
            <option value="">(none)</option>
            {visaOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelCls}>Stream</span>
          <input value={f.stream} onChange={(e) => set("stream", e.target.value)} placeholder="Points-tested" className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Invitations issued</span>
          <input value={f.invitations_issued} onChange={(e) => set("invitations_issued", e.target.value)} inputMode="numeric" className={`${inputCls} font-utility`} />
        </label>
        <label>
          <span className={labelCls}>Minimum points</span>
          <input value={f.min_points} onChange={(e) => set("min_points", e.target.value)} inputMode="numeric" className={`${inputCls} font-utility`} />
        </label>
        <label>
          <span className={labelCls}>Program year</span>
          <input value={f.program_year} onChange={(e) => set("program_year", e.target.value)} placeholder="2025-26" className={`${inputCls} font-utility`} />
        </label>
        <label className="flex items-end gap-2 pb-1.5 font-body text-sm text-ink">
          <input type="checkbox" checked={f.is_estimated} onChange={(e) => set("is_estimated", e.target.checked)} />
          Projected / estimated round
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>Occupation notes</span>
          <input value={f.occupation_notes} onChange={(e) => set("occupation_notes", e.target.value)} placeholder="Trades from 65 · ICT 90+" className={inputCls} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>Notes</span>
          <textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="w-full resize-y rounded-md border border-ink/20 bg-paper px-3 py-2 font-body text-sm text-ink focus-visible:border-status-open" />
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>Source URL</span>
          <input value={f.source_url} onChange={(e) => set("source_url", e.target.value)} className={`${inputCls} font-utility`} />
        </label>
      </div>
    </div>
  );
}
