"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "I want to study computer science",
  "MIT",
  "Scholarships in Canada",
  "Stanford University",
  "MBA programs in the UK",
];

const TYPE_SPEED_MS = 45;
const HOLD_MS = 2 * 60 * 1000; // pause on the fully-typed phrase before it vanishes
const VANISH_MS = 450;

/**
 * Cycles through example searches with a typewriter effect, then dissolves
 * each one ("vapour" — blur + fade + drift up) before typing the next.
 * Purely decorative — the real <input> sits underneath and stays clickable
 * (see SearchBar). Skips the animation for prefers-reduced-motion, showing
 * a single static phrase instead.
 */
export function AnimatedPlaceholder() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [vanishing, setVanishing] = useState(false);

  useEffect(() => {
    // One-time media-query check on mount, not a state-sync loop — safe to
    // disable the "no setState in effect" rule here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const phrase = PHRASES[phraseIndex];

    if (!vanishing) {
      if (charCount < phrase.length) {
        const t = setTimeout(() => setCharCount((c) => c + 1), TYPE_SPEED_MS);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setVanishing(true), HOLD_MS);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setVanishing(false);
      setCharCount(0);
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    }, VANISH_MS);
    return () => clearTimeout(t);
  }, [charCount, vanishing, phraseIndex, reducedMotion]);

  const text = reducedMotion ? PHRASES[0] : PHRASES[phraseIndex].slice(0, charCount);

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-body text-lg text-slate transition-all ease-out duration-150 ${
        vanishing
          ? "-translate-y-2 opacity-0 blur-sm [transition-duration:450ms]"
          : "translate-y-0 opacity-100 blur-none"
      }`}
    >
      {text}
      <span
        aria-hidden="true"
        className="animate-blink-caret ml-1 inline-block h-[1.4em] w-[3px] shrink-0 bg-ink"
      />
    </span>
  );
}
