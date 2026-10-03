import type { ReactNode } from "react";

/**
 * The standard section header used across content pages (visa, scholarship,
 * university, guide sub-sections): an accent bar followed by a display-face
 * title. `ProfileSection` wraps this with a divider; standalone sections use
 * it directly.
 */
export function SectionHeading({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={`mb-5 flex items-center gap-3 font-display text-2xl font-semibold text-ink sm:text-[1.75rem] ${className}`}
    >
      <span
        aria-hidden
        className="section-bar inline-block h-7 w-1.5 flex-shrink-0 rounded-full"
        style={{
          backgroundColor:
            "var(--color-status-open)",
        }}
      />
      {children}
    </Tag>
  );
}
