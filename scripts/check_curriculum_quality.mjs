import pg from "pg";
import fs from "fs";
import { parseCurriculum } from "../src/lib/curriculum-parser.ts";

// Read-only sweep for program curriculum text that will render badly on
// /universities/{slug}/programs/{programSlug} — a single term card claiming
// "1 term of coursework" that actually dumps a whole multi-year degree's
// units into one card, a raw comma-blob with no code badges, or a "code"
// badge that's really a credit-point suffix like "6cp".
//
// Runs the SAME parseCurriculum() the page renders with (src/lib/
// curriculum-parser.ts), so this tests actual rendering behavior rather than
// guessing from raw-text patterns — the approach that missed real bugs
// during manual review in Sept 2026 (Canberra's mislabeled "1 term" blob,
// Wollongong's tangled single-line format with "(Ncp)" credit suffixes on
// every unit, and UTS's numeric course codes not getting badge-extracted).
// Each of those was a different per-university scraper convention; new
// build-out sprints will likely introduce new ones parseCurriculumLine
// doesn't handle yet. Run this after any curriculum data import/sprint.
//
//   node scripts/check_curriculum_quality.mjs
//   node scripts/check_curriculum_quality.mjs --university university-of-canberra

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const uniFilterIdx = process.argv.indexOf("--university");
const uniFilter = uniFilterIdx !== -1 ? process.argv[uniFilterIdx + 1] : null;

/**
 * Heuristics for "this term card will look broken to a reader", checked
 * against the ACTUAL parsed output, not the raw text:
 *
 * - A single term whose one item is a huge comma/semicolon-fused blob
 *   (parseCurriculum's freeform-paragraph fallback didn't trigger because
 *   the text technically split into multiple "items", so the wall-of-text
 *   still renders as a bulleted list, just with 1 giant garbled bullet or a
 *   suspiciously low ratio of coded to total items).
 * - A term with several items but very few actually got a `code` badge,
 *   despite the raw text containing what looks like many course codes
 *   (suggests the renderer isn't recognizing this university's code format
 *   at all, same root cause as the UTS numeric-code gap).
 * - A "code" that's actually a credit-point marker ("6cp", "12CP") —
 *   confirms the trailing-code pattern is misfiring on a credit suffix
 *   instead of a real code, exactly the Wollongong bug shape.
 */
function findIssues(programSlug, uniSlug, curriculum) {
  const terms = parseCurriculum(curriculum);
  const issues = [];

  for (const term of terms) {
    if (term.freeformText) continue; // intentional prose fallback, fine

    const totalItems = term.items.length;
    if (totalItems === 0) continue;

    const codedItems = term.items.filter((i) => i.code).length;
    const cpMisfires = term.items.filter((i) => i.code && /^\d+\s*cp$/i.test(i.code)).length;

    if (cpMisfires > 0) {
      issues.push(
        `${cpMisfires} item(s) show a credit-point suffix ("Ncp") as if it were a course code`,
      );
    }

    // A single term with 8+ items and none of them coded, where the raw
    // text looks like it should have codes (contains a 3+ digit run near a
    // colon or letter prefix), suggests the code pattern isn't recognized
    // for this university's convention at all.
    if (totalItems >= 8 && codedItems === 0 && /[A-Z]{2,6}\s?\d{2,6}|\d{3,6}/.test(curriculum)) {
      issues.push(
        `${totalItems} items in one term, 0 got a code badge, though the raw text looks like it has codes`,
      );
    }

    // A single term claiming to hold an implausibly large number of items
    // (a whole-degree unit dump mislabeled as one term) is the exact shape
    // of the original Canberra/Wollongong bug reports.
    if (terms.length === 1 && totalItems >= 15) {
      issues.push(`only 1 term detected but it contains ${totalItems} items — likely mislabeled`);
    }
  }

  return issues;
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows } = await client.query(
    `select u.slug as uni, u.name as uni_name, p.slug, p.curriculum
     from programs p join universities u on u.id = p.university_id
     where p.curriculum is not null and p.status = 'published'
     ${uniFilter ? "and u.slug = $1" : ""}
     order by u.slug, p.slug`,
    uniFilter ? [uniFilter] : [],
  );

  console.log(`Checking ${rows.length} published programs with curriculum data...\n`);

  const byUni = new Map();
  for (const r of rows) {
    const issues = findIssues(r.slug, r.uni, r.curriculum);
    if (issues.length === 0) continue;
    if (!byUni.has(r.uni)) byUni.set(r.uni, { name: r.uni_name, rows: [] });
    byUni.get(r.uni).rows.push({ slug: r.slug, issues });
  }

  let total = 0;
  for (const [uniSlug, { name, rows: flagged }] of [...byUni.entries()].sort(
    (a, b) => b[1].rows.length - a[1].rows.length,
  )) {
    console.log(`${name} (${uniSlug}): ${flagged.length} flagged`);
    for (const f of flagged.slice(0, 5)) {
      console.log(`  /universities/${uniSlug}/programs/${f.slug}`);
      for (const issue of f.issues) console.log(`    - ${issue}`);
    }
    if (flagged.length > 5) console.log(`  ... and ${flagged.length - 5} more`);
    console.log("");
    total += flagged.length;
  }

  console.log(
    total === 0
      ? "Clean: no curriculum rendering issues detected."
      : `${total} program(s) across ${byUni.size} universit${byUni.size === 1 ? "y" : "ies"} need review.`,
  );
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
