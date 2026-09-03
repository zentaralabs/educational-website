import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PointsCalculator } from "@/components/site/PointsCalculator";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { SITE_YEAR } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `Australia PR Points Calculator ${SITE_YEAR} (189, 190, 491)`,
  description:
    "Free calculator for the Australian skilled migration points test. Add up your points for the subclass 189, 190, and 491 visas from age, English, work experience, qualifications, study, partner, and nomination.",
  path: "/visas/points-calculator",
  type: "website",
});

const FAQ = [
  {
    q: "How many points do I need for the 189 visa?",
    a: "You need at least 65 points to submit an Expression of Interest, but that is only the minimum. Recent invitation rounds have invited trades occupations near 65, most professional occupations from about 75, and ICT and accounting from 90 or higher. State nomination for the 190 and 491 usually invites at lower scores.",
  },
  {
    q: "What is the maximum points you can score?",
    a: "In practice the highest realistic total is around 100 to 110. Age caps at 30 points (ages 25 to 32), English at 20 (Superior), qualifications at 20 (Doctorate), and combined skilled work experience at 20.",
  },
  {
    q: "Does the 189, 190, or 491 use the same points test?",
    a: "Yes, the same points test applies to all three. The difference is nomination: the 190 adds 5 points for state nomination and the 491 adds 15 for regional nomination or eligible family sponsorship. The 189 has no nomination and no bonus.",
  },
  {
    q: "How can I increase my points?",
    a: "The fastest single jumps are usually a higher English test result (10 or 20 points), a skilled partner skills assessment (10 points), a Professional Year in Australia (5 points), or NAATI community-language credentialing (5 points). More skilled work experience helps but accrues one five-point band every few years.",
  },
  {
    q: "Is this calculator official?",
    a: "No. It uses the current published points values but does not replace the Department of Home Affairs points tool or advice from a registered migration agent. It does not check your occupation, skills assessment, or exact age at invitation.",
  },
];

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Visas", href: "/visas" },
  { label: "Points calculator" },
];

export default function PointsCalculatorPage() {
  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Australia skilled migration points calculator
      </h1>
      <p className="mt-3 font-body text-base leading-relaxed text-slate">
        Add up your score for the points test that decides invitations for the{" "}
        <Link href="/visas/skilled-independent-189" className="text-status-open underline underline-offset-2">
          Skilled Independent (189)
        </Link>
        ,{" "}
        <Link href="/visas/skilled-nominated-190" className="text-status-open underline underline-offset-2">
          Skilled Nominated (190)
        </Link>
        , and{" "}
        <Link href="/visas/skilled-work-regional-491" className="text-status-open underline underline-offset-2">
          Skilled Work Regional (491)
        </Link>{" "}
        visas. The total updates as you change each answer.
      </p>

      <div className="mt-8">
        <PointsCalculator />
      </div>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">
          Points calculator: common questions
        </h2>
        <div className="flex flex-col gap-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="font-body text-base font-semibold text-ink">{f.q}</h3>
              <p className="mt-1 font-body text-base leading-relaxed text-slate">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 border-t border-line pt-6">
        <Link
          href="/visas"
          className="font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
        >
          ← All visa subclasses
        </Link>
      </div>
    </main>
  );
}
