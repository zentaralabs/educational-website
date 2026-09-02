"use client";

import { useMemo, useState } from "react";
import { PostCard } from "@/components/site/PostCard";

export type BrowserGuide = {
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  created_at: string;
  country: { name: string } | null;
};

type Group = { key: string; label: string; blurb?: string };

// A guide is flagged "New" only if it is both genuinely recent and one of
// the few most-recently-added, so the badge stays meaningful once the
// library is no longer brand new.
const NEW_FOR_DAYS = 21;
const NEW_MAX_COUNT = 3;

function recentSlugs(guides: BrowserGuide[]): Set<string> {
  const cutoff = Date.now() - NEW_FOR_DAYS * 86_400_000;
  return new Set(
    guides
      .filter((g) => new Date(g.created_at).getTime() >= cutoff)
      .slice(0, NEW_MAX_COUNT)
      .map((g) => g.slug),
  );
}

/**
 * Tabbed browser for the /guides index. All guides render into the DOM up
 * front (so every guide stays crawlable and the page works without JS);
 * the tabs just filter what's visible. "All" keeps the grouped view.
 * A search box collapses the tabs and shows a flat, newest-first list of
 * matches across every category.
 */
export function GuidesBrowser({
  guides,
  groups,
}: {
  guides: BrowserGuide[];
  groups: Group[];
}) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const newSlugs = useMemo(() => recentSlugs(guides), [guides]);
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return [];
    return guides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.excerpt ?? "").toLowerCase().includes(q),
    );
  }, [guides, q]);

  const countFor = (key: string) =>
    key === "all" ? guides.length : guides.filter((g) => g.category === key).length;

  const tabs = [{ key: "all", label: "All" }, ...groups.filter((g) => countFor(g.key) > 0)];

  return (
    <div className="mt-10">
      <label className="relative block">
        <span className="sr-only">Search guides</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides"
          className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 font-body text-sm text-ink placeholder:text-slate focus-visible:border-status-open focus-visible:outline-none"
        />
      </label>

      {q ? (
        <div className="mt-8">
          <p className="mb-5 font-body text-sm text-slate">
            {matches.length === 0
              ? `No guides match "${query.trim()}".`
              : `${matches.length} ${matches.length === 1 ? "guide" : "guides"} matching "${query.trim()}"`}
          </p>
          <div className="flex flex-col gap-3">
            {matches.map((g) => (
              <PostCard
                key={g.slug}
                href={`/guides/${g.slug}`}
                eyebrow={g.country ? g.country.name : undefined}
                title={g.title}
                excerpt={g.excerpt}
                isNew={newSlugs.has(g.slug)}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            role="tablist"
            aria-label="Guide categories"
            className="mt-6 -mx-6 flex gap-6 overflow-x-auto border-b border-line px-6"
          >
            {tabs.map((tab) => {
              const selected = active === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(tab.key)}
                  className={`-mb-px flex flex-shrink-0 items-center gap-2 border-b-2 py-3.5 font-body text-base font-medium whitespace-nowrap transition-colors duration-150 ${
                    selected
                      ? "border-status-open text-ink"
                      : "border-transparent text-slate hover:border-ink/20 hover:text-ink"
                  }`}
                >
                  {tab.label}
                  <span className="font-utility text-sm text-slate">{countFor(tab.key)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-12">
            {groups
              .filter((group) => active === "all" || active === group.key)
              .map((group) => {
                const items = guides.filter((g) => g.category === group.key);
                if (items.length === 0) return null;
                return (
                  <section key={group.key}>
                    <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-2">
                      <h2 className="font-display text-xl font-semibold text-ink">{group.label}</h2>
                      <span className="font-utility text-xs text-slate">
                        {items.length} {items.length === 1 ? "guide" : "guides"}
                      </span>
                    </div>
                    {group.blurb && (
                      <p className="mb-5 font-body text-sm text-slate">{group.blurb}</p>
                    )}
                    <div className="flex flex-col gap-3">
                      {items.map((g) => (
                        <PostCard
                          key={g.slug}
                          href={`/guides/${g.slug}`}
                          eyebrow={g.country ? g.country.name : undefined}
                          title={g.title}
                          excerpt={g.excerpt}
                          isNew={newSlugs.has(g.slug)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
