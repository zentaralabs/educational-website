import Link from "next/link";
import { CheckBadgeIcon } from "@/components/site/icons";

const POINTS = [
  {
    h: "Official sources only",
    d: "Every deadline, fee, and requirement traces to a university, government, or admissions-body page.",
  },
  {
    h: "Dated and re-checked",
    d: "Each fact carries the date it was last verified, on a quarterly re-verification cadence.",
  },
  {
    h: "Independent",
    d: "No university pays for inclusion, a better write-up, or a higher rank. We are not an education agent.",
  },
  {
    h: "Named editor, public method",
    d: "Written and maintained by a named operator against a published methodology.",
  },
];

/**
 * Condensed "why this data can be trusted" block for the homepage and
 * university profiles — the four E-E-A-T signals in one glance, linking out
 * to the full methodology and policy pages.
 */
export function WhyTrust({ className = "" }: { className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-line bg-mist p-5 sm:p-6 ${className}`}
    >
      <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
        <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-status-open" />
        Why trust Where To Apply
      </h2>
      <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {POINTS.map((p) => (
          <li key={p.h} className="flex flex-col gap-0.5">
            <span className="font-body text-sm font-semibold text-ink">
              {p.h}
            </span>
            <span className="font-body text-xs leading-relaxed text-slate">
              {p.d}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs">
        <Link
          href="/methodology"
          className="text-status-open underline underline-offset-2"
        >
          How we verify data →
        </Link>
        <Link
          href="/editorial-policy"
          className="text-slate underline underline-offset-2 hover:text-ink"
        >
          Editorial policy →
        </Link>
        <Link
          href="/about"
          className="text-slate underline underline-offset-2 hover:text-ink"
        >
          Who runs this →
        </Link>
      </div>
    </section>
  );
}
