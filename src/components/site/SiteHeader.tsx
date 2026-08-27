import Link from "next/link";

const NAV = [
  { label: "Deadlines", href: "/deadlines" },
  { label: "Guides", href: "/guides" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Visas", href: "/visas" },
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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 sm:flex-nowrap">
        <Link
          href="/"
          className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-ink"
        >
          Where To Apply
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-ink/15 px-3 py-1.5 font-body text-sm font-medium whitespace-nowrap text-ink/80 transition-colors duration-150 hover:border-status-open hover:text-ink sm:px-4 sm:text-base"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
