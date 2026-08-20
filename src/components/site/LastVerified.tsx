function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Visible provenance signal required by the GEO/AEO strategy (Section 5) —
 * every fact-bearing page needs a "last verified" date and source citations.
 */
export function LastVerified({
  date,
  sources,
}: {
  date: string | null;
  sources?: string[] | null;
}) {
  if (!date && !sources?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-utility text-xs text-slate">
      {date && (
        <span>
          Last verified <time dateTime={date}>{formatDate(date)}</time>
        </span>
      )}
      {sources && sources.length > 0 && (
        <span className="flex flex-wrap items-center gap-x-1.5">
          Sources:
          {sources.map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline decoration-slate/40 underline-offset-2 hover:text-ink hover:decoration-ink"
            >
              [{i + 1}]
            </a>
          ))}
        </span>
      )}
    </div>
  );
}
