import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DeadlineTable } from "@/components/site/DeadlineTable";
import { FaqSection } from "@/components/site/FaqSection";
import { VerifiedInline } from "@/components/site/VerifiedInline";
import { WhyTrust } from "@/components/site/WhyTrust";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { deadlineBadgeStatus } from "@/lib/deadline-status";
import { DEADLINE_PAGE_INDEXED } from "@/lib/deadline-detail";
import { faqJsonLd } from "@/lib/faq";
import { SITE_YEAR } from "@/lib/site-config";
import {
  getPublishedDeadlinesForUniversity,
  getPublishedUniversity,
  listPublishedUniversitySlugs,
} from "@/lib/queries/public-universities";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

const INTAKE_YEAR = SITE_YEAR + 1;

export async function generateStaticParams() {
  const slugs = await listPublishedUniversitySlugs();
  return slugs.map((slug) => ({ slug }));
}

async function load(slug: string) {
  const university = await getPublishedUniversity(slug);
  if (!university || university.country?.code !== "AU") return null;
  const deadlines = await getPublishedDeadlinesForUniversity(university.id);
  if (deadlines.length === 0) return null;
  return { university, deadlines };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const { university } = data;
  const title = composeTitle(`${university.name} Deadlines ${INTAKE_YEAR}`, [
    "International Students",
    "International",
  ]);
  const description = `When to apply to ${university.name} as an international student for the ${INTAKE_YEAR} intakes: closing dates by degree level, how the intakes work, and how early to lodge for a student visa.`;
  return pageMetadata({
    title,
    description,
    path: `/universities/${slug}/deadlines`,
    type: "article",
    ...(DEADLINE_PAGE_INDEXED.has(slug)
      ? {}
      : { robots: { index: false, follow: true } }),
  });
}

