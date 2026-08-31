import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqSection } from "@/components/site/FaqSection";
import { LastVerified } from "@/components/site/LastVerified";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { WhyTrust } from "@/components/site/WhyTrust";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { VisasBrowser } from "@/components/site/VisasBrowser";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import { itemListJsonLd } from "@/lib/itemlist-jsonld";
import { listPublishedVisas, type PublicVisaListRow } from "@/lib/queries/public-visas";
import { VISA_CATEGORY_LABELS, VISA_CATEGORY_ORDER } from "@/lib/visa-categories";

export const revalidate = 3600;

export const metadata = {
  title: "Australian Student & Skilled Visa Subclasses Explained",
  description:
    "Every Australian visa subclass an international student meets, from the student visa (subclass 500) to the graduate and skilled visas that follow. Plain-English breakdowns of eligibility, points, cost, and the pathway to permanent residence, each figure dated and sourced.",
  alternates: { canonical: "/visas" },
};

// The visas that make up the standard study-to-stay sequence, in order. Codes
// are resolved against the live dataset so a card only renders if that
// subclass is published.
const PATHWAY_STEPS: { code: string; role: string }[] = [
  { code: "500", role: "Study" },
  { code: "485", role: "Work after study" },
  { code: "189", role: "Permanent residence (independent)" },
];

// The core visas an international student compares when planning ahead.
const COMPARISON_CODES = ["500", "485", "189", "190", "491"];

function byCode(visas: PublicVisaListRow[], code: string) {
  return visas.find((v) => v.code === code) ?? null;
}

function hubFaq(student500: PublicVisaListRow | null): FaqItem[] {
  const items: FaqItem[] = [
    {
      q: "What visa do I need to study in Australia?",
      a: "The student visa, subclass 500. One student visa covers your whole course, including a packaged pathway such as an ELICOS or foundation program feeding into a degree. You apply from outside or inside Australia and must hold Overseas Student Health Cover for the full visa period.",
    },
    {
      q: "How much does the Australian student visa cost?",
      a: student500?.base_application_charge
        ? `The base application charge for the subclass 500 student visa is ${student500.base_application_charge}. Charges are re-indexed on 1 July each year, and family members included in the application pay extra. See the subclass 500 page for the current figure and its source.`
        : "See the subclass 500 page for the current base application charge; it is re-indexed on 1 July each year.",
    },
    {
      q: "Can I stay in Australia after I finish my degree?",
      a: "Yes. The Temporary Graduate visa (subclass 485) lets recent graduates live and work in Australia temporarily after completing an eligible qualification. How long it lasts depends on your qualification level and, for some applicants, where you studied.",
    },
    {
      q: "Which visa leads to permanent residence after studying?",
      a: "The permanent options most graduates target are the points-tested skilled visas: subclass 189 (independent), 190 (state-nominated), and 491 (regional, a provisional visa that leads to the permanent 191). Employer sponsorship through subclass 482 to 186 is the other main route. All require a positive skills assessment and, for the points-tested visas, an invitation through SkillSelect.",
    },
    {
      q: "Are student visas points-tested?",
      a: "No. The points test applies only to the skilled migration visas (189, 190, 491). The student visa is assessed on the Genuine Student requirement, financial capacity, English, health, and character, not on a points score.",
    },
    {
      q: "How often does Australia issue skilled visa invitations?",
      a: "The Department of Home Affairs runs SkillSelect invitation rounds, usually monthly, issuing invitations to apply for the 189, 190, and 491 visas above a points cut-off that varies by round and occupation. Our invitation-rounds tracker has the round-by-round history.",
    },
  ];
  return items;
}

