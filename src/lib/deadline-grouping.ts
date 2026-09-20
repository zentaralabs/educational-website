import type { PublicDeadlineRow } from "@/lib/queries/public-deadlines";

/** Groups deadline rows by "Month Year", preserving row order within a group. */
export function groupDeadlinesByMonth(
  deadlines: PublicDeadlineRow[],
): Map<string, PublicDeadlineRow[]> {
  const groups = new Map<string, PublicDeadlineRow[]>();
  for (const d of deadlines) {
    const key = new Date(d.deadline_date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }
  return groups;
}
