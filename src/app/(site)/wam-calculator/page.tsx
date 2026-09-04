import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { WamCalculator } from "@/components/site/WamCalculator";
import { FaqSection } from "@/components/site/FaqSection";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd } from "@/lib/faq";
import { SITE_YEAR } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 86400;

const title = `WAM Calculator: Weighted Average Mark (${SITE_YEAR})`;
const description =
  "Work out your Weighted Average Mark (WAM) for an Australian university: enter each subject's mark and credit points to get your WAM, grade band, and 7-point GPA estimate.";

export const metadata = pageMetadata({
  title,
  description,
  path: "/wam-calculator",
  type: "website",
});

const FAQ = [
  {
    q: "What is a WAM?",
    a: "WAM stands for Weighted Average Mark, the standard way Australian universities summarise your overall academic performance. It's the credit-point-weighted average of your marks across all subjects, expressed as a number out of 100 rather than a letter grade.",
  },
  {
    q: "How is WAM calculated?",
    a: "Multiply each subject's mark by its credit points, add those up, then divide by the total credit points. A subject worth more credit points (a bigger, more intensive subject) counts for more in the average than a smaller one, which is why it's a weighted average rather than a simple mean of your marks.",
  },
  {
    q: "What WAM do I need for a master's or honours program?",
    a: "Most Australian postgraduate coursework programs ask for a Credit average (a WAM around 65) as a baseline, with more competitive programs and honours-year entry usually wanting a Distinction average (around 75) or higher. Requirements vary by university and course, so check the specific program's entry requirements.",
  },
  {
    q: "Is WAM the same as GPA?",
    a: "They measure the same thing but on different scales: WAM is out of 100, GPA is usually out of 7 in Australia. The rough conversion is High Distinction (85+) to 7.0, Distinction (75-84) to 6.0, Credit (65-74) to 5.0, and Pass (50-64) to 4.0. This is a common convention, not every university's exact published scale, so use it as an estimate.",
  },
  {
    q: "Does every university calculate WAM the same way?",
    a: "The basic formula is standard, but some universities apply extra weighting by year of study when calculating WAM for honours entry, giving your final year more weight than your first. This calculator uses the standard, unweighted-by-year formula that covers general admission purposes. Check your university's official policy if you're calculating WAM specifically for honours entry.",
  },
];

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "WAM calculator" },
];

export default function WamCalculatorPage() {
  const jsonLd = [breadcrumbJsonLd(breadcrumbs), faqJsonLd(FAQ)];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        WAM calculator
      </h1>
      <p className="mt-3 font-body text-base leading-relaxed text-slate">
        Add each subject&rsquo;s mark and credit points to work out your{" "}
        <strong className="font-semibold text-ink">Weighted Average Mark</strong>,
        the number Australian universities use to summarise your academic
        record for postgraduate and honours admission. Your WAM updates as you
        add subjects.
      </p>

      <div className="mt-8">
        <WamCalculator />
      </div>

      <FaqSection heading="WAM: common questions" items={FAQ} />

      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Planning your next degree
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { href: "/cost-calculator", label: "Cost of studying calculator" },
            { href: "/visas/points-calculator", label: "Skilled migration points calculator" },
            { href: "/universities", label: "Browse all universities" },
            { href: "/study", label: "Browse programs by subject" },
            { href: "/deadlines", label: "Application deadlines by intake" },
            { href: "/scholarships", label: "Scholarships for international students" },
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
