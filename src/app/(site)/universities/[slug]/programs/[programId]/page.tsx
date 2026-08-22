import Link from "next/link";
import { notFound } from "next/navigation";
import { Fact, FactBox, ProfileSection } from "@/components/site/ProfileSection";
import { LastVerified } from "@/components/site/LastVerified";
import { ProgramRequirementFacts } from "@/components/site/ProgramRequirementFacts";
import { TuitionFact } from "@/components/site/TuitionFact";
import { getPublishedProgram } from "@/lib/queries/public-programs";

export const revalidate = 3600;

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

  const title = `${program.name} at ${program.university!.name} — Requirements & Cost`;
  const description = `${[program.degree_level?.name, program.subject?.name]
    .filter(Boolean)
    .join(" · ")} program at ${program.university!.name}: admission requirements, English test scores, duration, and tuition.`;

  return { title, description };
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

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="font-utility text-xs text-slate">
        <Link href={`/universities/${university.slug}`} className="underline underline-offset-2 hover:text-ink">
          {university.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{program.name}</span>
      </nav>

      <p className="mt-3 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
        {[program.degree_level?.name, program.subject?.name].filter(Boolean).join(" · ")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        {program.name}
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        {university.name}
        {university.city && `, ${university.city}`}
        {university.country?.name && `, ${university.country.name}`}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {(program.application_url ?? university.apply_url) && (
          <a
            href={program.application_url ?? university.apply_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-ink px-4 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
          >
            Apply ↗
          </a>
        )}
      </div>

      <ProfileSection title="Program details">
        <FactBox>
          <Fact label="Duration" value={program.duration_years ? `${program.duration_years} yr` : null} />
          <TuitionFact
            domestic={program.tuition_domestic ?? university.tuition_domestic}
            domesticIsCsp={program.tuition_domestic_is_csp ?? university.tuition_domestic_is_csp}
            international={program.tuition_international ?? university.tuition_international}
            currency={program.currency ?? university.currency}
          />
          <ProgramRequirementFacts
            admissionRequirements={program.admission_requirements}
            englishRequirements={program.english_requirements}
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
        </FactBox>
      </ProfileSection>

      <div className="mt-8 border-t border-ink/10 pt-6">
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
