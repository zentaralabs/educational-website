"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";

export type BrowserCollection = {
  slug: string;
  title: string;
  blurb: string;
  category: string;
};

type Group = { key: string; label: string };

/**
 * Tabbed browser for the /best index — same pattern as GuidesBrowser.
 * Every shortlist renders up front (crawlable, works without JS); the
 * tabs filter what's visible. "All" keeps the grouped view.
 */
export function BestBrowser({
  collections,
  groups,
}: {
  collections: BrowserCollection[];
  groups: Group[];
}) {
  const [active, setActive] = useState<string>("all");

  const countFor = (key: string) =>
    key === "all" ? collections.length : collections.filter((c) => c.category === key).length;

  const tabs = [{ key: "all", label: "All" }, ...groups.filter((g) => countFor(g.key) > 0)];

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label="Shortlist categories"
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
            const items = collections.filter((c) => c.category === group.key);
            if (items.length === 0) return null;
            return (
              <section key={group.key}>
                <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-2">
                  <h2 className="font-display text-xl font-semibold text-ink">{group.label}</h2>
                  <span className="font-utility text-xs text-slate">
                    {items.length} {items.length === 1 ? "list" : "lists"}
                  </span>
                </div>
                <ul className="flex flex-col gap-4">
                  {items.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/best/${c.slug}`}
                        className="group flex flex-col gap-1.5 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] sm:p-6"
                      >
                        <span className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg font-semibold text-ink text-balance group-hover:underline">
                            {c.title}
                          </h3>
                          <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                        </span>
                        <p className="font-body text-base text-slate">{c.blurb}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
      </div>
    </div>
  );
}
