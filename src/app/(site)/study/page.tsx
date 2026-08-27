import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { formatCurrency } from "@/lib/format";
import { listPublishedSubjects } from "@/lib/queries/public-subjects";

export const revalidate = 3600;

export const metadata = {
  title: "Study by subject in Australia",
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
      <p className="mt-3 font-body text-base text-slate">
        Pick a field to see how many programs Australian universities offer,
        which universities teach it, the cheapest tuition on record, the typical
        entry requirements, and whether it leads to skilled migration.
      </p>

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
