import Link from "next/link";
import type { PublicScholarshipListRow } from "@/lib/queries/public-scholarships";

type Uni = { slug: string; name: string };

/**
 * Published scholarships for a handful of universities, straight from the
 * scholarships table (each row is re-verified against the university's own
 * page; see scripts/scholarship_corrections_*.mjs). Nothing is hand-written
 * here, so it stays correct when the rows are corrected.
 */
export function UniversityScholarships({
  heading,
  intro,
  universities,
  scholarships,
}: {
  heading: string;
  intro: string;
  universities: Uni[];
  scholarships: PublicScholarshipListRow[];
}) {
  const byUni = universities.map((u) => ({
    uni: u,
    rows: scholarships.filter((s) => s.universities.some((su) => su.slug === u.slug)),
  }));
  const withRows = byUni.filter((b) => b.rows.length > 0);
  if (withRows.length === 0) return null;
  const without = byUni.filter((b) => b.rows.length === 0).map((b) => b.uni.name);

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-ink">{heading}</h2>
      <p className="mt-3 font-body text-base leading-relaxed text-ink">{intro}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {withRows.flatMap(({ uni, rows }) =>
          rows.map((s) => (
            <li
              key={`${uni.slug}-${s.slug}`}
              className="rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm text-ink"
            >
              <Link href={`/scholarships/${s.slug}`} className="font-semibold hover:underline">
                {s.name}
              </Link>
              <span className="text-slate"> at {uni.name}</span>
              {s.amount && <span>: {s.amount}</span>}
              {s.separate_application != null && (
                <span className="mt-1 block text-xs text-slate">
                  {s.separate_application
                    ? "Needs a separate application"
                    : "Assessed with your course application"}
                </span>
              )}
            </li>
          )),
        )}
      </ul>
      {without.length > 0 && (
        <p className="mt-3 font-body text-sm text-slate">
          No scholarship is on record for {without.join(", ")}. That does not rule out
          awards, so check the university directly.
        </p>
      )}
    </section>
  );
}
