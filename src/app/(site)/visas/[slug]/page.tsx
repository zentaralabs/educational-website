import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { ArrowUpRightIcon, CheckBadgeIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { FaqSection } from "@/components/site/FaqSection";
import { Fact, FactGrid } from "@/components/site/FactGrid";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  EligibilityChecklist,
  VisaStreams,
  type VisaStream,
} from "@/components/site/visa-blocks";
import { faqJsonLd, visaFaq } from "@/lib/faq";
import { RELATED_LIMIT, visaRelated } from "@/lib/related-content";
import { SITE_YEAR } from "@/lib/site-config";
import { extractFaqItems } from "@/lib/extract-faq";
import { authorInitials } from "@/lib/format";
import {
  getPublishedVisa,
  listPublishedInvitationRounds,
  listPublishedVisaSlugs,
} from "@/lib/queries/public-visas";
import { VISA_CATEGORY_LABELS } from "@/lib/visa-categories";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listPublishedVisaSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const visa = await getPublishedVisa(slug);
  if (!visa) return {};
  // Lead with "Subclass NNN" — that, not the Department's full official name,
  // is what people type. The old title spent its first 55 characters on
  // "Skilled Employer Sponsored Regional (Provisional) visa" and pushed the
  // subclass number out of the visible part of the snippet entirely.
  //
  // `meta_title` overrides that lead for rows where the code is not the query.
  // The bridging row spans 010/020/030, a string nobody searches, so it leads
  // with "Bridging visa" instead. See 0028_add_visa_meta_title.sql.
  const title = composeTitle(
    visa.meta_title ?? `Subclass ${visa.code} Visa`,
    [
      `Eligibility, ${visa.is_points_tested ? "Points" : "Requirements"} & Cost ${SITE_YEAR}`,
      `Eligibility & Cost ${SITE_YEAR}`,
      `${SITE_YEAR} Guide`,
    ],
  );
  const description =
    visa.short_description ??
    visa.summary ??
    `${visa.name} (subclass ${visa.code}): who it is for, eligibility, cost, processing time, and the pathway to permanent residence.`;
  return pageMetadata({
    title,
    description,
    path: `/visas/${slug}`,
    type: "article",
  });
}

