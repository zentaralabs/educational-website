"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AuthorListRow } from "@/lib/queries/authors";

export function AuthorsTable({ authors }: { authors: AuthorListRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return authors;
    return authors.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [authors, search]);

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
        <span className="ml-auto font-body text-xs text-slate">
          {filtered.length} of {authors.length}
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
                Credentials
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Role
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Published pieces
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="border-b border-ink/10 text-sm last:border-b-0 hover:bg-ink/[0.02]"
              >
                <td className="px-3 py-2.5">
                  <Link
                    href={`/admin/authors/${a.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {a.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-slate">{a.credentials ?? "—"}</td>
                <td className="px-3 py-2.5 text-ink">
                  {a.is_admin ? "Admin" : "Editor"}
                </td>
                <td className="px-3 py-2.5 text-slate">{a.publishedCount}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center font-body text-sm text-slate"
                >
                  No authors match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
