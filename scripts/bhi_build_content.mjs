// Box Hill Institute build-out: writes the 11 Bond-standard rows in bhi_content.json
// to Postgres. Every field is either lifted directly from a real fetched
// boxhill.edu.au course page (via its embedded Next.js __NEXT_DATA__ JSON) or,
// for the two Music Industry exit-award rows, from the Bachelor of Music
// Industry's own real Course Structure text describing those exit points.
// No invented text anywhere.
import fs from "node:fs";
import pg from "pg";

const content = JSON.parse(fs.readFileSync("scripts/bhi_content.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const rows = Object.entries(content).map(([id, r]) => ({
  id,
  name: r.name,
  source_url: r.source_url,
  cricos_code: r.cricos_code,
  description: dedash(r.description.trim()),
  curriculum: dedash(r.curriculum.trim()),
  admission_requirements: dedash(r.admission_requirements.trim()),
  english_requirements: dedash(r.english_requirements.trim()),
}));

console.log(`Loaded ${rows.length} Bond-standard rows to write.`);
for (const r of rows) console.log(" -", r.name, "|", r.source_url);

if (process.argv.includes("--commit")) {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
  );
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  let updated = 0;
  for (const r of rows) {
    await client.query(
      `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4,
       source_url=$5, application_url=$5, cricos_code=$6, updated_at=now() WHERE id=$7`,
      [r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.source_url, r.cricos_code, r.id],
    );
    updated++;
  }
  console.log("Committed", updated, "rows to Postgres.");
  await client.end();
} else {
  console.log("\nDry run only. Re-run with --commit to apply.");
}
