"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createScholarship, SCHOLARSHIP_SCOPES } from "@/lib/queries/scholarships";
import { logActivity } from "@/lib/queries/activity";
import { createClient } from "@/lib/supabase/client";

export function NewScholarshipForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [scope, setScope] = useState(SCHOLARSHIP_SCOPES[0]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const id = await createScholarship(supabase, { name, scope });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "scholarship",
        entity_id: id,
        action: "created",
        detail: `Created draft: ${name}`,
      });
      router.push(`/admin/scholarships/${id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not create scholarship");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-md gap-4">
      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Name
        </span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

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

      {errorMsg && <p className="font-body text-xs text-status-closed">{errorMsg}</p>}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create draft"}
        </button>
      </div>

      <p className="font-body text-xs text-slate">
        Amount, eligibility, deadline, and linked universities are edited
        after creation.
      </p>
    </form>
  );
}
