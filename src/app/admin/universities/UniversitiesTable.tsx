"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import {
  COUNTRY_LABELS,
  type ContentStatus,
  type MockUniversity,
} from "@/lib/mock-admin-data";

const STATUS_OPTIONS: ContentStatus[] = [
  "draft",
  "needs_review",
  "verified",
  "published",
  "archived",
];

export function UniversitiesTable({
  initialUniversities,
}: {
  initialUniversities: MockUniversity[];
}) {
  const [universities, setUniversities] = useState(initialUniversities);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return universities.filter((u) => {
      if (
        search &&
        !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.city.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (countryFilter !== "all" && u.country !== countryFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      return true;
    });
  }, [universities, search, countryFilter, statusFilter]);

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkSetStatus(status: ContentStatus) {
    setUniversities((prev) =>
      prev.map((u) => (selected.has(u.id) ? { ...u, status } : u)),
    );
    setSelected(new Set());
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or city…"
          className="min-w-64 rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="all">All countries</option>
          {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>

        <span className="ml-auto font-body text-xs text-slate">
          {filtered.length} of {universities.length}
        </span>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-md border border-status-pending/40 bg-status-pending/10 px-3 py-2">
          <span className="font-body text-sm text-ink">
            {selected.size} selected
          </span>
          <span className="font-body text-xs text-slate">Set status:</span>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => bulkSetStatus(s)}
              className="rounded border border-ink/20 bg-paper px-2 py-1 font-body text-xs text-ink transition-colors duration-150 hover:border-status-open"
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-ink/15">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03]">
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 && selected.size === filtered.length
                  }
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Name
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Country
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Status
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Acceptance rate
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Last verified
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Author
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-ink/10 text-sm last:border-b-0 hover:bg-ink/[0.02]"
              >
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => toggleOne(u.id)}
                    aria-label={`Select ${u.name}`}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/admin/universities/${u.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {u.name}
                  </Link>
                  <div className="font-utility text-xs text-slate">
                    {u.city}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-ink">{u.country}</td>
                <td className="px-3 py-2.5">
                  <ContentStatusBadge status={u.status} />
                </td>
                <td className="px-3 py-2.5 font-utility text-ink">
                  {u.acceptanceRate !== null ? `${u.acceptanceRate}%` : "—"}
                </td>
                <td className="px-3 py-2.5 font-utility text-slate">
                  {u.lastVerifiedAt ?? "never"}
                </td>
                <td className="px-3 py-2.5 text-slate">{u.author}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center font-body text-sm text-slate"
                >
                  No universities match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
