import type { ReactNode } from "react";

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** GitHub-style slug: lowercase, strip punctuation, spaces to hyphens. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Flattens the markdown/JSX children ReactMarkdown hands a heading into plain text. */
export function headingText(children: ReactNode): string {
  if (children == null || children === false) return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (typeof children === "object" && "props" in (children as object)) {
    return headingText((children as { props: { children: ReactNode } }).props.children);
  }
  return "";
}

/**
 * Pulls h2 and h3 headings out of guide/post markdown for the "On this page"
 * rail. Skips anything inside fenced code blocks. IDs are produced by the
 * same slugifyHeading GuideContent puts on the rendered headings, so no
 * de-duplication here (a repeated heading just anchors to its first use).
 */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = slugifyHeading(text);
    if (id) items.push({ id, text, level });
  }

  return items;
}
