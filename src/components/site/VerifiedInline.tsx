import { CheckBadgeIcon } from "@/components/site/icons";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

/**
 * Restrained inline provenance marker placed directly beneath a group of
 * high-consequence facts — tuition, entry requirements, deadlines — so the
 * "checked, and here is where from" signal sits next to the number itself
 * rather than only in a page-level footer (see PROJECT_STATUS Section 27).
 * Deliberately a single muted line; not a badge.
 */
export function VerifiedInline({
  date,
  source,
  label = "Verified",
}: {
  date: string | null;
  source?: string | null;
  label?: string;
}) {
  if (!date && !source) return null;

  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-utility text-xs text-slate">
      <CheckBadgeIcon className="h-3.5 w-3.5 flex-shrink-0 text-status-open" />
      {date && (
        <span>
          {label} <time dateTime={date}>{formatDate(date)}</time>
        </span>
      )}
      {source && (
        <>
          {date && <span aria-hidden="true">·</span>}
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline decoration-slate/40 underline-offset-2 hover:text-ink hover:decoration-ink"
          >
            {hostLabel(source)} ↗
          </a>
        </>
      )}
    </p>
  );
}
