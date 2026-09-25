// Bond University tail-completion: writes the 6 rows in scripts/data/bond_tail_content.json
// that were missing curriculum (Foundation Program, English, Graduate Diploma in Business,
// Graduate Diploma in Construction Practice, Master of Marketing (Professional), Master of
// Philosophy). Two of these rows (English, Master of Philosophy) also carry corrected
// admission_requirements/english_requirements fields where the existing stored text was found
// to not match the live bond.edu.au page (see bond-completion-2026-09-25 memory for detail).
// Only fields present in the content object are updated -- fields omitted for a row (e.g.
// admission_requirements for Foundation Program, which was already correct) are left untouched.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/data/bond_tail_content.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const FIELDS = ["description", "curriculum", "admission_requirements", "english_requirements", "source_url"];

const updates = [];
for (const [name, c] of Object.entries(content)) {
  const set = {};
  for (const f of FIELDS) {
    if (c[f] != null) set[f] = dedash(c[f]);
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
