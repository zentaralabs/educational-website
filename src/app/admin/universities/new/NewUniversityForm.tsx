"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUniversity } from "@/lib/queries/universities";
import { logActivity } from "@/lib/queries/activity";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";

export function NewUniversityForm({
  countries,
}: {
  countries: { id: number; code: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [countryId, setCountryId] = useState(String(countries[0]?.id ?? ""));
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!countryId) {
      setErrorMsg("Choose a country");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const id = await createUniversity(supabase, {
        name,
        slug,
        country_id: Number(countryId),
        author_id: user?.id ?? null,
      });
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "university",
        entity_id: id,
        action: "created",
        detail: `Created draft: ${name}`,
      });
      router.push(`/admin/universities/${id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not create university");
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
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Slug
        </span>
        <input
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-utility text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Country
        </span>
        <select
          required
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
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
    </form>
  );
}
