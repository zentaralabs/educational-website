import type { ContentStatus } from "@/lib/supabase/types";

const CONFIG: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--color-slate)" },
  needs_review: { label: "Needs review", color: "var(--color-status-pending)" },
  verified: { label: "Verified", color: "var(--color-status-open)" },
  published: { label: "Published", color: "var(--color-status-open)" },
  archived: { label: "Archived", color: "var(--color-status-closed)" },
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const { label, color } = CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-body text-xs font-medium"
      style={{ color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
