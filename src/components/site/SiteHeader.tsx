import Link from "next/link";

const NAV = [
  { label: "Deadlines", href: "/deadlines" },
  { label: "Guides", href: "/guides" },
  { label: "Compare", href: "/compare" },
  { label: "Blog", href: "/blog" },
];

/**
 * Persistent minimal top nav — 4-5 items max, per PROJECT_STATUS.md Section 4.
 * Faceted filtering lives on listing pages instead of deep menus here.
 * Domestic/international toggle lives on the homepage under the search box now,
 * not here — see StudentTypeToggle usage in app/page.tsx.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-ink"
        >
          Where To Apply
        </Link>

        <nav className="flex items-center gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-ink/15 px-4 py-1.5 font-body text-base font-medium text-ink/80 transition-colors duration-150 hover:border-status-open hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
