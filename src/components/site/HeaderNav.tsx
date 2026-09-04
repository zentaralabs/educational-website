"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { SearchIcon } from "./icons";

type NavLink = { label: string; href: string; hint?: string };
type NavItem = NavLink | { label: string; children: NavLink[] };

const NAV: NavItem[] = [
  { label: "Universities", href: "/universities" },
  { label: "Scholarships", href: "/scholarships" },
  {
    label: "Explore",
    children: [
      { label: "Deadlines", href: "/deadlines", hint: "Application closing dates by intake" },
      { label: "Courses", href: "/study", hint: "Browse programs by subject" },
      { label: "Best universities", href: "/best", hint: "Ranked shortlists by field" },
      { label: "Compare", href: "/compare", hint: "Universities side by side" },
      { label: "Cost of living", href: "/cost-of-living", hint: "Monthly budgets by city" },
      { label: "Cost calculator", href: "/cost-calculator", hint: "Full cost of your degree" },
      { label: "WAM calculator", href: "/wam-calculator", hint: "Weighted Average Mark from your subject marks" },
      { label: "By country", href: "/international", hint: "Applying from India, Nepal, China and more" },
    ],
  },
  {
    label: "Visas",
    children: [
      { label: "All visa subclasses", href: "/visas", hint: "Student, graduate, skilled, family, working holiday" },
      { label: "Updates", href: "/updates", hint: "Student visa & policy changes, dated and sourced" },
      { label: "Points calculator", href: "/visas/points-calculator", hint: "Estimate your skilled migration score" },
      { label: "Invitation rounds", href: "/visas/invitation-rounds", hint: "SkillSelect cut-offs, round by round" },
    ],
  },
  {
    label: "Guides",
    children: [
      { label: "How-to guides", href: "/guides", hint: "Step-by-step, evergreen" },
      { label: "Blog", href: "/blog", hint: "Analysis and longer reads" },
    ],
  },
];

const linkClass =
  "rounded-md px-3 py-1.5 font-body text-sm font-medium whitespace-nowrap text-ink/75 transition-colors duration-150 hover:text-ink sm:text-base";

function isLink(item: NavItem): item is NavLink {
  return "href" in item;
}

/**
 * Top nav. The grouped entries are click-to-open menu buttons, which behave
 * the same on touch, mouse, and keyboard (the previous hover-only CSS menus
 * could not be opened by tapping). Closing: outside click, Escape, choosing
 * an item, or navigating to a new route.
 */
export function HeaderNav() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuId = useId();
  const router = useRouter();
  const pathname = usePathname();

  const close = () => setOpenLabel(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (openLabel === null) return;
    function onPointerDown(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenLabel(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenLabel(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openLabel]);

  // Site-wide Cmd/Ctrl+K: jump to /search from anywhere. HeaderNav renders
  // on every page, so this is the one place that can make the shortcut work
  // outside the homepage and /search itself. On /search already, SearchBar's
  // own listener focuses the input instead — this one steps aside there.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (pathname === "/search") return;
        e.preventDefault();
        router.push("/search");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router]);

  return (
    <nav
      ref={navRef}
      className="flex flex-wrap items-center gap-x-1 gap-y-1"
    >
      {NAV.map((item) => {
        if (isLink(item)) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className={linkClass}
              onClick={close}
            >
              {item.label}
            </Link>
          );
        }

        const open = openLabel === item.label;
        const panelId = `${menuId}-${item.label.replace(/\W+/g, "-")}`;

        return (
          <div key={item.label} className="relative">
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() =>
                setOpenLabel((cur) => (cur === item.label ? null : item.label))
              }
              className={`${linkClass} inline-flex items-center gap-1 ${
                open ? "text-ink" : ""
              }`}
            >
              {item.label}
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className={`h-3 w-3 text-ink/40 transition-transform duration-150 ${
                  open ? "rotate-180" : ""
                }`}
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

            <div
              id={panelId}
              hidden={!open}
              className="absolute right-0 top-full z-20 pt-2"
            >
              <div className="w-64 rounded-lg border border-ink/10 bg-paper p-1.5 shadow-lg shadow-ink/5">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={close}
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
        );
      })}

      <Link
        href="/search"
        onClick={close}
        aria-label="Search"
        title="Search (⌘K)"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink/75 transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
      >
        <SearchIcon className="h-[18px] w-[18px]" />
      </Link>
    </nav>
  );
}
