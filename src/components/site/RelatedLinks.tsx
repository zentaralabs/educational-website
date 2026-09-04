import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import type { RelatedLink } from "@/lib/related-content";

/**
 * Shared "related content" block used on guide, visa, and blog pages so
 * every long-form page links out to 3 to 6 siblings with descriptive anchor
 * text (internal-linking pass, see src/lib/related-content.ts).
 */
export function RelatedLinks({
  items,
  heading = "Keep reading",
  className = "",
}: {
  items: RelatedLink[];
  heading?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={className}>
      <h2 className="mb-4 font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {heading}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-paper px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/40 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
            >
              <span className="font-body text-sm font-medium text-ink">{item.label}</span>
              <ArrowUpRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
