import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { SITE_YEAR } from "@/lib/site-config";
import { formatCurrency } from "@/lib/format";
import {
  getSubjectBySlug,
  listPublishedSubjects,
} from "@/lib/queries/public-subjects";
import { SUBJECT_CONTENT } from "@/lib/subjects";

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
  const title = `Study ${subject.name} in Australia ${SITE_YEAR}: Costs, Universities & Requirements`;
  const feeBit =
    subject.minTuition != null
      ? ` Tuition from ${formatCurrency(subject.minTuition, "AUD")}/year across ${subject.universities.length} universities.`
      : "";
  const description = `${subject.programs.length} ${subject.name} programs for international students at Australian universities.${feeBit} Entry requirements, costs, and the pathway to permanent residence.`;
  const url = `/study/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

const GENERIC_REQUIREMENTS =
  "Entry to a bachelor degree needs a completed senior secondary qualification (or a recognised foundation year) that meets the university's minimum, plus an English test, usually IELTS 6.0 to 6.5. Entry to a postgraduate coursework degree needs a relevant bachelor degree, often with a credit average, and IELTS 6.5. Registration-based fields (nursing, teaching, psychology, architecture) set higher English bars and additional requirements. Always confirm the exact requirements for the specific program.";

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

  const cheapest = subject.programs.filter((p) => p.tuition != null).slice(0, 15);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Study by subject", href: "/study" },
    { label: subject.name },
  ];

  const jsonLd: Record<string, unknown>[] = [breadcrumbJsonLd(breadcrumbs)];
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
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          Study in Australia
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          Study {subject.name} in Australia
        </h1>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-mist px-4 py-3">
          <dt className="font-utility text-[0.7rem] font-semibold tracking-widest text-slate uppercase">
            Programs
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-ink">
            {subject.programs.length}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-mist px-4 py-3">
          <dt className="font-utility text-[0.7rem] font-semibold tracking-widest text-slate uppercase">
            Universities
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-ink">
            {subject.universities.length}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-mist px-4 py-3">
          <dt className="font-utility text-[0.7rem] font-semibold tracking-widest text-slate uppercase">
            Tuition from
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-status-open">
            {subject.minTuition != null
              ? formatCurrency(subject.minTuition, "AUD")
              : "varies"}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        {intro.map((p) => (
          <p key={p.slice(0, 24)} className="font-body text-base leading-relaxed text-ink">
            {p}
          </p>
        ))}
      </div>

      {content?.careers && (
        <p className="mt-6 rounded-xl border border-status-open/25 bg-status-open/5 p-5 font-body text-sm text-ink">
          <span className="font-semibold">Migration angle. </span>
          {content.careers}
        </p>
      )}

      {cheapest.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">
            Most affordable {subject.name} programs
          </h2>
          <div className="overflow-hidden rounded-xl border border-line">
            {cheapest.map((p, i) => (
              <Link
                key={p.id}
                href={`/universities/${p.universitySlug}/programs/${p.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-ink/[0.03]"
                style={{
                  borderBottomWidth: i < cheapest.length - 1 ? 1 : 0,
                  borderBottomColor: "var(--color-line)",
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate font-body text-sm font-medium text-ink">
                    {p.name}
                  </span>
                  <span className="font-utility text-xs text-slate">
                    {p.universityName}
                    {p.degreeLevel ? ` · ${p.degreeLevel}` : ""}
                  </span>
                </span>
                <span className="flex-shrink-0 font-utility text-sm font-medium text-status-open">
                  {formatCurrency(p.tuition, p.currency)}/yr
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-2 font-body text-xs text-slate">
            Tuition is per year for international students, from each program&rsquo;s
            page. Figures are approximate and change annually.
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          Universities offering {subject.name}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {subject.universities.map((u) => (
            <li key={u.slug}>
              <Link
                href={`/universities/${u.slug}`}
                className="inline-block rounded-full border border-line bg-mist px-3.5 py-1.5 font-body text-sm text-ink transition-colors hover:border-status-open/40 hover:underline"
              >
                {u.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          Typical entry requirements
        </h2>
        <p className="font-body text-base leading-relaxed text-ink">
          {GENERIC_REQUIREMENTS}
        </p>
      </section>

      {content?.faq && content.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">
            {subject.name} in Australia: common questions
          </h2>
          <div className="flex flex-col gap-4">
            {content.faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-body text-base font-semibold text-ink">
                  {f.q}
                </h3>
                <p className="mt-1 font-body text-base leading-relaxed text-slate">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Related
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { href: "/guides/real-cost-of-studying-in-australia", label: "The real cost of studying in Australia" },
            { href: "/guides/study-to-permanent-residence-pathway-australia", label: "The study-to-PR pathway" },
            { href: "/scholarships", label: "Scholarships for studying in Australia" },
            { href: "/best/affordable-australian-universities-for-international-students", label: "Most affordable universities" },
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
