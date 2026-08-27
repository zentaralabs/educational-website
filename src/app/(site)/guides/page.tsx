import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { GUIDE_CATEGORY_LABELS } from "@/lib/guide-categories";
import { listPublishedGuides } from "@/lib/queries/public-guides";

export const revalidate = 3600;

export const metadata = {
  title: "Guides",
  description:
    "How-to guides for personal statements, letters of recommendation, transfers, financial aid, and international applications.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesIndexPage() {
  const guides = await listPublishedGuides({ excludeCategory: "comparison" });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Guides
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        Personal statements, letters of recommendation, transfers, financial
        aid, test prep, and more, fact-checked and kept current.
      </p>

      <Link
        href="/best"
        className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-status-pending/30 bg-status-pending/5 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
      >
        <span>
          <span className="font-display text-base font-semibold text-ink">
            Decision guides
          </span>
          <span className="mt-1 block font-body text-sm text-slate">
            Shortlists of Australian universities by cost, intakes, regional
            migration advantages, and scholarships.
          </span>
        </span>
        <ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-slate" />
      </Link>

      {guides.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">No guides published yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="group flex flex-col gap-1.5 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] sm:p-6"
              >
                <span className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
                  {GUIDE_CATEGORY_LABELS[g.category] ?? g.category}
                  {g.country && ` · ${g.country.name}`}
                </span>
                <span className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-ink text-balance group-hover:underline">
                    {g.title}
                  </h2>
                  <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                </span>
                {g.excerpt && (
                  <p className="font-body text-base text-slate">{g.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
