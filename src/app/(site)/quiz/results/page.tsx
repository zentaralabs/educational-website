import Link from "next/link";
import { formatCurrency, selectivityLabel } from "@/lib/format";
import { getQuizMatches, listQuizOptions } from "@/lib/queries/public-quiz";
import { getCity } from "@/lib/cities";
import { TrackEvent } from "@/components/site/TrackEvent";

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
  pte?: string;
  city?: string;
  type?: string;
  regional?: string;
  scholarship?: string;
};

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | null;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-body text-[0.7rem] font-semibold tracking-wide text-slate uppercase">
        {label}
      </dt>
      <dd
        className={`font-body text-sm font-medium ${accent ? "text-status-open" : "text-ink"}`}
      >
        {value ?? "Not listed"}
      </dd>
    </div>
  );
}

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const maxBudget = sp.budget ? Number(sp.budget) : undefined;
  const ielts = sp.ielts ? Number(sp.ielts) : undefined;
  const pte = sp.pte ? Number(sp.pte) : undefined;

  const [matches, options] = await Promise.all([
    getQuizMatches({
      degreeLevel: sp.degree,
      subject: sp.subject,
      maxBudget,
      ielts,
      pte,
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
    pte && `PTE ${pte}`,
    cityName,
    sp.type && `${sp.type} institutions`,
    sp.regional === "1" && "regional campus",
    sp.scholarship === "1" && "automatic scholarship",
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <TrackEvent
        event="quiz_completed"
        eventParams={{ matches: matches.length, filters: criteria.length }}
      />
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Your matches
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        {matches.length} universit{matches.length === 1 ? "y" : "ies"} match
        {criteria.length > 0 && <> your picks ({criteria.join(" · ")})</>}, more
        open admissions first.
      </p>

      {matches.length === 0 ? (
        <div className="card mt-8 p-6">
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
        <ul className="mt-8 flex flex-col gap-5">
          {matches.map((u) => (
            <li key={u.slug} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <Link
                  href={`/universities/${u.slug}`}
                  className="font-display text-xl font-semibold text-ink hover:underline"
                >
                  {u.name}
                </Link>
                <span className="font-body text-sm text-slate">
                  {u.city ?? "Australia"}
                  {u.institutionType && ` · ${u.institutionType}`}
                </span>
              </div>

              {u.whoIsItFor && (
                <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-ink/80">
                  {u.whoIsItFor}
                </p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
                <Stat
                  label="Selectivity"
                  value={selectivityLabel(u.selectivityBand) ?? "Not listed"}
                />
                <Stat
                  label="Tuition from"
                  value={u.minTuition ? formatCurrency(u.minTuition) : "Not listed"}
                  accent
                />
                <Stat
                  label="First-year budget"
                  value={
                    u.firstYearBudget ? formatCurrency(u.firstYearBudget) : "Not listed"
                  }
                />
                <Stat
                  label="Intakes"
                  value={u.intakes.length > 0 ? u.intakes.join(", ") : "Not listed"}
                />
              </dl>

              {(u.isRegional || u.automaticScholarships.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {u.isRegional && (
                    <span className="rounded-full border border-line bg-paper px-2.5 py-1 font-body text-xs font-medium text-slate">
                      Regional (migration points)
                    </span>
                  )}
                  {u.automaticScholarships.length > 0 && (
                    <span className="rounded-full border border-status-open/30 bg-status-open/10 px-2.5 py-1 font-body text-xs font-medium text-ink">
                      Automatic scholarship
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-body text-sm font-medium">
                <Link
                  href={`/universities/${u.slug}/deadlines`}
                  className="text-status-open hover:underline"
                >
                  Deadlines &rarr;
                </Link>
                <Link
                  href={`/universities/${u.slug}`}
                  className="text-status-open hover:underline"
                >
                  Full profile &rarr;
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="card mt-10 p-5 sm:p-6">
        <p className="font-display text-base font-semibold text-ink">
          Keep narrowing
        </p>
        <ul className="mt-3 flex flex-col gap-2 font-body text-sm">
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
