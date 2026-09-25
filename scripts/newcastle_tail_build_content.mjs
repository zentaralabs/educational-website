// University of Newcastle tail-completion: writes the 26 rows in
// scripts/data/newcastle_tail_content.json (keyed by DB row id) -- 22 rows missing only
// `description` (real curriculum/admission/english already present from PR #65 / the
// 2026-09-20 reconciliation), plus 4 rows built to full Bond standard (2 generic HDR
// research degrees, 1 PhD-by-prior-publication, 1 admission/english-only gap on Master
// of Information Technology). Only fields present per row are updated -- fields omitted
// for a row are left untouched, so already-correct content is never clobbered.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/newcastle_tail_content.json", "utf8"));

function dedash(t) {
  if (typeof t !== "string") return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const FIELDS = [
  "description",
  "curriculum",
  "admission_requirements",
  "english_requirements",
  "ielts_overall",
  "ielts_listening",
  "ielts_reading",
  "ielts_writing",
  "ielts_speaking",
];

const updates = [];
for (const [id, c] of Object.entries(content)) {
  const set = {};
  for (const f of FIELDS) {
    if (c[f] != null) set[f] = typeof c[f] === "string" ? dedash(c[f]) : c[f];
  }
  updates.push({ id, name: c._name, set });
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
