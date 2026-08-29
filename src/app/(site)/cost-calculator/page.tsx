import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CostCalculator } from "@/components/site/CostCalculator";
import { FaqSection } from "@/components/site/FaqSection";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd } from "@/lib/faq";
import { SITE_YEAR } from "@/lib/site-config";
import { listCollectionUniversities } from "@/lib/queries/public-collections";

export const revalidate = 3600;

const title = `Cost of Studying in Australia Calculator (${SITE_YEAR})`;
const description =
  "Work out the full cost of studying in Australia as an international student: tuition, rent, food, transport, health cover, the student visa, and flights, for one year and the whole degree. Includes what you need to show for the visa.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/cost-calculator" },
  openGraph: { title, description, url: "/cost-calculator", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

const FAQ = [
  {
    q: "How much does it cost to study in Australia for international students?",
    a: "For most students, a first year runs between A$40,000 and A$80,000 all in: roughly A$30,000 to A$50,000 tuition, about A$30,000 living costs, the A$2,500 student visa, around A$650 health cover, plus flights and setup. Group of Eight universities and the Sydney and Melbourne cost of living sit at the top of that range.",
  },
  {
    q: "How much money do I need to show for an Australian student visa?",
    a: "You evidence 12 months of living costs (A$29,710 for the primary applicant, set by the Australian Government), plus first-year tuition and about A$2,000 for travel. Add A$10,394 for a partner and A$4,449 per child. The funds also need a genuine savings history, so most successful applications show a margin above the minimum.",
  },
  {
    q: "Is this cost calculator accurate?",
    a: "It gives a realistic estimate from published 2026 ranges, but it is not a quote. Rent is the largest and most variable cost and the calculator uses a midpoint. Tuition depends on your exact course, and OSHC and airfares vary by provider and season. Use it to plan, then get real figures before you commit.",
  },
  {
    q: "What is the cheapest way to study in Australia?",
    a: "Pick a regional or newer university rather than a Group of Eight, study in Adelaide, Perth, or a regional city rather than Sydney or Melbourne, share accommodation, and choose a two-year master's over a longer degree. Studying regionally also earns skilled-migration points, which many students value more than the fee saving.",
  },
  {
    q: "Does the calculator include working part-time?",
    a: "No. Student visa holders can work up to 48 hours a fortnight in session, which for many students covers a meaningful share of living costs, but the visa requires you to show you can fund your study without relying on that income. The figures here are what you plan for, not what you will necessarily spend from savings.",
  },
];

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Cost calculator" },
];

export default async function CostCalculatorPage() {
  const raw = await listCollectionUniversities();
  const universities = raw
    .map((u) => ({ slug: u.slug, name: u.name, minTuition: u.minTuition }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const jsonLd = [breadcrumbJsonLd(breadcrumbs), faqJsonLd(FAQ)];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Cost of studying in Australia calculator
      </h1>
      <p className="mt-3 font-body text-base leading-relaxed text-slate">
        Add your course and city, and this works out the full first-year and
        whole-degree cost: tuition, rent, food, transport, health cover, the{" "}
        <Link
          href="/visas/student-500"
          className="text-status-open underline underline-offset-2"
        >
          student visa
        </Link>
        , and flights. It also shows the amount you need to evidence for the
        visa. The totals update as you change each answer.
      </p>

      <div className="mt-8">
        <CostCalculator universities={universities} />
      </div>

      <FaqSection heading="Cost of studying in Australia: common questions" items={FAQ} />

      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Bring the cost down
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { href: "/best/affordable-australian-universities-for-international-students", label: "Most affordable universities" },
            { href: "/best/regional-australian-universities-for-skilled-migration", label: "Regional universities (migration points)" },
            { href: "/cost-of-living", label: "Cost of living by city" },
            { href: "/scholarships", label: "Scholarships for international students" },
            { href: "/universities", label: "Browse all universities" },
            { href: "/best/australian-universities-with-no-application-fee", label: "Universities with no application fee" },
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
