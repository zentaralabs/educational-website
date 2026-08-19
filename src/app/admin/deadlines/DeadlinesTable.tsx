"use client";

import { useMemo, useRef, useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { ContentStatus } from "@/lib/mock-admin-data";
import {
  APPLICATION_PLATFORMS,
  DEADLINE_TYPES,
  DEGREE_LEVELS,
  type ApplicationPlatform,
  type DeadlineType,
  type MockDeadline,
} from "@/lib/mock-deadlines-data";

const STATUS_OPTIONS: ContentStatus[] = [
  "draft",
  "needs_review",
  "verified",
  "published",
  "archived",
];

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  // Build the string from local getters, not toISOString() — toISOString()
  // converts to UTC first, which rolls the date back a day in any timezone
  // ahead of UTC (e.g. local midnight Oct 25 in UTC+5:30 is Oct 24 UTC).
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toCsv(rows: MockDeadline[]): string {
  const header = [
    "university_slug",
    "degree_level",
    "deadline_type",
    "deadline_date",
    "application_platform",
    "status",
  ];
  const lines = rows.map((r) =>
    [
      r.universitySlug,
      r.degreeLevel,
      r.deadlineType,
      r.deadlineDate,
      r.applicationPlatform,
      r.status,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DeadlinesTable({
  initialDeadlines,
}: {
  initialDeadlines: MockDeadline[];
}) {
  const [deadlines, setDeadlines] = useState(initialDeadlines);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [shiftDays, setShiftDays] = useState("7");
  const [month, setMonth] = useState(() => new Date(2026, 9, 1)); // Oct 2026
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return deadlines
      .filter((d) => {
        if (
          search &&
          !d.universityName.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (degreeFilter !== "all" && d.degreeLevel !== degreeFilter)
          return false;
        if (typeFilter !== "all" && d.deadlineType !== typeFilter)
          return false;
        return true;
      })
      .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
  }, [deadlines, search, degreeFilter, typeFilter]);

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((d) => d.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyShift() {
    const n = parseInt(shiftDays, 10);
    if (Number.isNaN(n)) return;
    setDeadlines((prev) =>
      prev.map((d) =>
        selected.has(d.id)
          ? { ...d, deadlineDate: shiftDate(d.deadlineDate, n) }
          : d,
      ),
    );
  }

  function applyBulkType(type: DeadlineType) {
    setDeadlines((prev) =>
      prev.map((d) =>
        selected.has(d.id) ? { ...d, deadlineType: type } : d,
      ),
    );
  }

  function applyBulkPlatform(platform: ApplicationPlatform) {
    setDeadlines((prev) =>
      prev.map((d) =>
        selected.has(d.id) ? { ...d, applicationPlatform: platform } : d,
      ),
    );
  }

  function applyBulkStatus(status: ContentStatus) {
    setDeadlines((prev) =>
      prev.map((d) => (selected.has(d.id) ? { ...d, status } : d)),
    );
  }

  function handleExport() {
    const rows = selected.size > 0 ? filtered.filter((d) => selected.has(d.id)) : filtered;
    downloadCsv("deadlines-export.csv", toCsv(rows));
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.trim().split("\n").slice(1); // skip header
      let count = 0;
      const imported: MockDeadline[] = [];
      for (const line of lines) {
        const [slug, degreeLevel, deadlineType, deadlineDate, platform] =
          line.split(",").map((v) => v.trim());
        if (!slug || !deadlineDate) continue;
        imported.push({
          id: `import-${Date.now()}-${count}`,
          universityName: slug,
          universitySlug: slug,
          country: "US",
          degreeLevel: (degreeLevel as MockDeadline["degreeLevel"]) || "Undergraduate",
          deadlineType: (deadlineType as MockDeadline["deadlineType"]) || "Regular Decision",
          deadlineDate,
          isRolling: deadlineType === "Rolling",
          applicationPlatform:
            (platform as MockDeadline["applicationPlatform"]) || "Direct",
          status: "draft",
          lastVerifiedAt: null,
        });
        count++;
      }
      setDeadlines((prev) => [...imported, ...prev]);
      setImportSummary(`Imported ${count} row${count === 1 ? "" : "s"} as drafts.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const monthLabel = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekday = new Date(
    month.getFullYear(),
    month.getMonth(),
    1,
  ).getDay();
  const deadlinesByDay = useMemo(() => {
    const map = new Map<number, MockDeadline[]>();
    for (const d of filtered) {
      const date = new Date(`${d.deadlineDate}T00:00:00`);
      if (
        date.getFullYear() === month.getFullYear() &&
        date.getMonth() === month.getMonth()
      ) {
        const day = date.getDate();
        map.set(day, [...(map.get(day) ?? []), d]);
      }
    }
    return map;
  }, [filtered, month]);

  const statusColor: Record<ContentStatus, string> = {
    draft: "var(--color-slate)",
    needs_review: "var(--color-status-pending)",
    verified: "var(--color-status-open)",
    published: "var(--color-status-open)",
    archived: "var(--color-status-closed)",
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by university…"
          className="min-w-56 rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
        <select
          value={degreeFilter}
          onChange={(e) => setDegreeFilter(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="all">All degree levels</option>
          {DEGREE_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="all">All deadline types</option>
          {DEADLINE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-ink/20">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-1.5 font-body text-sm ${
                view === "list" ? "bg-ink text-paper" : "text-ink"
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 font-body text-sm ${
                view === "calendar" ? "bg-ink text-paper" : "text-ink"
              }`}
            >
              Calendar
            </button>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
          >
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {importSummary && (
        <p className="mb-3 font-body text-xs text-status-open">
          {importSummary}
        </p>
      )}

      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-4 rounded-md border border-status-pending/40 bg-status-pending/10 px-3 py-2.5">
          <span className="font-body text-sm text-ink">
            {selected.size} selected
          </span>

          <div className="flex items-center gap-1.5">
            <span className="font-body text-xs text-slate">Shift dates</span>
            <input
              type="number"
              value={shiftDays}
              onChange={(e) => setShiftDays(e.target.value)}
              className="w-16 rounded border border-ink/20 bg-paper px-2 py-1 font-utility text-xs text-ink"
            />
            <span className="font-body text-xs text-slate">days</span>
            <button
              type="button"
              onClick={applyShift}
              className="rounded border border-ink/20 bg-paper px-2 py-1 font-body text-xs text-ink transition-colors duration-150 hover:border-status-open"
            >
              Apply
            </button>
          </div>

          <label className="flex items-center gap-1.5 font-body text-xs text-slate">
            Set type
            <select
              onChange={(e) => applyBulkType(e.target.value as DeadlineType)}
              defaultValue=""
              className="rounded border border-ink/20 bg-paper px-2 py-1 font-body text-xs text-ink"
            >
              <option value="" disabled>
                choose…
              </option>
              {DEADLINE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5 font-body text-xs text-slate">
            Set platform
            <select
              onChange={(e) =>
                applyBulkPlatform(e.target.value as ApplicationPlatform)
              }
              defaultValue=""
              className="rounded border border-ink/20 bg-paper px-2 py-1 font-body text-xs text-ink"
            >
              <option value="" disabled>
                choose…
              </option>
              {APPLICATION_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5 font-body text-xs text-slate">
            Set status
            <select
              onChange={(e) => applyBulkStatus(e.target.value as ContentStatus)}
              defaultValue=""
              className="rounded border border-ink/20 bg-paper px-2 py-1 font-body text-xs text-ink"
            >
              <option value="" disabled>
                choose…
              </option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {view === "list" ? (
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
                  University
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Degree
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Type
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Date
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Platform
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-ink/10 text-sm last:border-b-0 hover:bg-ink/[0.02]"
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(d.id)}
                      onChange={() => toggleOne(d.id)}
                      aria-label={`Select ${d.universityName} ${d.deadlineType}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-medium text-ink">
                    {d.universityName}
                  </td>
                  <td className="px-3 py-2.5 text-slate">{d.degreeLevel}</td>
                  <td className="px-3 py-2.5 text-ink">{d.deadlineType}</td>
                  <td className="px-3 py-2.5 font-utility text-ink">
                    {d.isRolling ? "Rolling" : d.deadlineDate}
                  </td>
                  <td className="px-3 py-2.5 text-slate">
                    {d.applicationPlatform}
                  </td>
                  <td className="px-3 py-2.5">
                    <ContentStatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center font-body text-sm text-slate"
                  >
                    No deadlines match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border border-ink/15 p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
              }
              className="rounded border border-ink/20 px-2 py-1 font-body text-xs text-ink"
              aria-label="Previous month"
            >
              ←
            </button>
            <span className="font-body text-sm font-semibold text-ink">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() =>
                setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
              }
              className="rounded border border-ink/20 px-2 py-1 font-body text-xs text-ink"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
              <div key={w} className="px-1 py-1 text-center">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayDeadlines = deadlinesByDay.get(day) ?? [];
              return (
                <div
                  key={day}
                  className="min-h-20 rounded border border-ink/10 p-1"
                >
                  <div className="font-utility text-xs text-slate">{day}</div>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {dayDeadlines.map((d) => (
                      <span
                        key={d.id}
                        title={`${d.universityName} — ${d.deadlineType}`}
                        className="truncate rounded px-1 py-0.5 font-body text-[10px] text-paper"
                        style={{ backgroundColor: statusColor[d.status] }}
                      >
                        {d.universityName}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
