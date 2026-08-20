"use client";

import { useStudentType } from "@/lib/student-type";

/** Compact header pill so the domestic/international choice is visible and changeable from anywhere, not just the homepage. */
export function StudentTypeToggle() {
  const { resolved, setStudentType } = useStudentType();

  return (
    <div className="flex items-center rounded-full border border-ink/15 p-0.5 font-utility text-xs">
      {(["domestic", "international"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setStudentType(option)}
          aria-pressed={resolved === option}
          className={`rounded-full px-2.5 py-1 capitalize transition-colors duration-150 ${
            resolved === option
              ? "bg-ink text-paper"
              : "text-slate hover:text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
