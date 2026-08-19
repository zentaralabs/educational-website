"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import { GUIDE_CATEGORIES, type MockGuide } from "@/lib/mock-guides-data";

function qaCompleteness(g: MockGuide): string {
  const total = 3;
  const done =
    Number(g.qaFactsVerified) +
    Number(g.qaSentenceVariationChecked) +
    Number(g.qaFirsthandDetailAdded);
  return `${done}/${total}`;
}

export function GuidesTable({ guides }: { guides: MockGuide[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    return guides.filter((g) => {
      if (search && !g.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (categoryFilter !== "all" && g.category !== categoryFilter)
        return false;
      return true;
    });
  }, [guides, search, categoryFilter]);

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
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="all">All categories</option>
          {GUIDE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="ml-auto font-body text-xs text-slate">
          {filtered.length} of {guides.length}
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
                Category
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Status
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                QA
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Author
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr
                key={g.id}
                className="border-b border-ink/10 text-sm last:border-b-0 hover:bg-ink/[0.02]"
              >
                <td className="max-w-md px-3 py-2.5">
                  <Link
                    href={`/admin/guides/${g.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {g.title}
                  </Link>
                  <div className="font-utility text-xs text-slate">
                    /{g.slug}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-slate">{g.category}</td>
                <td className="px-3 py-2.5">
                  <ContentStatusBadge status={g.status} />
                </td>
                <td className="px-3 py-2.5 font-utility text-ink">
                  {qaCompleteness(g)}
                </td>
                <td className="px-3 py-2.5 text-slate">{g.author}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center font-body text-sm text-slate"
                >
                  No guides match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
