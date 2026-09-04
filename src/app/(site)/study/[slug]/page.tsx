import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqSection } from "@/components/site/FaqSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { SITE_URL, SITE_YEAR } from "@/lib/site-config";
import { formatCurrency } from "@/lib/format";
import {
  getSubjectBySlug,
  listPublishedSubjects,
} from "@/lib/queries/public-subjects";
import { SUBJECT_CONTENT } from "@/lib/subjects";
import { SubjectComparisonTable } from "@/components/site/SubjectComparisonTable";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const subjects = await listPublishedSubjects();
  return subjects.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) return {};
  const title = composeTitle(`Study ${subject.name} in Australia`, [
    `Costs, Universities & Requirements ${SITE_YEAR}`,
    `Cost & Entry Requirements ${SITE_YEAR}`,
    `Cost & Entry ${SITE_YEAR}`,
    `${SITE_YEAR}`,
  ]);
  const feeBit =
    subject.minTuition != null
      ? ` Tuition from ${formatCurrency(subject.minTuition, "AUD")}/year across ${subject.universities.length} universities.`
      : "";
  const description = `${subject.programs.length} ${subject.name} programs for international students at Australian universities.${feeBit} Entry requirements, costs, and the pathway to permanent residence.`;
  return pageMetadata({
    title,
    description,
    path: `/study/${slug}`,
    type: "article",
    // Subjects without curated editorial fall back to templated copy built
    // from program data. Kept live for visitors and internal links, but
    // noindex until they get a real write-up.
    ...(SUBJECT_CONTENT[slug] ? {} : { robots: { index: false, follow: true } }),
  });
}

