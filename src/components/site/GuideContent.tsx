import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { headingText, slugifyHeading } from "@/lib/toc";

/** h2/h3 get slug ids (so the "On this page" rail can deep-link to them)
 *  plus scroll-margin, so the sticky header doesn't cover a jumped-to
 *  heading. */
function H2({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
  const id = slugifyHeading(headingText(children));
  return (
    <h2 id={id || undefined} className="scroll-mt-24" {...props}>
      {children}
    </h2>
  );
}

function H3({ children, ...props }: ComponentPropsWithoutRef<"h3">) {
  const id = slugifyHeading(headingText(children));
  return (
    <h3 id={id || undefined} className="scroll-mt-24" {...props}>
      {children}
    </h3>
  );
}

export function GuideContent({ content }: { content: string }) {
  return (
    <div className="prose-guide font-body text-base leading-relaxed text-ink">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h2: H2, h3: H3 }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
