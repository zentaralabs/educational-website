/**
 * Small inline line-icon set, stroke=currentColor so each inherits the
 * site's existing text-color tokens (ink/slate/status-open) — no icon
 * library dependency, no new colors introduced.
 */
type IconProps = { className?: string };

const base = "shrink-0";

export function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CoinIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2c0 3-5 2-5 5 0 1.1 1.1 2 2.5 2s2.5-.9 2.5-2" strokeLinecap="round" />
      <path d="M12 6v1.2M12 16.8V18" strokeLinecap="round" />
    </svg>
  );
}

export function GlobeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
    </svg>
  );
}

export function BookIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22.5V5.5Z" strokeLinejoin="round" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22.5V5.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckBadgeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <path
        d="M12 3.5 14 5l2.6-.4 1 2.4L20 8.4l-.9 2.6.9 2.6-2.4 1.4-1 2.4L14 17l-2 1.5-2-1.5-2.6.4-1-2.4L4 13.6l.9-2.6L4 8.4l2.4-1.4 1-2.4L10 5l2-1.5Z"
        strokeLinejoin="round"
      />
      <path d="m8.5 12.3 2.2 2.2 4.3-4.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`${base} ${className}`}>
      <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
