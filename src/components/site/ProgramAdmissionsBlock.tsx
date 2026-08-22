"use client";

import { useStudentType } from "@/lib/student-type";

/**
 * Admission requirements prose, plus the free-text English requirements
 * note — but only when there's no structured IELTS/PTE score already
 * covering it in the sidebar, so the two don't repeat the same numbers.
 * Hidden for domestic visitors, same as the sidebar's English scores.
 */
export function ProgramAdmissionsBlock({
  admissionRequirements,
  englishRequirements,
  hasStructuredEnglishScore,
}: {
  admissionRequirements: string | null;
  englishRequirements: string | null;
  hasStructuredEnglishScore: boolean;
}) {
  const { resolved } = useStudentType();
  const showEnglishText = resolved !== "domestic" && !hasStructuredEnglishScore && Boolean(englishRequirements);

  if (!admissionRequirements && !showEnglishText) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-ink/[0.035] p-5">
      {admissionRequirements && (
        <p className="font-body text-base leading-relaxed text-ink">{admissionRequirements}</p>
      )}
      {showEnglishText && (
        <p className="font-body text-sm leading-relaxed text-slate">{englishRequirements}</p>
      )}
    </div>
  );
}
