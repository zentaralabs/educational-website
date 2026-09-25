// University of Divinity program build-out: writes content for all 17 published rows.
// Content sources: all 17 rows built from divinity.edu.au's own live course pages
// (plain WordPress site, no Cloudflare gating, plain curl works). English language
// requirements are NOT published per-course on divinity.edu.au itself; they come
// from the University's own Admissions Policy PDF (Schedule A: Coursework Awards,
// AQF 5-9, IELTS 6.5/6.0) and Higher Degree by Research Policy PDF (Table 2: HDR,
// AQF 9-10, IELTS 7.0/6.5), both linked from the Policies and Procedures page.
// 8 rows were flagged "already Bond-standard" going into this sprint; a spot-check
// found fabricated curriculum (invented "Year 1/2/3" unit-name lists not matching
// the real points-by-discipline course structure) on multiple rows, so all 8 were
// re-sourced from the real pages along with the other 9.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/ud_content.json", "utf8"));
const dbRows = JSON.parse(fs.readFileSync("scripts/data/ud_rows.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const updates = [];
for (const [id, c] of Object.entries(content)) {
  const dbRow = dbRows.find((r) => r.id === id);
  if (!dbRow) { console.error("NO DB ROW FOR", id, c.name); continue; }

  const description = dedash(c.description?.trim());
  const curriculum = dedash(c.curriculum?.trim());
  const admission = dedash(c.admission_requirements?.trim());
  const english = dedash(c.english_requirements?.trim());

  if (!description || !curriculum || !admission || !english) {
    console.error("INCOMPLETE ROW, skipping write:", c.name);
    continue;
  }

  updates.push({
    id: dbRow.id,
    name: c.name,
    description,
    curriculum,
    admission_requirements: admission,
    english_requirements: english,
    source_url: c.source_url,
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
