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

/**
 * The one date format for every deadline the site shows. The year matters —
 * the calendar spans two intake years, so a bare "OCT 15" is ambiguous.
 */
export function formatDeadlineDate(deadlineDate: string, isRolling: boolean): string {
  if (isRolling) return "Rolling";
  return new Date(deadlineDate).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
