import type { ReactNode } from "react";
import { EyeIcon } from "@/components/site/icons";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * First-hand experience block: a screenshot, an applicant walkthrough, "what
 * surprised us" — anything that could only be written by someone who actually
 * went through the process, as opposed to summarizing an official source.
 * Distinct from LastVerified (fact accuracy) and ArticleMeta (who wrote the
 * page); this is specifically the "we did this ourselves" signal.
 *
 * Renders nothing without real `children` — never ship this as an empty
 * placeholder box.
 */
export function FieldNotes({
  heading = "What we found",
  observedBy,
  date,
  children,
}: {
  heading?: string;
  observedBy?: string;
  date?: string | null;
  children: ReactNode;
}) {
  if (!children) return null;

  return (
    <aside className="mt-8 rounded-xl border border-line bg-mist px-5 py-4">
      <p className="flex items-center gap-1.5 font-utility text-xs font-semibold tracking-wide text-slate uppercase">
        <EyeIcon className="h-3.5 w-3.5" />
        {heading}
      </p>
      <div className="mt-2 font-body text-[0.95rem] leading-relaxed text-ink [&_p]:mt-2 [&_p:first-child]:mt-0">
        {children}
      </div>
      {(observedBy || date) && (
        <p className="mt-3 font-utility text-xs text-slate">
          {observedBy && <>Observed by {observedBy}</>}
          {observedBy && date && " · "}
          {date && <time dateTime={date}>{formatDate(date)}</time>}
        </p>
      )}
    </aside>
  );
}
