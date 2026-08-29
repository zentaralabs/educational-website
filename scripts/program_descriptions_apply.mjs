import pg from "pg";
import fs from "fs";

// Apply written program descriptions back to the DB. Input: a JSON file of
// [{ id, description, source_url? , duration_years? }] objects. Only the
// `description` (and optionally source_url / duration_years) is updated;
// status is left as-is (these stay noindex until a later verification wave).
//
//   node scripts/program_descriptions_apply.mjs scripts/data/_written_Bond.json          # dry run
//   node scripts/program_descriptions_apply.mjs scripts/data/_written_Bond.json --commit

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const file = process.argv[2];
const COMMIT = process.argv.includes("--commit");
if (!file) { console.error("pass a written-descriptions JSON file"); process.exit(1); }

const items = JSON.parse(fs.readFileSync(file, "utf8"));

const bad = [];
for (const it of items) {
  if (!it.id || !it.description?.trim()) bad.push(`${it.id || "?"}: missing id/description`);
  if (it.description?.includes("—")) bad.push(`${it.id}: em dash in description`);
  const wc = (it.description || "").trim().split(/\s+/).length;
  if (wc < 60 || wc > 240) bad.push(`${it.id}: ${wc} words (want 60-240)`);
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log(`${items.length} descriptions, all valid (no em dashes, 60-240 words).`);

if (!COMMIT) { console.log("Re-run with --commit to apply."); process.exit(0); }

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();
let n = 0;
for (const it of items) {
  const sets = ["description = $2", "updated_at = now()"];
  const vals = [it.id, it.description.trim()];
  if (it.source_url) { sets.push(`source_url = $${vals.length + 1}`); vals.push(it.source_url); }
  if (it.duration_years != null) { sets.push(`duration_years = $${vals.length + 1}`); vals.push(it.duration_years); }
  const { rowCount } = await c.query(
    `update programs set ${sets.join(", ")} where id = $1 and status = 'published'`,
    vals,
  );
  n += rowCount;
}
console.log(`Updated ${n} programs. Now: node scripts/export_programs.mjs && POST /api/revalidate (programs).`);
await c.end();
