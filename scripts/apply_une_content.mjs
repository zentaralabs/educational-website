import pg from "pg";
import fs from "fs";

// Apply Bond-standard content (description, curriculum, admission_requirements,
// english_requirements, application_url, source_url) to University of New England
// published programs, sourced live from une.edu.au /study/courses/ pages and the
// international course-fees index, during the 2026-09-20 build-out sprint.
//
//   node scripts/apply_une_content.mjs scripts/data/une_updates.json          # dry run
//   node scripts/apply_une_content.mjs scripts/data/une_updates.json --commit

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const file = process.argv[2];
const COMMIT = process.argv.includes("--commit");
if (!file) { console.error("pass a JSON file"); process.exit(1); }

const items = JSON.parse(fs.readFileSync(file, "utf8"));
const bad = [];
for (const it of items) {
  if (!it.id) bad.push("missing id");
  if (!it.description?.trim()) bad.push(`${it.id}: missing description`);
  if (!it.curriculum?.trim()) bad.push(`${it.id}: missing curriculum`);
  if (!it.english_requirements?.trim()) bad.push(`${it.id}: missing english_requirements`);
  for (const f of ["description", "curriculum", "admission_requirements", "english_requirements"]) {
    if (it[f]?.includes("—") || it[f]?.includes("–")) bad.push(`${it.id}: dash in ${f}`);
  }
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log(`${items.length} rows, all valid (no missing required fields, no em/en dashes).`);
const gapRows = items.filter((it) => !it.admission_requirements?.trim());
if (gapRows.length) {
  console.log(`${gapRows.length} row(s) have a genuine admission_requirements gap:`, gapRows.map((r) => r.name));
}
if (!COMMIT) { console.log("Re-run with --commit to apply."); process.exit(0); }

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();
let n = 0;
for (const it of items) {
  const url = it.slug ? `https://www.une.edu.au/study/courses/${it.slug}` : null;
  const { rowCount } = await c.query(
    `update programs set
       description = $2,
       curriculum = $3,
       admission_requirements = $4,
       english_requirements = $5,
       application_url = $6,
       source_url = $6,
       last_verified_at = now(),
       updated_at = now()
     where id = $1 and status = 'published'`,
    [
      it.id,
      it.description.trim(),
      it.curriculum.trim(),
      it.admission_requirements ? it.admission_requirements.trim() : null,
      it.english_requirements.trim(),
      url,
    ],
  );
  n += rowCount;
}
console.log(`Updated ${n} programs.`);
await c.end();
