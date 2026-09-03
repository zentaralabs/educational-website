export type DeadlineBadgeStatus = "open" | "upcoming" | "closed";

/**
 * Whether `deadline_date` is a date the university itself publishes or our
 * own apply-by guidance. See migration 0026: only a `closing_date` is precise
 * enough to show to the day or to stamp OPEN/UPCOMING/CLOSED.
 */
export type DeadlineDateKind = "closing_date" | "recommended";

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
 * The one date format for every deadline the site shows.
 *
 * A published closing date is shown to the day, with the year: the calendar
 * spans two intake years, so a bare "OCT 15" is ambiguous. Our own guidance
 * is shown only to the month, because it is derived from the intake month
 * rather than from anything a university published — rendering it as a
 * to-the-day date implied a precision it does not have, and made forty-odd
 * universities appear to share one deadline.
 */
export function formatDeadlineDate(
  deadlineDate: string,
  kind: DeadlineDateKind,
): string {
  const date = new Date(deadlineDate);
  if (kind === "recommended") {
    return `~${date.toLocaleDateString("en-AU", { month: "short", year: "numeric" })}`;
  }
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** The same value spelled out, for headings and prose. */
export function formatDeadlineDateLong(
  deadlineDate: string,
  kind: DeadlineDateKind,
): string {
  const date = new Date(deadlineDate);
  if (kind === "recommended") {
    return `around ${date.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}`;
  }
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
