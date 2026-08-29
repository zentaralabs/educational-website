import Link from "next/link";
import { formatCurrency, formatSelectivity } from "@/lib/format";
import { getQuizMatches, listQuizOptions } from "@/lib/queries/public-quiz";
import { getCity } from "@/lib/cities";

export const revalidate = 3600;

export const metadata = {
  title: "Your University Matches",
  description:
    "Australian universities matched to your degree level, field of study, budget, English, city, and scholarship preferences.",
  robots: { index: false, follow: true },
};

type SP = {
  degree?: string;
  subject?: string;
  budget?: string;
  ielts?: string;
  city?: string;
  type?: string;
  regional?: string;
  scholarship?: string;
};

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const maxBudget = sp.budget ? Number(sp.budget) : undefined;
  const ielts = sp.ielts ? Number(sp.ielts) : undefined;

  const [matches, options] = await Promise.all([
    getQuizMatches({
      degreeLevel: sp.degree,
      subject: sp.subject,
      maxBudget,
      ielts,
      city: sp.city,
      institutionType: sp.type,
      regional: sp.regional === "1",
      scholarship: sp.scholarship === "1",
    }),
    listQuizOptions(),
  ]);

  const subjectName = sp.subject
    ? options.subjects.find((s) => s.slug === sp.subject)?.name
    : undefined;
  const cityName = sp.city ? getCity(sp.city)?.name : undefined;

  const criteria = [
    sp.degree && sp.degree,
    subjectName,
    maxBudget && `under ${formatCurrency(maxBudget)} tuition`,
    ielts && `IELTS ${ielts.toFixed(1)}`,
    cityName,
    sp.type && `${sp.type} institutions`,
    sp.regional === "1" && "regional campus",
    sp.scholarship === "1" && "automatic scholarship",
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
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
            No published universities match every filter yet. Try loosening the
            budget, city, or IELTS.
          </p>
          <Link
            href="/quiz"
            className="mt-3 inline-block font-body text-sm text-status-open underline underline-offset-2"
          >
            &larr; Adjust my answers
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
                {u.city ?? "Australia"}
                {u.institutionType && ` · ${u.institutionType}`}
              </p>

              {u.whoIsItFor && (
                <p className="mt-2 font-body text-sm text-ink">{u.whoIsItFor}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-utility text-xs text-slate">
                <span>
                  Selectivity: {formatSelectivity(u.acceptanceRate) ?? "Not listed"}
                </span>
                <span>
                  Tuition from:{" "}
                  {u.minTuition ? formatCurrency(u.minTuition) : "Not listed"}
                </span>
                {u.firstYearBudget && (
                  <span>First-year budget: {formatCurrency(u.firstYearBudget)}</span>
                )}
                {u.intakes.length > 0 && (
                  <span>Intakes: {u.intakes.join(", ")}</span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {u.isRegional && (
                  <span className="rounded border border-ink/15 bg-ink/[0.03] px-1.5 py-0.5 font-utility text-[11px] text-slate">
                    Regional (migration points)
                  </span>
                )}
                {u.automaticScholarships.length > 0 && (
                  <span className="rounded border border-status-open/30 bg-status-open/10 px-1.5 py-0.5 font-utility text-[11px] text-ink">
                    Automatic scholarship
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs">
                <Link
                  href={`/universities/${u.slug}/deadlines`}
                  className="text-status-open underline underline-offset-2"
                >
                  Deadlines
                </Link>
                <Link
                  href={`/universities/${u.slug}`}
                  className="text-status-open underline underline-offset-2"
                >
                  Full profile
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 rounded-md border border-ink/15 bg-ink/[0.02] p-5">
        <p className="font-display text-sm font-semibold text-ink">Keep narrowing</p>
        <ul className="mt-2 flex flex-col gap-1.5 font-body text-sm">
          <li>
            <Link href="/quiz" className="text-status-open underline underline-offset-2">
              Adjust my answers
            </Link>
          </li>
          <li>
            <Link
              href="/universities"
              className="text-status-open underline underline-offset-2"
            >
              Browse and filter every university
            </Link>
          </li>
          {sp.subject && subjectName && (
            <li>
              <Link
                href={`/study/${sp.subject}`}
                className="text-status-open underline underline-offset-2"
              >
                {subjectName} courses in Australia
              </Link>
            </li>
          )}
          {sp.city && cityName && (
            <li>
              <Link
                href={`/cost-of-living/${sp.city}`}
                className="text-status-open underline underline-offset-2"
              >
                Cost of living in {cityName}
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/cost-calculator"
              className="text-status-open underline underline-offset-2"
            >
              Work out the full cost of your degree
            </Link>
          </li>
          <li>
            <Link
              href="/scholarships"
              className="text-status-open underline underline-offset-2"
            >
              Browse scholarships for international students
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
