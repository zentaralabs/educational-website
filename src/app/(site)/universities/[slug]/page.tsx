import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { Fact, ProfileSection } from "@/components/site/ProfileSection";
import { LastVerified } from "@/components/site/LastVerified";
import { deadlineBadgeStatus, formatDeadlineDate } from "@/lib/deadline-status";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getPublishedProgramsForUniversity } from "@/lib/queries/public-programs";
import {
  getPublishedDeadlinesForUniversity,
  getPublishedScholarshipsForUniversity,
  getPublishedUniversity,
  listPublishedUniversitySlugs,
} from "@/lib/queries/public-universities";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listPublishedUniversitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const university = await getPublishedUniversity(slug);
  if (!university) return {};

  const title = `${university.name} — Deadlines, Admissions & Costs`;
  const description =
    university.distinctive_summary?.slice(0, 155) ??
    `Application deadlines, admissions requirements, tuition, and scholarships for ${university.name}.`;

  return { title, description };
}

export default async function UniversityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const university = await getPublishedUniversity(slug);
  if (!university) notFound();

  const [deadlines, scholarships, programs] = await Promise.all([
    getPublishedDeadlinesForUniversity(university.id),
    getPublishedScholarshipsForUniversity(university.id),
    getPublishedProgramsForUniversity(university.id),
  ]);

  const nextDeadline = deadlines.find(
    (d) => !d.is_rolling && deadlineBadgeStatus(d.deadline_date, d.is_rolling) === "upcoming",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: university.name,
    url: university.website_url ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: university.city ?? undefined,
      addressRegion: university.region ?? undefined,
      addressCountry: university.country?.code,
    },
    foundingDate: university.founded_year ? String(university.founded_year) : undefined,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="font-body text-base text-slate">
        {[university.city, university.region, university.country?.name]
          .filter(Boolean)
          .join(", ")}
        {university.institution_type && ` · ${university.institution_type}`}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink text-balance">
        {university.name}
      </h1>

      {/* Answer-first fact, per GEO strategy Section 5 — lead with the direct
          fact so it's citable without context. */}
      {nextDeadline && (
        <p className="mt-4 rounded-md border border-ink/15 bg-ink/[0.02] px-4 py-3 font-body text-base text-ink">
          {university.name}&rsquo;s {nextDeadline.deadline_type?.name ?? "next"} deadline
          is{" "}
          <strong className="font-semibold">
            {new Date(nextDeadline.deadline_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </strong>
          {nextDeadline.degree_level && ` for ${nextDeadline.degree_level.name}`}.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {university.rankings.slice(0, 3).map((r) => (
          <span
            key={r.id}
            className="rounded-sm border border-ink/15 px-2 py-0.5 font-utility text-xs text-slate"
          >
            #{r.rank} {r.category ?? "Overall"} · {r.ranking_body?.name} {r.year}
          </span>
        ))}
      </div>

      {university.website_url && (
        <a
          href={university.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-body text-base text-status-open underline underline-offset-2"
        >
          Official website ↗
        </a>
      )}

      {university.distinctive_summary && (
        <ProfileSection title="Overview">
          <p className="font-body text-base leading-relaxed text-ink">
            {university.distinctive_summary}
          </p>
        </ProfileSection>
      )}

      <ProfileSection title="Admissions">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact label="Acceptance rate" value={formatPercent(university.acceptance_rate)} />
          <Fact label="GPA requirement" value={university.gpa_requirement} />
          <Fact
            label="Required tests"
            value={university.required_tests?.join(", ")}
          />
          <Fact label="Test score range" value={university.test_score_range} />
          <Fact
            label="Required documents"
            value={university.required_documents?.join(", ")}
          />
          <Fact
            label="Application platform"
            value={university.application_platform?.name}
          />
          <Fact
            label="Degree levels"
            value={university.degree_levels.map((d) => d.name).join(", ")}
          />
        </dl>
      </ProfileSection>

      <ProfileSection title="Cost & aid">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact
            label="Tuition (in-state)"
            value={formatCurrency(university.tuition_in_state)}
          />
          <Fact
            label="Tuition (out-of-state)"
            value={formatCurrency(university.tuition_out_state)}
          />
          <Fact
            label="Tuition (international)"
            value={formatCurrency(university.tuition_international)}
          />
          <Fact
            label="Est. cost of attendance"
            value={formatCurrency(university.est_cost_of_attendance)}
          />
        </dl>

        {scholarships.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {scholarships.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-md border border-ink/10 px-3 py-2 text-sm"
              >
                <span className="text-ink">{s.name}</span>
                {s.amount && <span className="font-utility text-xs text-slate">{s.amount}</span>}
              </li>
            ))}
          </ul>
        )}
      </ProfileSection>

      <ProfileSection title="Academics">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact
            label="Popular majors"
            value={university.popular_majors?.join(", ")}
          />
          <Fact label="Student:faculty ratio" value={university.student_faculty_ratio} />
        </dl>

        {programs.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-md border border-ink/15">
            {programs.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                style={{
                  borderBottomWidth: i < programs.length - 1 ? 1 : 0,
                  borderBottomColor:
                    "color-mix(in srgb, var(--color-ink) 10%, transparent)",
                }}
              >
                <span className="text-ink">
                  {p.name}
                  {p.degree_level && (
                    <span className="text-slate"> — {p.degree_level.name}</span>
                  )}
                  {p.subject && (
                    <span className="text-slate"> · {p.subject.name}</span>
                  )}
                </span>
                <div className="flex items-center gap-3 font-utility text-xs text-slate">
                  {p.duration_years && <span>{p.duration_years} yr</span>}
                  <span>
                    {formatCurrency(
                      p.tuition_international ?? university.tuition_international,
                    ) ?? "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ProfileSection>

      {university.international_student_notes && (
        <ProfileSection title="For international students">
          <p className="font-body text-base leading-relaxed text-ink">
            {university.international_student_notes}
          </p>
        </ProfileSection>
      )}

      {deadlines.length > 0 && (
        <ProfileSection title="All deadlines">
          <div className="overflow-hidden rounded-md border border-ink/15">
            {deadlines.map((d, i) => {
              const status = deadlineBadgeStatus(d.deadline_date, d.is_rolling);
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-4 border-l-4 px-4 py-3 text-sm"
                  style={{
                    borderLeftColor: `var(--color-status-${status})`,
                    borderBottomWidth: i < deadlines.length - 1 ? 1 : 0,
                    borderBottomColor:
                      "color-mix(in srgb, var(--color-ink) 10%, transparent)",
                  }}
                >
                  <span className="text-ink">
                    {d.deadline_type?.name}
                    {d.degree_level && ` — ${d.degree_level.name}`}
                    {d.application_platform && ` · ${d.application_platform.name}`}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-utility text-xs text-slate">
                      {formatDeadlineDate(d.deadline_date, d.is_rolling)}
                    </span>
                    <StatusBadge status={status} />
                  </div>
                </div>
              );
            })}
          </div>
        </ProfileSection>
      )}

      <ProfileSection title="Sources">
        <LastVerified
          date={university.last_verified_at}
          sources={university.source_urls}
        />
        {(university.author || university.reviewed_by) && (
          <p className="mt-2 font-body text-xs text-slate">
            {university.author && <>Written by {university.author.name}</>}
            {university.author?.credentials && ` (${university.author.credentials})`}
            {university.reviewed_by && <>{university.author ? " · " : ""}Reviewed by {university.reviewed_by.name}</>}
          </p>
        )}
      </ProfileSection>

      <Link
        href="/deadlines"
        className="mt-8 inline-block font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
      >
        ← Back to deadline calendar
      </Link>
    </main>
  );
}
