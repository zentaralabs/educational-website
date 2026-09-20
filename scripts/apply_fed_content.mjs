import pg from "pg";
import fs from "fs";

// Apply Bond-standard content (description/curriculum/admission_requirements/
// english_requirements) to FEDniversity program rows during the build-out
// sprint. Input: JSON array of
//   { id, description?, curriculum?, admission_requirements?, english_requirements?, source_url? }
// Only fields present on an item are written (partial updates allowed, e.g.
// to fix just english_requirements on an already-complete row).
//
//   node scripts/apply_fed_content.mjs scripts/data/_fed_fix.json          # dry run
//   node scripts/apply_fed_content.mjs scripts/data/_fed_fix.json --commit

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const file = process.argv[2];
const COMMIT = process.argv.includes("--commit");
if (!file) { console.error("pass a JSON file"); process.exit(1); }

const items = JSON.parse(fs.readFileSync(file, "utf8"));
const FIELDS = ["description", "curriculum", "admission_requirements", "english_requirements", "source_url"];
const bad = [];
for (const it of items) {
  if (!it.id) { bad.push(`missing id: ${JSON.stringify(it)}`); continue; }
  const present = FIELDS.filter((f) => it[f] != null);
  if (!present.length) bad.push(`${it.id}: no fields to update`);
  for (const f of present) {
    if (typeof it[f] === "string" && it[f].includes("—")) bad.push(`${it.id}: em dash in ${f}`);
    if (typeof it[f] === "string" && it[f].includes("–") && f !== "source_url") bad.push(`${it.id}: en dash in ${f}`);
  }
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log(`${items.length} rows, all valid (no em/en dashes).`);
if (!COMMIT) {
  for (const it of items) {
    const present = FIELDS.filter((f) => it[f] != null);
    console.log(`  would update ${it.id}: ${present.join(", ")}`);
  }
  console.log("Re-run with --commit to apply.");
  process.exit(0);
}

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();
let n = 0;
for (const it of items) {
  const present = FIELDS.filter((f) => it[f] != null);
  const setClause = present.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const values = present.map((f) => (typeof it[f] === "string" ? it[f].trim() : it[f]));
  const { rowCount } = await c.query(
    `update programs set ${setClause}, updated_at = now() where id = $1 and status = 'published'`,
    [it.id, ...values],
  );
  n += rowCount;
}
console.log(`Updated ${n} programs. Now: node scripts/export_programs.mjs`);
await c.end();
