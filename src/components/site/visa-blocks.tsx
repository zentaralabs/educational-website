import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SectionHeading } from "@/components/site/SectionHeading";

/**
 * Structured blocks for the /visas/[slug] layout. All styling derives from the
 * design tokens in globals.css (ink / slate / mist / line / status-open,
 * font-display / font-body / font-utility) — no new colours or fonts.
 */

/** Inline markdown (bold, links) with no block wrapper, for list-item text. */
function Inline({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }: ComponentPropsWithoutRef<"p">) => <>{children}</>,
        a: ({ children, href }: ComponentPropsWithoutRef<"a">) => (
          <a
            href={href}
            className="text-status-open underline underline-offset-2"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

/**
 * Splits an eligibility / conditions markdown string into a leading prose
 * paragraph and its bullet list, then renders the bullets as numbered cards.
 * Falls back to nothing if there are no bullets to show.
 */
export function EligibilityChecklist({
  content,
  heading = "Eligibility checklist",
}: {
  content: string;
  heading?: string;
}) {
  const lines = content.split("\n");
  const items: string[] = [];
  const intro: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      items.push(line.slice(2).trim());
    } else if (line && items.length === 0) {
      intro.push(line);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeading>{heading}</SectionHeading>
      {intro.length > 0 && (
        <p className="mb-4 font-body text-base leading-relaxed text-ink/90">
          <Inline>{intro.join(" ")}</Inline>
        </p>
      )}
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-xl border border-line bg-paper p-4 shadow-card sm:p-5"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-status-open/10 font-utility text-sm font-semibold text-status-open">
              {i + 1}
            </span>
            <p className="font-body text-base leading-relaxed text-ink">
              <Inline>{item}</Inline>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export type VisaStream = {
  name: string;
  description: string;
  duration: string | null;
};

/** Sidebar cards for a multi-stream visa. Hidden when there are no streams. */
export function VisaStreams({ streams }: { streams: VisaStream[] | null }) {
  if (!streams || streams.length === 0) {
    return null;
  }
  return (
    <section>
      <SectionHeading>Visa streams</SectionHeading>
      <div className="flex flex-col gap-3">
        {streams.map((s) => (
          <div
            key={s.name}
            className="rounded-xl border border-line bg-mist p-4"
          >
            <p className="font-body text-[0.95rem] font-semibold text-ink">
              {s.name}
            </p>
            <p className="mt-1 font-body text-sm leading-relaxed text-slate">
              {s.description}
            </p>
            {s.duration && (
              <p className="mt-2 inline-block rounded-full bg-paper px-2.5 py-1 font-utility text-xs font-semibold tracking-wide text-status-open">
                {s.duration}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
