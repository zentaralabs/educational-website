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
      className={`mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink ${className}`}
    >
      <span
        aria-hidden
        className="inline-block h-5 w-1 flex-shrink-0 rounded-full"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-status-open) 60%, transparent)",
        }}
      />
      {children}
    </Tag>
  );
}