export default async function UniversityDeadlinesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { university, deadlines } = data;
  const name = university.name;

  const firmUpcoming = deadlines
    .filter(
      (d) => !d.is_rolling && deadlineBadgeStatus(d.deadline_date, d.is_rolling) === "upcoming",
    )
    .sort((a, b) => a.deadline_date.localeCompare(b.deadline_date));
  const allRolling = deadlines.every((d) => d.is_rolling);
  const next = firmUpcoming[0];

  const intakeTypes = [
    ...new Set(deadlines.map((d) => d.deadline_type?.name).filter(Boolean)),
  ] as string[];

  // The seed appends the same university-wide guidance to every deadline
  // row (only the intake month differs). On a page that is nothing but the
  // deadline table that repeats badly, so normalise the intake reference,
  // dedupe, and show the guidance once below the table instead of per-row.
  const guidance = [
    ...new Set(
      deadlines
        .map((d) => d.notes)
        .filter((n): n is string => Boolean(n))
        .map((n) =>
          n.replace(
            /for the [A-Za-z]+( or [A-Za-z]+)? \d{4}( \(Term \d\))? intake/gi,
            "for your intended intake",
          ),
        ),
    ),
  ];

  const source =
    deadlines.find((d) => d.source_url && !/^https?:\/\/[^/]+\/?$/.test(d.source_url))
      ?.source_url ?? university.website_url ?? null;

  const verifiedAt =
    deadlines
      .map((d) => d.last_verified_at)
      .filter((d): d is string => Boolean(d))
      .sort()
      .at(-1) ?? university.last_verified_at;

  const answer = next
    ? `The recommended date to have your international application in to ${name} for its next intake${
        next.deadline_type?.name ? ` (${next.deadline_type.name})` : ""
      } is ${new Date(next.deadline_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}. Competitive courses close earlier.`
    : allRolling
      ? `${name} assesses international applications on a rolling basis rather than to a single fixed date. For a ${INTAKE_YEAR} start, apply as early as you can, and no later than about three months before your intake, to leave time for the offer, Confirmation of Enrolment, and student visa.`
      : `${name} runs fixed intakes rather than one hard deadline. Apply about three to four months before your intended intake; later applications are often still accepted while places and visa-processing time remain.`;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Universities", href: "/universities" },
    { label: name, href: `/universities/${slug}` },
    { label: "Deadlines" },
  ];

  const faq = [
    {
      q: `When is the ${name} application deadline for international students?`,
      a: answer,
    },
    {
      q: `Can I apply to ${name} after the deadline?`,
      a: `Often, yes. Australian universities rarely enforce a single hard cut-off. If places remain in your course and there is enough time to arrange a student visa before the intake starts, a late application is usually still considered. Competitive and quota courses (medicine, some design and health programs) are the exception and do close firmly.`,
    },
    {
      q: `What intakes does ${name} have?`,
      a: intakeTypes.length
        ? `${name} takes international students for ${
            intakeTypes.length === 1
              ? "one intake"
              : `${intakeTypes.length} intakes`
          }: ${new Intl.ListFormat("en").format(intakeTypes)}. Not every course is available in every intake, so check the course page.`
        : `Check the ${name} course pages for the intakes available in your program.`,
    },
    {
      q: `How early should I apply to ${name}?`,
      a: `Three to four months before your intended intake is the usual advice, and earlier for competitive courses or if you are from a country where the student visa takes longer to process. Applying early also means an earlier offer, which helps with scholarships and accommodation.`,
    },
  ];

  const jsonLd: Record<string, unknown>[] = [
    breadcrumbJsonLd(breadcrumbs),
    faqJsonLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${name} application deadlines`,
      itemListElement: deadlines.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: [d.deadline_type?.name, d.degree_level?.name]
          .filter(Boolean)
          .join(" "),
      })),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        {name} application deadlines {INTAKE_YEAR}
      </h1>

      {/* The date is the whole reason for this page, so it leads as a display
          figure rather than sitting mid-sentence in the prose below. When the
          university has no firm date we say so here instead of inventing one. */}
      <div className="mt-6 rounded-xl border border-line bg-mist px-5 py-4">
        <p className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
          {next ? "Next deadline" : "How applications close"}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          {next ? (
            <time dateTime={next.deadline_date}>
              {new Date(next.deadline_date).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          ) : allRolling ? (
            "Rolling admissions"
          ) : (
            "Fixed intakes, no single deadline"
          )}
        </p>
        {next?.deadline_type?.name && (
          <p className="mt-1 font-body text-sm text-slate">
            {next.deadline_type.name}
            {next.degree_level && ` · ${next.degree_level.name}`}
          </p>
        )}
      </div>

      <p className="mt-4 rounded-md border border-ink/15 bg-ink/[0.02] px-4 py-3 font-body text-base text-ink">
        {answer}
      </p>

      <div className="mt-8">
        <DeadlineTable
          items={deadlines.map((d) => ({
            id: d.id,
            label: [d.deadline_type?.name, d.degree_level?.name]
              .filter(Boolean)
              .join(" · "),
            deadlineDate: d.deadline_date,
            isRolling: d.is_rolling,
          }))}
        />
      </div>

      <VerifiedInline date={verifiedAt} source={source} />

      {guidance.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-line bg-mist p-4">
          <h2 className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
            How {name} handles application dates
          </h2>
          {guidance.map((g) => (
            <p key={g} className="font-body text-sm leading-relaxed text-ink">
              {g}
            </p>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
        <p>
          These dates are for international applicants. Domestic dates, and the
          exact date for a specific course, can differ. Always confirm on{" "}
          {name}&rsquo;s own website before you rely on a date.
        </p>
        <p>
          Once you have an offer, you accept it, pay the deposit, and receive a
          Confirmation of Enrolment, then you apply for the{" "}
          <Link
            href="/visas/student-500"
            className="font-medium text-status-open underline underline-offset-2"
          >
            subclass 500 student visa
          </Link>
          . Build that time into your plan: from some countries the visa alone
          takes one to three months.
        </p>
      </div>

      <FaqSection
        heading={`${name} deadlines: common questions`}
        items={faq}
      />

      <WhyTrust className="mt-10" />

      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Keep planning
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { href: `/universities/${slug}`, label: `${name} full profile` },
            { href: "/deadlines", label: "All Australian university deadlines" },
            { href: "/universities", label: "Browse all universities" },
            { href: "/visas/student-500", label: "Student visa (subclass 500)" },
            { href: "/international", label: "Applying from your country" },
            { href: "/scholarships", label: "Scholarships" },
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
