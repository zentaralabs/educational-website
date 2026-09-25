// AIB + NIDA fabrication spot-check: writes real content for the 17 of 20 published
// rows confirmed as genuine, currently-offered courses (10 AIB, 7 NIDA). The other 3
// (AIB's Associate Degree in Management + Bachelor of Business Administration, both
// TEQSA-accreditation-expired 16/03/2020; NIDA's Master of Fine Arts (Design for
// Performance), absent from the current course sitemap/postgraduate nav despite being
// a real historical award) are archived separately via aib_nida_archive.mjs.
//
// All 20 "already Bond-standard" rows were fabricated: AIB rows used a templated
// "Year 12 completion... IELTS 6.0" admission block copy-pasted across postgraduate-only
// courses, invented curriculum unit names with no resemblance to AIB's real Leadership/
// Strategic Management-led core, and several shared a generic /courses/ listing-page
// source_url. NIDA rows used a flat "IELTS 6.5" template for every course despite NIDA's
// real, course-specific figure (7.0 baseline, 8.0 for Acting specifically), invented
// curriculum unit names with no resemblance to NIDA's real Year One/Two/Three subject
// lists, and several shared a generic /study/undergraduate/ or /study/postgraduate/
// listing-page source_url (one pointed at the international-students policy page).
import fs from "node:fs";
import pg from "pg";
import data from "./data/aib_nida_content.mjs";

const { content, cricosCodes } = data;
const dbRows = JSON.parse(fs.readFileSync("scripts/data/aib_nida_rows.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const updates = [];
for (const [name, c] of Object.entries(content)) {
  const dbRow = dbRows.find((r) => r.name === name);
  if (!dbRow) { console.error("NO DB ROW FOR", name); continue; }

  const description = dedash(c.description?.trim());
  const curriculum = dedash(c.curriculum?.trim());
  const admission = dedash(c.admission_requirements?.trim());
  const english = dedash(c.english_requirements?.trim());
  const source_url = c.source_url;
  const cricos_code = cricosCodes[name] || null;

  if (!description || !curriculum || !admission || !english || !source_url) {
    console.error("INCOMPLETE ROW, skipping write:", name);
    continue;
  }

  updates.push({
    id: dbRow.id,
    name,
    description,
    curriculum,
    admission_requirements: admission,
    english_requirements: english,
    source_url,
    cricos_code,
  });
}

console.log(`Prepared ${updates.length} Bond-standard rows.`);
for (const r of updates) {
  console.log(" -", r.name, "| cricos:", r.cricos_code, "| src:", r.source_url);
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
    if (r.cricos_code) {
      await client.query(
        `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4,
         source_url=$5, application_url=$5, cricos_code=$6, last_verified_at=now(), updated_at=now() WHERE id=$7`,
        [r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.source_url, r.cricos_code, r.id],
      );
    } else {
      await client.query(
        `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4,
         source_url=$5, application_url=$5, last_verified_at=now(), updated_at=now() WHERE id=$6`,
        [r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.source_url, r.id],
      );
    }
    updated++;
  }
  console.log(`\nCommitted ${updated} rows to Postgres.`);
  await client.end();
} else {
  console.log("\nRe-run with --commit to apply.");
}
