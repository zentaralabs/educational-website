"use client";

import { useId, useState } from "react";

/**
 * Click-to-expand panel, collapsed by default. Used for the homepage
 * "next application dates" strip so the hero stays compact. Animates the
 * open/close via a grid-rows trick that works without measuring height.
 */
export function Collapsible({
  label,
  sublabel,
  children,
  defaultOpen = false,
}: {
  label: string;
  sublabel?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-mist">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink/[0.03] sm:px-5"
      >
        <span className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-dot absolute inline-flex h-2 w-2 rounded-full bg-status-open" />
          </span>
          <span className="font-body text-sm font-semibold tracking-wide text-ink">
            {label}
          </span>
          {sublabel && (
            <span className="font-utility text-xs text-slate">{sublabel}</span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 flex-shrink-0 text-slate transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,0.84,0.34,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line">{children}</div>
        </div>
      </div>
    </div>
  );
}
