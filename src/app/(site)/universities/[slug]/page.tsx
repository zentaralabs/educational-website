import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { AdmissionsRequirementFacts } from "@/components/site/AdmissionsRequirementFacts";
import { UniversityAtAGlance } from "@/components/site/UniversityAtAGlance";
import { GO8_SLUGS, isRegionalCity } from "@/lib/australia";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GuideContent } from "@/components/site/GuideContent";
import { CheckBadgeIcon } from "@/components/site/icons";
import { Fact, FactBox, ProfileSection } from "@/components/site/ProfileSection";
import { HowToApply } from "@/components/site/HowToApply";
import { OutboundLink } from "@/components/site/OutboundLink";
import { LastVerified } from "@/components/site/LastVerified";
import { VerifiedInline } from "@/components/site/VerifiedInline";
import { WhyTrust } from "@/components/site/WhyTrust";
import { ProgramsList } from "@/components/site/ProgramsList";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { FaqSection } from "@/components/site/FaqSection";
import { faqJsonLd, universityFaq } from "@/lib/faq";
import { SITE_URL, SITE_YEAR } from "@/lib/site-config";
import { deadlineBadgeStatus } from "@/lib/deadline-status";
import { formatCurrency, selectivityLabel } from "@/lib/format";
import { getPublishedProgramsForUniversity } from "@/lib/queries/public-programs";
import {
  getPublishedDeadlinesForUniversity,
  getPublishedScholarshipsForUniversity,
  getPublishedUniversity,
  getRelatedUniversities,
  getUniversityRedirect,
  listPublishedUniversitySlugs,
} from "@/lib/queries/public-universities";
import { pickPrimarySource } from "@/lib/sources";

// Indicative single-student annual living cost in Australia when a
// city-specific figure isn't set — anchored to the Home Affairs financial
// capacity figure. Deliberately conservative/round.
const NATIONAL_LIVING_COST_AUD = 29_710;

// Guides that apply to essentially every Australian university — shown as
// "related reading" on every AU profile. Kept as a short curated list rather
// than a link table since they're universally relevant.
const AU_RELATED_GUIDES = [
  { slug: "real-cost-of-studying-in-australia", title: "The real cost of studying in Australia" },
  { slug: "study-to-permanent-residence-pathway-australia", title: "The study-to-PR pathway in Australia" },
  { slug: "proving-funds-for-an-australian-student-visa", title: "Proving you can afford to study in Australia" },
  { slug: "ielts-vs-pte-for-australian-university-admission", title: "IELTS vs PTE for Australian admission" },
];

