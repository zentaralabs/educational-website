import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DeadlineTable } from "@/components/site/DeadlineTable";
import { FaqSection } from "@/components/site/FaqSection";
import { VerifiedInline } from "@/components/site/VerifiedInline";
import { WhyTrust } from "@/components/site/WhyTrust";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { formatDeadlineDateLong } from "@/lib/deadline-status";
import { DEADLINE_PAGE_INDEXED } from "@/lib/deadline-detail";
import { faqJsonLd, RMIT_APPLICATION_FEE_NOTE, RMIT_SLUG } from "@/lib/faq";
import { formatCurrency } from "@/lib/format";
import { INTAKE_YEAR } from "@/lib/site-config";
import {
  getPublishedDeadlinesForUniversity,
  getPublishedScholarshipsForUniversity,
  getPublishedUniversity,
  listPublishedUniversitySlugs,
} from "@/lib/queries/public-universities";
import { getPublishedProgramsForUniversity } from "@/lib/queries/public-programs";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listPublishedUniversitySlugs();
  return slugs.map((slug) => ({ slug }));
}

async function load(slug: string) {
  const university = await getPublishedUniversity(slug);
  if (!university || university.country?.code !== "AU") return null;
  const [deadlines, programs, scholarships] = await Promise.all([
    getPublishedDeadlinesForUniversity(university.id),
    getPublishedProgramsForUniversity(university.id),
    getPublishedScholarshipsForUniversity(university.id),
  ]);
  if (deadlines.length === 0) return null;
  return { university, deadlines, programs, scholarships };
}

type LevelSummary = {
  level: string;
  count: number;
  tuition: [number, number] | null;
  ielts: [number, number] | null;
  currency: string;
};

/** Per degree level: how many published programs, and the real min-max of
 *  the listed international tuition and IELTS overall across them. Only
 *  figures actually stored on program rows; nothing is estimated. */
