/**
 * Pulls question-shaped headings + the paragraph beneath them out of guide
 * markdown, for FAQPage schema.org markup (GEO tactic, Section 5). Guides
 * aren't authored as structured Q&A, so this only picks up headings that
 * already read as questions — no guessing at intent beyond that.
 */
export function extractFaqItems(
  markdown: string,
): { question: string; answer: string }[] {
  const lines = markdown.split("\n");
  const items: { question: string; answer: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(/^#{2,3}\s+(.*\?)\s*$/);
    if (!heading) continue;

    const answerLines: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (/^#{1,6}\s/.test(lines[j])) break;
      if (lines[j].trim()) answerLines.push(lines[j].trim());
      else if (answerLines.length) break;
    }

    if (answerLines.length) {
      items.push({ question: heading[1].trim(), answer: answerLines.join(" ") });
    }
  }

  return items;
}
