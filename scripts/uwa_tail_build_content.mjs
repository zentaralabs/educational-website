// University of Western Australia tail-completion: writes the rows in
// scripts/data/uwa_tail_final_content.json (keyed by DB row id). Only fields present
// per row are updated -- fields omitted for a row are left untouched, so already
// correct content (e.g. existing descriptions we didn't need to touch) is never
// clobbered. Also used to fix 2 confirmed fabrications in already-"complete" rows:
// Bachelor of Economics (ATAR 90 -> 85) and Master of Applied Human Performance
// Science (coursework) (wrong IMED unit codes -> real SSEH unit codes, curriculum only).
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/uwa_tail_final_content.json", "utf8"));

function dedash(t) {
  if (typeof t !== "string") return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const FIELDS = ["description", "curriculum", "admission_requirements", "english_requirements"];

const updates = [];
for (const [id, c] of Object.entries(content)) {
  const set = {};
  for (const f of FIELDS) {
    if (c[f] != null) set[f] = dedash(c[f]);
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
  console.log(`Committed ${updated} rows.`);
  await client.end();
} else {
  console.log("\nDry run only. Pass --commit to write to the database.");
}
