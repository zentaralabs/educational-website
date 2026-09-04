"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";

export type BrowserVisa = {
  slug: string;
  code: string;
  name: string;
  category: string;
  stream: string | null;
  short_description: string | null;
  is_points_tested: boolean;
  min_points: number | null;
  stay_period: string | null;
  leads_to_pr: boolean;
};

type Group = { key: string; label: string };

function VisaCard({ v }: { v: BrowserVisa }) {
  return (
    <Link
      href={`/visas/${v.slug}`}
      className="group flex flex-col gap-1.5 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] sm:p-6"
    >
      <span className="flex items-center gap-2 font-utility text-xs font-semibold tracking-wide text-status-open uppercase">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
        Subclass {v.code}
        {v.stream && ` · ${v.stream}`}
      </span>
      <span className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink text-balance group-hover:underline">
          {v.name}
        </h3>
        <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
      </span>
      {v.short_description && (
        <p className="font-body text-base text-slate">{v.short_description}</p>
      )}
      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-utility text-xs text-slate">
        {v.stay_period && <span>Stay: {v.stay_period}</span>}
        {v.is_points_tested && v.min_points != null && <span>Points floor: {v.min_points}</span>}
        <span>{v.leads_to_pr ? "Pathway to PR" : "Not a PR visa"}</span>
      </span>
    </Link>
  );
}

/**
 * Tabbed browser for the /visas index — same pattern as GuidesBrowser.
 * All visas render up front (crawlable, works without JS); the tabs
 * filter what's visible. "All" keeps the grouped view.
 */
export function VisasBrowser({
  visas,
  groups,
}: {
  visas: BrowserVisa[];
  groups: Group[];
}) {
  const [active, setActive] = useState<string>("all");

  const countFor = (key: string) =>
    key === "all" ? visas.length : visas.filter((v) => v.category === key).length;

  const tabs = [{ key: "all", label: "All" }, ...groups.filter((g) => countFor(g.key) > 0)];

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label="Visa categories"
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
            const items = visas.filter((v) => v.category === group.key);
            if (items.length === 0) return null;
            return (
              <section key={group.key}>
                <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-2">
                  <h2 className="font-display text-xl font-semibold text-ink">{group.label}</h2>
                  <span className="font-utility text-xs text-slate">
                    {items.length} {items.length === 1 ? "visa" : "visas"}
                  </span>
                </div>
                <ul className="flex flex-col gap-4">
                  {items.map((v) => (
                    <li key={v.slug}>
                      <VisaCard v={v} />
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
