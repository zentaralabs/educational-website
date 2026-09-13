import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { SITE_NAME, SITE_URL, SITE_YEAR } from "@/lib/site-config";
import {
  listDeadlineFilterOptions,
  listPublishedDeadlines,
} from "@/lib/queries/public-deadlines";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";
import { DeadlinesExplorer } from "./DeadlinesExplorer";

// Filtering/pagination moved client-side (DeadlinesExplorer) specifically so
// this page reads no searchParams: that was forcing full per-request dynamic
// rendering (Cache-Control: no-store, no bfcache) on the site's
// most-revisited page type. Filtered/paginated states are now a client-side
// view over this single cached document rather than separate SSR'd pages, so
// there's one canonical rather than a per-filter one.
export const revalidate = 3600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: `Australian University Application Deadlines ${SITE_YEAR + 1}`,
    description:
      "International application dates for every intake at Australian universities, by degree level: firm closing dates where they exist, recommended apply-by dates where admissions are rolling.",
    path: "/deadlines",
    type: "website",
  }),
};

export default async function DeadlinesPage() {
  const [{ rows: deadlines, totalCount, pageSize }, options] = await Promise.all([
    listPublishedDeadlines({}, 1),
    listDeadlineFilterOptions(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "University application deadlines",
    description: "Aggregated, sourced application deadlines for universities in Australia.",
    url: `${SITE_URL}/deadlines`,
    variableMeasured: "Application deadline date",
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    license: `${SITE_URL}/terms`,
  };

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Deadlines" }];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-8 pb-16">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-[0.8rem] font-semibold tracking-wide text-slate uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          {totalCount} sourced deadlines
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          Application deadline calendar
        </h1>
        <p className="mt-2 max-w-2xl font-body text-base text-ink/80">
          Recommended international application dates for each intake, filterable
          by country, degree level, and intake.
        </p>
      </div>

      <p className="mt-4 rounded-xl border border-status-pending/25 bg-status-pending/5 px-4 py-3 font-body text-sm text-slate">
        Australian universities run fixed intakes (Semester 1 starts in February
        or March, Semester 2 in July; a few use terms or trimesters). Some, such
        as the University of Sydney and ANU, publish a firm international closing
        date; others assess applications on a rolling basis and close courses
        once full, so the date shown is the recommended time to apply, roughly
        three to four months before the intake. Postgraduate coursework and
        competitive courses (medicine, law, portfolio-based programs) close
        earlier. Confirm the date for your specific course with the university.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {[
          { href: "/deadlines/february-2027-intake", label: "February 2027 intake" },
          { href: "/deadlines/july-2027-intake", label: "July 2027 intake" },
        ].map((hub) => (
          <Link
            key={hub.href}
            href={hub.href}
            className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-status-open/30 bg-status-open/[0.04] px-4 py-3 font-body text-sm transition-colors duration-150 hover:border-status-open/50"
          >
            <span className="text-ink">
              <span className="font-semibold">{hub.label}:</span> full table,
              timeline, and what changed
            </span>
            <span aria-hidden="true" className="text-status-open">
              &rarr;
            </span>
          </Link>
        ))}
      </div>

      <Suspense fallback={null}>
        <DeadlinesExplorer
          initialRows={deadlines}
          initialTotalCount={totalCount}
          pageSize={pageSize}
          options={options}
        />
      </Suspense>
    </main>
  );
}
