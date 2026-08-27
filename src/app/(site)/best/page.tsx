import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { COLLECTIONS } from "@/lib/collections";

export const revalidate = 3600;

export const metadata = {
  title: "Best universities in Australia for international students, by category",
  description:
    "Shortlists of Australian universities ranked by first-year cost, number of intakes, regional migration advantages, application fees, and automatic scholarships. Each list shows how it was built.",
  alternates: { canonical: "/best" },
};

export default function BestIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Best universities in Australia, by category
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        There is no single &ldquo;best&rdquo; university, so this is a set of
        shortlists built from the data on this site: cheapest first year, most
        intakes per year, regional migration advantages, no application fee,
        automatic scholarships, and more. Each list shows how it was put
        together, not just the result.
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        {COLLECTIONS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/best/${c.slug}`}
              className="group flex flex-col gap-1.5 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] sm:p-6"
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