const GENERIC_REQUIREMENTS =
  "Entry to a bachelor degree needs a completed senior secondary qualification (or a recognised foundation year) that meets the university's minimum, plus an English test, usually IELTS 6.0 to 6.5 (PTE Academic 50 to 58). Entry to a postgraduate coursework degree needs a relevant bachelor degree, often with a credit average, and IELTS 6.5 (PTE 58). Registration-based fields (nursing, teaching, psychology, architecture) set higher English bars and additional requirements. Always confirm the exact requirements for the specific program.";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  const content = SUBJECT_CONTENT[slug];
  const intro = content?.intro ?? [
    `Australian universities offer ${subject.programs.length} ${subject.name} programs to international students, taught at ${subject.universities.length} universities across the country.`,
    `Tuition ranges from ${subject.minTuition != null ? formatCurrency(subject.minTuition, "AUD") : "the mid AUD 20,000s"} to ${subject.maxTuition != null ? formatCurrency(subject.maxTuition, "AUD") : "over AUD 45,000"} a year, with the Group of Eight universities at the top of that range and regional and newer universities at the bottom.`,
  ];

  const uniName = new Map(subject.universities.map((u) => [u.slug, u.name]));
  const strongAt = (content?.strongAt ?? [])
    .map((s) => ({ ...s, name: uniName.get(s.slug) }))
    .filter((s): s is { slug: string; why: string; name: string } => Boolean(s.name));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Study by subject", href: "/study" },
    { label: subject.name },
  ];

  const jsonLd: Record<string, unknown>[] = [breadcrumbJsonLd(breadcrumbs)];

  // Course schema: one entry per university that teaches this subject. Only on
  // curated (indexed) subject pages, so the markup matches a page that is
  // actually in search.
  if (content && subject.universities.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${subject.name} courses at Australian universities`,
      itemListElement: subject.universities.map((u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Course",
          name: `${subject.name} at ${u.name}`,
          description: `${subject.name} degrees for international students at ${u.name}, Australia.`,
          url: `${SITE_URL}/universities/${u.slug}`,
          provider: {
            "@type": "CollegeOrUniversity",
            name: u.name,
            url: `${SITE_URL}/universities/${u.slug}`,
          },
        },
      })),
    });
  }

  if (content?.faq.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

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
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          Study {subject.name} in Australia
        </h1>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-3 sm:max-w-2xl">
        <div className="rounded-xl border border-line bg-mist px-4 py-3">
          <dt className="font-utility text-xs font-semibold tracking-wide text-slate uppercase">
            Programs
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-ink">
            {subject.programs.length}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-mist px-4 py-3">
          <dt className="font-utility text-xs font-semibold tracking-wide text-slate uppercase">
            Universities
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-ink">
            {subject.universities.length}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-mist px-4 py-3">
          <dt className="font-utility text-xs font-semibold tracking-wide text-slate uppercase">
            Tuition from
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-status-open">
            {subject.minTuition != null
              ? formatCurrency(subject.minTuition, "AUD")
              : "varies"}
          </dd>
        </div>
      </dl>

      {content?.costNote && (
        <p className="mt-3 font-body text-xs text-slate">{content.costNote}</p>
      )}

      <div className="mt-8 flex max-w-2xl flex-col gap-3">
        {intro.map((p) => (
          <p key={p.slice(0, 24)} className="font-body text-base leading-relaxed text-ink">
            {p}
          </p>
        ))}
        {content?.fromCountry && (
          <p className="font-body text-base leading-relaxed text-ink">
            {content.fromCountry}
          </p>
        )}
      </div>

      {content?.careers && (
        <p className="mt-6 max-w-2xl rounded-xl border border-status-open/25 bg-status-open/5 p-5 font-body text-sm text-ink">
          <span className="font-semibold">Migration angle. </span>
          {content.careers}
        </p>
      )}

      <SubjectComparisonTable
        subjectName={subject.name}
        programs={subject.programs}
      />

      {strongAt.length > 0 && (
        <section className="mt-10">
          <SectionHeading>Universities known for {subject.name}</SectionHeading>
          <p className="mb-4 font-body text-sm text-slate">
            There is no official field-level ranking of Australian universities.
            These are the ones with a recognised reputation in {subject.name},
            strongest first.
          </p>
          <ol className="flex flex-col gap-3">
            {strongAt.map((u, i) => (
              <li key={u.slug}>
                <Link
                  href={`/universities/${u.slug}`}
                  className="card card-hover group flex gap-3 p-4"
                >
                  <span className="font-display text-lg font-semibold text-slate">
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-body text-[0.95rem] font-semibold text-ink group-hover:underline">
                      {u.name}
                    </span>
                    <span className="mt-0.5 block font-body text-sm text-slate">
                      {u.why}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-10 max-w-2xl">
        <SectionHeading>
          {content?.requirements ? `Entry requirements for ${subject.name}` : "Typical entry requirements"}
        </SectionHeading>
        {content?.requirements ? (
          <div className="flex flex-col gap-3">
            {content.requirements.map((p) => (
              <p key={p.slice(0, 24)} className="font-body text-base leading-relaxed text-ink">
                {p}
              </p>
            ))}
          </div>
        ) : (
          <p className="font-body text-base leading-relaxed text-ink">
            {GENERIC_REQUIREMENTS}
          </p>
        )}
      </section>

      {content?.faq && content.faq.length > 0 && (
        <FaqSection
          heading={`${subject.name} in Australia: common questions`}
          items={content.faq}
        />
      )}

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="mb-3 font-body text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
          Related
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {(content?.related ?? [
            { href: "/guides/real-cost-of-studying-in-australia", label: "The real cost of studying in Australia" },
            { href: "/guides/study-to-permanent-residence-pathway-australia", label: "The study-to-PR pathway" },
            { href: "/visas/student-500", label: "Student visa (subclass 500)" },
            { href: "/guides/how-the-australian-points-test-works", label: "How the skilled points test works" },
            { href: "/scholarships", label: "Scholarships for studying in Australia" },
            { href: "/best/affordable-australian-universities-for-international-students", label: "Most affordable universities" },
          ]).map((l) => (
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
      </section>

      <p className="mt-8 font-body text-xs text-slate">
        Program counts and tuition figures are drawn from this site&rsquo;s
        database and are approximate. This is general information, not admissions
        or migration advice.
      </p>

      <div className="mt-6">
        <Link
          href="/study"
          className="group inline-flex items-center gap-2 font-body text-sm font-medium text-ink"
        >
          <ArrowUpRightIcon className="h-3.5 w-3.5 rotate-[225deg] text-slate transition-colors group-hover:text-status-open" />
          All subjects
        </Link>
      </div>
    </main>
  );
}
