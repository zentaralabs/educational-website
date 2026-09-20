import { DeadlineTable } from "@/components/site/DeadlineTable";
import { groupDeadlinesByMonth } from "@/lib/deadline-grouping";
import { universityDeadlineHref } from "@/lib/deadline-detail";
import type { PublicDeadlineRow } from "@/lib/queries/public-deadlines";

/**
 * Server-rendered, no-JS-required render of the unfiltered deadline
 * calendar. Used as the `<Suspense>` fallback for `DeadlinesExplorer`
 * (which reads `useSearchParams()` and therefore cannot be part of the
 * static/ISR'd HTML — see the comment on that Suspense boundary in
 * `page.tsx`). Without a real fallback here, that whole subtree rendered as
 * nothing in the HTML a crawler sees: 38 university deadline pages —
 * including the site's best-performing template — had exactly one
 * crawlable inbound link sitewide as a result. This component is what a
 * crawler, or any visitor before hydration, actually sees.
 */
export function DeadlinesStaticList({ deadlines }: { deadlines: PublicDeadlineRow[] }) {
  const grouped = groupDeadlinesByMonth(deadlines);

  return (
    <div className="mt-6 flex flex-col gap-8">
      {[...grouped.entries()].map(([month, monthRows]) => (
        <section key={month}>
          <h2 className="mb-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
            {month}
          </h2>
          <DeadlineTable
            labelHeading="University"
            pulseOnOpen
            items={monthRows.map((d) => ({
              id: d.id,
              label: (
                <>
                  <span className="font-medium text-ink">{d.university?.name}</span>
                  {" · "}
                  {d.deadline_type?.name}
                  {d.degree_level && ` (${d.degree_level.name})`}
                </>
              ),
              deadlineDate: d.deadline_date,
              isRolling: d.is_rolling,
              dateKind: d.date_kind,
              ...(d.university ? { href: universityDeadlineHref(d.university.slug) } : {}),
            }))}
          />
        </section>
      ))}
    </div>
  );
}
