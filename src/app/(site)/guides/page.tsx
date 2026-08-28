import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { GuidesBrowser } from "@/components/site/GuidesBrowser";
import { GUIDE_CATEGORY_LABELS } from "@/lib/guide-categories";
import { listPublishedGuides } from "@/lib/queries/public-guides";

export const revalidate = 3600;

export const metadata = {
  title: "Guides",
  description:
    "How-to guides for personal statements, letters of recommendation, transfers, financial aid, and international applications.",
  alternates: { canonical: "/guides" },
};

// Tab order for the category browser.
const CATEGORY_ORDER = ["how-to", "country-guide", "test-prep"];

const CATEGORY_BLURB: Record<string, string> = {
  "how-to": "Step-by-step walkthroughs of the parts of an application you actually write.",
  "country-guide": "How the system works in Australia: fees, visas, accreditation, and the path to PR.",
  "test-prep": "Choosing and preparing for the English and admissions tests universities ask for.",
};

export default async function GuidesIndexPage() {
  const guides = await listPublishedGuides({ excludeCategory: "comparison" });

  const categoryKeys = [
    ...CATEGORY_ORDER.filter((c) => guides.some((g) => g.category === c)),
    ...[...new Set(guides.map((g) => g.category))].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];
  const groups = categoryKeys.map((key) => ({
    key,
    label: GUIDE_CATEGORY_LABELS[key] ?? key,
    blurb: CATEGORY_BLURB[key],
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Guides
      </h1>
      <p className="mt-2 max-w-2xl font-body text-base text-slate">
        Personal statements, letters of recommendation, transfers, financial aid,
        test prep, and more. Every guide is fact-checked and dated.
      </p>

      <Link
        href="/best"
        className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-line bg-mist px-5 py-4 transition-colors duration-150 hover:border-status-open/40"
      >
        <span>
          <span className="font-body text-sm font-semibold text-ink">
            Looking for decision guides?
          </span>
          <span className="mt-0.5 block font-body text-sm text-slate">
            Ranked shortlists of Australian universities by cost, intakes, and migration advantages.
          </span>
        </span>
        <ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 text-slate" />
      </Link>

      {guides.length === 0 ? (
        <p className="mt-10 font-body text-base text-slate">No guides published yet.</p>
      ) : (
        <GuidesBrowser guides={guides} groups={groups} />
      )}
    </main>
  );
}
