import Link from "next/link";
import { authorInitials } from "@/lib/format";

/**
 * Card for the /blog grid. Site styling (thin border, small radius, green
 * accent) — not the guides PostCard, so the two indexes can diverge.
 * `featured` spans both columns and lays out wider.
 */
export function BlogCard({
  href,
  title,
  excerpt,
  tags,
  date,
  author,
  readingMinutes,
  featured = false,
}: {
  href: string;
  title: string;
  excerpt?: string | null;
  tags?: string[] | null;
  date?: string | null;
  author?: string | null;
  readingMinutes: number;
  featured?: boolean;
}) {
  const primaryTag = tags?.[0];

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/40 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] ${
        featured
          ? "border-status-open/25 bg-status-open/[0.04] p-6 sm:col-span-2 sm:p-8"
          : "border-line bg-paper p-5"
      }`}
    >
      <div className="flex items-center gap-2 font-utility text-xs tracking-widest text-status-open uppercase">
        {featured && <span>Latest</span>}
        {featured && primaryTag && <span aria-hidden className="text-ink/25">·</span>}
        {primaryTag && <span className={featured ? "text-slate" : ""}>{primaryTag.replace(/-/g, " ")}</span>}
      </div>

      <h3
        className={`mt-2 font-display font-semibold text-ink text-balance group-hover:underline ${
          featured ? "text-xl sm:text-2xl" : "text-lg"
        }`}
      >
        {title}
      </h3>

      {excerpt && (
        <p
          className={`mt-2 font-body text-slate ${
            featured ? "text-base leading-relaxed" : "line-clamp-3 text-[0.95rem]"
          }`}
        >
          {excerpt}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-4 font-utility text-xs text-slate">
        {author && (
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[0.6rem] font-semibold text-paper">
              {authorInitials(author)}
            </span>
            {author}
          </span>
        )}
        {date && (
          <>
            {author && <span aria-hidden className="text-ink/25">·</span>}
            <time dateTime={date}>
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </>
        )}
        <span aria-hidden className="text-ink/25">·</span>
        <span>{readingMinutes} min</span>
      </div>
    </Link>
  );
}
