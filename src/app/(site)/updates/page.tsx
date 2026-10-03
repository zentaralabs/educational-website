import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqSection } from "@/components/site/FaqSection";
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

  const byYear = new Map<string, typeof updates>();
  for (const u of updates) {
    const year = u.announced_date.slice(0, 4);
    const list = byYear.get(year) ?? [];
    list.push(u);
    byYear.set(year, list);
  }
  const years = [...byYear.keys()].sort().reverse();

  const latest = updates.find((u) => !u.is_estimated) ?? updates[0] ?? null;
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

      {latest && (
        <div className="mt-8 rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/[0.08] to-sun/[0.12] p-6 sm:p-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-coral px-3 py-1 font-utility text-xs font-semibold tracking-wider text-white uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Latest update
          </p>
          <h2
            id={`${latest.slug}-latest`}
            className="mt-3 font-display text-2xl font-semibold text-ink text-balance"
          >
            {latest.title}
          </h2>
          <p className="mt-2 font-utility text-sm text-slate">
            Announced {fmtDate(latest.announced_date)}
            {effectiveLabel(latest.effective_date)
              ? ` · ${effectiveLabel(latest.effective_date)}`
              : ""}
          </p>
          <p className="mt-4 font-body text-base leading-relaxed text-ink">{latest.summary}</p>
        </div>
      )}

      {updates.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No updates logged yet.
        </p>
      ) : (
        <div className="mt-12 flex flex-col gap-10">
          {years.map((year) => (
            <section key={year}>
              <h2 className="mb-5 inline-block rounded-full bg-ink px-4 py-1 font-utility text-sm font-semibold tracking-wider text-paper">
                {year}
              </h2>
              <div className="flex flex-col gap-5">
                {byYear.get(year)!.map((u) => (
                  <article
                    key={u.slug}
                    id={u.slug}
                    className="scroll-mt-24 rounded-2xl border border-line bg-paper p-5 shadow-card sm:p-6"
                    style={{
                      borderLeft: `5px solid ${CATEGORY_COLOR[u.category]}`,
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-utility text-sm text-slate">
                      <span
                        className="rounded-full px-3 py-0.5 text-xs font-semibold tracking-wide text-white uppercase"
                        style={{ background: CATEGORY_COLOR[u.category] }}
                      >
                        {CATEGORY_LABEL[u.category]}
                      </span>
                      <time dateTime={u.announced_date} className="font-semibold text-ink">
                        {fmtDate(u.announced_date)}
                      </time>
                      {u.is_estimated && (
                        <span className="text-status-pending">estimate</span>
                      )}
                      {effectiveLabel(u.effective_date) && (
                        <span>{effectiveLabel(u.effective_date)}</span>
                      )}
                    </div>

                    <h3 className="mt-3 font-display text-xl font-semibold text-ink text-balance sm:text-2xl">
                      {u.title}
                    </h3>
                    <p className="mt-2 font-body text-base leading-relaxed text-ink/85">
                      {u.summary}
                    </p>

                    {u.impact && (
                      <p className="mt-4 rounded-xl border border-teal/30 bg-teal/[0.08] px-4 py-3 font-body text-base leading-relaxed text-ink">
                        <span className="font-semibold text-teal">What to do: </span>
                        {u.impact}
                      </p>
                    )}

                    {u.affects && u.affects.length > 0 && (
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {u.affects.map((a) => (
                          <li
                            key={a}
                            className="rounded-full border border-line bg-mist px-3 py-1 font-body text-sm text-slate"
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 font-utility text-sm text-slate">
                      {u.source_urls.length > 0 && (
                        <span className="flex flex-wrap items-center gap-x-1.5">
                          Source:
                          {u.source_urls.map((url, i) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="underline decoration-slate/40 underline-offset-2 hover:text-ink hover:decoration-ink"
                            >
                              [{i + 1}]
                            </a>
                          ))}
                        </span>
                      )}
                      {u.last_verified_at && (
                        <span>
                          Verified{" "}
                          <time dateTime={u.last_verified_at}>
                            {fmtDate(u.last_verified_at)}
                          </time>
                        </span>
                      )}
                      {u.detail_url && (
                        <Link
                          href={u.detail_url}
                          className="font-semibold text-brand underline underline-offset-2"
                        >
                          Read our analysis &rarr;
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
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
