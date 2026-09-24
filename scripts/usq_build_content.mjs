import fs from "fs";
import pg from "pg";

// Synthesize Bond-standard content for USQ/UniSQ rows from usq_raw_extract.json
// (real fetched unisq.edu.au marketing-page content, plain server-rendered
// HTML, no Cloudflare gating, no JS rendering needed).
//
//   node scripts/usq_build_content.mjs            # dry run, prints a sample
//   node scripts/usq_build_content.mjs --commit

const COMMIT = process.argv.includes("--commit");
const raw = JSON.parse(fs.readFileSync("scripts/data/usq_raw_extract.json", "utf8"));

function dedash(s) {
  // House rule: zero em/en dashes anywhere in written content.
  return s.replace(/[‒–—―]/g, ",").replace(/\s,\s/g, ", ").replace(/,\s*,/g, ",");
}

function cleanWhitespace(s) {
  return s.replace(/\s+/g, " ").trim();
}

function cleanDescription(raw) {
  let s = raw.replace(/^Overview\s*/, "");
  s = s.replace(/^-->\s*/, "");
  s = cleanWhitespace(s);
  // Trim to a reasonable length at a sentence boundary, keep it substantial (aim 400-900 chars)
  if (s.length > 1100) {
    const cut = s.slice(0, 1100);
    const lastPeriod = cut.lastIndexOf(". ");
    s = lastPeriod > 400 ? cut.slice(0, lastPeriod + 1) : cut;
  }
  return dedash(cleanWhitespace(s));
}

function cleanCurriculum(raw) {
  let s = raw.replace(/^Degree structure\s*/, "");
  s = cleanWhitespace(s);
  if (s.length > 2200) {
    const cut = s.slice(0, 2200);
    const lastParen = cut.lastIndexOf(")");
    s = lastParen > 800 ? cut.slice(0, lastParen + 1) : cut;
  }
  return dedash(s);
}

function cleanAdmission(raw) {
  // Strip the leading accordion id/button markup that leaked into the extract.
  let s = raw;
  s = s.replace(/^[a-z0-9#>_.\- "=]*?accordion-year-twelve"[^>]*>\s*/i, "");
  s = s.replace(/^[a-z0-9#>_.\- "=]*?academic-entry-requirements"[^>]*>\s*/i, "");
  s = s.replace(/^I am a current or recent year 12 student\s*/, "");
  s = s.replace(/^Academic entry requirements\s*/, "");
  s = cleanWhitespace(s);
  s = s.replace(/Find out more about assumed knowledge\s*\.?$/, "").trim();
  if (s.length > 1200) {
    const cut = s.slice(0, 1200);
    const lastPeriod = cut.lastIndexOf(". ");
    s = lastPeriod > 300 ? cut.slice(0, lastPeriod + 1) : cut;
  }
  return dedash(cleanWhitespace(s));
}

function cleanEnglish(raw) {
  let s = raw;
  s = s.replace(/^[a-z0-9#>_.\- "=]*?english-language-requirements"[^>]*>\s*/i, "");
  s = s.replace(/^English language requirements\s*/, "");
  s = cleanWhitespace(s);
  if (s.length > 700) {
    const cut = s.slice(0, 700);
    const lastPeriod = cut.lastIndexOf(". ");
    s = lastPeriod > 100 ? cut.slice(0, lastPeriod + 1) : cut;
  }
  return dedash(cleanWhitespace(s));
}

const updates = [];
for (const [id, r] of Object.entries(raw)) {
  if (r.skip || !r.ok) continue;
  const description = cleanDescription(r.description);
  const curriculum = cleanCurriculum(r.curriculum);
  const admission_requirements = cleanAdmission(r.admission);
  const english_requirements = cleanEnglish(r.english);
  updates.push({ id, name: r.name, url: r.url, description, curriculum, admission_requirements, english_requirements });
}

console.log(`Prepared ${updates.length} rows.`);
console.log("--- sample ---");
console.log(JSON.stringify(updates[5], null, 2));

fs.writeFileSync("scripts/data/usq_final_content.json", JSON.stringify(updates, null, 2));

if (!COMMIT) {
  console.log("\nDry run only. Re-run with --commit to write to Postgres.");
  process.exit(0);
}

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);
const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

let n = 0;
for (const u of updates) {
  await c.query(
    `update programs set description = $2, curriculum = $3, admission_requirements = $4,
     english_requirements = $5, source_url = coalesce(source_url, $6), updated_at = now()
     where id = $1`,
    [u.id, u.description, u.curriculum, u.admission_requirements, u.english_requirements, u.url],
  );
  n++;
}
console.log(`Committed ${n} rows.`);
await c.end();
