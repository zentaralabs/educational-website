// Curtin University tail closure (2026-09-25 session): writes real content for the
// 16 remaining published rows that are being kept (3 of the original 19 are archived
// separately via curtin_tail_archive.mjs). Content sourced from handbook.curtin.edu.au's
// AppSync GraphQL course-detail API (re-cracked this session, see
// scripts/data/_curtin_hb_client.mjs) and www.curtin.edu.au's own plain-HTML course pages,
// per the source_url on each entry below. Also fixes the stored typo in "Doctor or
// Philosophy - Law"'s name (-> "Doctor of Philosophy - Law") and a real fabrication caught
// in Graduate Diploma in Geoscience's pre-existing description (it falsely claimed the
// award was "delivered through the Graduate Diploma in Mineral Exploration Geoscience", a
// real but entirely different sibling program; the real course is the intermediate exit
// award of the Master of Geoscience).
//
// Only fields present in scripts/data/curtin_tail_content.json for a given program are
// written, so already-correct fields are left untouched unless a fix is included.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/curtin_tail_content.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const FIELDS = ["description", "curriculum", "admission_requirements", "english_requirements", "source_url"];

const updates = [];
for (const [name, c] of Object.entries(content)) {
  const set = {};
  for (const f of FIELDS) {
    if (c[f] !== undefined) set[f] = dedash(String(c[f]).trim());
  }
  if (c.name_fix) set.name = c.name_fix;
  updates.push({ id: c.id, name, set });
}

console.log(`Prepared ${updates.length} rows.`);
for (const r of updates) {
  console.log(" -", r.name, "| fields:", Object.keys(r.set).join(", "));
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
    const cols = Object.keys(r.set);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const values = cols.map((c) => r.set[c]);
    await client.query(
      `UPDATE programs SET ${setClause}, last_verified_at = now(), updated_at = now() WHERE id = $${cols.length + 1}`,
      [...values, r.id],
    );
    updated++;
  }
  console.log(`\nCommitted ${updated} rows to Postgres.`);
  await client.end();
} else {
  console.log("\nRe-run with --commit to apply.");
}
