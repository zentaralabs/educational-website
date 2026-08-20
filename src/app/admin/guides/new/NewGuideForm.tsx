"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGuide } from "@/lib/queries/guides";
import { logActivity } from "@/lib/queries/activity";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["how-to", "comparison", "country-guide", "test-prep"];

export function NewGuideForm({
  countries,
}: {
  countries: { id: number; code: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [countryId, setCountryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const id = await createGuide(supabase, {
        title,
        slug,
        category,
        country_id: countryId ? Number(countryId) : null,
        author_id: user?.id ?? null,
      });
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "guide",
        entity_id: id,
        action: "created",
        detail: `Created draft: "${title}"`,
      });
      router.push(`/admin/guides/${id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not create guide");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-md gap-4">
      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Title
        </span>
        <input
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
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
          Category
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Country (optional)
        </span>
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="">Country-agnostic</option>
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

      <p className="font-body text-xs text-slate">
        Content, QA checklist, and related links are edited after creation.
      </p>
    </form>
  );
}
