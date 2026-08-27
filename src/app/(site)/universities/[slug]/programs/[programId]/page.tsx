import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProfileSection } from "@/components/site/ProfileSection";
import { LastVerified } from "@/components/site/LastVerified";
import { ProgramAdmissionsBlock } from "@/components/site/ProgramAdmissionsBlock";
import { ProgramSidebar } from "@/components/site/ProgramSidebar";
import { ArrowUpRightIcon, BookIcon, CheckBadgeIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { SITE_YEAR } from "@/lib/site-config";
import { getPublishedProgram } from "@/lib/queries/public-programs";

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

async function loadProgram(slug: string, programId: string) {
  const program = await getPublishedProgram(programId);
  if (!program || !program.university || program.university.status !== "published") {
    return null;
  }
  if (program.university.slug !== slug) return null;
  return program;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; programId: string }>;
}) {
  const { slug, programId } = await params;
  const program = await loadProgram(slug, programId);
  if (!program) return {};

  const title = `${program.name}, ${program.university!.name}: Fees & Entry Requirements ${SITE_YEAR}`;
  const description = `${program.name} at ${program.university!.name} for international students: tuition fees, entry requirements, English test score, duration${program.subject?.name ? `, and how it fits the ${program.subject.name} field` : ""}.`;
  const url = `/universities/${slug}/programs/${programId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string; programId: string }>;
}) {
  const { slug, programId } = await params;
  const program = await loadProgram(slug, programId);
  if (!program) notFound();

  const university = program.university!;
  const curriculumTerms = program.curriculum
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCurriculumLine);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
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
            <a
              href={program.application_url ?? university.apply_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper shadow-md shadow-ink/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/15"
            >
              Apply
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-ink/10 pt-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <span
            className="inline-block h-5 w-1 rounded-full"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-status-open) 60%, transparent)" }}
          />
          About this program
        </h2>
        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-mist p-6 font-body text-lg leading-8 text-ink sm:p-7">
          {program.description?.split("\n\n").map((paragraph, i) => (
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

        <div className="mt-6">
          <ProgramSidebar
            durationYears={program.duration_years}
            tuitionDomestic={program.tuition_domestic ?? university.tuition_domestic}
            tuitionDomesticIsCsp={program.tuition_domestic_is_csp ?? university.tuition_domestic_is_csp}
            tuitionInternational={program.tuition_international ?? university.tuition_international}
            applicationFee={university.application_fee}
            currency={program.currency ?? university.currency}
            ieltsOverall={program.ielts_overall ?? university.ielts_overall}
            ieltsListening={program.ielts_listening ?? university.ielts_listening}
            ieltsReading={program.ielts_reading ?? university.ielts_reading}
            ieltsWriting={program.ielts_writing ?? university.ielts_writing}
            ieltsSpeaking={program.ielts_speaking ?? university.ielts_speaking}
            pteOverall={program.pte_overall ?? university.pte_overall}
            pteListening={program.pte_listening ?? university.pte_listening}
            pteReading={program.pte_reading ?? university.pte_reading}
            pteWriting={program.pte_writing ?? university.pte_writing}
            pteSpeaking={program.pte_speaking ?? university.pte_speaking}
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

      <ProfileSection title="Admissions">
        <ProgramAdmissionsBlock
          admissionRequirements={program.admission_requirements}
          englishRequirements={program.english_requirements}
          hasStructuredEnglishScore={hasStructuredEnglishScore}
        />
      </ProfileSection>

      <div className="mt-8 flex items-center gap-2 rounded-xl bg-status-open/5 px-4 py-3">
        <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-status-open" />
        <LastVerified
          date={program.last_verified_at}
          sources={program.source_url ? [program.source_url] : null}
        />
      </div>

      <Link
        href={`/universities/${university.slug}`}
        className="mt-6 inline-block font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
      >
        ← Back to {university.name}
      </Link>
    </main>
  );
}
