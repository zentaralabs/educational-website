// Kaplan Business School build-out: writes Bond-standard content for 22 of 23
// published rows (Diploma of Commerce is archived separately, see kbs_archive.mjs).
// Content sources:
//  - 10 rows (all Bachelor of Business variants, Graduate Diploma of Business
//    Administration, Master of Accounting, Master of Business Analytics (IT),
//    both MBA specialisations, and the base MBA) already had a real,
//    kbs.edu.au-sourced description+curriculum in the DB before this sprint,
//    spot-checked against live pages and confirmed genuine (real unit codes
//    matching the live course-structure accordions) -- these are left as-is
//    and only get admission_requirements/english_requirements added (or, for
//    the MBA, nothing at all: it was already fully Bond-standard and verified).
//  - 11 rows are built fresh this sprint from each course's own live
//    kbs.edu.au/courses/<slug> page (server-rendered HTML, no Cloudflare
//    gating, no JS execution needed).
// Admission/English text for every row is KBS's own shared tiered policy text
// (from /admissions/entry-requirements/{international,domestic,english}-entry-requirements),
// since KBS's own course pages link out to these shared pages rather than
// repeating a course-specific figure -- this is a real, published KBS policy,
// not a template estimate.
import fs from "node:fs";
import pg from "pg";

const built = JSON.parse(fs.readFileSync("scripts/data/kbs_final_rows.json", "utf8"));
const dbRows = JSON.parse(fs.readFileSync("scripts/data/kbs_rows.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const updates = [];
for (const [name, c] of Object.entries(built)) {
  const dbRow = dbRows.find((r) => r.name === name);
  if (!dbRow) { console.error("NO DB ROW FOR", name); continue; }

  const description = c.description ? dedash(c.description.trim()) : dbRow.description;
  const curriculum = c.curriculum ? dedash(c.curriculum.trim()) : dbRow.curriculum;
  const admission = c.admission ? dedash(c.admission.trim()) : dbRow.admission_requirements;
  const english = c.english ? dedash(c.english.trim()) : dbRow.english_requirements;

  if (!description || !curriculum || !admission || !english) {
    console.error("INCOMPLETE ROW, skipping write:", name);
    continue;
  }

  updates.push({
    id: dbRow.id,
    name,
    description,
    curriculum,
    admission_requirements: admission,
    english_requirements: english,
    source_url: c.source_url,
    cricos_code: c.cricos_code,
  });
}

console.log(`Prepared ${updates.length} rows for Bond-standard write.`);
for (const r of updates) console.log(" -", r.name, "|", r.source_url, "| cricos:", r.cricos_code);

if (process.argv.includes("--commit")) {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
  );
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  let updated = 0;
  for (const r of updates) {
    await client.query(
      `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4,
       source_url=$5, application_url=$5, cricos_code=$6, last_verified_at=now(), updated_at=now() WHERE id=$7`,
      [r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.source_url, r.cricos_code, r.id],
    );
    updated++;
  }
  console.log("Committed", updated, "rows to Postgres.");
  await client.end();
} else {
  console.log("\nDry run only. Re-run with --commit to apply.");
}
