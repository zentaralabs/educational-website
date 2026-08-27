import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { listPublishedVisas } from "@/lib/queries/public-visas";
import { VISA_CATEGORY_LABELS, VISA_CATEGORY_ORDER } from "@/lib/visa-categories";

export const revalidate = 3600;

export const metadata = {
  title: "Australian visa subclasses",
  description:
    "Plain-English breakdowns of Australia's student, graduate, skilled, and employer-sponsored visa subclasses covering eligibility, points, costs, and the pathway to permanent residence.",
  alternates: { canonical: "/visas" },
};

export default async function VisasIndexPage() {
  const visas = await listPublishedVisas();

  const byCategory = new Map<string, typeof visas>();
  for (const v of visas) {
    const list = byCategory.get(v.category) ?? [];
    list.push(v);
    byCategory.set(v.category, list);
  }
  const categories = VISA_CATEGORY_ORDER.filter((c) => byCategory.has(c));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Australian visa subclasses
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        What each subclass is for, who qualifies, what it costs, and whether it
        leads to permanent residence. Every figure is dated and sourced.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

      {visas.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          No visa subclasses published yet.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="mb-4 font-body text-xs font-semibold tracking-widest text-slate uppercase">
                {VISA_CATEGORY_LABELS[category] ?? category}
              </h2>
              <ul className="flex flex-col gap-4">
                {byCategory.get(category)!.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/visas/${v.slug}`}
                      className="group flex flex-col gap-1.5 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] sm:p-6"
                    >
                      <span className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
                        Subclass {v.code}
                        {v.stream && ` · ${v.stream}`}
                      </span>
                      <span className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold text-ink text-balance group-hover:underline">
                          {v.name}
                        </h3>
                        <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                      </span>
                      {v.short_description && (
                        <p className="font-body text-base text-slate">
                          {v.short_description}
                        </p>
                      )}
                      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-utility text-xs text-slate">
                        {v.stay_period && <span>Stay: {v.stay_period}</span>}
                        {v.is_points_tested && v.min_points != null && (
                          <span>Points floor: {v.min_points}</span>
                        )}
                        <span>
                          {v.leads_to_pr ? "Pathway to PR" : "Not a PR visa"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
