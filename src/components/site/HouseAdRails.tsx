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
  body,
  cta,
}: {
  slot: string;
  href: string;
  color: string;
  label: string;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <div
      className="rounded-2xl border border-line bg-paper p-4 shadow-card"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <p
        className="font-utility text-[0.7rem] font-semibold tracking-wider uppercase"
        style={{ color }}
      >
        {label}
      </p>
      <p className="mt-1.5 font-display text-base leading-snug font-semibold text-ink">
        {title}
      </p>
      <p className="mt-1.5 font-body text-[0.8rem] leading-snug text-slate">{body}</p>
      <Link
        href={href}
        onClick={() => trackEvent("house_ad_click", { slot })}
        className="mt-3 inline-block rounded-full px-3.5 py-1.5 font-body text-[0.8rem] font-semibold text-white"
        style={{ background: color }}
      >
        {cta} &rarr;
      </Link>
    </div>
  );
}

/**
 * Sticky house-ad columns in the empty margins either side of the page, on
 * wide desktops only (1600px+, where there is room beside the widest
 * content). They promote the site's own tools; the same slots can later
 * hold affiliate or AdSense units.
 */
export function HouseAdRails() {
  const pathname = usePathname();
  if (!showRails(pathname)) return null;

  const rail =
    "pointer-events-none absolute inset-y-0 hidden w-44 min-[1600px]:block";

  return (
    <>
      <aside
        aria-label="Free tools"
        className={`${rail} left-[calc(50%-36rem-1.5rem-11rem)]`}
      >
        <div className="pointer-events-auto sticky top-24 flex flex-col gap-4 pt-8">
          <ToolCard
            slot="left-quiz"
            href="/quiz"
            color="var(--color-brand)"
            label="Free tool"
            title="Not sure where to apply?"
            body="Answer a few questions and get a shortlist matched to your budget and English score."
            cta="2-minute quiz"
          />
          <ToolCard
            slot="left-wam"
            href="/wam-calculator"
            color="var(--color-teal)"
            label="Free tool"
            title="What is your WAM?"
            body="Convert your marks to Australia's grade average."
            cta="Calculate"
          />
          <ToolCard
            slot="left-points"
            href="/visas/points-calculator"
            color="var(--color-violet)"
            label="Free tool"
            title="How many PR points do you have?"
            body="Check your points for the 189, 190 and 491 skilled visas."
            cta="Points calculator"
          />
        </div>
      </aside>

      <aside
        aria-label="Free tools"
        className={`${rail} right-[calc(50%-36rem-1.5rem-11rem)]`}
      >
        <div className="pointer-events-auto sticky top-24 flex flex-col gap-4 pt-8">
          <div
            className="rounded-2xl border border-line bg-paper p-4 shadow-card"
            style={{ borderTop: "4px solid var(--color-coral)" }}
          >
            <p className="font-utility text-[0.7rem] font-semibold tracking-wider text-coral uppercase">
              Stay ahead
            </p>
            <p className="mt-1.5 font-display text-base leading-snug font-semibold text-ink">
              Never miss a deadline
            </p>
            <p className="mt-1.5 mb-3 font-body text-[0.8rem] leading-snug text-slate">
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
            body="Tuition, rent, health cover and flights in one total."
            cta="Cost calculator"
          />
        </div>
      </aside>
    </>
  );
}
