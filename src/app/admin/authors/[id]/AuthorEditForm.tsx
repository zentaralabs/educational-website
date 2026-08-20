"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { AuthorPiece } from "@/lib/queries/authors";
import { updateAuthor } from "@/lib/queries/authors";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Author = Database["public"]["Tables"]["authors"]["Row"];

const PIECE_HREF: Record<AuthorPiece["type"], string> = {
  university: "/admin/universities",
  guide: "/admin/guides",
};

export function AuthorEditForm({
  author,
  pieces,
}: {
  author: Author;
  pieces: AuthorPiece[];
}) {
  const router = useRouter();
  const [name, setName] = useState(author.name);
  const [credentials, setCredentials] = useState(author.credentials ?? "");
  const [bio, setBio] = useState(author.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(author.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      await updateAuthor(supabase, author.id, {
        name,
        credentials: credentials || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      });
      setMessage("Saved.");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {author.name}
          </h1>
          <p className="mt-1 font-body text-xs text-slate">
            {author.is_admin ? "Admin" : "Editor"} — manage roles in{" "}
            <Link href="/admin/settings" className="underline">
              Settings
            </Link>
          </p>
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
            disabled={saving}
            onClick={save}
            className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="grid max-w-md gap-4">
          <label className="block">
            <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Name
            </span>
            <input
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
              rows={5}
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
        </div>

        <aside>
          <div className="rounded-md border border-ink/15 p-4">
            <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Published pieces ({pieces.length})
            </h2>
            {pieces.length === 0 ? (
              <p className="font-body text-sm text-slate">Nothing authored yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pieces.map((p) => (
                  <li key={`${p.type}-${p.id}`} className="flex items-center justify-between gap-2">
                    <Link
                      href={`${PIECE_HREF[p.type]}/${p.id}`}
                      className="font-body text-sm text-ink hover:underline"
                    >
                      {p.title}
                    </Link>
                    <ContentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
