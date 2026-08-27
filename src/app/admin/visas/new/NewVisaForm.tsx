"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logActivity } from "@/lib/queries/activity";
import { createVisaSubclass } from "@/lib/queries/visas";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";
import { VISA_CATEGORY_ORDER } from "@/lib/visa-categories";

export function NewVisaForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("skilled");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function syncSlug(nextName: string, nextCode: string) {
    if (!slugTouched) {
      setSlug(slugify(`${nextName} ${nextCode}`));
    }
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
      const id = await createVisaSubclass(supabase, {
        name,
        code,
        category,
        slug,
        author_id: user?.id ?? null,
      });
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "visa",
        entity_id: id,
        action: "created",
        detail: `Created draft: "${name}" (subclass ${code})`,
      });
      router.push(`/admin/visas/${id}`);
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
        <span className={labelCls}>Name</span>
        <input
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            syncSlug(e.target.value, code);
          }}
          placeholder="Skilled Independent visa"
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className={labelCls}>Subclass code</span>
        <input
          required
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            syncSlug(name, e.target.value);
          }}
          placeholder="189"
          className={`${inputCls} font-utility`}
        />
      </label>

      <label className="block">
        <span className={labelCls}>Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls}
        >
          {VISA_CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelCls}>Slug</span>
        <input
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
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
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create draft"}
        </button>
      </div>

      <p className="font-body text-xs text-slate">
        All other fields are edited after creation.
      </p>
    </form>
  );
}
