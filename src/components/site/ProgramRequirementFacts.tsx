"use client";

import { Fact } from "@/components/site/ProfileSection";
import { formatEnglishScore } from "@/lib/format";
import { useStudentType } from "@/lib/student-type";

/**
 * English proficiency tests (IELTS/PTE, plus the free-text english_requirements
 * note) are an international-applicant concept — hidden for domestic visitors,
 * same rule as the university-level admissions facts.
 */
export function ProgramRequirementFacts({
  admissionRequirements,
  englishRequirements,
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
  admissionRequirements: string | null;
  englishRequirements: string | null;
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
  const showEnglish = resolved !== "domestic";

  const ieltsSummary = showEnglish
    ? formatEnglishScore(ieltsOverall, ieltsListening, ieltsReading, ieltsWriting, ieltsSpeaking)
    : null;
  const pteSummary = showEnglish
    ? formatEnglishScore(pteOverall, pteListening, pteReading, pteWriting, pteSpeaking)
    : null;
  // The free-text note restates the same band scores in prose once either
  // structured score is set — show it only when it's the sole source of
  // English-requirement info, so the two don't repeat each other.
  const showEnglishText = showEnglish && !ieltsSummary && !pteSummary;

  return (
    <>
      <Fact label="Admission requirements" value={admissionRequirements} />
      {showEnglishText && <Fact label="English requirements" value={englishRequirements} />}
      {showEnglish && <Fact label="IELTS requirement" value={ieltsSummary} />}
      {showEnglish && <Fact label="PTE requirement" value={pteSummary} />}
    </>
  );
}
