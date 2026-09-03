"use client";

import { useEffect, useState } from "react";

/**
 * A "there is more below" cue, pinned to the bottom of the first screen so it
 * shows without any scrolling. The hero is taller than a laptop viewport, so
 * an in-flow arrow at the end of it would sit below the fold — this has to be
 * fixed-position. Decorative (aria-hidden) and pointer-events-none: it is a
 * visual affordance for sighted mouse/touch users, and it must never sit on
 * top of the cookie banner's buttons. Fades out as soon as the reader moves.
 */
export function ScrollCue() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center transition-opacity duration-300 ${
        scrolled ? "opacity-0" : "opacity-100"
      }`}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-scroll-hint text-slate/70"
      >
        <path d="M12 5v14M6 13l6 6 6-6" />
      </svg>
    </div>
  );
}
