"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthor } from "@/lib/queries/authors";
import { createClient } from "@/lib/supabase/client";

export function NewAuthorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [credentials, setCredentials] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const id = await createAuthor(supabase, {
        name,
        credentials: credentials || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      });
      router.push(`/admin/authors/${id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not create author");
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
          Credentials
        </span>
        <input
          value={credentials}
          onChange={(e) => setCredentials(e.target.value)}
          placeholder="e.g. Former admissions reader, State University"
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Bio
        </span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Avatar URL
        </span>
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      {errorMsg && <p className="font-body text-xs text-status-closed">{errorMsg}</p>}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create author"}
        </button>
      </div>

      <p className="font-body text-xs text-slate">
        This creates a byline profile only — it doesn&rsquo;t grant admin
        panel access. To let this person log in, invite them via Supabase
        Auth first so their account id matches this row.
      </p>
    </form>
  );
}
