import Link from "next/link";

export type Crumb = { label: string; href?: string };

/** Visible wayfinding trail for deep pages, per PROJECT_STATUS.md Section 4. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 font-utility text-xs text-slate">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors duration-150 hover:text-ink"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink/70">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && (
              <span aria-hidden="true" className="text-ink/25">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
