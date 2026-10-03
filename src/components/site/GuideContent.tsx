import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { headingText, slugifyHeading } from "@/lib/toc";

/** h2/h3 get slug ids (so the "On this page" rail can deep-link to them)
 *  plus scroll-margin, so the sticky header doesn't cover a jumped-to
 *  heading. Question-shaped h2s are flagged so the article styling can
 *  render them as FAQ-style prompts instead of numbered chapters. */
function H2({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
  const text = headingText(children);
  const id = slugifyHeading(text);
  const isQuestion = text.trim().endsWith("?");
  return (
    <h2
      id={id || undefined}
      className={`scroll-mt-24${isQuestion ? " is-question" : ""}`}
      {...props}
    >
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

/* Money amounts are what readers scan for. Wrapping them in a chip is purely
   presentational: the text content (and so the indexed copy) is unchanged. */
const MONEY = /((?:AUD\s?|A\$|\$)\d[\d,]*(?:\.\d+)?)/g;

function decorate(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child !== "string") return child;
    const parts = child.split(MONEY);
    if (parts.length === 1) return child;
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="figure-chip">
          {part}
        </span>
      ) : (
        part
      ),
    );
  });
}

const CALLOUT = /^(tip|note|important|warning|heads up|key point|remember|watch out)\b/i;

/** A paragraph that opens with a bold "Tip:" / "Note:" / "Important:" lead
 *  becomes a callout card. Everything else is a normal paragraph. */
function P({ children, ...props }: ComponentPropsWithoutRef<"p">) {
  const first = Children.toArray(children)[0];
  if (isValidElement<{ children?: ReactNode }>(first) && first.type === "strong") {
    const lead = headingText(first.props.children).trim();
    const match = lead.match(CALLOUT);
    if (match) {
      const kind = /warning|watch out|important/i.test(match[1])
        ? "warn"
        : /tip|remember/i.test(match[1])
          ? "tip"
          : "note";
      return (
        <p className={`callout callout-${kind}`} {...props}>
          {children}
        </p>
      );
    }
  }
  return <p {...props}>{decorate(children)}</p>;
}

function Li({ children, ...props }: ComponentPropsWithoutRef<"li">) {
  return <li {...props}>{decorate(children)}</li>;
}

function Td({ children, ...props }: ComponentPropsWithoutRef<"td">) {
  return <td {...props}>{decorate(children)}</td>;
}

/** Wide tables scroll inside their own rounded frame instead of breaking
 *  the page width on phones. */
function Table({ children, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="table-wrap" tabIndex={0}>
      <table {...props}>{children}</table>
    </div>
  );
}

export function GuideContent({
  content,
  variant = "compact",
}: {
  content: string;
  /** `article` is the rich long-form treatment (guides, blog, comparisons);
   *  `compact` is the quieter style for sub-sections and legal copy. */
  variant?: "compact" | "article" | "section";
}) {
  const article = variant !== "compact";
  return (
    <div
      className={`prose-guide font-body text-base leading-relaxed text-ink${
        article ? " prose-article" : ""
      }${variant === "section" ? " prose-section" : ""
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={
          article
            ? { h2: H2, h3: H3, p: P, li: Li, td: Td, table: Table }
            : { h2: H2, h3: H3 }
        }
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
