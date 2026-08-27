"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvitationRound } from "@/lib/queries/visas";
import { createClient } from "@/lib/supabase/client";

export function NewRoundForm() {
  const router = useRouter();
  const [roundDate, setRoundDate] = useState("");
  const [visaCode, setVisaCode] = useState("189");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const id = await createInvitationRound(supabase, {
        round_date: roundDate,
        visa_code: visaCode,
      });
      router.push(`/admin/visas/rounds/${id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not create");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open";
  const labelCls =
    "mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase";

  return (
    <form onSubmit={handleSubmit} className="grid max-w-md gap-4">
      <label className="block">
        <span className={labelCls}>Round date</span>
        <input
          required
          type="date"
          value={roundDate}
          onChange={(e) => setRoundDate(e.target.value)}
          className={`${inputCls} font-utility`}
        />
      </label>
      <label className="block">
        <span className={labelCls}>Visa code</span>
        <input
          required
          value={visaCode}
          onChange={(e) => setVisaCode(e.target.value)}
          placeholder="189"
          className={`${inputCls} font-utility`}
        />
      </label>
      {errorMsg && (
        <p className="font-body text-xs text-status-closed">{errorMsg}</p>
      )}
      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create draft"}
        </button>
      </div>
    </form>
  );
}
