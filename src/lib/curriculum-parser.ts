/**
 * Parses a program's `curriculum` text into per-term structure for display.
 *
 * Shared between the program page renderer
 * (src/app/(site)/universities/[slug]/programs/[programSlug]/page.tsx) and
 * scripts/check_curriculum_quality.mjs, so the audit script tests the exact
 * same logic the site actually renders with, rather than a hand-maintained
 * copy that can drift out of sync (as happened during the Sept 2026
 * Canberra/Wollongong/UTS curriculum-rendering bug sweep — three separate
 * per-university data conventions each broke this differently, so the fix
 * needed one shared, testable source of truth instead of ad hoc scripts).
 */

export type CurriculumItem = { code: string | null; text: string; electiveCount: string | null };
export type CurriculumTerm = {
  label: string | null;
  units: string | null;
  items: CurriculumItem[];
  /** Set instead of `items` when a line has no reliable per-unit delimiter
   *  at all (raw scraped prose) — rendered as a paragraph, not a bullet. */
  freeformText: string | null;
};

/** Splits `str` on `delimiter`, ignoring delimiters that fall inside "(...)" —
 *  so "Name (A, B), Other" splits into ["Name (A, B)", "Other"], not three. */
export function splitOutsideParens(str: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === delimiter && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

/**
 * Parses one curriculum line. The primary shape is
 * "Label — CODE1 Name; CODE2 Name; 2 electives (24 units)." from the
 * build-out import scripts, but several per-university scrapers (e.g.
 * Canberra's accordion scraper) instead write
 * "Label: Name (CODE), Name (CODE), ..." — comma-separated with a trailing
 * parenthesized code per unit, and no semicolons at all. Handle both, and
 * fall back to a plain paragraph for scrapers that wrote raw unstructured
 * text with neither delimiter (e.g. Curtin).
 */
export function parseCurriculumLine(line: string): CurriculumTerm {
  const separatorIndex = line.indexOf(" — ");
  let label = separatorIndex === -1 ? null : line.slice(0, separatorIndex).trim();
  let body = separatorIndex === -1 ? line : line.slice(separatorIndex + 3);

  const unitsMatch = body.match(/\((\d+)\s*units?\)\.?\s*$/i);
  const units = unitsMatch ? `${unitsMatch[1]} units` : null;
  if (unitsMatch) body = body.slice(0, unitsMatch.index).trim();

  const hasSemicolons = body.includes(";");

  // "Label: Name (CODE), Name (CODE), ..." — only kick in when there's no
  // " — " label and no ";" items already, so well-formed lines are untouched.
  if (label === null && !hasSemicolons) {
    const colonIndex = body.indexOf(":");
    if (colonIndex !== -1 && colonIndex < 60) {
      const candidateLabel = body.slice(0, colonIndex).trim();
      const candidateBody = body.slice(colonIndex + 1).trim();
      if (candidateLabel && /\([^()]*\d[^()]*\)\s*,/.test(candidateBody)) {
        label = candidateLabel;
        body = candidateBody;
      }
    }
  }

  const rawItems = hasSemicolons
    ? splitOutsideParens(body, ";")
    : splitOutsideParens(body, ",");

  const items = rawItems
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((segment): CurriculumItem => {
      // A stray inline "Section Label: " prefix (no digits in it) sometimes
      // survives the split when a scraper joined multiple labeled groups
      // into one comma list without separating them — strip it so the code
      // match below still fires on the actual unit code that follows.
      const inlineLabelMatch = segment.match(/^([A-Za-z][A-Za-z &]{2,30}):\s*/);
      if (inlineLabelMatch && !/\d/.test(inlineLabelMatch[1])) {
        segment = segment.slice(inlineLabelMatch[0].length);
      }
      // Checked before the code pattern below since a bare "2 electives"
      // would otherwise match a purely-numeric code too.
      const electiveMatch = segment.match(/^(\d+)\s+electives?$/i);
      if (electiveMatch) return { code: null, text: "Elective", electiveCount: electiveMatch[1] };
      // Letter-prefixed ("ACCT11-100") or purely-numeric (UTS: "15312",
      // Canberra-style before that data was switched to trailing-code) codes.
      // No leading zero: a real course code never starts with 0, which also
      // keeps this from misfiring on a thousands-separated number split by
      // the comma fallback (e.g. "80,000 words" -> "000 words").
      const codeMatch = segment.match(/^([A-Z]{2,6}\d{1,4}(?:-\d{1,4})?|[1-9]\d{2,5})\s+(.+)$/);
      if (codeMatch) return { code: codeMatch[1], text: codeMatch[2], electiveCount: null };
      // "Name (CODE)" — trailing parenthetical only counts as a code badge
      // when it contains a digit, so "(elective)"-style asides stay as text.
      const trailingCodeMatch = segment.match(/^(.+?)\s*\(([^()]{2,12})\)$/);
      if (trailingCodeMatch && /\d/.test(trailingCodeMatch[2])) {
        return { code: trailingCodeMatch[2], text: trailingCodeMatch[1].trim(), electiveCount: null };
      }
      return { code: null, text: segment, electiveCount: null };
    });

  // No delimiter structure was found at all: one long blob with no code and
  // no comma/semicolon split. Render it as prose instead of a single
  // misleadingly bulleted item.
  if (items.length === 1 && items[0].code === null && items[0].text.length > 220) {
    return { label, units, items: [], freeformText: items[0].text };
  }

  return { label, units, items, freeformText: null };
}

/** Parses a full `curriculum` field (one line per term) into term cards. */
export function parseCurriculum(curriculum: string | null | undefined): CurriculumTerm[] {
  if (!curriculum) return [];
  return curriculum
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCurriculumLine);
}
