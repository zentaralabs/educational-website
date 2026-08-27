"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUniversityOption } from "@/lib/queries/public-universities";

const MAX_SELECTION = 4;

export function UniversityPicker({
  universities,
  initialSelection = [],
}: {
  universities: PublicUniversityOption[];
  initialSelection?: string[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return universities;
    const q = search.toLowerCase();
    return universities.filter(
      (u) => u.name.toLowerCase().includes(q) || u.country?.toLowerCase().includes(q),
    );
  }, [universities, search]);

  function toggle(slug: string) {
    setErrorMsg(null);
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SELECTION) {
        setErrorMsg(`You can compare up to ${MAX_SELECTION} universities at a time.`);
        return prev;
      }
      return [...prev, slug];
    });
  }

  function handleCompare() {
    if (selected.length < 2) {
      setErrorMsg("Pick at least 2 universities to compare.");
      return;
    }
    router.push(`/compare/universities?u=${selected.map(encodeURIComponent).join(",")}`);
  }

  return (
    <div className="rounded-md border border-ink/15 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Build your own comparison
          </h2>
          <p className="mt-0.5 font-body text-sm text-slate">
            Pick 2 to {MAX_SELECTION} universities to compare cost, acceptance rate, and
            requirements side by side.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCompare}
          disabled={selected.length < 2}
          className="rounded-md bg-ink px-4 py-2 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-40"
        >
          Compare {selected.length > 0 && `(${selected.length})`}
        </button>
      </div>

      {errorMsg && (
        <p className="mt-3 font-body text-sm text-status-closed">{errorMsg}</p>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter universities…"
        className="mt-4 w-full rounded-md border border-ink/20 bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
      />

      <ul className="mt-3 grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2">
        {filtered.map((u) => {
          const checked = selected.includes(u.slug);
          return (
            <li key={u.slug}>
              <label className="flex items-center gap-2 rounded-md px-2 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:bg-ink/[0.03]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(u.slug)}
                />
                <span className="flex-1">{u.name}</span>
                {u.country && <span className="text-xs text-slate">{u.country}</span>}
              </label>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-2 py-4 font-body text-sm text-slate">No matches.</li>
        )}
      </ul>
    </div>
  );
}
