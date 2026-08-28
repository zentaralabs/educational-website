import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LastVerified } from "@/components/site/LastVerified";
import { InvitationVolumeChart } from "@/components/site/InvitationVolumeChart";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd, type FaqItem } from "@/lib/faq";
import { listPublishedInvitationRounds } from "@/lib/queries/public-visas";

export const revalidate = 3600;

export const metadata = {
  title: "SkillSelect invitation rounds: history and points cut-offs",
  description:
    "Every Australian SkillSelect invitation round since 2022: dates, invitations issued, and the minimum points cut-off for the subclass 189 and 491 skilled visas, with the latest round highlighted.",
  alternates: { canonical: "/visas/invitation-rounds" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Visas", href: "/visas" },
  { label: "Invitation rounds" },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function InvitationRoundsPage() {
  const rounds = await listPublishedInvitationRounds();

  const byYear = new Map<string, typeof rounds>();
  for (const r of rounds) {
    const year = r.program_year ?? "Other";
    const list = byYear.get(year) ?? [];
    list.push(r);
    byYear.set(year, list);
  }
  const years = [...byYear.keys()].sort().reverse();

  const latestVerified =
    rounds.map((r) => r.last_verified_at).filter(Boolean).sort().reverse()[0] ??
    null;
  const sources = [
    ...new Set(rounds.map((r) => r.source_url).filter((u): u is string => !!u)),
  ];

  // Most recent round that has actually happened.
  const latestActual = rounds.find((r) => !r.is_estimated) ?? null;

  // Subclass 189 rounds, oldest first, for the volume chart.
  const chartBars = rounds
    .filter((r) => r.visa_code === "189" && r.invitations_issued != null)
    .map((r) => ({
      date: r.round_date,
      invitations: r.invitations_issued as number,
      isEstimated: r.is_estimated,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const actual189 = rounds.filter(
    (r) => r.visa_code === "189" && !r.is_estimated && r.invitations_issued != null,
  );
  const minVol = actual189.length
    ? Math.min(...actual189.map((r) => r.invitations_issued as number))
    : null;
  const maxVol = actual189.length
    ? Math.max(...actual189.map((r) => r.invitations_issued as number))
    : null;

  const faq: FaqItem[] = [
    {
      q: "How often are subclass 189 invitation rounds held?",
      a: "It has changed. Through the 2022-23 program year rounds ran roughly monthly while the department cleared a backlog. In 2023-24 there were only two 189 rounds, in December 2023 and June 2024. Since the 2025-26 year the department has settled on a roughly quarterly pattern, with rounds in August, November, and June. Dates are never announced in advance.",
    },
    latestActual
      ? {
          q: "What was the minimum points score in the most recent round?",
          a: `The pool pass mark is 65 points and every round to date has invited from 65 for the most in-demand occupations, mostly trades. The ${fmtDate(
            latestActual.round_date,
          )} round for the subclass ${latestActual.visa_code} was no different: 65 at the floor, rising through the 80s for health and engineering and to about 100 for ICT and accounting.`,
        }
      : null,
    {
      q: "Why do ICT and accounting applicants need 95 or more when the pass mark is 65?",
      a: "Each occupation group has an annual ceiling on how many people can be invited. Accounting, ICT, and engineering attract far more high-scoring expressions of interest than their ceilings allow, so the department works down from the top and the effective cut-off for those occupations sits well above the 65-point floor. Trades occupations receive fewer applications, so they clear near the floor.",
    },
    minVol != null && maxVol != null
      ? {
          q: "How many invitations does a 189 round issue?",
          a: `It varies widely with how many applications are on hand and the size of that year's skilled migration allocation. Recent 189 rounds have ranged from about ${minVol.toLocaleString(
            "en-AU",
          )} invitations up to ${maxVol.toLocaleString(
            "en-AU",
          )}. The December 2022 round was the largest ever at around 35,000.`,
        }
      : null,
    {
      q: "When is the next subclass 189 round?",
      a: "The Department of Home Affairs does not publish a schedule. Based on the recent quarterly pattern the next round is likely around September 2026, but treat any date before it appears on the official SkillSelect page as an estimate.",
    },
    {
      q: "Where do these figures come from?",
      a: "The 2022-23 and 2023-24 rounds are from the Department of Home Affairs' own invitation-rounds page and its 2022-23 Freedom of Information release. Later rounds are cross-checked against established Australian migration-practice sources because the official SkillSelect page blocks automated access. Every row links its source and carries a last-verified date.",
    },
  ].filter((x): x is FaqItem => x !== null);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
      />
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        SkillSelect invitation rounds
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        In periodic rounds, the Department of Home Affairs invites the highest-ranked
        SkillSelect candidates to apply for a skilled visa. This is the round-by-round
        history since 2022: how many invitations went out, and the lowest points score
        that got one.{" "}
        <Link
          href="/visas/points-calculator"
          className="text-status-open underline underline-offset-2"
        >
          Work out your own points first
        </Link>
        .
      </p>

      {latestActual && (
        <div className="mt-8 rounded-2xl border border-status-open/30 bg-status-open/5 p-5">
          <p className="font-body text-xs font-semibold tracking-widest text-status-open uppercase">
            Latest round
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-ink">
            {fmtDate(latestActual.round_date)} &middot; subclass {latestActual.visa_code}
            {latestActual.stream ? ` (${latestActual.stream})` : ""}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 font-utility text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs tracking-wide text-slate uppercase">Invitations</dt>
              <dd className="mt-0.5 text-lg text-ink">
                {latestActual.invitations_issued?.toLocaleString("en-AU") ?? "Not published"}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-slate uppercase">Points floor</dt>
              <dd className="mt-0.5 text-lg text-ink">{latestActual.min_points ?? "65"}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-slate uppercase">Program year</dt>
              <dd className="mt-0.5 text-lg text-ink">{latestActual.program_year ?? "—"}</dd>
            </div>
          </dl>
          {latestActual.occupation_notes && (
            <p className="mt-3 font-body text-sm text-slate">
              {latestActual.occupation_notes}
            </p>
          )}
        </div>
      )}

      {chartBars.length >= 2 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-ink">
            189 invitation volume by round
          </h2>
          <p className="mt-1 font-body text-sm text-slate">
            Round sizes swing hard with the backlog and each year&rsquo;s skilled
            allocation. The monthly 2022-23 rounds cleared a pandemic backlog; 2023-24 had
            just two.
          </p>
          <InvitationVolumeChart bars={chartBars} />
        </section>
      )}

      {rounds.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No rounds published yet.
        </p>
      ) : (
        <div className="mt-12 flex flex-col gap-10">
          {years.map((year) => (
            <section key={year}>
              <h2 className="mb-4 font-body text-xs font-semibold tracking-widest text-slate uppercase">
                {year === "Other" ? "Other rounds" : `${year} program year`}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-utility text-sm">
                  <thead>
                    <tr className="border-b border-ink/15 text-left text-xs tracking-wide text-slate uppercase">
                      <th className="py-2 pr-4 font-semibold">Round date</th>
                      <th className="py-2 pr-4 font-semibold">Visa</th>
                      <th className="py-2 pr-4 font-semibold">Stream</th>
                      <th className="py-2 pr-4 font-semibold">Invitations</th>
                      <th className="py-2 font-semibold">Min points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byYear.get(year)!.map((r) => (
                      <tr key={r.id} className="border-b border-ink/10 align-top">
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {new Date(r.round_date).toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {r.is_estimated && (
                            <span className="ml-1 text-status-pending">
                              (projected)
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {r.visa ? (
                            <Link
                              href={`/visas/${r.visa.slug}`}
                              className="text-status-open underline underline-offset-2"
                            >
                              {r.visa_code}
                            </Link>
                          ) : (
                            r.visa_code
                          )}
                        </td>
                        <td className="py-2 pr-4">{r.stream ?? "—"}</td>
                        <td className="py-2 pr-4">
                          {r.invitations_issued?.toLocaleString("en-AU") ?? "—"}
                        </td>
                        <td className="py-2">
                          {r.min_points ?? "—"}
                          {r.occupation_notes && (
                            <span className="mt-0.5 block text-xs text-slate">
                              {r.occupation_notes}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-status-pending/30 bg-status-pending/5 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          A note on projected rounds
        </h2>
        <p className="mt-2 font-body text-sm text-slate">
          Rows marked <span className="text-status-pending">projected</span> are
          our estimate of a future round&rsquo;s likely timing and cut-off, based
          on the pattern of past rounds and published program allocations. They
          are not official. Home Affairs does not announce round dates or cut-offs
          in advance. For the reasoning behind each projection, see our{" "}
          <Link
            href="/blog?tag=what-we-are-watching"
            className="text-status-open underline underline-offset-2"
          >
            What we&rsquo;re watching
          </Link>{" "}
          posts.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink">
          Common questions
        </h2>
        <dl className="mt-4 flex flex-col gap-6">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-body text-base font-semibold text-ink">{f.q}</dt>
              <dd className="mt-1 font-body text-sm text-slate">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <LastVerified date={latestVerified} sources={sources} />
      </div>
    </main>
  );
}
