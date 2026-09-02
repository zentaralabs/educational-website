"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

type SearchPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  tags: string[] | null;
  published_at: string | null;
};

function shortDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Wraps the server-rendered /blog list. With an empty box it shows the
 * default view untouched (children). Once the reader types, it hides that
 * and shows a flat, newest-first list of matching posts. Pure progressive
 * enhancement: no JS means the normal list still works.
 */
export function BlogIndexSearch({
  posts,
  children,
}: {
  posts: SearchPost[];
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return [];
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? "").toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.replace(/-/g, " ").toLowerCase().includes(q)),
    );
  }, [posts, q]);

  return (
    <div>
      <label className="relative mt-6 block">
        <span className="sr-only">Search the blog</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the blog"
          className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 font-body text-sm text-ink placeholder:text-slate focus-visible:border-status-open focus-visible:outline-none"
        />
      </label>

      {q ? (
        <div className="mt-8">
          <p className="mb-5 font-body text-sm text-slate">
            {matches.length === 0
              ? `No posts match "${query.trim()}".`
              : `${matches.length} ${matches.length === 1 ? "post" : "posts"} matching "${query.trim()}"`}
          </p>
          <ul className="flex flex-col gap-3">
            {matches.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col gap-1 rounded-2xl border border-line bg-paper p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/40"
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-lg font-semibold text-ink group-hover:underline">
                      {p.title}
                    </span>
                    {p.published_at && (
                      <time
                        dateTime={p.published_at}
                        className="flex-shrink-0 font-utility text-xs text-slate"
                      >
                        {shortDate(p.published_at)}
                      </time>
                    )}
                  </span>
                  {p.excerpt && (
                    <span className="font-body text-[0.95rem] text-slate">{p.excerpt}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
