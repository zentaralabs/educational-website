"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { EntityType, ReviewQueueItem } from "@/lib/review-queue";

const ENTITY_LABELS: Record<EntityType, string> = {
  university: "University",
  deadline: "Deadline",
  guide: "Guide",
  scholarship: "Scholarship",
};

export function ReviewQueueTable({ items }: { items: ReviewQueueItem[] }) {
  const [typeFilter, setTypeFilter] = useState<"all" | EntityType>("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return items;
    return items.filter((i) => i.entityType === typeFilter);
  }, [items, typeFilter]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | EntityType)}
          className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
        >
          <option value="all">All types</option>
          {Object.entries(ENTITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="font-body text-xs text-slate">
          {filtered.length} awaiting review, oldest first
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-ink/15">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03]">
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Type
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Title
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Status
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Last verified
              </th>
              <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Author
              </th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={`${item.entityType}-${item.id}`}
                className="border-b border-ink/10 text-sm last:border-b-0 hover:bg-ink/[0.02]"
              >
                <td className="px-3 py-2.5 text-slate">
                  {ENTITY_LABELS[item.entityType]}
                </td>
                <td className="px-3 py-2.5 font-medium text-ink">
                  {item.title}
                </td>
                <td className="px-3 py-2.5">
                  <ContentStatusBadge status={item.status} />
                </td>
                <td className="px-3 py-2.5 font-utility text-ink">
                  {item.lastVerifiedAt ?? "never"}
                </td>
                <td className="px-3 py-2.5 text-slate">
                  {item.author ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Link
                    href={item.href}
                    className="font-body text-xs font-medium text-status-open hover:underline"
                  >
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center font-body text-sm text-slate"
                >
                  Nothing in the queue — everything reviewed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
