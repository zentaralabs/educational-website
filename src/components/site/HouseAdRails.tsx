"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EmailSignupForm } from "@/components/site/EmailSignupForm";
import { trackEvent } from "@/lib/analytics";

/** Content sections that get side rails. Tools, the quiz, legal pages and
 *  the homepage deliberately don't. */
const SECTIONS = [
  "guides",
  "blog",
  "universities",
  "international",
  "study",
  "scholarships",
  "visas",
  "compare",
  "best",
  "occupations",
  "cost-of-living",
];
const EXCLUDED = new Set([
  "/universities/in",
  "/visas/points-calculator",
  "/compare/universities",
]);

function showRails(pathname: string): boolean {
  if (pathname === "/updates") return true;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2 || !SECTIONS.includes(parts[0])) return false;
  return !EXCLUDED.has(`/${parts[0]}/${parts[1]}`) || parts.length > 2;
}

function ToolCard({
  slot,
  href,
  color,
  label,
  title,
  short,
  body,
  cta,
}: {
  slot: string;
  href: string;
  color: string;
  label: string;
  title: string;
  /** Shorter title for the compact (1280-1400px) rail. */
  short: string;
  body: string;
  cta: string;
}) {
  return (
    <div
      className="rail-card rounded-2xl border border-line bg-paper shadow-card"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <p
        className="rail-detail font-utility text-[0.7rem] font-semibold tracking-wider uppercase"
        style={{ color }}
      >
        {label}
      </p>
      <p className="rail-title mt-1.5 font-display leading-snug font-semibold text-ink">
        <span className="rail-full">{title}</span>
        <span className="rail-short">{short}</span>
      </p>
      <p className="rail-detail mt-1.5 font-body text-[0.8rem] leading-snug text-slate">{body}</p>
      <Link
        href={href}
        onClick={() => trackEvent("house_ad_click", { slot })}
        className="rail-cta mt-3 inline-block rounded-full font-body font-semibold text-white"
        style={{ background: color }}
      >
        {cta} &rarr;
      </Link>
    </div>
  );
}

/**
 * Sticky house-ad columns in the empty margins either side of the page, on
 * laptops and up (1280px+): compact cards at 1280-1399, full cards from
 * 1400. Anchored beside the widest article column (64rem). They promote the site's own tools; the same slots can later
 * hold affiliate or AdSense units.
 */
export function HouseAdRails() {
  const pathname = usePathname();
  if (!showRails(pathname)) return null;


  return (
    <>
      <aside
        aria-label="Free tools"
        className="house-rail house-rail-left"
      >
        <div className="pointer-events-auto sticky top-24 flex flex-col gap-4 pt-8">
          <ToolCard
            slot="left-quiz"
            href="/quiz"
            color="var(--color-brand)"
            label="Free tool"
            title="Not sure where to apply?"
            short="Where to apply?"
            body="Answer a few questions and get a shortlist matched to your budget and English score."
            cta="Quiz"
          />
          <ToolCard
            slot="left-wam"
            href="/wam-calculator"
            color="var(--color-teal)"
            label="Free tool"
            title="What is your WAM?"
            short="Your WAM?"
            body="Convert your marks to Australia's grade average."
            cta="Calculate"
          />
          <ToolCard
            slot="left-points"
            href="/visas/points-calculator"
            color="var(--color-violet)"
            label="Free tool"
            title="How many PR points do you have?"
            short="Your PR points?"
            body="Check your points for the 189, 190 and 491 skilled visas."
            cta="Points"
          />
        </div>
      </aside>

      <aside
        aria-label="Free tools"
        className="house-rail house-rail-right"
      >
        <div className="pointer-events-auto sticky top-24 flex flex-col gap-4 pt-8">
          <div
            className="rail-card rounded-2xl border border-line bg-paper shadow-card"
            style={{ borderTop: "4px solid var(--color-coral)" }}
          >
            <p className="rail-detail font-utility text-[0.7rem] font-semibold tracking-wider text-coral uppercase">
              Stay ahead
            </p>
            <p className="rail-title mt-1.5 font-display leading-snug font-semibold text-ink">
              <span className="rail-full">Never miss a deadline</span>
              <span className="rail-short">Deadline alerts</span>
            </p>
            <p className="rail-detail mt-1.5 mb-3 font-body text-[0.8rem] leading-snug text-slate">
              One email when a deadline or visa rule changes. No spam.
            </p>
            <div className="rail-signup">
              <EmailSignupForm source="side-rail" />
            </div>
          </div>
          <ToolCard
            slot="right-cost"
            href="/cost-calculator"
            color="var(--color-sun)"
            label="Free tool"
            title="What will it cost?"
            short="Total cost?"
            body="Tuition, rent, health cover and flights in one total."
            cta="Cost"
          />
        </div>
      </aside>
    </>
  );
}
