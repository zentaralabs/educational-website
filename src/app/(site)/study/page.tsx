import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { formatCurrency } from "@/lib/format";
import { listPublishedSubjects } from "@/lib/queries/public-subjects";

export const revalidate = 3600;

export const metadata = {
  title: "Study in Australia by Subject: Programs, Costs & Entry",
  description:
    "Every field of study at Australian universities for international students: how many programs, how many universities, cheapest tuition, entry requirements, and the pathway to permanent residence.",
  alternates: { canonical: "/study" },
};

export default async function StudyIndexPage() {
  const subjects = await listPublishedSubjects();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Study by subject in Australia
      </h1>
      <div className="mt-3 flex flex-col gap-3 font-body text-base leading-relaxed text-slate">
        <p>
          Pick a field to see how many programs Australian universities offer,
          which universities teach it, the cheapest tuition on record, the
          typical entry requirements, and whether it leads to skilled migration.
        </p>
        <p>
          For international students the subject often matters more than the
          university. It sets the tuition band, the English and academic entry
          bar, how long the degree runs, and, if you plan to stay after
          graduating, whether the qualification maps to an occupation on a
          skilled list. A well-ranked university cannot rescue a field that leads
          nowhere for migration, and a modest university in the right field can.
        </p>
        <p>
          Each subject page pulls the numbers together so you can compare fields
          before you compare institutions, then links the guides that go deeper:
          how the{" "}
          <Link
            href="/guides/how-the-australian-points-test-works"
            className="font-medium text-status-open underline underline-offset-2"
          >
            points test
          </Link>{" "}
          works, and how to get a{" "}
          <Link
            href="/guides/getting-a-skills-assessment-in-australia"
            className="font-medium text-status-open underline underline-offset-2"
          >
            skills assessment
          </Link>
          .
        </p>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {subjects.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/study/${s.slug}`}
              className="card card-hover group flex h-full flex-col gap-1.5 p-5"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-display text-lg font-semibold text-ink group-hover:underline">
                  {s.name}
                </span>
                <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
              </span>
              <span className="flex flex-wrap gap-x-3 gap-y-0.5 font-utility text-xs text-slate">
                <span>
                  {s.programCount} program{s.programCount === 1 ? "" : "s"}
                </span>
                <span>{s.universityCount} universities</span>
                {s.minTuition != null && (
                  <span className="text-status-open">
                    from {formatCurrency(s.minTuition, "AUD")}/yr
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
