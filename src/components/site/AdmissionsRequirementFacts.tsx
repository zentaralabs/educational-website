"use client";

import { Fact } from "@/components/site/ProfileSection";
import { useStudentType } from "@/lib/student-type";

function formatEnglishScore(
  overall: number | null,
  listening: number | null,
  reading: number | null,
  writing: number | null,
  speaking: number | null,
): string | null {
  if (!overall) return null;
  const bands = [
    listening && `L${listening}`,
    reading && `R${reading}`,
    writing && `W${writing}`,
    speaking && `S${speaking}`,
  ]
    .filter(Boolean)
    .join(" ");
  return `${overall} overall${bands ? ` — ${bands}` : ""}`;
}

/**
 * IELTS/PTE and the academic requirement text vary by student type: English
 * tests only apply to international applicants, and domestic entry bars
 * (e.g. a plain ATAR cutoff) are often simpler than the international one.
 */
export function AdmissionsRequirementFacts({
  requiredTests,
  gpaRequirement,
  atarRequirement,
  academicRequirement,
  academicRequirementDomestic,
  ieltsOverall,
  ieltsListening,
  ieltsReading,
  ieltsWriting,
  ieltsSpeaking,
  pteOverall,
  pteListening,
  pteReading,
  pteWriting,
  pteSpeaking,
}: {
  requiredTests: string[] | null;
  gpaRequirement: string | null;
  atarRequirement: string | null;
  academicRequirement: string | null;
  academicRequirementDomestic: string | null;
  ieltsOverall: number | null;
  ieltsListening: number | null;
  ieltsReading: number | null;
  ieltsWriting: number | null;
  ieltsSpeaking: number | null;
  pteOverall: number | null;
  pteListening: number | null;
  pteReading: number | null;
  pteWriting: number | null;
  pteSpeaking: number | null;
}) {
  const { resolved } = useStudentType();

  const academicRequirementText =
    resolved === "domestic"
      ? (academicRequirementDomestic ?? academicRequirement)
      : academicRequirement;

  const ieltsSummary =
    resolved === "domestic"
      ? null
      : formatEnglishScore(ieltsOverall, ieltsListening, ieltsReading, ieltsWriting, ieltsSpeaking);
  const pteSummary =
    resolved === "domestic"
      ? null
      : formatEnglishScore(pteOverall, pteListening, pteReading, pteWriting, pteSpeaking);

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
      <Fact
        label="IELTS requirement (typical)"
        value={
          ieltsSummary && (
            <>
              {ieltsSummary}
              <span className="mt-0.5 block font-body text-xs font-normal normal-case text-slate">
                Some programs set a higher bar — see the program list below.
              </span>
            </>
          )
        }
      />
      <Fact
        label="PTE requirement (typical)"
        value={
          pteSummary && (
            <>
              {pteSummary}
              <span className="mt-0.5 block font-body text-xs font-normal normal-case text-slate">
                Some programs set a higher bar — see the program list below.
              </span>
            </>
          )
        }
      />
    </>
  );
}
