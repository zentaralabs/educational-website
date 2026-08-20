import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { ComparisonUniversityRow } from "@/lib/queries/public-universities";

const ROWS: {
  label: string;
  value: (u: ComparisonUniversityRow) => string | null;
}[] = [
  { label: "Country", value: (u) => u.country?.name ?? null },
  { label: "Acceptance rate", value: (u) => formatPercent(u.acceptance_rate) },
  {
    label: "Tuition (international)",
    value: (u) => formatCurrency(u.tuition_international, u.currency),
  },
  {
    label: "Tuition (domestic)",
    value: (u) => formatCurrency(u.tuition_domestic, u.currency),
  },
  {
    label: "Est. cost of attendance",
    value: (u) => formatCurrency(u.est_cost_of_attendance, u.currency),
  },
  { label: "Student:faculty ratio", value: (u) => u.student_faculty_ratio },
  { label: "Required tests", value: (u) => u.required_tests?.join(", ") ?? null },
];

export function ComparisonTable({
  universities,
}: {
  universities: ComparisonUniversityRow[];
}) {
  if (universities.length < 2) return null;

  return (
    <div className="overflow-x-auto rounded-md border border-ink/15">
      <table className="w-full border-collapse font-body text-sm">
        <thead>
          <tr>
            <th className="border-b border-ink/15 px-4 py-3 text-left font-body text-xs font-semibold tracking-wide text-slate uppercase">
              &nbsp;
            </th>
            {universities.map((u) => (
              <th
                key={u.id}
                className="border-b border-ink/15 px-4 py-3 text-left font-display text-base font-semibold text-ink"
              >
                <Link
                  href={`/universities/${u.slug}`}
                  className="hover:underline"
                >
                  {u.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-ink/10 last:border-b-0">
              <th className="px-4 py-2.5 text-left font-body text-xs font-semibold tracking-wide text-slate uppercase">
                {row.label}
              </th>
              {universities.map((u) => (
                <td key={u.id} className="px-4 py-2.5 font-utility text-sm text-ink">
                  {row.value(u) ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
