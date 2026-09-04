import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Fact, FactBox, ProfileSection } from "@/components/site/ProfileSection";
import { FaqSection } from "@/components/site/FaqSection";
import { LastVerified } from "@/components/site/LastVerified";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd } from "@/lib/faq";
import { flagEmoji } from "@/lib/flag";
import { SITE_YEAR } from "@/lib/site-config";
import {
  ORIGIN_COUNTRY_SLUGS,
  getOriginCountry,
} from "@/lib/origin-countries";
import { getApplyGuide } from "@/lib/apply-guides";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";
import { AUD_RATES, RATES_AS_OF, formatLocalRange } from "@/lib/fx";

export const revalidate = 3600;

export function generateStaticParams() {
  return ORIGIN_COUNTRY_SLUGS.map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const c = getOriginCountry(country);
  if (!c) return {};
  const title = composeTitle(`Study in Australia from ${c.name}`, [
    `Cost, Visa & How to Apply ${SITE_YEAR}`,
    `Cost, Visa & Requirements ${SITE_YEAR}`,
    `Cost & Visa ${SITE_YEAR}`,
    `${SITE_YEAR} Guide`,
  ]);
  const description = `A practical guide for ${c.demonym} students applying to Australian universities: what a year costs, how the application and student visa work, credential and English requirements, and the pathway after graduation.`;
  return pageMetadata({
    title,
    description,
    path: `/international/${country}`,
    type: "article",
  });
}

