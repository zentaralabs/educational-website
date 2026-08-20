export type DeadlineBadgeStatus = "open" | "upcoming" | "closed";

/**
 * Maps a deadline's date to the passport-stamp badge state (Section 7).
 * Rolling admissions are always "open"; otherwise it's just past vs future —
 * there's no third "closing soon" state in the badge system.
 */
export function deadlineBadgeStatus(
  deadlineDate: string,
  isRolling: boolean,
): DeadlineBadgeStatus {
  if (isRolling) return "open";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(deadlineDate);

  return date < today ? "closed" : "upcoming";
}

export function formatDeadlineDate(deadlineDate: string, isRolling: boolean): string {
  if (isRolling) return "ROLLING";
  const date = new Date(deadlineDate);
  return date
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    .toUpperCase()
    .replace(",", "");
}
