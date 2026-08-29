import pg from "pg";
import fs from "fs";

// Backfill structured IELTS/PTE fields on programs from a JSON file of
// [{ id, ielts_overall, ielts_listening?, ielts_reading?, ielts_writing?,
//    ielts_speaking?, pte_overall? }]. Used to populate the stub programs,
// which had all-null structured English scores and so fell back to the
// (often too-low) university default in the "English Test Scores" box.
// Values parsed from each program's own `english_requirements` text, with
// registration-gated programs (teaching, nursing, speech pathology, etc.)
// overridden to match the sourced program description.
// See PROJECT_STATUS.md "Description pass".
//
//   node scripts/apply_english_scores.mjs scripts/data/_ielts_fix.json           # dry run
//   node scripts/apply_english_scores.mjs scripts/data/_ielts_fix.json --commit

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const file = process.argv[2];
const COMMIT = process.argv.includes("--commit");
if (!file) { console.error("pass a JSON file"); process.exit(1); }

const COLS = ["ielts_overall", "ielts_listening", "ielts_reading", "ielts_writing", "ielts_speaking", "pte_overall"];
const items = JSON.parse(fs.readFileSync(file, "utf8"));

const bad = [];
for (const it of items) {
  if (!it.id) bad.push("missing id");
  const o = it.ielts_overall;
  if (o == null || o < 4 || o > 9) bad.push(`${it.id}: ielts_overall ${o}`);
  for (const k of ["ielts_listening", "ielts_reading", "ielts_writing", "ielts_speaking"]) {
    if (it[k] != null && it[k] > o + 0.001) bad.push(`${it.id}: ${k} ${it[k]} > overall ${o}`);
  }
  if (it.pte_overall != null && (it.pte_overall < 10 || it.pte_overall > 90)) bad.push(`${it.id}: pte_overall ${it.pte_overall}`);
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log(`${items.length} rows, all valid.`);
if (!COMMIT) { console.log("Re-run with --commit to apply."); process.exit(0); }

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();
let n = 0;
for (const it of items) {
  const sets = ["updated_at = now()"];
  const vals = [it.id];
  for (const col of COLS) {
    if (it[col] != null) { sets.push(`${col} = $${vals.length + 1}`); vals.push(it[col]); }
  }
  const { rowCount } = await c.query(
    `update programs set ${sets.join(", ")} where id = $1 and status = 'published'`,
    vals,
  );
  n += rowCount;
}
console.log(`Updated ${n} programs. Now: node scripts/export_programs.mjs && POST /api/revalidate (programs).`);
await c.end();
