import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProfileSection } from "@/components/site/ProfileSection";
import { VerifiedInline } from "@/components/site/VerifiedInline";
import { WhyTrust } from "@/components/site/WhyTrust";
import { ProgramAdmissionsBlock } from "@/components/site/ProgramAdmissionsBlock";
import { ProgramSidebar } from "@/components/site/ProgramSidebar";
import { OutboundLink } from "@/components/site/OutboundLink";
import { ArrowUpRightIcon, BookIcon, PassportIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { SITE_YEAR } from "@/lib/site-config";
import {
  getProgramOccupations,
  getPublishedProgramBySlug,
  isProgramIndexable,
  resolveProgramSlugById,
} from "@/lib/queries/public-programs";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Legacy `/programs/{uuid}` URLs (everything indexed before program slugs
 * shipped) 301 to the slug URL. The UUID is the immutable primary key, so
 * this redirect is permanent.
 */
async function redirectIfLegacyId(slug: string, programParam: string) {
  if (!UUID_RE.test(programParam)) return;
  const resolved = await resolveProgramSlugById(programParam);
  if (resolved && resolved.universitySlug === slug) {
    permanentRedirect(
      `/universities/${resolved.universitySlug}/programs/${resolved.programSlug}`,
    );
  }
  notFound();
}

export const revalidate = 3600;

type CurriculumItem = { code: string | null; text: string; electiveCount: string | null };
type CurriculumTerm = { label: string | null; units: string | null; items: CurriculumItem[] };

/** Parses one "Label — CODE1 Name; CODE2 Name; 2 electives (24 units)." curriculum line. */
function parseCurriculumLine(line: string): CurriculumTerm {
  const separatorIndex = line.indexOf(" — ");
  const label = separatorIndex === -1 ? null : line.slice(0, separatorIndex);
  let body = separatorIndex === -1 ? line : line.slice(separatorIndex + 3);

  const unitsMatch = body.match(/\((\d+)\s*units?\)\.?\s*$/i);
  const units = unitsMatch ? `${unitsMatch[1]} units` : null;
  if (unitsMatch) body = body.slice(0, unitsMatch.index).trim();

  const items = body
    .split(";")
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((segment): CurriculumItem => {
      const codeMatch = segment.match(/^([A-Z]{2,6}\d{3,4})\s+(.+)$/);
      if (codeMatch) return { code: codeMatch[1], text: codeMatch[2], electiveCount: null };
      const electiveMatch = segment.match(/^(\d+)\s+electives?$/i);
      if (electiveMatch) return { code: null, text: "Elective", electiveCount: electiveMatch[1] };
      return { code: null, text: segment, electiveCount: null };
    });
  return { label, units, items };
}

async function loadProgram(slug: string, programSlug: string) {
  const program = await getPublishedProgramBySlug(slug, programSlug);
  if (!program || !program.university || program.university.status !== "published") {
    return null;
  }
  return program;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; programSlug: string }>;
}) {
  const { slug, programSlug } = await params;
  if (UUID_RE.test(programSlug)) return {};
  const program = await loadProgram(slug, programSlug);
  if (!program) return {};

  const title = composeTitle(`${program.name}, ${program.university!.name}`, [
    `Fees & Entry Requirements ${SITE_YEAR}`,
    `Fees & Entry ${SITE_YEAR}`,
    `${SITE_YEAR}`,
  ]);
  const description = `${program.name} at ${program.university!.name} for international students: tuition fees, entry requirements, English test score, duration${program.subject?.name ? `, and how it fits the ${program.subject.name} field` : ""}.`;

  return pageMetadata({
    title,
    description,
    path: `/universities/${slug}/programs/${program.slug}`,
    type: "website",
    // Index only programs with real sourced content of their own — a parsed
    // curriculum or an "About this program" description of 110+ words (see
    // `isProgramIndexable`). The short templated long-tail cards stay
    // noindex, still live for users and internal links, pending a later
    // verification wave. See PROJECT_STATUS "Description pass".
    robots: { index: isProgramIndexable(program), follow: true },
  });
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string; programSlug: string }>;
}) {
  const { slug, programSlug } = await params;
  await redirectIfLegacyId(slug, programSlug);
  const program = await loadProgram(slug, programSlug);
  if (!program) notFound();

  const occupations = await getProgramOccupations(program.id);

  const university = program.university!;
  const curriculumTerms = program.curriculum
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCurriculumLine);

  const hasDescription = Boolean(program.description?.trim());

  // English scores: take IELTS/PTE as a whole set from the program when it
  // sets its own overall (its per-skill bands may be null, and are then just
  // omitted), otherwise from the university. Never mix a program's overall
  // with the university's bands.
  const ielts = program.ielts_overall != null ? program : university;
  const pte = program.pte_overall != null ? program : university;

  const hasStructuredEnglishScore = Boolean(
    (program.ielts_overall ?? university.ielts_overall) ||
      (program.pte_overall ?? university.pte_overall),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: program.name,
    provider: {
      "@type": "CollegeOrUniversity",
      name: university.name,
    },
    educationalProgramMode: program.degree_level?.name ?? undefined,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: university.name, href: `/universities/${university.slug}` },
    { label: program.name },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-wide text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {[program.degree_level?.name, program.subject?.name].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
              {program.name}
            </h1>
            <p className="mt-2 font-body text-base text-slate">
              {university.name}
              {university.city && `, ${university.city}`}
              {university.country?.name && `, ${university.country.name}`}
            </p>
          </div>
          {(program.application_url ?? university.apply_url) && (
            <OutboundLink
              event="apply_click"
              eventParams={{
                university: university.name,
                program: program.name,
                location: "program_page",
              }}
              href={program.application_url ?? university.apply_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper shadow-md shadow-ink/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/15"
            >
              Apply
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </OutboundLink>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-ink/10 pt-8">
        {hasDescription && (
          <>
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink">
              <span
                className="inline-block h-5 w-1 rounded-full"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-status-open) 60%, transparent)" }}
              />
              About this program
            </h2>
            <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-line bg-mist p-6 font-body text-lg leading-8 text-ink sm:p-7">
              {program.description!.split("\n\n").map((paragraph, i) => (
                <p key={i} className={i === 0 ? "text-pretty font-medium" : undefined}>
                  {paragraph.split("\n").map((line, j, lines) => (
                    <span key={j}>
                      {line}
                      {j < lines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </>
        )}

        <div>
          <ProgramSidebar
            durationYears={program.duration_years}
            tuitionDomestic={program.tuition_domestic ?? university.tuition_domestic}
            tuitionDomesticIsCsp={program.tuition_domestic_is_csp ?? university.tuition_domestic_is_csp}
            tuitionInternational={program.tuition_international ?? university.tuition_international}
            applicationFee={university.application_fee}
            currency={program.currency ?? university.currency}
            ieltsOverall={ielts.ielts_overall}
            ieltsListening={ielts.ielts_listening}
            ieltsReading={ielts.ielts_reading}
            ieltsWriting={ielts.ielts_writing}
            ieltsSpeaking={ielts.ielts_speaking}
            pteOverall={pte.pte_overall}
            pteListening={pte.pte_listening}
            pteReading={pte.pte_reading}
            pteWriting={pte.pte_writing}
            pteSpeaking={pte.pte_speaking}
          />
          <VerifiedInline
            date={program.last_verified_at}
            source={program.source_url}
          />
        </div>
      </div>

      {curriculumTerms && curriculumTerms.length > 0 && (
        <ProfileSection title="Course structure">
          <p className="mb-4 flex items-center gap-2 font-body text-sm text-slate">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-status-open/10 text-status-open">
              <BookIcon className="h-3.5 w-3.5" />
            </span>
            {curriculumTerms.length} term{curriculumTerms.length === 1 ? "" : "s"} of coursework
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {curriculumTerms.map((term, i) => (
              <div
                key={i}
                className="rounded-xl border border-line bg-mist p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
              >
                {(term.label || term.units) && (
                  <div className="flex items-center justify-between gap-2 border-b border-ink/10 pb-2">
                    {term.label && (
                      <p className="font-utility text-xs font-semibold uppercase tracking-wide text-status-open">
                        {term.label}
                      </p>
                    )}
                    {term.units && (
                      <span className="flex-shrink-0 rounded-full bg-ink/[0.05] px-2 py-0.5 font-utility text-[10px] text-slate">
                        {term.units}
                      </span>
                    )}
                  </div>
                )}
                <ul className={term.label || term.units ? "mt-2 flex flex-col gap-1.5" : "flex flex-col gap-1.5"}>
                  {term.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 font-body text-sm text-ink">
                      {item.code ? (
                        <span className="flex-shrink-0 rounded-full bg-ink/[0.05] px-2 py-0.5 font-utility text-[10px] text-slate">
                          {item.code}
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className="inline-block h-1 w-1 flex-shrink-0 rounded-full bg-status-open/50"
                        />
                      )}
                      <span>{item.text}</span>
                      {item.electiveCount && (
                        <span className="ml-auto flex-shrink-0 rounded-full bg-status-open/10 px-2 py-0.5 font-utility text-[10px] text-status-open">
                          {item.electiveCount} elective{item.electiveCount === "1" ? "" : "s"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ProfileSection>
      )}

      {occupations.length > 0 && (
        <ProfileSection title="Career & PR pathway">
          <p className="mb-4 flex items-center gap-2 font-body text-sm text-slate">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-status-open/10 text-status-open">
              <PassportIcon className="h-3.5 w-3.5" />
            </span>
            Occupations this degree typically leads to, and their skilled-migration list status
          </p>
          <div className="flex flex-col gap-3">
            {occupations.map(({ occupation, relevance, pathway_note }) => {
              if (!occupation) return null;
              const lists = [
                occupation.mltssl && "MLTSSL",
                occupation.stsol && "STSOL",
                occupation.rol && "ROL",
                occupation.csol && "CSOL",
              ].filter(Boolean) as string[];
              return (
                <Link
                  key={occupation.slug}
                  href={`/occupations/${occupation.slug}`}
                  className="block rounded-xl border border-line bg-mist p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-body text-sm font-semibold text-ink">
                      {occupation.name}
                      <span className="ml-2 font-utility text-[11px] font-normal text-slate">
                        ANZSCO {occupation.anzsco_code}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {relevance === "primary" && (
                        <span className="rounded-full bg-status-open/10 px-2 py-0.5 font-utility text-[10px] font-semibold text-status-open">
                          Primary outcome
                        </span>
                      )}
                      {lists.map((list) => (
                        <span
                          key={list}
                          className="rounded-full bg-ink/[0.05] px-2 py-0.5 font-utility text-[10px] text-slate"
                        >
                          {list}
                        </span>
                      ))}
                    </div>
                  </div>
                  {(pathway_note ?? occupation.visa_pathway_note ?? occupation.summary) && (
                    <p className="mt-2 font-body text-sm text-slate">
                      {pathway_note ?? occupation.visa_pathway_note ?? occupation.summary}
                    </p>
                  )}
                  {occupation.assessing_authority && (
                    <p className="mt-1.5 font-body text-xs text-slate">
                      Assessed by {occupation.assessing_authority}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
          <p className="mt-3 font-body text-xs text-slate">
            List membership changes over time and does not guarantee an invitation. See the{" "}
            <Link href="/guides/skilled-occupation-lists-explained" className="underline underline-offset-2 hover:text-ink">
              skilled occupation lists guide
            </Link>{" "}
            and the{" "}
            <Link href="/visas/points-calculator" className="underline underline-offset-2 hover:text-ink">
              points calculator
            </Link>{" "}
            before relying on this for a visa decision.
          </p>
        </ProfileSection>
      )}

      {(program.admission_requirements ||
        (program.english_requirements && !hasStructuredEnglishScore)) && (
        <ProfileSection title="Admissions">
          <ProgramAdmissionsBlock
            admissionRequirements={program.admission_requirements}
            englishRequirements={program.english_requirements}
            hasStructuredEnglishScore={hasStructuredEnglishScore}
          />
        </ProfileSection>
      )}

      <WhyTrust className="mt-8" />

      <Link
        href={`/universities/${university.slug}`}
        className="mt-6 inline-block font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
      >
        ← Back to {university.name}
      </Link>
    </main>
  );
}
