import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getQuizMatches } from "@/lib/queries/public-quiz";

export const metadata = {
  title: "Your University Matches",
};

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    country?: string;
    degree?: string;
    budget?: string;
    type?: string;
  }>;
}) {
  const { country, degree, budget, type } = await searchParams;
  const maxBudget = budget ? Number(budget) : undefined;

  const matches = await getQuizMatches({
    country,
    degreeLevel: degree,
    maxBudget,
    institutionType: type,
  });

  const criteria = [
    country && `country: ${country}`,
    degree && `degree: ${degree}`,
    maxBudget && `budget: under ${formatCurrency(maxBudget)}`,
    type && `type: ${type}`,
  ].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Your matches
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        {matches.length} universit{matches.length === 1 ? "y" : "ies"} match
        {criteria.length > 0 && <> your picks ({criteria.join(" · ")})</>}, most
        realistic acceptance odds first.
      </p>

      {matches.length === 0 ? (
        <div className="mt-8 rounded-md border border-ink/15 bg-ink/[0.02] p-6">
          <p className="font-body text-base text-ink">
            No published universities match those filters yet — try loosening
            the budget or country.
          </p>
          <Link
            href="/quiz"
            className="mt-3 inline-block font-body text-sm text-status-open underline underline-offset-2"
          >
            ← Adjust my answers
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {matches.map((u) => (
            <li key={u.slug} className="rounded-md border border-ink/15 p-4">
              <Link
                href={`/universities/${u.slug}`}
                className="font-display text-lg font-semibold text-ink hover:underline"
              >
                {u.name}
              </Link>
              <p className="mt-0.5 font-body text-sm text-slate">
                {u.country?.name}
                {u.institution_type && ` · ${u.institution_type}`}
              </p>

              {u.distinctive_summary && (
                <p className="mt-2 font-body text-sm text-ink">
                  {u.distinctive_summary}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-4 font-utility text-xs text-slate">
                <span>Acceptance rate: {formatPercent(u.acceptance_rate) ?? "—"}</span>
                <span>
                  Tuition (intl.):{" "}
                  {u.tuition_international
                    ? formatCurrency(u.tuition_international)
                    : "not listed"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/quiz"
        className="mt-8 inline-block font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
      >
        ← Start over
      </Link>
    </main>
  );
}
