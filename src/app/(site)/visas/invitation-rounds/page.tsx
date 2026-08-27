import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LastVerified } from "@/components/site/LastVerified";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { listPublishedInvitationRounds } from "@/lib/queries/public-visas";

export const revalidate = 3600;

export const metadata = {
  title: "SkillSelect invitation rounds",
  description:
    "Round-by-round history of Australian SkillSelect invitations: dates, invitations issued, and minimum points cut-offs for the subclass 189, 190, and 491 visas.",
  alternates: { canonical: "/visas/invitation-rounds" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Visas", href: "/visas" },
  { label: "Invitation rounds" },
];

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

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        SkillSelect invitation rounds
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        In periodic rounds, the Department of Home Affairs invites a batch of
        SkillSelect candidates to apply for a skilled visa. Since the 2025-26
        program year the subclass 189 rounds run roughly quarterly. This is the
        history: how many invitations went out, and the lowest points score that
        got one.{" "}
        <Link
          href="/visas/points-calculator"
          className="text-status-open underline underline-offset-2"
        >
          Work out your own points first
        </Link>
        .
      </p>

      {rounds.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No rounds published yet.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
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

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <LastVerified date={latestVerified} sources={sources} />
      </div>
    </main>
  );
}
