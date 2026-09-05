import pg from "pg";
import fs from "fs";
import crypto from "crypto";
import {
  readCsvObjects,
  PROVIDER_SLUG,
  degreeLevelFor,
  subjectSlugFor,
  annualTuition,
  durationYears,
  normalizeName,
  isCombinedDegree,
  tidyName,
} from "./lib/cricos.mjs";
import { slugify } from "./lib/slug.mjs";

// Merge the CRICOS course register into scripts/data/programs.json.
//
// The programs table began as a one-off AI import that only ever covered a
// thin, uneven slice of each university (most sat at 8-14 rows; a real
// catalogue is 200-600). This rebuilds the catalogue from the Commonwealth
// Register of Institutions and Courses for Overseas Students -- the
// authoritative national list of every course an overseas student can enrol
// in, per provider (scripts/data/cricos-courses.csv, filtered to our 56
// institutions from the monthly data.gov.au snapshot).
//
// What it does, per CRICOS course row (non-combined, degree-level, current):
//   * matched to an existing program (same university, ~same name)
//       -> backfill cricos_code, and duration/annual tuition only where unset.
//         Never touches description, curriculum, status or name.
//   * not matched
//       -> add a new row: name, slug, degree level, subject, indicative
//         duration + annual tuition, cricos_code, status 'published'
//         (bare rows render a facts-only card and are noindex until an
//         enrichment pass gives them 100+ words -- see isProgramIndexable).
//
// Output: rewrites scripts/data/programs.json (same shape/order as
// export_programs.mjs) and writes scripts/data/programs-catalog-added.json
// (the new ids, for rollback). Apply to the DB with seed_programs.mjs.
//
//   node scripts/build_programs_catalog.mjs           # report only
//   node scripts/build_programs_catalog.mjs --write   # rewrite programs.json

const WRITE = process.argv.includes("--write");
const NEW_STATUS = process.argv.includes("--draft") ? "draft" : "published";
const TODAY = new Date().toISOString().slice(0, 10);

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

// ---- reference data (validate our maps against the live vocab) -------------
const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const uniSlugs = new Set(
  (await client.query("select slug from universities")).rows.map((r) => r.slug),
);
const levelNames = new Set(
  (await client.query("select name from degree_levels")).rows.map((r) => r.name),
);
const subjectSlugs = new Set(
  (await client.query("select slug from subjects")).rows.map((r) => r.slug),
);
await client.end();

for (const s of new Set(Object.values(PROVIDER_SLUG))) {
  if (!uniSlugs.has(s)) throw new Error(`PROVIDER_SLUG points at unknown university slug: ${s}`);
}

// ---- existing programs ----------------------------------------------------
const programs = JSON.parse(fs.readFileSync("scripts/data/programs.json", "utf8"));
const byKey = new Map(); // `${slug}::${normName}` -> program row
const slugsByUni = new Map(); // slug -> Set(program slug)
for (const p of programs) {
  byKey.set(`${p.university_slug}::${normalizeName(p.name)}`, p);
  if (!slugsByUni.has(p.university_slug)) slugsByUni.set(p.university_slug, new Set());
  slugsByUni.get(p.university_slug).add(p.slug);
}

function uniqueSlug(uniSlug, name) {
  const set = slugsByUni.get(uniSlug) ?? new Set();
  slugsByUni.set(uniSlug, set);
  const base = slugify(name) || "program";
  let candidate = base;
  for (let n = 2; set.has(candidate); n += 1) candidate = `${base}-${n}`;
  set.add(candidate);
  return candidate;
}

// ---- walk the register --------------------------------------------------
const rows = readCsvObjects(fs.readFileSync("scripts/data/cricos-courses.csv", "utf8"));

const skip = { expired: 0, provider: 0, level: 0, combined: 0, blankName: 0, dupInFeed: 0 };
const seenInFeed = new Set();
let matched = 0;
let backfilled = 0;
const added = [];
const perUni = {}; // slug -> { existing, matched, added }

for (const s of new Set(Object.values(PROVIDER_SLUG))) perUni[s] = { existing: 0, matched: 0, added: 0 };
for (const p of programs) if (perUni[p.university_slug]) perUni[p.university_slug].existing += 1;

