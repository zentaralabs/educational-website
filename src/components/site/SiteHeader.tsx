import Link from "next/link";

type NavLink = { label: string; href: string; hint?: string };
type NavItem = NavLink | { label: string; children: NavLink[] };

const NAV: NavItem[] = [
  { label: "Deadlines", href: "/deadlines" },
  {
    label: "Explore",
    children: [
      { label: "Courses", href: "/study", hint: "Browse programs by subject" },
      { label: "Best universities", href: "/best", hint: "Ranked shortlists by field" },
      { label: "Compare", href: "/compare", hint: "Universities side by side" },
      { label: "Cost of living", href: "/cost-of-living", hint: "Monthly budgets by city" },
    ],
  },
  {
    label: "Funding & visas",
    children: [
      { label: "Scholarships", href: "/scholarships", hint: "Funding you can apply for" },
      { label: "Visas", href: "/visas", hint: "Student, graduate & skilled subclasses" },
    ],
  },
  {
    label: "Guides",
    children: [
      { label: "How-to guides", href: "/guides", hint: "Step-by-step, evergreen" },
      { label: "Blog", href: "/blog", hint: "Deadline & policy updates" },
    ],
  },
];

const linkClass =
  "rounded-md px-3 py-1.5 font-body text-sm font-medium whitespace-nowrap text-ink/75 transition-colors duration-150 hover:text-ink sm:text-base";

function isLink(item: NavItem): item is NavLink {
  return "href" in item;
}

/**
 * Persistent top nav — a few grouped entries instead of one flat row of pills.
 * Sub-menus are CSS-only (hover + focus-within) so this stays a server component.
 * Faceted filtering lives on listing pages instead of deep menus here.
 * Domestic/international toggle lives on the homepage under the search box now,
 * not here — see StudentTypeToggle usage in app/page.tsx.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4 sm:flex-nowrap">
        <Link
          href="/"
          className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-ink"
        >
          Where To Apply
        </Link>

        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {NAV.map((item) =>
            isLink(item) ? (
              <Link key={item.label} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className="group relative">
                <button
                  type="button"
                  className={`${linkClass} inline-flex items-center gap-1 group-hover:text-ink group-focus-within:text-ink`}
                  aria-haspopup="true"
                >
                  {item.label}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    className="h-3 w-3 text-ink/40 transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
                  >
                    <path
                      d="M2.5 4.5 6 8l3.5-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="invisible absolute left-0 top-full z-20 pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="w-64 rounded-lg border border-ink/10 bg-paper p-1.5 shadow-lg shadow-ink/5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-md px-3 py-2 transition-colors duration-150 hover:bg-ink/5"
                      >
                        <span className="block font-body text-sm font-medium text-ink">
                          {child.label}
                        </span>
                        {child.hint ? (
                          <span className="mt-0.5 block font-body text-xs text-ink/55">
                            {child.hint}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