export default async function VisaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const visa = await getPublishedVisa(slug);
  if (!visa) notFound();

  const rounds = visa.is_points_tested
    ? await listPublishedInvitationRounds({ visaCode: visa.code, limit: 6 })
    : [];

  const streams = (visa.streams as VisaStream[] | null) ?? null;

  const contentFaq = (
    visa.content ? extractFaqItems(visa.content) : []
  ).map((f) => ({ q: f.question, a: f.answer }));
  const faqItems = [...visaFaq(visa), ...contentFaq];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Visas", href: "/visas" },
    { label: `Subclass ${visa.code}` },
  ];

  const jsonLdBlocks: Record<string, unknown>[] = [breadcrumbJsonLd(breadcrumbs)];
  if (faqItems.length > 0) {
    jsonLdBlocks.push(faqJsonLd(faqItems));
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-8 pb-16">
      {jsonLdBlocks.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          Subclass {visa.code}
          {" · "}
          {VISA_CATEGORY_LABELS[visa.category] ?? visa.category}
          {visa.stream && ` · ${visa.stream}`}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          {visa.name}
        </h1>
        {visa.summary && (
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink/90 sm:text-lg">
            {visa.summary}
          </p>
        )}
        {visa.author && (
          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink font-utility text-xs font-semibold text-paper">
              {authorInitials(visa.author.name)}
            </span>
            <p className="font-body text-sm text-slate">
              By <span className="font-medium text-ink">{visa.author.name}</span>
              {visa.author.credentials && `, ${visa.author.credentials}`}
              {visa.reviewed_by && <>, reviewed by {visa.reviewed_by.name}</>}
            </p>
          </div>
        )}
      </div>

      <FactGrid>
        <Fact label="Stay period" value={visa.stay_period} />
        <Fact
          label="Permanent residence"
          value={
            visa.leads_to_pr
              ? "Yes, PR or a pathway to it"
              : "No, temporary only"
          }
        />
        <Fact
          label="Points tested"
          value={
            visa.is_points_tested
              ? `Yes${visa.min_points != null ? `, ${visa.min_points} points needed to be invited` : ""}`
              : "No"
          }
        />
        <Fact label="Age limit" value={visa.age_limit} />
        <Fact label="Base application charge" value={visa.base_application_charge} />
        <Fact label="Processing time" value={visa.processing_time} />
        <Fact label="English requirement" value={visa.english_requirement} />
        <Fact
          label="Work experience"
          value={visa.work_experience_requirement}
        />
        <Fact label="Skilled occupation list" value={visa.occupation_list} />
      </FactGrid>

      {/* Eligibility checklist + streams sidebar. A two-column grid only when
          the visa actually has streams to show alongside; otherwise the
          checklist runs in the contained reading column. */}
      {(() => {
        const hasChecklist = Boolean(
          visa.eligibility && visa.eligibility.includes("\n- "),
        );
        const eligibilityBlock = hasChecklist ? (
          <EligibilityChecklist
            content={visa.eligibility as string}
            heading="Who it's for"
          />
        ) : visa.eligibility ? (
          <section>
            <SectionHeading>Who it&rsquo;s for</SectionHeading>
            <GuideContent content={visa.eligibility} />
          </section>
        ) : null;

        if (streams && streams.length > 0) {
          return (
            <div className="mt-10 grid items-start gap-x-10 gap-y-8 lg:grid-cols-[1.6fr_1fr]">
              <div>{eligibilityBlock}</div>
              <VisaStreams streams={streams} />
            </div>
          );
        }
        return <div className="mt-10 max-w-2xl">{eligibilityBlock}</div>;
      })()}

      {visa.pr_pathway && (
        <section className="mt-10 max-w-2xl">
          <SectionHeading>Pathway to permanent residence</SectionHeading>
          <p className="font-body text-base leading-relaxed text-ink">
            {visa.pr_pathway}
          </p>
        </section>
      )}

      {visa.content && (
        <section className="mt-10 max-w-2xl">
          <GuideContent content={visa.content} />
        </section>
      )}

      {visa.conditions && (
        <section className="mt-10 max-w-2xl">
          <SectionHeading>Visa conditions</SectionHeading>
          <GuideContent content={visa.conditions} />
        </section>
      )}

      <FaqSection
        grid
        heading={`${visa.name} (subclass ${visa.code}): common questions`}
        items={faqItems}
      />

      {rounds.length > 0 && (
        <section className="mt-10 border-t border-ink/10 pt-6">
          <div className="flex items-baseline justify-between gap-3">
            <SectionHeading className="mb-0">
              Recent invitation rounds
            </SectionHeading>
            <Link
              href="/visas/invitation-rounds"
              className="font-body text-sm text-status-open underline underline-offset-2"
            >
              Full history
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse font-utility text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-left text-xs tracking-wide text-slate uppercase">
                  <th className="py-2 pr-4 font-semibold">Round</th>
                  <th className="py-2 pr-4 font-semibold">Stream</th>
                  <th className="py-2 pr-4 font-semibold">Invitations</th>
                  <th className="py-2 font-semibold">Min points</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.id} className="border-b border-ink/10">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(r.round_date).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {r.is_estimated && (
                        <span className="ml-1 text-status-pending">(est.)</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{r.stream ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {r.invitations_issued?.toLocaleString("en-AU") ?? "—"}
                    </td>
                    <td className="py-2">{r.min_points ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-body text-sm text-slate">
            Not sure where you stand?{" "}
            <Link
              href="/visas/points-calculator"
              className="text-status-open underline underline-offset-2"
            >
              Work out your points
            </Link>{" "}
            for the {visa.code} and related visas.
          </p>
        </section>
      )}

      <RelatedLinks
        className="mt-12 border-t border-ink/10 pt-6"
        heading="Related guides and visas"
        items={visaRelated(slug).slice(0, RELATED_LIMIT)}
      />

      <div className="mt-10 flex items-center gap-2 rounded-xl bg-status-open/5 px-4 py-3">
        <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-status-open" />
        <LastVerified date={visa.last_verified_at} sources={visa.source_urls} />
      </div>

      <p className="mt-6 font-body text-xs text-slate">
        This is general information, not immigration advice. Visa criteria change
        often, so always confirm the current rules on the Department of Home
        Affairs website or with a registered migration agent before you apply.
      </p>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <Link
          href="/visas"
          className="group inline-flex items-center gap-2 font-body text-sm font-medium text-ink"
        >
          <ArrowUpRightIcon className="h-3.5 w-3.5 rotate-[225deg] text-slate transition-colors group-hover:text-status-open" />
          All visa subclasses
        </Link>
      </div>
    </main>
  );
}