// Largest degree-seeking source countries. Every AU profile links these so a
// reader lands on what is different for their nationality (agent rules,
// credential recognition, student-visa evidence level). Full set at
// /international.
const AU_TOP_ORIGIN_COUNTRIES = [
  { slug: "india", name: "India" },
  { slug: "nepal", name: "Nepal" },
  { slug: "china", name: "China" },
  { slug: "vietnam", name: "Vietnam" },
  { slug: "philippines", name: "the Philippines" },
  { slug: "pakistan", name: "Pakistan" },
];

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listPublishedUniversitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const university = await getPublishedUniversity(slug);
  if (!university) return {};

  const title = `${university.name}: Fees, Entry Requirements & Deadlines ${SITE_YEAR}`;
  const description =
    `${university.name} for international students${university.city ? ` in ${university.city.split(",")[0]}` : ""}: tuition fees, entry requirements, application deadlines, and scholarships. ` +
    (university.distinctive_summary?.slice(0, 90) ?? "Independently researched and dated.");
  const url = `/universities/${slug}`;
  const ogImage = `${url}/og`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function UniversityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const university = await getPublishedUniversity(slug);
  if (!university) {
    const newSlug = await getUniversityRedirect(slug);
    if (newSlug) redirect(`/universities/${newSlug}`);
    notFound();
  }

  const [deadlines, scholarships, programs, relatedUniversities] =
    await Promise.all([
      getPublishedDeadlinesForUniversity(university.id),
      getPublishedScholarshipsForUniversity(university.id),
      getPublishedProgramsForUniversity(university.id),
      getRelatedUniversities(
        university.slug,
        university.country_id,
        university.tuition_international,
      ),
    ]);

  // Tuition to anchor the budget estimate on: the university-level figure if
  // set, otherwise the cheapest published program (matching the comparison
  // table's fillProgramFallbacks approach).
  const programTuitions = programs
    .map((p) => p.tuition_international)
    .filter((n): n is number => typeof n === "number" && n > 0);
  const anchorTuition =
    university.tuition_international ??
    (programTuitions.length ? Math.min(...programTuitions) : null);
  const tuitionIsFrom = university.tuition_international == null && anchorTuition != null;

  const currency = university.currency ?? "AUD";
  const livingCost = university.living_cost_annual ?? NATIONAL_LIVING_COST_AUD;
  const appFee = university.application_fee ?? 0;
  // First-year budget: tuition + living + application fee + a rough one-off
  // setup allowance (visa, OSHC, flights, initial deposits).
  const setupAllowance = 4_000;
  const budgetLow = anchorTuition
    ? Math.round((anchorTuition + livingCost + appFee + setupAllowance) / 1000) * 1000
    : null;
  const budgetHigh = budgetLow ? Math.round((budgetLow * 1.15) / 1000) * 1000 : null;

  const hasCostData = Boolean(anchorTuition || university.application_fee);

  // One source URL to surface inline next to the high-consequence fact
  // groups (entry requirements, tuition). No per-fact source column exists,
  // so this is the university's primary fact-check source.
  const primarySource = pickPrimarySource(
    university.source_urls,
    university.website_url,
  );

  const deadlineSource = pickPrimarySource(
    deadlines.map((d) => d.source_url).filter((u): u is string => Boolean(u)),
    primarySource,
  );
  const deadlineVerifiedAt =
    deadlines
      .map((d) => d.last_verified_at)
      .filter((d): d is string => Boolean(d))
      .sort()
      .at(-1) ?? university.last_verified_at;

  const nextDeadline = deadlines.find(
    (d) => !d.is_rolling && deadlineBadgeStatus(d.deadline_date, d.is_rolling) === "upcoming",
  );

  const intakeTypes = [
    ...new Set(
      deadlines
        .map((d) => d.deadline_type?.name)
        .filter((n): n is string => Boolean(n)),
    ),
  ];

  const isGo8 = GO8_SLUGS.has(university.slug);
  const isMetro = /Sydney|Melbourne/i.test(university.city ?? "") ||
    /^Brisbane,/i.test(university.city ?? "");
  const isRegional = isRegionalCity(university.city);

  // Overall admissions status for the header stamp — open beats upcoming
  // beats closed, so a school with any rolling/open path reads as open.
  const statusPriority = ["open", "upcoming", "closed"] as const;
  const overallStatus = statusPriority.find((s) =>
    deadlines.some((d) => deadlineBadgeStatus(d.deadline_date, d.is_rolling) === s),
  );

  // FactBox renders a visible tinted box even with zero facts inside, so
  // each section needs to know up front whether it has anything to show —
  // most AU universities in this dataset only have program-level facts, not
  // these university-level ones, so this is the common case, not an edge case.
  const hasAdmissionsData = [
    university.selectivity_band,
    university.gpa_requirement,
    university.atar_requirement,
    university.academic_requirement,
    university.academic_requirement_domestic,
    university.required_tests?.length,
    university.test_score_range,
    university.ielts_overall,
    university.pte_overall,
    university.required_documents?.length,
    university.application_platform?.name,
    university.degree_levels.length,
  ].some(Boolean);

  const hasAcademicsFacts = Boolean(
    university.popular_majors?.length || university.student_faculty_ratio,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: university.name,
    url: university.website_url ?? undefined,
    image: `${SITE_URL}/universities/${university.slug}/og`,
    address: {
      "@type": "PostalAddress",
      addressLocality: university.city ?? undefined,
      addressRegion: university.region ?? undefined,
      addressCountry: university.country?.code,
    },
    foundingDate: university.founded_year ? String(university.founded_year) : undefined,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(university.country
      ? [{ label: university.country.name, href: `/deadlines?country=${university.country.code}` }]
      : []),
    { label: university.name },
  ];

  const faqItems =
    university.country?.code === "AU"
      ? universityFaq({
          name: university.name,
          slug: university.slug,
          city: university.city,
          application_fee: university.application_fee,
          ielts_overall: university.ielts_overall,
          pte_overall: university.pte_overall,
          apply_url: university.apply_url,
          website_url: university.website_url,
          intakeTypes,
          budgetLow,
          budgetHigh,
          minTuition: anchorTuition,
          livingCost,
        })
      : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }}
        />
      )}

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {[university.city, university.region, university.country?.name]
            .filter(Boolean)
            .join(", ")}
          {university.institution_type && ` · ${university.institution_type}`}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
            {university.name}
          </h1>
          {overallStatus && <StatusBadge status={overallStatus} />}
        </div>

        {university.rankings.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {university.rankings.slice(0, 3).map((r) => (
              <span
                key={r.id}
                className="rounded-full border border-ink/15 bg-paper px-2.5 py-0.5 font-utility text-xs text-slate"
              >
                #{r.rank} {r.category ?? "Overall"} · {r.ranking_body?.name} {r.year}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {university.website_url && (
            <OutboundLink
              event="university_site_click"
              eventParams={{ university: university.name, location: "profile_header" }}
              href={university.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body text-base text-status-open underline underline-offset-2"
            >
              Official website ↗
            </OutboundLink>
          )}
          {university.apply_url && (
            <OutboundLink
              event="apply_click"
              eventParams={{ university: university.name, location: "profile_header" }}
              href={university.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper shadow-md shadow-ink/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/15"
            >
              Apply ↗
            </OutboundLink>
          )}
        </div>
      </div>

      {/* Answer-first fact, per GEO strategy Section 5 — lead with the direct
          fact so it's citable without context. */}
      {nextDeadline && (
        <p className="mt-6 rounded-md border border-ink/15 bg-ink/[0.02] px-4 py-3 font-body text-base text-ink">
          The recommended date to apply to {university.name} for its next intake
          {nextDeadline.deadline_type?.name
            ? ` (${nextDeadline.deadline_type.name})`
            : ""}{" "}
          is{" "}
          <strong className="font-semibold">
            {new Date(nextDeadline.deadline_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </strong>
          . Competitive courses close earlier.
        </p>
      )}

      <UniversityAtAGlance
        tuition={anchorTuition}
        tuitionIsFrom={tuitionIsFrom}
        currency={currency}
        applicationFee={university.application_fee}
        budgetLow={budgetLow}
        budgetHigh={budgetHigh}
        ielts={university.ielts_overall}
        pte={university.pte_overall}
        selectivity={selectivityLabel(university.selectivity_band)}
        intakeTypes={intakeTypes}
        degreeLevels={university.degree_levels.map((d) => d.name)}
        isGo8={isGo8}
        isRegional={isRegional}
        isMetro={isMetro}
      />

      {university.distinctive_summary && (
        <ProfileSection title="Overview">
          <p className="rounded-xl border border-line bg-mist p-5 font-body text-base leading-relaxed text-ink">
            {university.distinctive_summary}
          </p>
        </ProfileSection>
      )}

      {university.who_is_it_for && (
        <ProfileSection title="Who is this university for?">
          <div className="rounded-xl border border-line bg-mist p-5">
            <GuideContent content={university.who_is_it_for} />
          </div>
        </ProfileSection>
      )}

      {hasAdmissionsData && (
        <ProfileSection title="Admissions">
          <FactBox>
            <Fact label="Selectivity" value={selectivityLabel(university.selectivity_band)} />
            <Fact label="Test score range" value={university.test_score_range} />
            <AdmissionsRequirementFacts
              requiredTests={university.required_tests}
              gpaRequirement={university.gpa_requirement}
              atarRequirement={university.atar_requirement}
              academicRequirement={university.academic_requirement}
              academicRequirementDomestic={university.academic_requirement_domestic}
              ieltsOverall={university.ielts_overall}
              pteOverall={university.pte_overall}
            />
            <Fact
              label="Required documents"
              value={university.required_documents?.join(", ")}
            />
            <Fact
              label="Application platform"
              value={university.application_platform?.name}
            />
            <Fact
              label="Degree levels"
              value={university.degree_levels.map((d) => d.name).join(", ")}
            />
          </FactBox>
          <VerifiedInline
            date={university.last_verified_at}
            source={primarySource}
          />
          {university.selectivity_band && (
            <p className="mt-2 font-body text-xs text-slate">
              Australian universities do not publish official acceptance rates.
              Selectivity here is our editorial band, not a percentage.
              {university.selectivity_note ? ` ${university.selectivity_note}` : ""}{" "}
              Individual competitive courses stay harder to enter than the
              institution-wide band suggests.{" "}
              <Link href="/methodology" className="underline">
                How we assign it
              </Link>
              .
            </p>
          )}
        </ProfileSection>
      )}

      {hasCostData && (
        <ProfileSection title="Tuition & first-year budget">
          <FactBox>
            <Fact
              label={
                tuitionIsFrom
                  ? "International tuition (from)"
                  : "International tuition"
              }
              value={
                anchorTuition
                  ? `${formatCurrency(anchorTuition, currency)}/year`
                  : null
              }
            />
            <Fact
              label="Application fee"
              value={
                university.application_fee != null
                  ? university.application_fee === 0
                    ? "None"
                    : formatCurrency(university.application_fee, currency)
                  : null
              }
            />
            <Fact
              label="Living cost estimate"
              value={`${formatCurrency(livingCost, "AUD")}/year`}
            />
          </FactBox>
          <VerifiedInline
            date={university.last_verified_at}
            source={primarySource}
          />

          {budgetLow && budgetHigh && (
            <div className="mt-4 rounded-xl border border-status-pending/25 bg-status-pending/5 p-5">
              <p className="font-utility text-xs font-semibold tracking-widest text-slate uppercase">
                Estimated first-year budget
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">
                {formatCurrency(budgetLow, "AUD")} to{" "}
                {formatCurrency(budgetHigh, "AUD")}
              </p>
              <p className="mt-2 font-body text-sm text-slate">
                Tuition{tuitionIsFrom ? " (cheapest published program)" : ""} plus
                about {formatCurrency(livingCost, "AUD")} living costs, the
                application fee, and roughly {formatCurrency(4000, "AUD")} in
                one-off setup costs (visa, health cover, flights, initial
                deposits). Tuition varies widely by course, so check your
                specific program.
              </p>
            </div>
          )}

          <p className="mt-3 font-body text-xs text-slate">
            The living-cost figure is an estimate for{" "}
            {university.city?.split(",")[0] ?? "this location"}, anchored to the
            Australian Government&rsquo;s{" "}
            <a
              href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-2 hover:text-ink"
            >
              AUD 29,710 minimum
            </a>{" "}
            for a single student visa applicant (2026) and adjusted for the city.
            Your actual costs depend most on rent and lifestyle.
          </p>
        </ProfileSection>
      )}

      {scholarships.length > 0 && (
        <ProfileSection title="Financial aid & scholarships">
          <ul className="flex flex-col gap-2">
            {scholarships.map((s) => {
              const inner = (
                <>
                  <span className="font-body text-sm font-medium text-ink">
                    {s.name}
                  </span>
                  {s.amount && (
                    <span className="font-utility text-xs font-medium text-status-open">
                      {s.amount}
                    </span>
                  )}
                </>
              );
              return (
                <li key={s.id}>
                  {s.slug ? (
                    <Link
                      href={`/scholarships/${s.slug}`}
                      className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-mist px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30"
                    >
                      {inner}
                      <span className="ml-auto font-utility text-xs text-slate group-hover:text-status-open">
                        Details →
                      </span>
                    </Link>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-mist px-4 py-3">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 font-body text-xs text-slate">
            See all{" "}
            <Link
              href="/scholarships"
              className="underline underline-offset-2 hover:text-ink"
            >
              scholarships for studying in Australia
            </Link>
            , including national government schemes.
          </p>
        </ProfileSection>
      )}

      {(hasAcademicsFacts || programs.length > 0) && (
        <ProfileSection title="Academics">
          {hasAcademicsFacts && (
            <FactBox>
              <Fact
                label="Popular majors"
                value={university.popular_majors?.join(", ")}
              />
              <Fact label="Student:faculty ratio" value={university.student_faculty_ratio} />
            </FactBox>
          )}

          {programs.length > 0 && (
            <ProgramsList programs={programs} universitySlug={university.slug} />
          )}

          <p className="mt-4 font-body text-xs text-slate">
            Comparing options across universities?{" "}
            <Link href="/study" className="underline underline-offset-2 hover:text-ink">
              Browse programs by subject
            </Link>
            .
          </p>
        </ProfileSection>
      )}

      {university.international_student_notes && (
        <ProfileSection title="For international students">
          <p className="rounded-xl border border-line bg-mist p-5 font-body text-base leading-relaxed text-ink">
            {university.international_student_notes}
          </p>
        </ProfileSection>
      )}

      <ProfileSection title="How to apply">
        <HowToApply
          markdown={university.how_to_apply}
          applyUrl={university.apply_url}
          universityName={university.name}
        />
      </ProfileSection>

      {deadlines.length > 0 && (
        <ProfileSection title="Application deadlines">
          {deadlines.every((d) => d.is_rolling) ? (
            <p className="mb-3 font-body text-sm text-slate">
              {university.name} assesses international applications on a rolling
              basis rather than by a single fixed date. Apply as early as you
              can: places in popular courses fill, and you need time afterward
              for the offer, Confirmation of Enrolment, and Student visa before
              your intake starts.
            </p>
          ) : (
            <p className="mb-3 font-body text-sm text-slate">
              {university.name} runs fixed intakes rather than one hard deadline.
              The dates below are the recommended times to have your
              international application in, about three to four months before
              each intake. Postgraduate and competitive courses close earlier;
              later applications are often still accepted while places and visa
              time remain. Confirm the exact date for your course on the
              university&rsquo;s site.
            </p>
          )}
          <div className="overflow-hidden rounded-md border border-ink/10 bg-paper">
            {deadlines.map((d, i) => {
              const status = deadlineBadgeStatus(d.deadline_date, d.is_rolling);
              return (
                <div
                  key={d.id}
                  className="border-l-4 px-4 py-3 text-sm"
                  style={{
                    borderLeftColor: `var(--color-status-${status})`,
                    borderBottomWidth: i < deadlines.length - 1 ? 1 : 0,
                    borderBottomColor:
                      "color-mix(in srgb, var(--color-ink) 10%, transparent)",
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-ink">
                      {d.deadline_type?.name}
                      {d.degree_level && ` · ${d.degree_level.name}`}
                      {d.application_platform && ` · ${d.application_platform.name}`}
                    </span>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span className="font-utility text-xs text-slate">
                        {d.is_rolling
                          ? "ROLLING"
                          : new Date(d.deadline_date).toLocaleDateString("en-AU", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                      </span>
                      <StatusBadge status={status} />
                    </div>
                  </div>
                  {d.notes && (
                    <p className="mt-1.5 font-body text-xs text-slate">{d.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
          <VerifiedInline
            date={deadlineVerifiedAt}
            source={deadlineSource}
          />
          <Link
            href={`/universities/${university.slug}/deadlines`}
            className="mt-3 inline-block font-body text-sm font-medium text-status-open underline underline-offset-2"
          >
            {university.name} deadlines, in detail →
          </Link>
        </ProfileSection>
      )}

      {faqItems.length > 0 && (
        <FaqSection
          heading={`${university.name}: common questions`}
          items={faqItems}
        />
      )}

      {(relatedUniversities.length > 0 || university.country?.code === "AU") && (
        <ProfileSection title="Related">
          {relatedUniversities.length > 0 && (
            <>
              <h3 className="mb-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Similar universities
              </h3>
              <ul className="mb-5 grid gap-2 sm:grid-cols-2">
                {relatedUniversities.map((u) => (
                  <li key={u.slug}>
                    <Link
                      href={`/universities/${u.slug}`}
                      className="group flex flex-col gap-0.5 rounded-xl border border-line bg-mist px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30"
                    >
                      <span className="font-body text-sm font-medium text-ink group-hover:underline">
                        {u.name}
                      </span>
                      <span className="font-utility text-xs text-slate">
                        {u.city}
                        {u.tuition_international != null &&
                          ` · from ${formatCurrency(u.tuition_international, u.currency ?? "AUD")}/yr`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {university.country?.code === "AU" && (
            <>
              <h3 className="mb-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Guides
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {AU_RELATED_GUIDES.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-5 mb-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Applying from your country
              </h3>
              <p className="mb-2 font-body text-sm text-slate">
                What changes by nationality: agent rules, how your degree
                converts, and how closely the student visa is checked.
              </p>
              <ul className="flex flex-wrap gap-2">
                {AU_TOP_ORIGIN_COUNTRIES.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/international/${o.slug}`}
                      className="inline-flex rounded-full border border-ink/15 bg-mist px-3 py-1 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open/40 hover:text-status-open"
                    >
                      From {o.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/international"
                    className="inline-flex rounded-full border border-ink/15 bg-mist px-3 py-1 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open/40 hover:text-status-open"
                  >
                    All countries →
                  </Link>
                </li>
              </ul>
            </>
          )}
        </ProfileSection>
      )}

      <WhyTrust className="mt-8" />

      <ProfileSection title="Sources & verification">
        <div className="flex items-start gap-2 rounded-xl bg-status-open/5 px-4 py-3">
          <CheckBadgeIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-status-open" />
          <div>
            <LastVerified
              date={university.last_verified_at}
              sources={university.source_urls}
            />
            {(university.author || university.reviewed_by) && (
              <p className="mt-2 font-body text-xs text-slate">
                {university.author && <>Written by {university.author.name}</>}
                {university.author?.credentials && ` (${university.author.credentials})`}
                {university.reviewed_by && <>{university.author ? " · " : ""}Reviewed by {university.reviewed_by.name}</>}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 font-body text-xs text-slate">
          Spotted an out-of-date deadline, fee, or requirement?{" "}
          <a
            href={`mailto:admin@wheretoapply.xyz?subject=${encodeURIComponent(
              `Update: ${university.name}`,
            )}&body=${encodeURIComponent(
              `Page: /universities/${university.slug}\nWhat's outdated or incorrect:\n\nSource (if you have one):\n`,
            )}`}
            className="underline underline-offset-2 hover:text-ink"
          >
            Report an update
          </a>
          .
        </p>
      </ProfileSection>

      <Link
        href="/deadlines"
        className="mt-8 inline-block font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
      >
        ← Back to deadline calendar
      </Link>
    </main>
  );
}
