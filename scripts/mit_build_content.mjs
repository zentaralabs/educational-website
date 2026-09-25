// Melbourne Institute of Technology program build-out: writes content for 14 of the
// 15 published rows (all except Master of Information Technology, archived separately
// via mit_archive.mjs: absent from the live site's own full course-navigation footer,
// absent from the international tuition-fees schedule, absent from TEQSA's accredited
// and previously-accredited course lists for this provider, absent from Wayback Machine
// under the current /study-with-us/programs/ URL scheme, and absent from the CRICOS
// institution course list for provider 01545C, which lists exactly 14 AQF-level courses
// at the Melbourne location, all 14 matching our other 14 published rows one-for-one).
//
// 9 rows were flagged "already Bond-standard" going into this sprint (Bachelor of
// Business, Bachelor of Data Analytics, Bachelor of Engineering Technology
// (Telecommunications), Bachelor of Networking, Master of Business Analytics, Master
// of Business Research, Master of Engineering (Telecommunications), Master of
// Networking, Master of Professional Accounting); a spot-check of Bachelor of Business
// found both a fabricated/wrong English band (stored "no band below 6.0" vs the real,
// shared-policy-table and per-page "no band below 5.5") and a generic curriculum with
// no real unit codes at all, so per the standing instruction all 9 were re-sourced from
// the real mit.edu.au pages along with the other 6, using real BB/BM/BN/BDA/MA/MN/MDA/
// MAI/MBA/ME/MR/GA-coded units throughout.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/mit_content.json", "utf8"));
const sourceUrls = JSON.parse(fs.readFileSync("scripts/data/mit_source_urls.json", "utf8"));
const cricosCodes = JSON.parse(fs.readFileSync("scripts/data/mit_cricos_codes.json", "utf8"));
const dbRows = JSON.parse(fs.readFileSync("scripts/data/mit_rows.json", "utf8"));

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
  const cricos_code = cricosCodes[name];

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
    cricos_code,
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
