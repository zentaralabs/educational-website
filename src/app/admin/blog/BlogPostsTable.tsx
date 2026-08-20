"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { BlogPostListRow } from "@/lib/queries/blog-posts";

export function BlogPostsTable({ posts }: { posts: BlogPostListRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
  }, [posts, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          className="min-w-64 rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
        <span className="ml-auto font-body text-xs text-slate">
          {filtered.length} of {posts.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-ink/15">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03]">
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Title
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Status
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Published
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Author
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-ink/10 text-sm last:border-b-0 hover:bg-ink/[0.02]"
              >
                <td className="max-w-md px-3 py-2.5">
                  <Link
                    href={`/admin/blog/${p.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {p.title}
                  </Link>
                  <div className="font-utility text-xs text-slate">/{p.slug}</div>
                </td>
                <td className="px-3 py-2.5">
                  <ContentStatusBadge status={p.status} />
                </td>
                <td className="px-3 py-2.5 font-utility text-ink">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-2.5 text-slate">{p.author?.name ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center font-body text-sm text-slate"
                >
                  No blog posts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