for (const row of rows) {
  if ((row["Expired"] || "").trim() === "Yes") { skip.expired += 1; continue; }
  const slug = PROVIDER_SLUG[(row["CRICOS Provider Code"] || "").trim()];
  if (!slug) { skip.provider += 1; continue; }
  const level = degreeLevelFor(row);
  if (!level || !levelNames.has(level)) { skip.level += 1; continue; }
  const name = tidyName(row["Course Name"] || "");
  if (!name) { skip.blankName += 1; continue; }
  if (isCombinedDegree(name)) { skip.combined += 1; continue; }

  const normName = normalizeName(name);
  const feedKey = `${slug}::${normName}::${level}`;
  if (seenInFeed.has(feedKey)) { skip.dupInFeed += 1; continue; }
  seenInFeed.add(feedKey);

  const cricosCode = (row["CRICOS Course Code"] || "").trim() || null;
  const dy = durationYears(row["Duration (Weeks)"]);
  const tuition = annualTuition(row["Tuition Fee"] || row["Estimated Total Course Cost"], row["Duration (Weeks)"]);
  const subjectSlug = subjectSlugFor(row);
  const subject = subjectSlug && subjectSlugs.has(subjectSlug) ? subjectSlug : null;

  const existing = byKey.get(`${slug}::${normName}`);
  if (existing) {
    matched += 1;
    perUni[slug].matched += 1;
    // Only stamp the CRICOS code onto an already-curated row. Duration and
    // tuition on those rows are hand-verified against the provider's own
    // course page; a figure annualised from the register must not overwrite
    // or sit beside them.
    if (!existing.cricos_code && cricosCode) {
      existing.cricos_code = cricosCode;
      backfilled += 1;
    }
    continue;
  }

  const progSlug = uniqueSlug(slug, name);
  const rec = {
    university_slug: slug,
    degree_level: level,
    subject_slug: subject,
    id: crypto.randomUUID(),
    name,
    slug: progSlug,
    status: NEW_STATUS,
    duration_years: dy == null ? null : String(dy),
    tuition_international: tuition == null ? null : String(tuition),
    tuition_domestic: null,
    tuition_domestic_is_csp: null,
    currency: "AUD",
    application_url: null,
    description: null,
    curriculum: null,
    admission_requirements: null,
    english_requirements: null,
    ielts_overall: null,
    ielts_listening: null,
    ielts_reading: null,
    ielts_writing: null,
    ielts_speaking: null,
    pte_overall: null,
    pte_listening: null,
    pte_reading: null,
    pte_writing: null,
    pte_speaking: null,
    intake_dates: null,
    last_verified_at: TODAY,
    source_url: null,
    cricos_code: cricosCode,
  };
  programs.push(rec);
  added.push(rec.id);
  perUni[slug].added += 1;
}

// backfill cricos_code key on rows that never had it (keeps JSON shape stable)
for (const p of programs) if (!("cricos_code" in p)) p.cricos_code = p.cricos_code ?? null;

// ---- report -----------------------------------------------------------
console.log("Skipped CRICOS rows:", skip);
console.log(`Matched existing: ${matched} (backfilled a field on ${backfilled})`);
console.log(`New rows: ${added.length}  ->  programs.json would hold ${programs.length}`);
console.log("\nPer university (existing -> +new = total, matched):");
for (const [s, c] of Object.entries(perUni).sort((a, b) => b[1].added - a[1].added)) {
  console.log(
    `  ${s.padEnd(38)} ${String(c.existing).padStart(4)} +${String(c.added).padStart(4)} = ${String(
      c.existing + c.added,
    ).padStart(4)}   (matched ${c.matched})`,
  );
}

if (!WRITE) {
  console.log("\nReport only. Re-run with --write to rewrite scripts/data/programs.json.");
  process.exit(0);
}

// ---- write (same ordering as export_programs.mjs) ---------------------
const FIELD_ORDER = [
  "university_slug", "degree_level", "subject_slug",
  "id", "name", "slug", "status", "duration_years",
  "tuition_international", "tuition_domestic", "tuition_domestic_is_csp", "currency",
  "application_url", "description", "curriculum", "admission_requirements", "english_requirements",
  "ielts_overall", "ielts_listening", "ielts_reading", "ielts_writing", "ielts_speaking",
  "pte_overall", "pte_listening", "pte_reading", "pte_writing", "pte_speaking",
  "intake_dates", "last_verified_at", "source_url", "cricos_code",
];
programs.sort(
  (a, b) =>
    a.university_slug.localeCompare(b.university_slug) ||
    a.name.localeCompare(b.name) ||
    a.id.localeCompare(b.id),
);
const ordered = programs.map((p) => Object.fromEntries(FIELD_ORDER.map((f) => [f, p[f] ?? null])));
fs.writeFileSync("scripts/data/programs.json", JSON.stringify(ordered, null, 2) + "\n");
fs.writeFileSync(
  "scripts/data/programs-catalog-added.json",
  JSON.stringify({ generated_at: TODAY, status: NEW_STATUS, ids: added }, null, 2) + "\n",
);
console.log(`\nWrote scripts/data/programs.json (${ordered.length} rows)`);
console.log(`Wrote scripts/data/programs-catalog-added.json (${added.length} ids)`);
console.log("Next: node scripts/seed_programs.mjs  (dry run), then --commit");
