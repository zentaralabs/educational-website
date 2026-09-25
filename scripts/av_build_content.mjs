// Avondale University program build-out: writes content for 18 published rows.
// Content sources: all 18 rows are built from Avondale's own live avondale.edu.au
// course pages (avondale.edu.au is Cloudflare-gated against curl/WebFetch but not
// against the browser pane's same-origin fetch), plus, for the Diploma of Outdoor
// Leadership, Avondale's own VET course page. 10 rows were flagged "already
// Bond-standard" going into this sprint; a spot-check against live pages found
// fabrication a twentieth time in a row (invented unit names not matching any
// real unit code, a shared generic /courses/ listing-page source_url on 6 of the
// 10 rows) and all were rebuilt from the real pages. Of those 10, 3 (Bachelor of
// Science, Master of Leadership and Management, Master of Nursing (Coursework))
// turned out not to belong published at all (see av_archive_list.json) and are
// archived rather than rebuilt.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/av_content.json", "utf8"));
const dbRows = JSON.parse(fs.readFileSync("scripts/data/av_rows.json", "utf8"));

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
