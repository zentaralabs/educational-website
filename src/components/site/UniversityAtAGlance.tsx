import { formatCurrency } from "@/lib/format";
import { Fact, FactBox } from "@/components/site/ProfileSection";

export type AtAGlanceProps = {
  tuition: number | null;
  tuitionIsFrom: boolean;
  currency: string;
  applicationFee: number | null;
  budgetLow: number | null;
  budgetHigh: number | null;
  ielts: number | null;
  pte: number | null;
  selectivity: string | null;
  intakeTypes: string[];
  degreeLevels: string[];
  isGo8: boolean;
  isRegional: boolean;
  isMetro: boolean;
};

/** Compact "should I apply here?" summary shown near the top of a university
 * profile: a scannable fact grid plus derived fit signals. Every fact here
 * is repeated in more detail lower down the page; this is the at-a-glance
 * layer, per the homepage/university-page review. */
export function UniversityAtAGlance(p: AtAGlanceProps) {
  const english = [
    p.ielts != null && `IELTS ${p.ielts}`,
    p.pte != null && `PTE ${p.pte}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const goodFor: string[] = [];
  if (p.isGo8) goodFor.push("Research reputation and global rankings");
  if (p.isRegional)
    goodFor.push("Regional migration points (491 and 190 pathways)");
  if (p.tuition != null && p.tuition < 35_000 && !p.isGo8)
    goodFor.push("Lower tuition than the Group of Eight");
  if (p.intakeTypes.length >= 2) goodFor.push("More than one intake a year");
  if (p.applicationFee === 0) goodFor.push("No application fee");
  if (p.ielts != null && p.ielts <= 6.0)
    goodFor.push("Entry with IELTS 6.0 at the institutional minimum");
  if (p.selectivity === "Broadly accessible")
    goodFor.push("More open admissions across most courses");

  const weakerFor: string[] = [];
  if (p.isGo8 || (p.tuition != null && p.tuition >= 45_000))
    weakerFor.push("The lowest possible tuition budget");
  if (p.isMetro)
    weakerFor.push("Regional migration points, if you study on the metro campus");
  if (p.intakeTypes.length < 2)
    weakerFor.push("A mid-year start, if only one intake runs");
  if (p.ielts != null && p.ielts >= 7.0)
    weakerFor.push("Applicants with an English score below 7.0");

  return (
    <section className="mt-6">
      <h2 className="mb-3 font-display text-lg font-semibold text-ink">
        At a glance
      </h2>
      <FactBox>
        <Fact
          label="International tuition"
          value={
            p.tuition != null
              ? `${p.tuitionIsFrom ? "from " : ""}${formatCurrency(p.tuition, p.currency)}/yr`
              : null
          }
        />
        <Fact
          label="First-year budget"
          value={
            p.budgetLow != null && p.budgetHigh != null
              ? `${formatCurrency(p.budgetLow, "AUD")} to ${formatCurrency(p.budgetHigh, "AUD")}`
              : null
          }
        />
        <Fact label="English (minimum)" value={english || null} />
        <Fact
          label="Application fee"
          value={
            p.applicationFee == null
              ? null
              : p.applicationFee === 0
                ? "None"
                : formatCurrency(p.applicationFee, p.currency)
          }
        />
        <Fact
          label="Intakes"
          value={p.intakeTypes.length ? p.intakeTypes.join(" · ") : null}
        />
        <Fact
          label="Regional (migration)"
          value={p.isMetro ? "No" : p.isRegional ? "Yes" : null}
        />
        <Fact label="Selectivity" value={p.selectivity} />
        <Fact
          label="Degree levels"
          value={p.degreeLevels.length ? p.degreeLevels.join(", ") : null}
        />
      </FactBox>

      {(goodFor.length > 0 || weakerFor.length > 0) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {goodFor.length > 0 && (
            <div className="rounded-xl border border-line bg-mist p-4">
              <p className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Good for
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {goodFor.map((g) => (
                  <li
                    key={g}
                    className="flex gap-2 font-body text-sm text-ink"
                  >
                    <span aria-hidden className="text-status-open">✓</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {weakerFor.length > 0 && (
            <div className="rounded-xl border border-line bg-mist p-4">
              <p className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
                Weaker fit for
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {weakerFor.map((w) => (
                  <li
                    key={w}
                    className="flex gap-2 font-body text-sm text-ink"
                  >
                    <span aria-hidden className="text-slate">✕</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <p className="mt-2 font-body text-xs text-slate">
        Derived from the data on this page. Individual courses set their own
        fees, entry scores, and intakes, so check the ones you are applying to.
      </p>
    </section>
  );
}
