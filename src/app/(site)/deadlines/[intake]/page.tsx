import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqSection } from "@/components/site/FaqSection";
import { LastVerified } from "@/components/site/LastVerified";
import { ProfileSection } from "@/components/site/ProfileSection";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { StatusBadge } from "@/components/StatusBadge";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { faqJsonLd } from "@/lib/faq";
import { deadlineBadgeStatus, formatDeadlineDate } from "@/lib/deadline-status";
import { getIntakeHub, INTAKE_HUB_SLUGS } from "@/lib/intakes";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import {
  listIntakeDeadlines,
  type IntakeDeadlineRow,
} from "@/lib/queries/public-deadlines";
import { JsonLd } from "@/lib/json-ld";
import { composeTitle, pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return INTAKE_HUB_SLUGS.map((intake) => ({ intake }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ intake: string }>;
}): Promise<Metadata> {
  const { intake } = await params;
  const hub = getIntakeHub(intake);
  if (!hub) return {};
  return pageMetadata({
    title: composeTitle(hub.metaTitle),
    description: hub.metaDescription,
    path: `/deadlines/${hub.slug}`,
    type: "article",
  });
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type UniversityGroup = {
  slug: string;
  name: string;
  rows: IntakeDeadlineRow[];
};

function groupByUniversity(rows: IntakeDeadlineRow[]): UniversityGroup[] {
  const groups = new Map<string, UniversityGroup>();
  for (const row of rows) {
    if (!row.university) continue;
    const key = row.university.slug;
    if (!groups.has(key)) {
      groups.set(key, {
        slug: row.university.slug,
        name: row.university.name,
        rows: [],
      });
    }
    groups.get(key)!.rows.push(row);
  }
  const ordered = [...groups.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const g of ordered) {
    g.rows.sort(
      (a, b) =>
        (a.degree_level?.name ?? "").localeCompare(b.degree_level?.name ?? "") ||
        a.deadline_date.localeCompare(b.deadline_date),
    );
  }
  return ordered;
}

export default async function IntakeDeadlinePage({
  params,
}: {
  params: Promise<{ intake: string }>;
}) {
  const { intake } = await params;
  const hub = getIntakeHub(intake);
  if (!hub) notFound();

  const rows = await listIntakeDeadlines(hub.deadlineTypes);
  const groups = groupByUniversity(rows);

  const pageUrl = `${SITE_URL}/deadlines/${hub.slug}`;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Deadlines", href: "/deadlines" },
    { label: `${hub.intakeName} intake` },
  ];

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: hub.metaTitle,
      description: hub.metaDescription,
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      datePublished: `${hub.lastVerified}T00:00:00Z`,
      dateModified: `${hub.lastVerified}T00:00:00Z`,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `Australian university application deadlines: ${hub.intakeName} intake`,
      description: `Sourced ${hub.intakeName} intake application dates for universities in Australia, by degree level.`,
      url: pageUrl,
      variableMeasured: "Application deadline date",
      isAccessibleForFree: true,
      creator: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      license: `${SITE_URL}/terms`,
    },
    breadcrumbJsonLd(breadcrumbs),
    faqJsonLd(hub.faq),
  ];

  const related = [
    { href: "/deadlines", label: "Full application deadline calendar" },
    { href: "/international/nepal", label: "Applying to Australia from Nepal" },
    { href: "/international/india", label: "Applying to Australia from India" },
    { href: "/visas/student-500", label: "Student visa (subclass 500) explained" },
    { href: "/guides/genuine-student-requirement-how-to-write-your-statement", label: "Writing your Genuine Student statement" },
    { href: "/cost-calculator", label: "Calculate the total cost of your degree" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
          Australian university deadlines
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          {hub.intakeName} intake deadlines for Australian universities
        </h1>
        <p className="mt-3 font-body text-base text-slate">
          {rows.length} sourced application dates across {groups.length}{" "}
          Australian universities, undergraduate and postgraduate. Courses in
          this intake start in {hub.startWindow}.
        </p>
        <p className="mt-4 font-utility text-xs text-slate">
          All dates last checked against the university&rsquo;s own admissions
          page on the date shown in each row. Guidance around the table last
          reviewed{" "}
          <time dateTime={hub.lastVerified}>{shortDate(hub.lastVerified)}</time>.
        </p>
      </div>

      <section className="mt-6 rounded-xl border border-status-pending/25 bg-status-pending/5 p-4 sm:p-5">
        <h2 className="font-utility text-xs font-semibold tracking-widest text-slate uppercase">
          What changed
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {hub.whatChanged.map((entry) => (
            <li key={entry.date} className="font-body text-sm text-ink">
              <span className="font-semibold">{entry.date}.</span> {entry.note}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
        {hub.intro.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <ProfileSection title={`Is the ${hub.intakeName} intake right for you?`}>
        <div className="flex flex-col gap-3 font-body text-base leading-relaxed text-ink">
          {hub.decision.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        {hub.altIntake.slug && (
          <p className="mt-3 font-body text-sm text-slate">
            Considering the other intake instead? See the{" "}
            <Link
              href={`/deadlines/${hub.altIntake.slug}`}
              className="font-medium text-status-open underline underline-offset-2"
            >
              {hub.altIntake.name} intake deadlines
            </Link>
            .
          </p>
        )}
      </ProfileSection>

      <ProfileSection title="When to start: the timeline">
        <ol className="flex flex-col gap-4">
          {hub.timeline.map((t) => (
            <li key={t.step} className="border-l-2 border-status-open/30 pl-4">
              <p className="font-utility text-xs font-semibold tracking-wide text-status-open uppercase">
                {t.when}
              </p>
              <p className="mt-0.5 font-body text-base font-semibold text-ink">
                {t.step}
              </p>
              <p className="mt-1 font-body text-sm leading-relaxed text-slate">
                {t.detail}
              </p>
            </li>
          ))}
        </ol>
      </ProfileSection>

      <ProfileSection title="Application deadlines by university">
        <p className="mb-4 font-body text-sm text-slate">
          Each row is either a firm international closing date or, where a
          university assesses applications on a rolling basis, the recommended
          date to apply by. Universities that run terms or trimesters rather
          than semesters (for example Bond and UNSW) are not listed here; see
          the{" "}
          <Link
            href="/deadlines"
            className="font-medium text-status-open underline underline-offset-2"
          >
            full calendar
          </Link>{" "}
          for those.
        </p>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[36rem] border-collapse text-left font-body text-sm">
            <thead>
              <tr className="border-b border-line bg-mist">
                <th className="px-3 py-2.5 font-semibold text-ink">University</th>
                <th className="px-3 py-2.5 font-semibold text-ink">Level</th>
                <th className="px-3 py-2.5 font-semibold text-ink">
                  Apply by
                </th>
                <th className="px-3 py-2.5 font-semibold text-ink">
                  Last checked
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) =>
                group.rows.map((row, rowIndex) => {
                  const status = deadlineBadgeStatus(
                    row.deadline_date,
                    row.is_rolling,
                  );
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-line/60 last:border-b-0 align-top"
                    >
                      <td className="px-3 py-2.5">
                        {rowIndex === 0 ? (
                          <Link
                            href={`/universities/${group.slug}`}
                            className="font-medium text-status-open underline underline-offset-2"
                          >
                            {group.name}
                          </Link>
                        ) : (
                          <span className="text-slate/60">&nbsp;</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate">
                        {row.degree_level?.name ?? "All"}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              row.date_kind === "closing_date"
                                ? "font-utility text-ink"
                                : "font-utility text-slate"
                            }
                          >
                            {formatDeadlineDate(
                              row.deadline_date,
                              row.date_kind,
                            )}
                          </span>
                          {row.date_kind === "closing_date" ? (
                            <StatusBadge status={status} />
                          ) : (
                            <span className="font-body text-xs text-slate">
                              Recommended
                            </span>
                          )}
                        </span>
                        {row.notes ? (
                          <span className="mt-1 block font-body text-xs leading-snug text-slate">
                            {row.notes}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 font-utility text-xs text-slate">
                        {row.last_verified_at
                          ? shortDate(row.last_verified_at)
                          : "not recorded"}
                        {row.source_url ? (
                          <>
                            {" "}
                            <a
                              href={row.source_url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="underline decoration-slate/40 underline-offset-2 hover:text-ink"
                            >
                              source
                            </a>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>

        {groups.length === 0 && (
          <p className="mt-4 font-body text-sm text-slate">
            Deadline rows for this intake are being verified. Check the{" "}
            <Link
              href="/deadlines"
              className="font-medium text-status-open underline underline-offset-2"
            >
              full calendar
            </Link>{" "}
            in the meantime.
          </p>
        )}
      </ProfileSection>

      <FaqSection
        heading={`${hub.intakeName} intake: common questions`}
        items={hub.faq}
      />

      <div className="mt-10">
        <LastVerified date={hub.lastVerified} sources={hub.sources} />
      </div>

      <RelatedLinks
        items={related}
        className="mt-10 border-t border-ink/10 pt-8"
      />

      <p className="mt-8 font-body text-xs text-slate">
        This is general information, not migration advice. Application dates,
        visa rules, and university requirements change. Confirm every figure with
        the university and the Australian Government before you rely on it.
      </p>
    </main>
  );
}
