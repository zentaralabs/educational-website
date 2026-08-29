import pg from "pg";
import fs from "fs";

// Apply corrected `admission_requirements` values to published programs.
// Input: JSON file of [{ id, admission_requirements }]. Used to replace the
// vague/templated admission strings the AI-import pipeline left on the stub
// programs with per-program values sourced from the official course pages
// (see PROJECT_STATUS.md "Description pass" / admission_requirements fix).
//
//   node scripts/apply_admission_requirements.mjs scripts/data/_adm_fix.json          # dry run
//   node scripts/apply_admission_requirements.mjs scripts/data/_adm_fix.json --commit

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
  if (!it.id || !it.admission_requirements?.trim()) bad.push(`${it.id || "?"}: missing id/admission_requirements`);
  if (it.admission_requirements?.includes("—")) bad.push(`${it.id}: em dash`);
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log(`${items.length} rows, all valid (no em dashes).`);
if (!COMMIT) { console.log("Re-run with --commit to apply."); process.exit(0); }

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();
let n = 0;
for (const it of items) {
  const { rowCount } = await c.query(
    "update programs set admission_requirements = $2, updated_at = now() where id = $1 and status = 'published'",
    [it.id, it.admission_requirements.trim()],
  );
  n += rowCount;
}
console.log(`Updated ${n} programs. Now: node scripts/export_programs.mjs && POST /api/revalidate (programs).`);
await c.end();
