"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

function useActiveHeading(items: TocItem[], enabled: boolean) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || items.length === 0) return;

    const getHeadings = () =>
      items
        .map((i) => document.getElementById(i.id))
        .filter((el): el is HTMLElement => el !== null);

    // The active heading is the last one whose top has scrolled above the
    // reading line (~a third of the way down); before the first, none.
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const el of getHeadings()) {
        if (el.getBoundingClientRect().top - line <= 0) current = el.id;
        else break;
      }
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items, enabled]);

  return activeId;
}

/**
 * "On this page" navigation. `variant="rail"` is the sticky desktop
 * sidebar (with scroll-spy); `variant="panel"` is the collapsible block
 * shown above the article on narrow screens.
 */
export function TableOfContents({
  items,
  variant,
}: {
  items: TocItem[];
  variant: "rail" | "panel";
}) {
  const activeId = useActiveHeading(items, variant === "rail");

  if (items.length < 2) return null;

  const list = (
    <ul className="flex flex-col border-l border-line">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={`-ml-px block border-l-2 py-1 font-body text-sm leading-snug transition-colors duration-150 ${
              item.level === 3 ? "pl-6" : "pl-3"
            } ${
              variant === "rail" && activeId === item.id
                ? "border-status-open font-medium text-ink"
                : "border-transparent text-slate hover:border-ink/25 hover:text-ink"
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "panel") {
    return (
      <details className="group mb-8 rounded-xl border border-line bg-mist px-4 py-3 lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between font-body text-xs font-semibold tracking-wide text-slate uppercase [&::-webkit-details-marker]:hidden">
          On this page
          <span className="text-base transition-transform duration-150 group-open:rotate-90">
            &rsaquo;
          </span>
        </summary>
        <nav className="mt-3">{list}</nav>
      </details>
    );
  }

  return (
    <nav className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
      <p className="mb-2 pl-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
        On this page
      </p>
      {list}
    </nav>
  );
}
