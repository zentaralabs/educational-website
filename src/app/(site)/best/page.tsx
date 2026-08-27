import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { COLLECTIONS } from "@/lib/collections";

export const revalidate = 3600;

export const metadata = {
  title: "Best-for guides: choosing an Australian university",
  description:
    "Decision guides that compare Australian universities on cost, intakes, regional migration advantages, and scholarships, with the reasoning shown.",
  alternates: { canonical: "/best" },
};

export default function BestIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Choosing a university: decision guides
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        Shortlists built from the data on this site: cost, intakes, regional
        migration advantages, and scholarships. Each one shows how the list was
        put together, not just the result.
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        {COLLECTIONS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/best/${c.slug}`}
              className="group flex flex-col gap-1.5 rounded-2xl border border-ink/10 bg-ink/[0.02] p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:bg-ink/[0.03] hover:shadow-sm sm:p-6"
            >
              <span className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-ink text-balance group-hover:underline">
                  {c.title}
                </h2>
                <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
              </span>
              <p className="font-body text-base text-slate">{c.intro[0]}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
