"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/lib/queries/blog-posts";
import { logActivity } from "@/lib/queries/activity";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";

export function NewBlogPostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
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
      const id = await createBlogPost(supabase, {
        title,
        slug,
        author_id: user?.id ?? null,
      });
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "blog_post",
        entity_id: id,
        action: "created",
        detail: `Created draft: "${title}"`,
      });
      router.push(`/admin/blog/${id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not create post");
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
        Content, excerpt, and tags are edited after creation.
      </p>
    </form>
  );
}
