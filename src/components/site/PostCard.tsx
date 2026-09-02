import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";

/**
 * Listing card for the /guides and /blog indexes. `featured` gives the
 * lead item a larger title and a tinted panel; the default is a compact
 * row that reads well stacked.
 */
export function PostCard({
  href,
  eyebrow,
  title,
  excerpt,
  featured = false,
  isNew = false,
}: {
  href: string;
  eyebrow?: string;
  title: string;
  excerpt?: string | null;
  featured?: boolean;
  isNew?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-2 rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/40 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] ${
        featured
          ? "border-status-open/25 bg-status-open/[0.04] p-6 sm:p-8"
          : "border-line bg-paper p-5 sm:p-6"
      }`}
    >
      {(eyebrow || isNew) && (
        <span className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest uppercase">
          {isNew && (
            <span className="rounded-full bg-status-open/10 px-2 py-0.5 text-status-open">
              New
            </span>
          )}
          {eyebrow && <span className="text-status-open">{eyebrow}</span>}
        </span>
      )}
      <span className="flex items-start justify-between gap-3">
        <span
          className={`font-display font-semibold text-ink text-balance group-hover:underline ${
            featured ? "text-xl sm:text-2xl" : "text-lg"
          }`}
        >
          {title}
        </span>
        <ArrowUpRightIcon className="mt-1.5 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
      </span>
      {excerpt && (
        <span
          className={`font-body text-slate ${featured ? "text-base" : "text-[0.95rem]"}`}
        >
          {excerpt}
        </span>
      )}
    </Link>
  );
}
