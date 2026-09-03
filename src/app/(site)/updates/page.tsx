import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
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

      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Australia student &amp; visa updates
      </h1>
      <p className="mt-3 font-body text-base text-slate">
        A dated log of policy changes that affect applying to study in
        Australia: student visa charges, processing priorities, post-study
        work, English-test recognition, and the international-student planning
        level. Every entry links its official source and carries the date we
        last checked it.
      </p>

      {latest && (
        <div className="mt-8 rounded-2xl border border-status-open/30 bg-status-open/5 p-5">
          <p className="font-body text-xs font-semibold tracking-widest text-status-open uppercase">
            Latest update
          </p>
          <h2
            id={`${latest.slug}-latest`}
            className="mt-2 font-display text-xl font-semibold text-ink"
          >
            {latest.title}
          </h2>
          <p className="mt-1 font-utility text-xs text-slate">
            Announced {fmtDate(latest.announced_date)}
            {effectiveLabel(latest.effective_date)
              ? ` · ${effectiveLabel(latest.effective_date)}`
              : ""}
          </p>
          <p className="mt-3 font-body text-sm text-ink">{latest.summary}</p>
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
              <h2 className="mb-4 font-body text-xs font-semibold tracking-widest text-slate uppercase">
                {year}
              </h2>
              <div className="flex flex-col gap-8">
                {byYear.get(year)!.map((u) => (
                  <article
                    key={u.slug}
                    id={u.slug}
                    className="scroll-mt-24 border-l-2 border-line pl-4"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-utility text-xs text-slate">
                      <time dateTime={u.announced_date}>
                        {fmtDate(u.announced_date)}
                      </time>
                      <span className="rounded-sm border border-line bg-mist px-1.5 py-0.5 tracking-wide text-slate uppercase">
                        {CATEGORY_LABEL[u.category]}
                      </span>
                      {u.is_estimated && (
                        <span className="text-status-pending">estimate</span>
                      )}
                      {effectiveLabel(u.effective_date) && (
                        <span>{effectiveLabel(u.effective_date)}</span>
                      )}
                    </div>

                    <h3 className="mt-1.5 font-body text-lg font-semibold text-ink">
                      {u.title}
                    </h3>
                    <p className="mt-1.5 font-body text-sm leading-relaxed text-slate">
                      {u.summary}
                    </p>

                    {u.impact && (
                      <p className="mt-2 font-body text-sm leading-relaxed text-ink">
                        <span className="font-semibold">What to do: </span>
                        {u.impact}
                      </p>
                    )}

                    {u.affects && u.affects.length > 0 && (
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {u.affects.map((a) => (
                          <li
                            key={a}
                            className="rounded-full border border-line bg-mist px-2.5 py-0.5 font-body text-xs text-slate"
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-utility text-xs text-slate">
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
                          className="font-medium text-status-open underline underline-offset-2"
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

      <div className="mt-12 rounded-2xl border border-line bg-mist p-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          How to use this page
        </h2>
        <p className="mt-2 font-body text-sm text-slate">
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
          .
        </p>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink">
          Common questions
        </h2>
        <dl className="mt-4 flex flex-col gap-6">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-body text-base font-semibold text-ink">
                {f.q}
              </dt>
              <dd className="mt-1 font-body text-sm text-slate">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10">
        <LastVerified date={latestVerified} sources={allSources} />
      </div>
    </main>
  );
}
