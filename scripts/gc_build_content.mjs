// Greenwich College program build-out: writes content for all 16 published rows.
// Content sources: 15 of 16 rows built from greenwichcollege.edu.au's own live course
// pages (plain WordPress site, no Cloudflare gating, plain curl works; the site runs
// two parallel URL structures, /management-it/... and /management-courses/..., of which
// /management-it/... + /hospitality/... + /health-and-care/... carry the current,
// richer content with correct CRICOS codes and current training-package codes, while
// /management-courses/... in places serves an older, superseded-code version of the
// same course - e.g. Diploma of Business under /management-courses/ still shows the
// deprecated BSB50215 code, while /management-it/ shows the current BSB50120 "Digital
// Transformation" version actually reflected in the DB's own stored CRICOS code).
// The 16th row, Diploma of Graphic Design, has no live Greenwich page at all (confirmed
// via WP REST API listing, on-site search, and manual URL guesses) despite being a
// real, currently CRICOS-registered course (116132B, national code CUA50720) confirmed
// directly on the CRICOS institution course list; its content is sourced from CRICOS +
// training.gov.au's official CUA50720 packaging rules + Greenwich's own Enrolment
// Admission Policy PDF instead, with admission/English fields marked as inferred from
// institution-wide policy rather than a course-specific page (see gc-program-buildout
// memory for the full writeup).
// 9 rows were flagged "already Bond-standard" going into this sprint; a spot-check
// found fabricated curriculum (invented unit names not matching real unit codes) and
// wrong CRICOS codes on every one checked, all sourced from one shared generic
// source_url (a "your courses" landing/download-guide page, not a real course page).
// All 9 were re-sourced from the real pages along with the other 7.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/gc_content.json", "utf8"));
const sourceUrls = JSON.parse(fs.readFileSync("scripts/data/gc_source_urls.json", "utf8"));
const dbRows = JSON.parse(fs.readFileSync("scripts/data/gc_rows.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const updates = [];
for (const [name, c] of Object.entries(content)) {
  const dbRow = dbRows.find((r) => r.name === name);
  if (!dbRow) { console.error("NO DB ROW FOR", name); continue; }

  const description = dedash(c.description?.trim());
  const curriculum = dedash(c.curriculum?.trim());
  const admission = dedash(c.admission_requirements?.trim());
  const english = dedash(c.english_requirements?.trim());
  const source_url = sourceUrls[name];

  if (!description || !curriculum || !admission || !english || !source_url) {
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
    source_url,
    cricos_code: c.cricos_code,
  });
}

console.log(`Prepared ${updates.length} Bond-standard rows.`);
for (const r of updates) {
  console.log(" -", r.name, "| cricos:", r.cricos_code, "| src:", r.source_url);
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
    await client.query(
      `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4,
       source_url=$5, application_url=$5, cricos_code=$6, last_verified_at=now(), updated_at=now() WHERE id=$7`,
      [r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.source_url, r.cricos_code, r.id],
    );
    updated++;
  }
  console.log(`\nCommitted ${updated} rows to Postgres.`);
  await client.end();
} else {
  console.log("\nRe-run with --commit to apply.");
}
