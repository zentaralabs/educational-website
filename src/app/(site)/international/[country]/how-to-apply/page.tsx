import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqSection } from "@/components/site/FaqSection";
import { LastVerified } from "@/components/site/LastVerified";
import { ProfileSection } from "@/components/site/ProfileSection";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd } from "@/lib/faq";
import { flagEmoji } from "@/lib/flag";
import { APPLY_GUIDE_SLUGS, getApplyGuide } from "@/lib/apply-guides";
import { getOriginCountry } from "@/lib/origin-countries";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return APPLY_GUIDE_SLUGS.map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const guide = getApplyGuide(country);
  if (!guide) return {};
  return pageMetadata({
    title: composeTitle(guide.metaTitle),
    description: guide.metaDescription,
    path: `/international/${country}/how-to-apply`,
    type: "article",
  });
}

export default async function HowToApplyPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const c = getOriginCountry(country);
  const guide = getApplyGuide(country);
  if (!c || !guide) notFound();

  const pageUrl = `${SITE_URL}/international/${country}/how-to-apply`;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "By country", href: "/international" },
    { label: c.name, href: `/international/${country}` },
    { label: "How to apply" },
  ];

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.metaTitle,
      description: guide.metaDescription,
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      datePublished: `${guide.lastVerified}T00:00:00Z`,
      dateModified: `${guide.lastVerified}T00:00:00Z`,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    breadcrumbJsonLd(breadcrumbs),
    faqJsonLd(guide.faq),
  ];

  const related = [
    { href: `/international/${country}`, label: `Study in Australia from ${c.name}` },
    { href: "/deadlines/february-2027-intake", label: "February 2027 intake deadlines" },
    { href: "/visas/student-500", label: "Student visa (subclass 500) explained" },
    { href: "/guides/documents-checklist-for-an-australian-student-visa", label: "Student visa documents checklist" },
    { href: "/guides/proving-funds-for-an-australian-student-visa", label: "Proving funds for the student visa" },
    { href: "/guides/genuine-student-requirement-how-to-write-your-statement", label: "Writing your Genuine Student statement" },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-wide text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          Applying from {c.name}
        </p>
        <h1 className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          <span aria-hidden="true">{flagEmoji(c.code)}</span>
          <span>How to apply to an Australian university from {c.name}</span>
        </h1>
      </div>

      <div className="mt-6 flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
        {guide.intro.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <p>
          For what a year costs and the pathway after you graduate, see the{" "}
          <Link
            href={`/international/${country}`}
            className="font-medium text-status-open underline underline-offset-2"
          >
            Study in Australia from {c.name} overview
          </Link>
          .
        </p>
      </div>

      <ProfileSection title="The steps, in order">
        <ol className="flex flex-col gap-6">
          {guide.steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ink font-utility text-xs font-semibold text-paper">
                {i + 1}
              </span>
              <div className="flex flex-col gap-2">
                <p className="font-body text-base font-semibold text-ink">
                  {step.title}
                </p>
                {step.body.map((para) => (
                  <p
                    key={para.slice(0, 24)}
                    className="font-body text-sm leading-relaxed text-slate"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </ProfileSection>

      <ProfileSection title="Documents checklist">
        <div className="grid gap-4 sm:grid-cols-2">
          {guide.documents.map((group) => (
            <div
              key={group.group}
              className="rounded-xl border border-line bg-mist p-4"
            >
              <p className="font-utility text-xs font-semibold tracking-wide text-slate uppercase">
                {group.group}
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 font-body text-sm text-ink"
                  >
                    <span className="text-status-open">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="A working timeline for a February intake">
        <p className="mb-4 font-body text-sm text-slate">
          Semester 1 courses start in late February or early March. Working back
          from that, and allowing for the checks specific to {c.name}:
        </p>
        <ol className="flex flex-col gap-3">
          {guide.timeline.map((row) => (
            <li
              key={row.when}
              className="flex flex-col gap-0.5 border-l-2 border-status-open/30 pl-4 sm:flex-row sm:gap-4"
            >
              <span className="font-utility text-xs font-semibold tracking-wide text-status-open uppercase sm:w-40 sm:flex-shrink-0">
                {row.when}
              </span>
              <span className="font-body text-sm text-ink">{row.task}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 font-body text-sm text-slate">
          See the{" "}
          <Link
            href="/deadlines/february-2027-intake"
            className="font-medium text-status-open underline underline-offset-2"
          >
            February 2027 intake deadlines
          </Link>{" "}
          for the per-university dates.
        </p>
      </ProfileSection>

      <ProfileSection title={`Where ${c.demonym} applications go wrong`}>
        <ul className="flex flex-col gap-2">
          {guide.pitfalls.map((p) => (
            <li key={p.slice(0, 24)} className="flex gap-2 font-body text-sm text-ink">
              <span className="text-status-closed">·</span>
              {p}
            </li>
          ))}
        </ul>
      </ProfileSection>

      <FaqSection
        heading={`Applying from ${c.name}: common questions`}
        items={guide.faq}
      />

      <div className="mt-10">
        <LastVerified date={guide.lastVerified} sources={guide.sources} />
      </div>

      <RelatedLinks
        items={related}
        className="mt-10 border-t border-ink/10 pt-8"
      />

      <p className="mt-8 font-body text-xs text-slate">
        This is general information for {c.demonym} applicants, not migration
        advice. Fees, visa rules, attestation processes, and university
        requirements change. Confirm every step with the university and the
        Australian Government before you rely on it.
      </p>
    </main>
  );
}
