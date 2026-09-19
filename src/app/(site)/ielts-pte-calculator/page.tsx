import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { IeltsPteCalculator } from "@/components/site/IeltsPteCalculator";
import { FaqSection } from "@/components/site/FaqSection";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd } from "@/lib/faq";
import { SITE_YEAR } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 86400;

const title = `IELTS to PTE Score Converter (${SITE_YEAR})`;
const description =
  "Convert your IELTS Academic score to PTE Academic, or the other way around, using Pearson's official concordance table. See the equivalent CEFR level too.";

export const metadata = pageMetadata({
  title,
  description,
  path: "/ielts-pte-calculator",
  type: "website",
});

const FAQ = [
  {
    q: "How accurate is an IELTS to PTE score conversion?",
    a: "It's an official estimate, not an exact formula. Pearson's own concordance table maps each IELTS band to a range of PTE scores, not a single number, and Pearson states directly that score relationships between different tests are always an approximation, even when the underlying study is done to a high standard. Treat the result as a reliable estimate, then confirm the exact score your university or visa route actually requires.",
  },
  {
    q: "Is this the score Australian universities use for admission?",
    a: "Yes. University English requirements are almost always expressed as an IELTS or PTE Academic overall score, which is what this tool converts. Some programs additionally set a higher minimum on one skill (listening, reading, writing, or speaking) alongside the overall score, so check the specific program's entry requirements for any per-skill minimum on top of the overall figure shown here.",
  },
  {
    q: "Does the Australian student visa accept PTE Academic?",
    a: "Yes, PTE Academic is one of the Department of Home Affairs' approved tests for the student visa's English language condition. Since 7 August 2025 the department accepts a newer version of PTE Academic with different score requirements than before, so a PTE result from before that date may no longer show the score you expect. See the department's Vocational English and Competent English pages for the current approved-test tables.",
  },
  {
    q: "What PTE score do I need for the Australian student visa?",
    a: "The visa condition is checked per skill component, not by an overall score the way this converter (and university admission) works. For results taken on or after 7 August 2025, Vocational English needs at least 33 listening, 36 reading, 29 writing, and 24 speaking; Competent English needs at least 47 listening, 48 reading, 51 writing, and 54 speaking, each on PTE Academic's 10-90 scale. Which tier applies depends on your specific visa pathway, so check your visa condition and the current legislative instrument, not just this table.",
  },
  {
    q: "Why does Pearson give a range instead of one exact PTE number for each IELTS score?",
    a: "The two tests aren't built the same way; PTE Academic combines speaking and writing into integrated tasks where IELTS scores them separately, and the scales themselves differ (IELTS 0-9 in 0.5 steps, PTE 10-90). Pearson's concordance study used an equipercentile method that aligns the two score distributions statistically, which produces a band of PTE scores that correspond to each IELTS band rather than a one-to-one match.",
  },
  {
    q: "The table doesn't go below IELTS 4.5. Why not?",
    a: "That's where Pearson's own published concordance starts. There's no official PTE equivalent published for IELTS bands below 4.5, so this tool doesn't invent one.",
  },
];

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "IELTS to PTE calculator" },
];

export default function IeltsPteCalculatorPage() {
  const jsonLd = [breadcrumbJsonLd(breadcrumbs), faqJsonLd(FAQ)];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        IELTS to PTE score converter
      </h1>
      <p className="mt-3 font-body text-base leading-relaxed text-slate">
        Enter your IELTS Academic overall score or your PTE Academic overall
        score to see the equivalent on the other test, using{" "}
        <strong className="font-semibold text-ink">
          Pearson&rsquo;s official concordance table
        </strong>{" "}
        (updated July 2025). It also shows the matching CEFR level.
      </p>

      <div className="mt-8">
        <IeltsPteCalculator />
      </div>

      <FaqSection heading="IELTS and PTE: common questions" items={FAQ} />

      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Planning your application
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { href: "/visas/student-500", label: "Student visa (subclass 500)" },
            { href: "/cost-calculator", label: "Cost of studying calculator" },
            { href: "/wam-calculator", label: "WAM calculator" },
            { href: "/visas/points-calculator", label: "Skilled migration points calculator" },
            { href: "/universities", label: "Browse all universities" },
            { href: "/deadlines", label: "Application deadlines by intake" },
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