export default async function VisasIndexPage() {
  const visas = await listPublishedVisas();

  const presentCategories = new Set(visas.map((v) => v.category));
  const groups = [
    ...VISA_CATEGORY_ORDER.filter((c) => presentCategories.has(c)),
    ...[...presentCategories].filter((c) => !VISA_CATEGORY_ORDER.includes(c)),
  ].map((key) => ({ key, label: VISA_CATEGORY_LABELS[key] ?? key }));

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Visas" }];

  const pathway = PATHWAY_STEPS.map((s) => ({ ...s, visa: byCode(visas, s.code) })).filter(
    (s) => s.visa,
  );
  const comparison = COMPARISON_CODES.map((c) => byCode(visas, c)).filter(
    (v): v is PublicVisaListRow => v != null,
  );
  const lastVerified = visas
    .map((v) => v.last_verified_at)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1) ?? null;

  const faqItems = hubFaq(byCode(visas, "500"));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      {visas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              itemListJsonLd({
                name: "Australian student, graduate, and skilled visa subclasses",
                items: visas.map((v) => ({ path: `/visas/${v.slug}`, name: v.name })),
              }),
            ),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Australian student and skilled visa subclasses
      </h1>
      <div className="mt-3 flex flex-col gap-3 font-body text-base text-slate">
        <p>
          Studying in Australia starts with one visa, the{" "}
          <Link href="/visas/student-500" className="text-status-open underline underline-offset-2">
            student visa (subclass 500)
          </Link>
          . If you decide to stay on after your course, a sequence of graduate
          and skilled visas follows. This page maps that sequence and links each
          subclass to a full breakdown of its eligibility, cost, and processing
          time.
        </p>
        <p className="text-[0.95rem]">
          Immigration rules change often. Treat this page as orientation and
          confirm current detail on each subclass page and its cited sources.
          {lastVerified && (
            <>
              {" "}
              Figures were last checked against official sources on{" "}
              {new Date(lastVerified).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              .
            </>
          )}
        </p>
      </div>

      {pathway.length > 1 && (
        <section className="mt-10">
          <h2 className="mb-1 font-display text-xl font-semibold text-ink">
            The study-to-PR pathway
          </h2>
          <p className="mb-4 font-body text-[0.95rem] text-slate">
            The standard route from arriving as a student to permanent residence.
            Not everyone follows every step, and the employer-sponsored route
            (subclass 482 to 186) is a common alternative.
          </p>
          <ol className="flex flex-col gap-3">
            {pathway.map((step, i) => (
              <li key={step.code}>
                <Link
                  href={`/visas/${step.visa!.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-status-open/10 font-utility text-sm font-semibold text-status-open">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
                      {step.role}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-display text-lg font-semibold text-ink group-hover:underline">
                        {step.visa!.name}
                      </span>
                      <span className="font-utility text-xs text-slate">
                        Subclass {step.code}
                      </span>
                    </span>
                    {step.visa!.short_description && (
                      <span className="mt-0.5 block font-body text-sm text-slate">
                        {step.visa!.short_description}
                      </span>
                    )}
                  </span>
                  <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                </Link>
              </li>
            ))}
          </ol>
          <Link
            href="/guides/study-to-permanent-residence-pathway-australia"
            className="mt-3 inline-flex items-center gap-1.5 font-body text-sm text-status-open underline underline-offset-2 hover:text-ink"
          >
            Read the full pathway guide, with timelines and a worked points example
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link
          href="/visas/points-calculator"
          className="flex items-center justify-between gap-3 rounded-2xl border border-status-open/30 bg-status-open/5 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <span>
            <span className="font-display text-lg font-semibold text-ink">
              Points calculator
            </span>
            <span className="mt-1 block font-body text-sm text-slate">
              Add up your score for the 189, 190, and 491 skilled visas.
            </span>
          </span>
          <ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-slate" />
        </Link>
        <Link
          href="/visas/invitation-rounds"
          className="flex items-center justify-between gap-3 rounded-2xl border border-status-pending/30 bg-status-pending/5 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <span>
            <span className="font-display text-lg font-semibold text-ink">
              Invitation rounds
            </span>
            <span className="mt-1 block font-body text-sm text-slate">
              Round-by-round history of invitations issued and points cut-offs.
            </span>
          </span>
          <ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-slate" />
        </Link>
      </div>

      {comparison.length >= 2 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">
            The core visas at a glance
          </h2>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[40rem] border-collapse text-left font-body text-sm">
              <thead>
                <tr className="border-b border-line bg-mist">
                  <th className="px-4 py-3 font-utility text-xs font-semibold tracking-wide text-slate uppercase">
                    Visa
                  </th>
                  <th className="px-4 py-3 font-utility text-xs font-semibold tracking-wide text-slate uppercase">
                    Stay
                  </th>
                  <th className="px-4 py-3 font-utility text-xs font-semibold tracking-wide text-slate uppercase">
                    Points-tested
                  </th>
                  <th className="px-4 py-3 font-utility text-xs font-semibold tracking-wide text-slate uppercase">
                    Base charge
                  </th>
                  <th className="px-4 py-3 font-utility text-xs font-semibold tracking-wide text-slate uppercase">
                    Leads to PR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {comparison.map((v) => (
                  <tr key={v.slug}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/visas/${v.slug}`}
                        className="font-medium text-ink underline decoration-slate/30 underline-offset-2 hover:decoration-ink"
                      >
                        {v.name}
                      </Link>
                      <span className="mt-0.5 block font-utility text-xs text-slate">
                        Subclass {v.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate">{v.stay_period ?? "—"}</td>
                    <td className="px-4 py-3 text-slate">
                      {v.is_points_tested
                        ? v.min_points != null
                          ? `Yes (floor ${v.min_points})`
                          : "Yes"
                        : "No"}
                    </td>
                    <td className="px-4 py-3 text-slate">
                      {v.base_application_charge ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate">
                      {v.leads_to_pr ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 font-utility text-xs text-slate">
            Charges re-index on 1 July each year. Figures on each subclass page
            carry their own source and verification date.
          </p>
        </section>
      )}

      {visas.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No visa subclasses published yet.
        </p>
      ) : (
        <VisasBrowser visas={visas} groups={groups} />
      )}

      <FaqSection heading="Australian visas: common questions" items={faqItems} />

      <RelatedLinks
        className="mt-12"
        items={[
          {
            href: "/guides/study-to-permanent-residence-pathway-australia",
            label: "The study-to-PR pathway, step by step",
          },
          {
            href: "/guides/proving-funds-for-an-australian-student-visa",
            label: "Proving you can afford to study in Australia",
          },
          {
            href: "/guides/working-while-you-study-in-australia",
            label: "Working while you study: the 48-hour rule",
          },
          {
            href: "/guides/what-to-do-if-your-student-visa-is-refused",
            label: "What to do if your student visa is refused",
          },
          {
            href: "/international",
            label: "How the student visa works for applicants from your country",
          },
          {
            href: "/guides/how-the-australian-points-test-works",
            label: "How the skilled migration points test works",
          },
        ]}
      />

      <WhyTrust className="mt-10" />
      <div className="mt-6">
        <LastVerified date={lastVerified} />
      </div>
    </main>
  );
}