export default async function OriginCountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const c = getOriginCountry(country);
  if (!c) notFound();

  const hasApplyGuide = Boolean(getApplyGuide(country));

  // The same A$40,000 to A$80,000 first-year band shown in the fact box, in
  // the reader's own currency and counting unit. Null for a country with no
  // rate on file, in which case the block simply does not render.
  const localBudget = c.currency
    ? formatLocalRange(40_000, 80_000, c.currency)
    : null;

  const otherCountries = ORIGIN_COUNTRY_SLUGS.filter((s) => s !== country)
    .map((s) => getOriginCountry(s)!)
    .sort((a, b) => a.name.localeCompare(b.name));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "By country", href: "/international" },
    { label: c.name },
  ];

  const jsonLd: Record<string, unknown>[] = [
    breadcrumbJsonLd(breadcrumbs),
    faqJsonLd(c.faq),
  ];

  const related = [
    { href: "/universities", label: "Browse all Australian universities" },
    { href: "/deadlines/february-2027-intake", label: "February 2027 intake deadlines" },
    { href: "/visas/student-500", label: "Student visa (subclass 500) explained" },
    { href: "/best/affordable-australian-universities-for-international-students", label: "Most affordable universities" },
    { href: "/scholarships", label: "Scholarships for international students" },
    { href: "/visas/points-calculator", label: "Skilled migration points calculator" },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          Study in Australia
        </p>
        <h1 className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          <span aria-hidden="true">{flagEmoji(c.code)}</span>
          <span>Study in Australia from {c.name}</span>
        </h1>
      </div>

      <div className="mt-6 flex max-w-2xl flex-col gap-3 font-body text-base leading-relaxed text-ink">
        {c.intro.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <ProfileSection title="At a glance">
        <FactBox>
          <Fact label="First-year budget" value="A$40,000 to A$80,000" />
          <Fact label="Tuition (per year)" value="A$28,000 to A$55,000" />
          <Fact label="Living costs (visa minimum)" value="A$29,710 / 12 months" />
          <Fact label="Student visa (500) fee" value="A$2,500" />
          <Fact label="Work rights" value="48 hrs / fortnight in session" />
          <Fact label="Health cover (OSHC)" value="Required, full visa period" />
        </FactBox>
        {localBudget && (
          <p className="mt-3 font-body text-sm text-ink">
            <span className="font-semibold">In {c.currency}:</span> a first year
            of roughly {localBudget}, at A$1 = {c.currency}{" "}
            {AUD_RATES[c.currency!]!.toLocaleString("en-US")} on{" "}
            {new Date(RATES_AS_OF).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            . Indicative only: the rate moves, so price your own course at the
            rate on the day you transfer.
          </p>
        )}
        <p className="mt-2 font-body text-xs text-slate">
          Living costs and the visa fee are set by the Australian Government and
          are the same for every nationality. Tuition varies widely by
          university and course.
        </p>
      </ProfileSection>

      <ProfileSection narrow title={`Applying from ${c.name}`}>
        <div className="flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
          {c.applying.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        {hasApplyGuide && (
          <Link
            href={`/international/${country}/how-to-apply`}
            className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-status-open/30 bg-status-open/[0.04] px-4 py-3 font-body text-sm transition-colors duration-150 hover:border-status-open/50"
          >
            <span className="text-ink">
              <span className="font-semibold">
                How to apply from {c.name}, step by step:
              </span>{" "}
              the full process, a documents checklist, and a working timeline
            </span>
            <span aria-hidden="true" className="text-status-open">
              &rarr;
            </span>
          </Link>
        )}
      </ProfileSection>

      <ProfileSection narrow title="What it costs">
        <div className="flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
          {localBudget && (
            <p>
              A first year in Australia costs roughly {localBudget} for a
              student from {c.name}, converted from A$40,000 to A$80,000 at the
              rate above. Tuition is the part that moves: the rest (living
              costs, the visa, health cover) is fixed by the Australian
              Government and identical for every nationality.
            </p>
          )}
          <p>
            Tuition runs from the low A$30,000s at regional and newer
            universities to the high A$40,000s and beyond at the Group of Eight.
            Living costs depend on the city: budget around A$30,000 a year, more
            in Sydney and Melbourne, less in Adelaide, Perth, and regional
            centres.
          </p>
          <p>
            On top of that: the A$2,500 student visa, roughly A$500 to A$700 a
            year for single Overseas Student Health Cover, flights, and initial
            setup. See the{" "}
            <Link
              href="/cost-of-living"
              className="font-medium text-status-open underline underline-offset-2"
            >
              cost-of-living breakdowns by city
            </Link>{" "}
            and the{" "}
            <Link
              href="/best/affordable-australian-universities-for-international-students"
              className="font-medium text-status-open underline underline-offset-2"
            >
              most affordable universities
            </Link>
            .
          </p>
        </div>
      </ProfileSection>

      <ProfileSection narrow title="Your qualifications and English">
        <div className="flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
          {c.credentials.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection narrow title="The student visa">
        <div className="flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
          <p>
            International students hold the subclass 500 student visa. You apply
            after you receive and accept an offer and the university issues a
            Confirmation of Enrolment. You must meet the Genuine Student
            requirement, which replaced the Genuine Temporary Entrant test in
            March 2024, and show genuine access to funds.
          </p>
          {c.visaNote.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <p>
            Full detail on the visa itself, conditions, and family members is on
            the{" "}
            <Link
              href="/visas/student-500"
              className="font-medium text-status-open underline underline-offset-2"
            >
              subclass 500 page
            </Link>
            .
          </p>
        </div>
      </ProfileSection>

      <ProfileSection narrow title="After you graduate">
        <div className="flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
          <p>
            Most bachelor&rsquo;s and master&rsquo;s graduates qualify for a{" "}
            <Link
              href="/visas/temporary-graduate-485"
              className="font-medium text-status-open underline underline-offset-2"
            >
              Temporary Graduate visa (subclass 485)
            </Link>
            , which gives two to three years of full work rights. That skilled
            work is the usual step toward permanent residence through the
            points-tested visas.
          </p>
          <p>
            Check where you stand with the{" "}
            <Link
              href="/visas/points-calculator"
              className="font-medium text-status-open underline underline-offset-2"
            >
              points calculator
            </Link>{" "}
            and track demand in the{" "}
            <Link
              href="/visas/invitation-rounds"
              className="font-medium text-status-open underline underline-offset-2"
            >
              SkillSelect invitation rounds
            </Link>
            .
          </p>
        </div>
      </ProfileSection>

      <ProfileSection narrow title={`Popular fields for ${c.demonym} students`}>
        <ul className="flex flex-col gap-1.5">
          {c.popularFields.map((f) => (
            <li key={f} className="flex gap-2 font-body text-base text-ink">
              <span className="text-status-open">·</span>
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-body text-sm text-slate">
          Browse{" "}
          <Link
            href="/study"
            className="font-medium text-status-open underline underline-offset-2"
          >
            programs by subject
          </Link>{" "}
          to see entry requirements, the cheapest options, and the
          skilled-migration angle for each field.
        </p>
      </ProfileSection>

      <FaqSection heading={`Studying in Australia from ${c.name}: common questions`} items={c.faq} />

      <ProfileSection narrow title="Applying from another country">
        <p className="mb-3 font-body text-sm text-slate">
          The generic steps are the same everywhere. What changes by country is
          agent-versus-direct application, how your qualifications convert, and
          how closely the student visa evidence is checked.
        </p>
        <ul className="flex flex-wrap gap-2">
          {otherCountries.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/international/${o.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-mist px-3 py-1 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open/40 hover:text-status-open"
              >
                <span aria-hidden="true">{flagEmoji(o.code)}</span>
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </ProfileSection>

      <div className="mt-10">
        <LastVerified date={c.lastVerified} sources={c.sources} />
      </div>

      <RelatedLinks items={related} className="mt-10 border-t border-ink/10 pt-8" />

      <p className="mt-8 font-body text-xs text-slate">
        This is general information for {c.demonym} applicants, not migration
        advice. Fees, visa rules, and university requirements change. Confirm
        every figure with the university and the Australian Government before you
        rely on it.
      </p>
    </main>
  );
}
