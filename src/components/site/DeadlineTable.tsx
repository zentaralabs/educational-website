import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { deadlineBadgeStatus, formatDeadlineDate } from "@/lib/deadline-status";

export type DeadlineRowItem = {
  id: string;
  /** Left-hand descriptor. The calendar passes the university name plus
   * intake type; the profile adds degree level and application platform. */
  label: React.ReactNode;
  deadlineDate: string;
  isRolling: boolean;
  notes?: string | null;
  /** When set the whole row becomes a link (the calendar page). */
  href?: string;
};

/**
 * The shared deadline row used by the calendar, the university profile, and
 * the per-university deadlines page. The date is the element a visitor came
 * for, so it is the loudest thing in the row: the intake label is the muted
 * one, and the passport-stamp StatusBadge (Section 7) stays as it is but is
 * out-weighted rather than redesigned. An "Apply by" header gives the column
 * a name, which is what makes a "Rolling" row read as an answer instead of a
 * missing value.
 */
export function DeadlineTable({
  items,
  labelHeading = "Intake",
  pulseOnOpen = false,
}: {
  items: DeadlineRowItem[];
  labelHeading?: string;
  /** The animated dot beside an open date. Deliberately limited to the
   * deadline calendar — see the motion note in globals.css. */
  pulseOnOpen?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-md border border-line">
      <div className="flex items-center justify-between gap-4 border-b border-line bg-mist px-4 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
        <span>{labelHeading}</span>
        <span>Apply by</span>
      </div>

      {items.map((item) => {
        const status = deadlineBadgeStatus(item.deadlineDate, item.isRolling);
        const body = (
          <>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="font-body text-sm text-slate">{item.label}</span>
              <span className="flex flex-shrink-0 items-center gap-3">
                <span className="flex items-center gap-1.5 font-utility text-base font-semibold text-ink tabular-nums">
                  {pulseOnOpen && status === "open" && (
                    <span
                      aria-hidden="true"
                      className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-status-open"
                    />
                  )}
                  {item.isRolling ? (
                    formatDeadlineDate(item.deadlineDate, true)
                  ) : (
                    <time dateTime={item.deadlineDate}>
                      {formatDeadlineDate(item.deadlineDate, false)}
                    </time>
                  )}
                </span>
                <StatusBadge status={status} />
              </span>
            </div>
            {item.notes && (
              <p className="mt-1.5 font-body text-xs text-slate">{item.notes}</p>
            )}
          </>
        );

        const className =
          "block border-b border-line/70 border-l-4 px-4 py-3 last:border-b-0";

        return item.href ? (
          <Link
            key={item.id}
            href={item.href}
            className={`${className} transition-colors duration-150 hover:bg-ink/[0.03]`}
            style={{ borderLeftColor: `var(--color-status-${status})` }}
          >
            {body}
          </Link>
        ) : (
          <div
            key={item.id}
            className={className}
            style={{ borderLeftColor: `var(--color-status-${status})` }}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}
