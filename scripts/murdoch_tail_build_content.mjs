// Murdoch University tail closure (2026-09-25 session): writes real content for the
// 15 remaining published rows that are being kept (2 of the original 17 are archived
// separately via murdoch_tail_archive.mjs). Each row's content is sourced from
// handbook.murdoch.edu.au's __NEXT_DATA__ course JSON, murdoch.edu.au's own plain-HTML
// course pages, or (for the CRICOS-only Graduate Diploma in Systems Medicine) the
// government CRICOS course search, per the source_url on each entry below.
//
// Only fields present in scripts/data/murdoch_tail_content.json for a given program are
// written, so already-correct fields are left untouched unless a fix is included
// (Bachelor of Information Technology's curriculum drops a fabricated "Data Science"
// major that does not exist in Murdoch's real 8-major list; Research Masters with
// Training's description is corrected from a fabricated "two years full-time" duration
// to the real 18 months).
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/murdoch_tail_content.json", "utf8"));

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
