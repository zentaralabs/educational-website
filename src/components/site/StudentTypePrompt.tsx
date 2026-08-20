"use client";

import { useStudentType } from "@/lib/student-type";

/** First-visit homepage prompt — once set, this collapses to a quiet confirmation since the header toggle handles changing it later. */
export function StudentTypePrompt() {
  const { studentType, setStudentType } = useStudentType();

  if (studentType) {
    return (
      <p className="mt-4 font-body text-sm text-slate">
        Showing fees for {studentType} students.{" "}
        <button
          type="button"
          onClick={() => setStudentType(studentType === "domestic" ? "international" : "domestic")}
          className="underline decoration-slate/40 underline-offset-2 hover:text-ink hover:decoration-ink"
        >
          Not right? Switch to {studentType === "domestic" ? "international" : "domestic"}.
        </button>
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <p className="font-body text-sm text-slate">
        Are you a domestic or international applicant? We&rsquo;ll show the right tuition fee for you.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStudentType("domestic")}
          className="rounded-md border border-ink/20 px-4 py-1.5 font-body text-sm font-medium text-ink transition-colors duration-150 hover:border-status-open"
        >
          Domestic
        </button>
        <button
          type="button"
          onClick={() => setStudentType("international")}
          className="rounded-md bg-ink px-4 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          International
        </button>
      </div>
    </div>
  );
}
