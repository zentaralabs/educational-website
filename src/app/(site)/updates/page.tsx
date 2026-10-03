import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqSection } from "@/components/site/FaqSection";
import { UpdatesLog } from "@/components/site/UpdatesLog";
import { LastVerified } from "@/components/site/LastVerified";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import { itemListJsonLd } from "@/lib/itemlist-jsonld";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";
import { listPublishedPolicyUpdates } from "@/lib/queries/public-policy-updates";
import type { PolicyUpdateCategory } from "@/lib/supabase/types";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Australia Student & Visa Policy Updates",
  description:
    "A dated, sourced log of Australian policy changes that affect people applying to study here: student visa charges, processing priorities, post-study work, English tests, and planning levels. Every entry links its official source.",
  path: "/updates",
  type: "website",
});

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Updates" },
];

const CATEGORY_LABEL: Record<PolicyUpdateCategory, string> = {
  "student-visa": "Student visa",
  "post-study-work": "Post-study work",
  "fees-and-charges": "Fees & charges",
  "english-language": "English tests",
  "pr-pathway": "PR pathway",
  "university-sector": "University sector",
  other: "Policy",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function effectiveLabel(effective: string | null): string | null {
  if (!effective) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(effective) > now
    ? `Takes effect ${fmtDate(effective)}`
    : `In effect since ${fmtDate(effective)}`;
}

/* One colour per policy area, so the log is scannable at a glance. */
const CATEGORY_COLOR: Record<PolicyUpdateCategory, string> = {
  "student-visa": "var(--color-brand)",
  "post-study-work": "var(--color-teal)",
  "fees-and-charges": "var(--color-sun)",
  "english-language": "var(--color-violet)",
  "pr-pathway": "var(--color-coral)",
  "university-sector": "var(--color-slate)",
  other: "var(--color-slate)",
};

const faq: FaqItem[] = [
  {
    q: "How often is this page updated?",
    a: "Whenever a change lands that affects applicants: a visa charge, a Ministerial Direction, post-study work rules, English-test recognition, a planning level, or university-sector policy. Each entry carries the date it was last checked against the official source. Quiet months mean nothing new to report, not that the page has stopped being maintained.",
  },
  {
    q: "Are these official?",
    a: "Every entry links the primary source it is drawn from, almost always immi.homeaffairs.gov.au or education.gov.au. We summarise the change and say who it affects; the linked page is the authority. Where a figure is not yet on an official page we say so and mark the entry as an estimate.",
  },
  {
    q: "Does a change here apply to my application?",
    a: "It depends on when you lodge and, for processing priorities, on your education provider. Read the entry's summary, then confirm the detail against the official source and, if in doubt, a registered migration agent. This page is a starting point, not advice on your specific case.",
  },
];

export default async function UpdatesPage() {
  const updates = await listPublishedPolicyUpdates();

  const latestVerified =
    updates
      .map((u) => u.last_verified_at)
      .filter((d): d is string => Boolean(d))
      .sort()
      .at(-1) ?? null;
  const allSources = [...new Set(updates.flatMap((u) => u.source_urls))];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={itemListJsonLd({
          name: "Australia student and visa policy updates",
          items: updates.map((u) => ({
            path: `/updates#${u.slug}`,
            name: u.title,
          })),
        })}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div className="page-hero">
        <p className="page-eyebrow">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {updates.length} dated, sourced changes
        </p>
        <h1 className="page-title">Australia student &amp; visa updates</h1>
        <p>
          A dated log of policy changes that affect applying to study in
          Australia: student visa charges, processing priorities, post-study
          work, English-test recognition, and the international-student
          planning level. Every entry links its official source and carries the
          date we last checked it.
        </p>
      </div>

      {updates.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No updates logged yet.
        </p>
      ) : (
        <div className="mt-10">
          <UpdatesLog
            items={updates.map((u, idx) => ({
              slug: u.slug,
              title: u.title,
              summary: u.summary,
              impact: u.impact ?? null,
              category: u.category,
              categoryLabel: CATEGORY_LABEL[u.category],
              color: CATEGORY_COLOR[u.category],
              announced: u.announced_date,
              announcedLabel: fmtDate(u.announced_date),
              effectiveLabel: effectiveLabel(u.effective_date),
              estimated: u.is_estimated,
              affects: u.affects ?? [],
              sources: u.source_urls,
              verifiedLabel: u.last_verified_at ? fmtDate(u.last_verified_at) : null,
              verifiedIso: u.last_verified_at ?? null,
              detailUrl: u.detail_url ?? null,
              isNewest: idx === 0,
            }))}
          />
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-line bg-mist p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          How to use this page
        </h2>
        <p className="mt-2 font-body text-base leading-relaxed text-slate">
          Each entry summarises one change and links the official page it comes
          from. Whether a change applies to you usually depends on when you
          lodge, and for processing priorities on your education provider.
          Confirm the detail against the source before you rely on it. For the
          SkillSelect skilled-migration rounds, see the{" "}
          <Link
            href="/visas/invitation-rounds"
            className="font-medium text-status-open underline underline-offset-2"
          >
            invitation rounds tracker
          </Link>
          . For the fuller story behind an individual entry — not just what
          changed but what it means for applicants — check the{" "}
          <Link
            href="/blog"
            className="font-medium text-status-open underline underline-offset-2"
          >
            blog
          </Link>{" "}
          for a matching analysis, linked from this page as &ldquo;Read our
          analysis&rdquo; where one exists.
        </p>
      </div>

      <FaqSection heading="Common questions" items={faq} />

      <div className="mt-10">
        <LastVerified date={latestVerified} sources={allSources} />
      </div>
    </main>
  );
}
