import { ClockIcon } from "@/components/site/icons";
import { authorInitials } from "@/lib/format";

type Author = { name: string; credentials?: string | null } | null;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Byline row for guide and blog articles: who wrote it, who checked it,
 * how long it takes to read, and when it was published. Wraps cleanly on
 * narrow screens.
 */
export function ArticleMeta({
  author,
  reviewedBy,
  readingMinutes,
  date,
  dateLabel = "Published",
}: {
  author: Author;
  reviewedBy?: { name: string } | null;
  readingMinutes: number;
  date?: string | null;
  dateLabel?: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-body text-sm text-slate">
      {author && (
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ink font-utility text-[0.7rem] font-semibold text-paper">
            {authorInitials(author.name)}
          </span>
          <span>
            <span className="font-medium text-ink">{author.name}</span>
            {author.credentials ? `, ${author.credentials}` : ""}
          </span>
        </span>
      )}

      {reviewedBy && (
        <>
          <span aria-hidden className="text-ink/25">·</span>
          <span>Reviewed by {reviewedBy.name}</span>
        </>
      )}

      <span aria-hidden className="text-ink/25">·</span>
      <span className="flex items-center gap-1.5">
        <ClockIcon className="h-3.5 w-3.5" />
        {readingMinutes} min read
      </span>

      {date && (
        <>
          <span aria-hidden className="text-ink/25">·</span>
          <span>
            {dateLabel} <time dateTime={date}>{formatDate(date)}</time>
          </span>
        </>
      )}
    </div>
  );
}
