"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import {
  SCHOLARSHIP_SCOPES,
  type MockScholarship,
} from "@/lib/mock-scholarships-data";

export function ScholarshipsTable({
  scholarships,
}: {
  scholarships: MockScholarship[];
}) {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");

  const filtered = useMemo(() => {
    return scholarships.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (scopeFilter !== "all" && s.scope !== scopeFilter) return false;
      return true;
    });
  }, [scholarships, search, scopeFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="min-w-64 rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="all">All scopes</option>
          {SCHOLARSHIP_SCOPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="ml-auto font-body text-xs text-slate">
          {filtered.length} of {scholarships.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-ink/15">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03]">
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Name
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Scope
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Amount
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Deadline
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Universities
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-b border-ink/10 text-sm last:border-b-0 hover:bg-ink/[0.02]"
              >
                <td className="px-3 py-2.5">
                  <Link
                    href={`/admin/scholarships/${s.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-slate">{s.scope}</td>
                <td className="px-3 py-2.5 text-ink">{s.amount}</td>
                <td className="px-3 py-2.5 font-utility text-ink">
                  {s.deadlineDate ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-slate">
                  {s.universitySlugs.length > 0
                    ? s.universitySlugs.length
                    : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <ContentStatusBadge status={s.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center font-body text-sm text-slate"
                >
                  No scholarships match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
