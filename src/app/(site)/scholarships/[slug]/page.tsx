import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { CheckBadgeIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { FaqSection } from "@/components/site/FaqSection";
import { faqJsonLd, scholarshipFaq } from "@/lib/faq";
import { SITE_YEAR } from "@/lib/site-config";
import {
  getPublishedScholarship,
  listPublishedScholarshipSlugs,
} from "@/lib/queries/public-scholarships";
import { SCHOLARSHIP_SCOPE_LABELS } from "@/lib/scholarship-scopes";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listPublishedScholarshipSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await getPublishedScholarship(slug);
  if (!s) return {};
  // The scholarship's own name is the query, so it is the part that must
  // survive; the qualifier is appended only when there is room for it.
  const title = composeTitle(`${s.name} ${SITE_YEAR}`, [
    "Value, Eligibility & How to Apply",
    "Value & Eligibility",
    "Eligibility",
  ]);
  const description =
    `${s.name}${s.amount ? ` (${s.amount})` : ""} for international students in Australia: who is eligible, what it covers, whether you need a separate application, and how to apply. ` +
    (s.description ?? "");
  return pageMetadata({
    title,
    description,
    path: `/scholarships/${slug}`,
    type: "article",
  });
}

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-line bg-mist px-4 py-3">
      <dt className="font-utility text-[0.7rem] font-semibold tracking-widest text-slate uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-body text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default async function ScholarshipPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await getPublishedScholarship(slug);
  if (!s) notFound();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Scholarships", href: "/scholarships" },
    { label: s.name },
  ];

  const faqItems = scholarshipFaq(s);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      {faqItems.length > 0 && (
        <JsonLd data={faqJsonLd(faqItems)} />
      )}
      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {SCHOLARSHIP_SCOPE_LABELS[s.scope] ?? s.scope}
          {s.universities.length === 1 && ` · ${s.universities[0].name}`}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          {s.name}
        </h1>
        {s.amount && (
          <p className="mt-3 font-utility text-lg font-medium text-status-open">
            {s.amount}
          </p>
        )}
      </div>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        <Fact label="Study level" value={s.study_level} />
        <Fact
          label="How to get it"
          value={
            s.separate_application === true
              ? "Separate application required"
              : s.separate_application === false
                ? "Automatic on admission, no form"
                : null
          }
        />
        <Fact
          label="Deadline"
          value={
            s.deadline_date
              ? new Date(s.deadline_date).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null
          }
        />
        <Fact
          label="Country"
          value={s.country?.name ?? (s.universities.length ? "Australia" : null)}
        />
      </dl>

      {s.eligibility && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">
            Who is eligible
          </h2>
          <p className="font-body text-base leading-relaxed text-ink">
            {s.eligibility}
          </p>
        </section>
      )}

      {s.description && (
        <section className="mt-10">
          <GuideContent content={s.description} />
        </section>
      )}

      {s.universities.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">
            {s.universities.length === 1 ? "Offered at" : "Participating universities"}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {s.universities.map((u) => (
              <li key={u.slug}>
                <Link
                  href={`/universities/${u.slug}`}
                  className="inline-block rounded-full border border-ink/15 bg-ink/[0.02] px-3.5 py-1.5 font-body text-sm text-ink transition-colors hover:border-status-open/40 hover:underline"
                >
                  {u.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FaqSection heading={`${s.name}: common questions`} items={faqItems} />

      {s.external_url && (
        <a
          href={s.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper shadow-md shadow-ink/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Official scholarship page ↗
        </a>
      )}

      <div className="mt-10 flex items-center gap-2 rounded-xl bg-status-open/5 px-4 py-3">
        <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-status-open" />
        <LastVerified
          date={s.last_verified_at}
          sources={s.source_url ? [s.source_url] : null}
        />
      </div>

      <p className="mt-6 font-body text-xs text-slate">
        Scholarship terms change every year. Confirm the current value,
        eligibility, and deadline on the official page before you apply or rely
        on this for budgeting.
      </p>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <Link
          href="/scholarships"
          className="font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
        >
          ← All scholarships
        </Link>
      </div>
    </main>
  );
}