function summariseLevels(
  programs: Awaited<ReturnType<typeof getPublishedProgramsForUniversity>>,
  fallbackCurrency: string,
): LevelSummary[] {
  const byLevel = new Map<string, typeof programs>();
  for (const p of programs) {
    const key = p.degree_level?.name;
    if (!key) continue;
    byLevel.set(key, [...(byLevel.get(key) ?? []), p]);
  }
  const range = (xs: number[]): [number, number] | null =>
    xs.length ? [Math.min(...xs), Math.max(...xs)] : null;
  return [...byLevel.entries()]
    .map(([level, ps]) => ({
      level,
      count: ps.length,
      tuition: range(
        ps.map((p) => p.tuition_international).filter((n): n is number => n != null && n > 0),
      ),
      ielts: range(ps.map((p) => p.ielts_overall).filter((n): n is number => n != null)),
      currency: ps.find((p) => p.currency)?.currency ?? fallbackCurrency,
    }))
    .sort((a, b) => b.count - a.count);
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
  const { university, deadlines, programs, scholarships } = data;
  const name = university.name;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const levels = summariseLevels(programs, university.currency ?? "AUD");
  const topSubjects = [
    ...programs
      .reduce((m, p) => {
        if (p.subject?.name) m.set(p.subject.name, (m.get(p.subject.name) ?? 0) + 1);
        return m;
      }, new Map<string, number>())
      .entries(),
  ]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([n]) => n);
  const nextScholarships = scholarships
    .filter((sch) => !sch.deadline_date || new Date(sch.deadline_date) >= today)
    .slice()
    .sort((a, b) => (a.deadline_date ?? "9999").localeCompare(b.deadline_date ?? "9999"))
    .slice(0, 5);

  // Lead with a published closing date where one exists, and otherwise with
  // our own recommendation. A university without a firm date used to fall
  // through to "Rolling admissions", which answered "when should I apply?"
  // with nothing at all.
  const upcoming = deadlines
    .filter((d) => new Date(d.deadline_date) >= today)
    .sort((a, b) => a.deadline_date.localeCompare(b.deadline_date));
  const next =
    upcoming.find((d) => d.date_kind === "closing_date") ?? upcoming[0];
  const nextIsPublished = next?.date_kind === "closing_date";
  const allRolling = deadlines.every((d) => d.is_rolling);

  const intakeTypes = [
    ...new Set(deadlines.map((d) => d.deadline_type?.name).filter(Boolean)),
  ] as string[];

  // RMIT's fee is country-conditional, not a flat figure (see faq.ts), so it
  // gets its own note instead of reading university.application_fee.
  const feeAnswer =
    slug === RMIT_SLUG
      ? RMIT_APPLICATION_FEE_NOTE
      : university.application_fee != null
        ? university.application_fee === 0
          ? `No. ${name} does not charge international students an application fee when you apply directly or through an authorised agent. Third-party application platforms may add their own service fee.`
          : `${name} charges a non-refundable application fee of about ${formatCurrency(university.application_fee, "AUD")} per application, payable when you submit online. Some universities waive this for applications lodged through an authorised agent, so check before you pay.`
        : null;

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

  const nextIntake = next?.deadline_type?.name
    ? ` (${next.deadline_type.name})`
    : "";

  const answer = !next
    ? `${name} runs fixed intakes rather than one hard deadline. Apply about three to four months before your intended intake; later applications are often still accepted while places and visa-processing time remain.`
    : nextIsPublished
      ? `The closing date for international applications to ${name} for its next intake${nextIntake} is ${formatDeadlineDateLong(next.deadline_date, next.date_kind)}. Individual courses can close earlier.`
      : allRolling
        ? `${name} assesses international applications on a rolling basis rather than to a single published closing date. For a ${INTAKE_YEAR} start, aim to apply ${formatDeadlineDateLong(next.deadline_date, next.date_kind)}, and no later than about three months before your intake, to leave time for the offer, Confirmation of Enrolment, and student visa.`
        : `${name} does not publish a single closing date for international applications. For its next intake${nextIntake} we recommend applying ${formatDeadlineDateLong(next.deadline_date, next.date_kind)}, roughly three to four months ahead; later applications are often still accepted while places and visa-processing time remain.`;

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
      a: allRolling
        ? `Often, yes. ${name} assesses applications on a rolling basis, so there is no single cut-off to miss. If places remain in your course and there is enough time to arrange a student visa before the intake starts, a late application is usually still considered. Competitive and quota courses (medicine, some design and health programs) are the exception and do close firmly.`
        : nextIsPublished
          ? `Possibly, but do not plan on it. ${name} publishes a closing date, and individual courses can close earlier. If places remain and there is time to arrange a student visa, a late application may still be considered. Competitive and quota courses (medicine, some design and health programs) close firmly.`
          : `Often, yes. ${name} does not publish one hard closing date for every course. If places remain in your course and there is enough time to arrange a student visa before the intake starts, a late application is usually still considered. Competitive and quota courses close firmly.`,
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
      a: `${
        next
          ? `For ${name}'s next intake${nextIntake}, the ${nextIsPublished ? "published" : "recommended"} date is ${formatDeadlineDateLong(next.deadline_date, next.date_kind)}. `
          : ""
      }Three to four months before your intended intake is the usual advice, and earlier for competitive courses or if you are from a country where the student visa takes longer to process.${
        nextScholarships.length
          ? ` ${name} lists ${nextScholarships.length === 1 ? "a scholarship" : `${scholarships.length} scholarships`} with their own deadlines, so check those too.`
          : ""
      }`,
    },
    ...(feeAnswer
      ? [{ q: `How much does it cost to apply to ${name}?`, a: feeAnswer }]
      : []),
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

      <h1 className="page-title">
        {name} application deadlines {INTAKE_YEAR}
      </h1>

      {/* The date is the whole reason for this page, so it leads as a display
          figure rather than sitting mid-sentence in the prose below. When the
          university has no firm date we say so here instead of inventing one. */}
      <div className="mt-6 rounded-xl border border-line bg-mist px-5 py-4">
        <p className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
          {!next
            ? "How applications close"
            : nextIsPublished
              ? "Next deadline"
              : "Recommended"}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          {!next ? (
            "Fixed intakes, no single deadline"
          ) : nextIsPublished ? (
            <time dateTime={next.deadline_date}>
              {formatDeadlineDateLong(next.deadline_date, next.date_kind)}
            </time>
          ) : (
            `Apply by ${formatDeadlineDateLong(next.deadline_date, next.date_kind)}`
          )}
        </p>
        {next?.deadline_type?.name && (
          <p className="mt-1 font-body text-sm text-slate">
            {next.deadline_type.name}
            {next.degree_level && ` · ${next.degree_level.name}`}
            {!nextIsPublished && " · our guidance, not a published date"}
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
            dateKind: d.date_kind,
          }))}
        />
      </div>

      <VerifiedInline date={verifiedAt} source={source} />

      {feeAnswer && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-line bg-mist p-4">
          <h2 className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
            {name} application fee
          </h2>
          <p className="font-body text-sm leading-relaxed text-ink">
            {feeAnswer}
          </p>
        </div>
      )}

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

      {levels.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">
            Applying to {name} at a glance
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-slate">
            {name} has {programs.length} published program
            {programs.length === 1 ? "" : "s"} on this site
            {topSubjects.length > 0 && <>, most in {new Intl.ListFormat("en").format(topSubjects.slice(0, 4))}</>}.
            The figures below are the lowest and highest listed across those
            programs, so check the specific course page for yours.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[32rem] border-collapse text-left font-body text-sm text-ink">
              <thead className="bg-mist text-xs font-semibold tracking-wide text-slate uppercase">
                <tr>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Programs</th>
                  <th className="px-4 py-2">International tuition listed</th>
                  <th className="px-4 py-2">IELTS overall</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((l) => (
                  <tr key={l.level} className="border-t border-line">
                    <td className="px-4 py-2 font-medium">{l.level}</td>
                    <td className="px-4 py-2">{l.count}</td>
                    <td className="px-4 py-2">
                      {l.tuition
                        ? l.tuition[0] === l.tuition[1]
                          ? formatCurrency(l.tuition[0], l.currency)
                          : `${formatCurrency(l.tuition[0], l.currency)} to ${formatCurrency(l.tuition[1], l.currency)}`
                        : "Not listed"}
                    </td>
                    <td className="px-4 py-2">
                      {l.ielts
                        ? l.ielts[0] === l.ielts[1]
                          ? l.ielts[0].toFixed(1)
                          : `${l.ielts[0].toFixed(1)} to ${l.ielts[1].toFixed(1)}`
                        : "Not listed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 font-body text-xs text-slate">
            <Link
              href={`/universities/${slug}`}
              className="underline underline-offset-2"
            >
              See every {name} program
            </Link>
            .
          </p>
        </section>
      )}

      {nextScholarships.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">
            {name} scholarship deadlines
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {nextScholarships.map((sch) => (
              <li
                key={sch.id}
                className="rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm text-ink"
              >
                {sch.slug ? (
                  <Link
                    href={`/scholarships/${sch.slug}`}
                    className="font-medium underline underline-offset-2"
                  >
                    {sch.name}
                  </Link>
                ) : (
                  <span className="font-medium">{sch.name}</span>
                )}
                <span className="text-slate">
                  {sch.amount ? ` · ${sch.amount}` : ""}
                  {sch.deadline_date
                    ? ` · closes ${formatDeadlineDateLong(sch.deadline_date, "closing_date")}`
                    : " · no fixed closing date"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flow-copy flow-lead">
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
