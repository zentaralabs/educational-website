"use client";

import { useState } from "react";
import { PostCard } from "@/components/site/PostCard";

export type BrowserGuide = {
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  country: { name: string } | null;
};

type Group = { key: string; label: string; blurb?: string };

/**
 * Tabbed browser for the /guides index. All guides render into the DOM up
 * front (so every guide stays crawlable and the page works without JS);
 * the tabs just filter what's visible. "All" keeps the grouped view.
 */
export function GuidesBrowser({
  guides,
  groups,
}: {
  guides: BrowserGuide[];
  groups: Group[];
}) {
  const [active, setActive] = useState<string>("all");

  const countFor = (key: string) =>
    key === "all" ? guides.length : guides.filter((g) => g.category === key).length;

  const tabs = [{ key: "all", label: "All" }, ...groups.filter((g) => countFor(g.key) > 0)];

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label="Guide categories"
        className="-mx-6 flex gap-6 overflow-x-auto border-b border-line px-6"
      >
        {tabs.map((tab) => {
          const selected = active === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.key)}
              className={`-mb-px flex flex-shrink-0 items-center gap-1.5 border-b-2 py-3 font-body text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                selected
                  ? "border-status-open text-ink"
                  : "border-transparent text-slate hover:border-ink/20 hover:text-ink"
              }`}
            >
              {tab.label}
              <span className="font-utility text-xs text-slate">{countFor(tab.key)}</span>
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
                {active === "all" && (
                  <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-2">
                    <h2 className="font-display text-xl font-semibold text-ink">{group.label}</h2>
                    <span className="font-utility text-xs text-slate">
                      {items.length} {items.length === 1 ? "guide" : "guides"}
                    </span>
                  </div>
                )}
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
                    />
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
}
