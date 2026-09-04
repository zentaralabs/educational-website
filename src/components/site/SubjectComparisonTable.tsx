import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { SubjectProgram } from "@/lib/queries/public-subjects";

function formatDuration(years: number | null): string {
  if (years == null || years <= 0) return "—";
  // Whole or half years read naturally as years; the odd accelerated
  // lengths (Bond's 1.3-year master's, a 0.7-year honours year) read more
  // clearly as a month count.
  const isWholeOrHalf = Math.abs(years * 2 - Math.round(years * 2)) < 0.01;
  if (isWholeOrHalf && years >= 1) {
    const v = Math.round(years * 2) / 2;
    return `${v} year${v === 1 ? "" : "s"}`;
  }
  const months = Math.round(years * 12);
  return `${months} months`;
}

function shortCity(city: string): string {
  return city.split(/[,(]/)[0].trim();
}

/**
 * Cross-university comparison of every published program matched to a
 * subject — the one view a single university's own site can't give a
 * prospective student. Sorted cheapest-first (unpriced rows last), then by
 * university. Static markup: the value is the aggregated data, not sorting
 * controls.
 */
export function SubjectComparisonTable({
  subjectName,
  programs,
}: {
  subjectName: string;
  programs: SubjectProgram[];
}) {
  if (programs.length === 0) return null;

  const CAP = 60;

  const sorted = [...programs].sort((a, b) => {
    if (a.tuition == null && b.tuition != null) return 1;
    if (b.tuition == null && a.tuition != null) return -1;
    if (a.tuition != null && b.tuition != null && a.tuition !== b.tuition)
      return a.tuition - b.tuition;
    return (
      a.universityName.localeCompare(b.universityName) ||
      a.name.localeCompare(b.name)
    );
  });
  const rows = sorted.slice(0, CAP);
  const capped = sorted.length > CAP;

  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-xl font-semibold text-ink">
        {capped
          ? `Compare ${subjectName} programs`
          : `Compare all ${rows.length} ${subjectName} programs`}
      </h2>
      <p className="mb-4 font-body text-sm text-slate">
        {capped
          ? `The ${CAP} lowest-tuition ${subjectName} degrees for international students, of ${sorted.length} in our dataset. `
          : `Every ${subjectName} degree for international students in our dataset, cheapest first. `}
        Tuition is the indicative annual international fee;
        IELTS is the program&rsquo;s own overall minimum where it sets one,
        otherwise the university&rsquo;s institutional minimum. Confirm both on
        the course page before you apply.
      </p>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <caption className="sr-only">
            {subjectName} programs for international students at Australian
            universities, with university, degree level, duration, annual
            international tuition, and IELTS requirement, sorted by tuition.
          </caption>
          <thead>
            <tr className="bg-mist font-utility text-xs font-semibold tracking-wide text-slate uppercase">
              <th className="px-3 py-2.5">University</th>
              <th className="px-3 py-2.5">Program</th>
              <th className="px-3 py-2.5">Level</th>
              <th className="px-3 py-2.5 whitespace-nowrap">Duration</th>
              <th className="px-3 py-2.5 whitespace-nowrap">Tuition / yr</th>
              <th className="px-3 py-2.5">IELTS</th>
            </tr>
          </thead>
          <tbody className="font-body text-sm">
            {rows.map((p, i) => (
              <tr
                key={p.id}
                className="align-top"
                style={{
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "var(--color-line)",
                }}
              >
                <td className="px-3 py-3">
                  <Link
                    href={`/universities/${p.universitySlug}`}
                    className="font-medium text-ink hover:text-status-open hover:underline"
                  >
                    {p.universityName}
                  </Link>
                  {p.universityCity && (
                    <span className="mt-0.5 block font-utility text-xs text-slate">
                      {shortCity(p.universityCity)}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/universities/${p.universitySlug}/programs/${p.slug}`}
                    className="text-ink hover:text-status-open hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-slate">{p.degreeLevel ?? "—"}</td>
                <td className="px-3 py-3 whitespace-nowrap text-slate">
                  {formatDuration(p.durationYears)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap font-utility font-medium text-status-open">
                  {p.tuition != null
                    ? `${formatCurrency(p.tuition, p.currency)}`
                    : "—"}
                </td>
                <td className="px-3 py-3 font-utility text-slate">
                  {p.ielts != null ? p.ielts.toFixed(1) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 font-body text-xs text-slate">
        Figures are approximate, drawn from this site&rsquo;s database and each
        program&rsquo;s official course page, and change annually. A dash means
        the figure is not published at program level.
      </p>
    </section>
  );
}
