"use client";

import Link from "next/link";
import { useState } from "react";

export type UpdateItem = {
  slug: string;
  title: string;
  summary: string;
  impact: string | null;
  category: string;
  categoryLabel: string;
  color: string;
  announced: string; // ISO
  announcedLabel: string;
  effectiveLabel: string | null;
  estimated: boolean;
  affects: string[];
  sources: string[];
  verifiedLabel: string | null;
  verifiedIso: string | null;
  detailUrl: string | null;
  isNewest: boolean;
};

/** First sentence is the headline takeaway; the rest sits behind "Full
 *  details" (still in the HTML, so nothing is hidden from readers who
 *  expand it or from crawlers). */
function splitSummary(s: string): [string, string] {
  const m = s.match(/^([\s\S]+?[.!?])\s+([\s\S]+)$/);
  return m ? [m[1], m[2]] : [s, ""];
}

export function UpdatesLog({ items }: { items: UpdateItem[] }) {
  const [filter, setFilter] = useState<string>("all");

  const cats = [...new Map(items.map((i) => [i.category, i])).values()];
  const shown = items.filter((i) => filter === "all" || i.category === filter);

  const byYear = new Map<string, UpdateItem[]>();
  for (const u of shown) {
    const y = u.announced.slice(0, 4);
    byYear.set(y, [...(byYear.get(y) ?? []), u]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
          className="rounded-full border border-line bg-paper px-4 py-1.5 font-body text-sm font-medium text-ink"
        >
          All ({items.length})
        </button>
        {cats.map((c) => (
          <button
            key={c.category}
            type="button"
            aria-pressed={filter === c.category}
            onClick={() => setFilter(c.category)}
            className="rounded-full border bg-paper px-4 py-1.5 font-body text-sm font-medium text-ink"
            style={{ borderColor: c.color }}
          >
            <span
              aria-hidden
              className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
              style={{ background: c.color }}
            />
            {c.categoryLabel}
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-12">
        {[...byYear.entries()].map(([year, list]) => (
          <section key={year}>
            <h2 className="mb-6 inline-block rounded-full bg-ink px-4 py-1 font-utility text-sm font-semibold tracking-wider text-paper">
              {year}
            </h2>
            <ol className="relative ml-3 border-l-2 border-line pl-7 [counter-reset:none]">
              {list.map((u) => {
                const [lead, rest] = splitSummary(u.summary);
                return (
                  <li
                    key={u.slug}
                    className="relative mb-8 list-none p-0 last:mb-0"
                    style={{ paddingLeft: 0 }}
                  >
                    <span
                      aria-hidden
                      className="absolute top-2 -left-[2.2rem] h-4 w-4 rounded-full border-4 border-paper"
                      style={{ background: u.color, boxShadow: `0 0 0 2px ${u.color}` }}
                    />
                    <article
                      id={u.slug}
                      className="scroll-mt-24 rounded-2xl border border-line bg-paper p-5 shadow-card sm:p-6"
                      style={{ borderTop: `5px solid ${u.color}` }}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span
                          className="rounded-full px-3 py-0.5 font-utility text-xs font-semibold tracking-wide text-white uppercase"
                          style={{ background: u.color }}
                        >
                          {u.categoryLabel}
                        </span>
                        {u.isNewest && (
                          <span className="rounded-full bg-coral px-3 py-0.5 font-utility text-xs font-semibold tracking-wide text-white uppercase">
                            Newest
                          </span>
                        )}
                        <time
                          dateTime={u.announced}
                          className="font-utility text-sm font-semibold text-ink"
                        >
                          {u.announcedLabel}
                        </time>
                        {u.estimated && (
                          <span className="font-utility text-sm text-status-pending">
                            estimate
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 font-display text-xl font-semibold text-ink text-balance sm:text-2xl">
                        {u.title}
                      </h3>
                      {u.effectiveLabel && (
                        <p className="mt-1 font-utility text-sm text-slate">
                          {u.effectiveLabel}
                        </p>
                      )}

                      <p className="mt-3 font-body text-lg leading-relaxed text-ink">
                        {lead}
                      </p>

                      {u.impact && (
                        <p className="mt-4 rounded-xl border border-teal/30 bg-teal/[0.08] px-4 py-3 font-body text-base leading-relaxed text-ink">
                          <span className="font-semibold text-teal">What to do: </span>
                          {u.impact}
                        </p>
                      )}

                      {rest && (
                        <details className="group mt-4">
                          <summary className="cursor-pointer font-body text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
                            <span className="group-open:hidden">Show full details +</span>
                            <span className="hidden group-open:inline">Hide details −</span>
                          </summary>
                          <p className="mt-2 font-body text-base leading-relaxed text-ink/85">
                            {rest}
                          </p>
                        </details>
                      )}

                      {u.affects.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {u.affects.map((a) => (
                            <li
                              key={a}
                              className="rounded-full border border-line bg-mist px-3 py-1 font-body text-sm text-slate"
                              style={{ padding: undefined }}
                            >
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 font-utility text-sm text-slate">
                        {u.sources.length > 0 && (
                          <span className="flex flex-wrap items-center gap-x-1.5">
                            Source:
                            {u.sources.map((url, i) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="underline underline-offset-2 hover:text-ink"
                              >
                                [{i + 1}]
                              </a>
                            ))}
                          </span>
                        )}
                        {u.verifiedIso && (
                          <span>
                            Verified{" "}
                            <time dateTime={u.verifiedIso}>{u.verifiedLabel}</time>
                          </span>
                        )}
                        {u.detailUrl && (
                          <Link
                            href={u.detailUrl}
                            className="font-semibold text-brand underline underline-offset-2"
                          >
                            Read our analysis &rarr;
                          </Link>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        {shown.length === 0 && (
          <p className="font-body text-base text-slate">Nothing logged for this topic yet.</p>
        )}
      </div>
    </div>
  );
}
