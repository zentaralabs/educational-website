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
}: {
  requiredTests: string[] | null;
  gpaRequirement: string | null;
  atarRequirement: string | null;
  academicRequirement: string | null;
  academicRequirementDomestic: string | null;
}) {
  const { resolved } = useStudentType();

  const academicRequirementText =
    resolved === "domestic"
      ? (academicRequirementDomestic ?? academicRequirement)
      : academicRequirement;

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
    </>
  );
}
