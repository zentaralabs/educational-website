"use client";

import { useStudentType } from "@/lib/student-type";
import { CheckBadgeIcon } from "@/components/site/icons";

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
    <div className="flex gap-3 rounded-xl border-l-4 border-status-open bg-mist p-5">
      <CheckBadgeIcon className="mt-0.5 h-5 w-5 text-status-open" />
      <div className="flex flex-col gap-2">
        {admissionRequirements && (
          <p className="font-body text-base leading-relaxed text-ink">{admissionRequirements}</p>
        )}
        {showEnglishText && (
          <p className="font-body text-sm leading-relaxed text-slate">{englishRequirements}</p>
        )}
      </div>
    </div>
  );
}
