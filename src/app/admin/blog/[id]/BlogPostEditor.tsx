"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { BlogPostDetailRow } from "@/lib/queries/blog-posts";
import { updateBlogPost } from "@/lib/queries/blog-posts";
import { logActivity } from "@/lib/queries/activity";
import { createClient } from "@/lib/supabase/client";
import type { ContentStatus } from "@/lib/supabase/types";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Minimal markdown-to-HTML for the admin preview pane — same limited
// renderer as the guide editor, not the public-facing one.
function renderMarkdownPreview(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];

  function flush() {
    if (paragraph.length) {
      html.push(`<p>${paragraph.join(" ")}</p>`);
      paragraph = [];
    }
  }

  for (const line of lines) {
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      flush();
      const level = h[1].length;
      html.push(`<h${level}>${escapeHtml(h[2])}</h${level}>`);
    } else if (line.trim() === "") {
      flush();
    } else {
      paragraph.push(escapeHtml(line));
    }
  }
  flush();
  return html.join("\n");
}

export function BlogPostEditor({ post }: { post: BlogPostDetailRow }) {
  const router = useRouter();
  const [content, setContent] = useState(post.content);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [tags, setTags] = useState((post.tags ?? []).join(", "));
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<ContentStatus>(post.status);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const words = useMemo(() => wordCount(content), [content]);
  const previewHtml = useMemo(() => renderMarkdownPreview(content), [content]);

  async function save(targetStatus: ContentStatus, kind: "draft" | "publish") {
    setSaving(kind);
    setErrorMsg(null);
    setMessage(null);
    try {
      const supabase = createClient();
      await updateBlogPost(supabase, post.id, {
        content,
        excerpt: excerpt || null,
        tags: tags
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : null,
        word_count: words,
        status: targetStatus,
        ...(targetStatus === "published"
          ? {
              last_verified_at: new Date().toISOString().slice(0, 10),
              published_at: post.published_at ?? new Date().toISOString(),
            }
          : {}),
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "blog_post",
        entity_id: post.id,
        action: kind === "publish" ? "status_changed" : "updated",
        detail:
          kind === "publish"
            ? `Published "${post.title}"`
            : `Saved draft: "${post.title}"`,
      });
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {post.title}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ContentStatusBadge status={status} />
            <span className="font-utility text-xs text-slate">
              /{post.slug} · {words} words
            </span>
          </div>
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
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("draft", "draft")}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open disabled:opacity-50"
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("published", "publish")}
            className="rounded-md bg-status-open px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          {showPreview ? (
            <div
              className="min-h-96 rounded-md border border-ink/15 bg-paper px-5 py-4 font-body text-sm text-ink [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-2 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              className="w-full resize-y rounded-md border border-ink/20 bg-paper px-4 py-3 font-utility text-sm text-ink focus-visible:border-status-open"
            />
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-md border border-ink/15 p-4">
            <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Excerpt
            </h2>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Shown on the blog index and in search results."
              className="w-full resize-y rounded-md border border-ink/20 bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-slate/50 focus-visible:border-status-open"
            />
          </div>

          <div className="rounded-md border border-ink/15 p-4">
            <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Tags
            </h2>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="deadlines, policy, UK"
              className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/50 focus-visible:border-status-open"
            />
            <p className="mt-1 font-body text-xs text-slate">Comma-separated</p>
          </div>

          {post.published_at && (
            <div className="rounded-md border border-ink/15 p-4">
              <h2 className="mb-1 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Published
              </h2>
              <p className="font-utility text-sm text-ink">
                {new Date(post.published_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
