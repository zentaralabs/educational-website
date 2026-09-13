import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LastVerified } from "@/components/site/LastVerified";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Fact, FactGrid } from "@/components/site/FactGrid";
import { ArrowUpRightIcon, PassportIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import {
  getProgramsForOccupation,
  getPublishedOccupation,
  listPublishedOccupationSlugs,
} from "@/lib/queries/public-occupations";
import { SITE_YEAR } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

// Popular occupations (e.g. Registered Nurse, Software Engineer) can have
// hundreds of matching programs across dozens of universities, while niche
// ones have a handful — an unpaginated page swung from ~650 to ~6,100 words
// purely on table row count. Capping universities per page keeps every
// occupation page in a consistent, genuinely readable range and gives the
// long tail of universities real, crawlable `?page=N` URLs instead of an
// ever-growing single page.
const UNIVERSITIES_PER_PAGE = 15;

export async function generateStaticParams() {
  const slugs = await listPublishedOccupationSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function loadOccupation(slug: string) {
  const occupation = await getPublishedOccupation(slug);
  if (!occupation) return null;
  const programs = await getProgramsForOccupation(slug);
  return { occupation, programs };
}

function groupByUniversity(programs: Awaited<ReturnType<typeof getProgramsForOccupation>>) {
  return Array.from(
    programs.reduce((map, p) => {
      const existing = map.get(p.university.slug);
      if (existing) existing.push(p);
      else map.set(p.university.slug, [p]);
      return map;
    }, new Map<string, typeof programs>()),
  )
    .map(([universitySlug, rows]) => ({
      universitySlug,
      university: rows[0].university,
      programs: rows.sort((a, b) => a.program.name.localeCompare(b.program.name)),
    }))
    .sort((a, b) => a.university.name.localeCompare(b.university.name));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const data = await loadOccupation(slug);
  if (!data) return {};
  const { occupation, programs } = data;

  const totalPages = Math.max(1, Math.ceil(groupByUniversity(programs).length / UNIVERSITIES_PER_PAGE));
  const pageNum = Math.min(totalPages, Math.max(1, Number(page) || 1));

  const title = composeTitle(occupation.name, [
    `ANZSCO ${occupation.anzsco_code}: Visa & Degree Pathways ${SITE_YEAR}`,
    `Visa & Degree Pathways ${SITE_YEAR}`,
    `${SITE_YEAR}`,
  ]);
  const description =
    pageNum === 1
      ? `${occupation.name} (ANZSCO ${occupation.anzsco_code}): skilled occupation list status, visa pathway, and ${programs.length} real Australian degree${programs.length === 1 ? "" : "s"} that lead to it.`
      : `${occupation.name} (ANZSCO ${occupation.anzsco_code}): more Australian universities offering a degree pathway into this occupation. Page ${pageNum} of ${totalPages}.`;

  return pageMetadata({
    title,
    description,
    path: pageNum === 1 ? `/occupations/${slug}` : `/occupations/${slug}?page=${pageNum}`,
    type: "article",
    // Thin without the reverse lookup — index only occupations that actually
    // resolve to at least one real published program. See the "SEO/keyword
    // assessment" note in memory: the reverse lookup is the whole point, not
    // the ANZSCO trivia every migration-agent SOL page already has.
    robots: { index: programs.length > 0, follow: true },
  });
}

function listBadges(occupation: { mltssl: boolean; stsol: boolean; rol: boolean; csol: boolean }) {
  return [
    occupation.mltssl && "MLTSSL",
    occupation.stsol && "STSOL",
    occupation.rol && "ROL",
    occupation.csol && "CSOL",
  ].filter(Boolean) as string[];
}

export default async function OccupationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const data = await loadOccupation(slug);
  if (!data) notFound();
  const { occupation, programs } = data;

  const lists = listBadges(occupation);
  const pointsTested = occupation.mltssl || occupation.stsol || occupation.rol;

  const allUniversities = groupByUniversity(programs);
  const totalPages = Math.max(1, Math.ceil(allUniversities.length / UNIVERSITIES_PER_PAGE));
  const pageNum = Math.min(totalPages, Math.max(1, Number(page) || 1));
  const universities = allUniversities.slice(
    (pageNum - 1) * UNIVERSITIES_PER_PAGE,
    pageNum * UNIVERSITIES_PER_PAGE,
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Occupations", href: "/occupations" },
    { label: occupation.name },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Occupation",
    name: occupation.name,
    occupationalCategory: occupation.anzsco_code,
    description: occupation.summary ?? occupation.visa_pathway_note ?? undefined,
    dateModified: occupation.last_verified_at ?? undefined,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          ANZSCO {occupation.anzsco_code}
          {occupation.skill_level != null && ` · Skill level ${occupation.skill_level}`}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          {occupation.name}
        </h1>
        {occupation.summary && (
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink/90 sm:text-lg">
            {occupation.summary}
          </p>
        )}
        {lists.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {lists.map((list) => (
              <span
                key={list}
                className="rounded-full bg-status-open/10 px-2.5 py-1 font-utility text-xs font-semibold text-status-open"
              >
                {list}
              </span>
            ))}
          </div>
        )}
      </div>

      <FactGrid>
        <Fact
          label="Points-tested lists"
          value={pointsTested ? "Yes, supports 189/190/491" : "No"}
        />
        <Fact
          label="Employer-sponsored (CSOL)"
          value={occupation.csol ? "Yes, supports 482/186" : "No"}
        />
        <Fact label="Assessing authority" value={occupation.assessing_authority} />
        <Fact label="Skill level" value={occupation.skill_level != null ? String(occupation.skill_level) : null} />
      </FactGrid>

      {occupation.visa_pathway_note && (
        <section className="mt-10 max-w-2xl">
          <SectionHeading>Visa pathway</SectionHeading>
          <p className="font-body text-base leading-relaxed text-ink">
            {occupation.visa_pathway_note}
          </p>
        </section>
      )}

      {universities.length > 0 && (
        <section className="mt-10 border-t border-ink/10 pt-8">
          <SectionHeading>
            {programs.length} degree{programs.length === 1 ? "" : "s"} at {allUniversities.length} universit
            {allUniversities.length === 1 ? "y" : "ies"} that lead here
          </SectionHeading>
          <p className="mb-4 flex items-center gap-2 font-body text-sm text-slate">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-status-open/10 text-status-open">
              <PassportIcon className="h-3.5 w-3.5" />
            </span>
            Real published degree programs whose graduates typically pursue {occupation.name}
            {totalPages > 1 && ` — page ${pageNum} of ${totalPages}, alphabetically`}
          </p>
          <div className="flex flex-col gap-3">
            {universities.map(({ universitySlug, university, programs: rows }) => (
              <div
                key={universitySlug}
                className="rounded-xl border border-line bg-mist p-4"
              >
                <Link
                  href={`/universities/${universitySlug}`}
                  className="font-body text-sm font-semibold text-ink hover:underline"
                >
                  {university.name}
                  {university.city && <span className="font-normal text-slate">, {university.city}</span>}
                </Link>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                  {rows.map((r) => (
                    <li key={r.program.slug}>
                      <Link
                        href={`/universities/${universitySlug}/programs/${r.program.slug}`}
                        className="font-body text-sm text-slate underline decoration-slate/30 underline-offset-2 hover:text-ink hover:decoration-ink"
                      >
                        {r.program.name}
                      </Link>
                      {r.program.degree_level?.name && (
                        <span className="ml-1.5 font-utility text-[10px] text-slate/70">
                          {r.program.degree_level.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-5 flex items-center justify-between gap-3 font-body text-sm">
              {pageNum > 1 ? (
                <Link
                  href={pageNum - 1 === 1 ? `/occupations/${slug}` : `/occupations/${slug}?page=${pageNum - 1}`}
                  className="text-status-open underline underline-offset-2"
                >
                  ← Previous universities
                </Link>
              ) : (
                <span />
              )}
              <span className="text-slate">
                Page {pageNum} of {totalPages}
              </span>
              {pageNum < totalPages ? (
                <Link
                  href={`/occupations/${slug}?page=${pageNum + 1}`}
                  className="text-status-open underline underline-offset-2"
                >
                  More universities →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
      )}

      <p className="mt-6 font-body text-xs text-slate">
        List membership changes over time and a positive skills assessment is
        not a guarantee of an invitation. See the{" "}
        <Link href="/guides/skilled-occupation-lists-explained" className="underline underline-offset-2 hover:text-ink">
          skilled occupation lists guide
        </Link>{" "}
        and the{" "}
        <Link href="/visas/points-calculator" className="underline underline-offset-2 hover:text-ink">
          points calculator
        </Link>{" "}
        before treating this as immigration advice.
      </p>

      <RelatedLinks
        className="mt-10 border-t border-ink/10 pt-6"
        heading="Related"
        items={[
          { href: "/guides/skilled-occupation-lists-explained", label: "MLTSSL, STSOL, CSOL and ROL explained" },
          { href: "/visas/points-calculator", label: "Estimate your skilled migration points" },
          { href: "/occupations", label: "All occupations we track" },
        ]}
      />

      <div className="mt-8">
        <LastVerified date={occupation.last_verified_at} sources={occupation.source_url ? [occupation.source_url] : null} />
      </div>

      <div className="mt-6 border-t border-ink/10 pt-6">
        <Link
          href="/occupations"
          className="group inline-flex items-center gap-2 font-body text-sm font-medium text-ink"
        >
          <ArrowUpRightIcon className="h-3.5 w-3.5 rotate-[225deg] text-slate transition-colors group-hover:text-status-open" />
          All occupations
        </Link>
      </div>
    </main>
  );
}
