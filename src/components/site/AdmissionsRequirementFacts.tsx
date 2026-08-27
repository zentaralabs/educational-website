"use client";

import { Fact } from "@/components/site/ProfileSection";
import { useStudentType } from "@/lib/student-type";

/**
 * Academic requirement text varies by student type: domestic entry bars
 * (e.g. a plain ATAR cutoff) are often simpler than the international one.
 * Required tests (IELTS/PTE) are international-only, hidden for domestic —
 * actual band requirements live per-program in the program list, since
 * they vary by program and this university-level fact would otherwise
 * misrepresent them as one fixed number.
 */
export function AdmissionsRequirementFacts({
  requiredTests,
  gpaRequirement,
  atarRequirement,
  academicRequirement,
  academicRequirementDomestic,
  ieltsOverall,
  pteOverall,
}: {
  requiredTests: string[] | null;
  gpaRequirement: string | null;
  atarRequirement: string | null;
  academicRequirement: string | null;
  academicRequirementDomestic: string | null;
  ieltsOverall: number | null;
  pteOverall: number | null;
}) {
  const { resolved } = useStudentType();

  const academicRequirementText =
    resolved === "domestic"
      ? (academicRequirementDomestic ?? academicRequirement)
      : academicRequirement;

  // Institutional minimum only; specific programs list their own bands in
  // the program list. Shown for international visitors, same as required tests.
  const englishMinimum = [
    ieltsOverall != null ? `IELTS ${ieltsOverall}` : null,
    pteOverall != null ? `PTE ${pteOverall}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Fact
        label={resolved === "domestic" ? "ATAR requirement" : "GPA requirement"}
        value={resolved === "domestic" ? atarRequirement : gpaRequirement}
      />
      <Fact label="Academic requirement" value={academicRequirementText} />
      {resolved !== "domestic" && (
        <Fact label="Required tests" value={requiredTests?.join(", ")} />
      )}
      {resolved !== "domestic" && (
        <Fact
          label="English (institutional minimum)"
          value={englishMinimum || null}
        />
      )}
    </>
  );
}
