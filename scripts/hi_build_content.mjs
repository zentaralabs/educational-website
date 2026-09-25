// Holmes Institute program build-out: writes content for the 22 published rows.
// Content sources: 18 rows are built from Holmes's own live holmes.edu.au course
// pages, its official 2026 faculty Course Guide PDFs (Business & Management,
// Cybersecurity, Education & Teaching, Fashion, Aviation, Information Systems &
// Technology), and its current Admission Requirements Policy and Procedures
// document (a real, shared, tiered admission/English policy, not a template
// estimate). The 1 row flagged "already Bond-standard" (Master of Business
// Administration) was spot-checked against the live course page and found
// fabricated (invented curriculum, third-party pickmyuni.com source_url) and is
// rebuilt here from the real page.
//
// 4 rows (Associate Degree of Aviation, Diploma of Aviation, Undergraduate
// Certificate in Business, Undergraduate Certificate in Information Systems)
// are real, currently CRICOS-registered and/or TEQSA-accredited qualifications
// with no dedicated marketing page, course guide entry, or Wayback Machine
// history found anywhere on holmes.edu.au -- description/admission/english are
// built from CRICOS/TEQSA register data where available, and curriculum is left
// honestly null (documented in the description field) rather than invented.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/hi_content.json", "utf8"));
const dbRows = JSON.parse(fs.readFileSync("scripts/data/hi_rows.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const updates = [];
let honestNullCount = 0;
for (const [id, c] of Object.entries(content)) {
  const dbRow = dbRows.find((r) => r.id === id);
  if (!dbRow) { console.error("NO DB ROW FOR", id, c.name); continue; }

  const description = dedash(c.description?.trim());
  const curriculum = c.curriculum ? dedash(c.curriculum.trim()) : null;
  const admission = dedash(c.admission_requirements?.trim());
  const english = dedash(c.english_requirements?.trim());

  if (!description || !admission || !english) {
    console.error("INCOMPLETE ROW, skipping write:", c.name);
    continue;
  }
  if (!curriculum) honestNullCount++;

  updates.push({
    id: dbRow.id,
    name: c.name,
    description,
    curriculum, // may be null: honest-null exception, documented in description
    admission_requirements: admission,
    english_requirements: english,
    source_url: c.source_url,
    cricos_code: c.cricos_code,
  });
}

console.log(`Prepared ${updates.length} rows (${updates.length - honestNullCount} Bond-standard, ${honestNullCount} honest-null on curriculum).`);
for (const r of updates) {
  console.log(" -", r.name, "|", r.curriculum ? "BOND-STANDARD" : "honest-null (curriculum)", "| cricos:", r.cricos_code);
}

if (process.argv.includes("--commit")) {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
  );
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  let updated = 0;
  for (const r of updates) {
    if (r.curriculum) {
      await client.query(
        `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4,
         source_url=$5, application_url=$5, cricos_code=$6, last_verified_at=now(), updated_at=now() WHERE id=$7`,
        [r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.source_url, r.cricos_code, r.id],
      );
    } else {
      // Honest-null on curriculum: write the other 3 fields, leave curriculum untouched (do not overwrite with null).
      await client.query(
        `UPDATE programs SET description=$1, admission_requirements=$2, english_requirements=$3,
         source_url=$4, application_url=$4, cricos_code=$5, last_verified_at=now(), updated_at=now() WHERE id=$6`,
        [r.description, r.admission_requirements, r.english_requirements, r.source_url, r.cricos_code, r.id],
      );
    }
    updated++;
  }
  console.log("Committed", updated, "rows to Postgres.");
  await client.end();
} else {
  console.log("\nDry run only. Re-run with --commit to apply.");
}
