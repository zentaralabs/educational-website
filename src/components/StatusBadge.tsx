type BadgeStatus = "open" | "upcoming" | "closed";

const STATUS_CONFIG: Record<
  BadgeStatus,
  { label: string; color: string; rotate: string }
> = {
  open: { label: "OPEN", color: "var(--color-status-open)", rotate: "-2deg" },
  upcoming: {
    label: "UPCOMING",
    color: "var(--color-status-pending)",
    rotate: "1.5deg",
  },
  closed: {
    label: "CLOSED",
    color: "var(--color-status-closed)",
    rotate: "-1deg",
  },
};

/**
 * Passport-stamp status indicator — appears on every university card,
 * deadline entry, and guide. Functional (communicates state at a glance),
 * not decorative — see PROJECT_STATUS.md Section 7 "Signature element".
 */
export function StatusBadge({ status }: { status: BadgeStatus }) {
  const { label, color, rotate } = STATUS_CONFIG[status];

  return (
    <span
      className="inline-flex items-center rounded-sm border-2 px-2 py-0.5 font-utility text-xs font-semibold tracking-wide"
      style={{
        color,
        borderColor: color,
        transform: `rotate(${rotate})`,
      }}
    >
      {label}
    </span>
  );
}
