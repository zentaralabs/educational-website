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

export function SearchIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`${base} ${className}`}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function RssIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <path d="M5 11a9 9 0 0 1 9 9M5 5a15 15 0 0 1 15 15" strokeLinecap="round" />
      <circle cx="5.5" cy="18.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BuildingIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <path d="M4 9 12 4l8 5" />
      <path d="M5 9v11h14V9" />
      <path d="M10 20v-4h4v4" />
      <path d="M8.5 12.5h.01M15.5 12.5h.01" />
    </svg>
  );
}

export function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9.5h16M8.5 3v3.5M15.5 3v3.5" />
    </svg>
  );
}

export function BarsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <path d="M4.5 20h15" />
      <path d="M7.5 20v-7M12 20V8m4.5 12v-5" />
    </svg>
  );
}

export function PassportIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <circle cx="12.5" cy="14.5" r="2.4" />
    </svg>
  );
}

export function CalculatorIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <rect x="8" y="6" width="8" height="3.4" />
      <path d="M8.6 13h.01M12 13h.01M15.4 13h.01M8.6 16.6h.01M12 16.6h.01M15.4 16.6h.01" />
    </svg>
  );
}
