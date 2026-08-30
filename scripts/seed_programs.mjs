import pg from "pg";
import fs from "fs";

// Apply scripts/data/programs.json back to the database. Upserts every row by
// its `id` (the file is the source of truth); rows in the DB but not the file
// are left untouched. university_slug / degree_level / subject_slug are
// resolved to foreign keys here.
//
// Guards, matching src/lib/queries/programs.ts:
//   * no em dashes in name / description / admission_requirements /
//     english_requirements (house style)
//   * a row with status 'published' must have a non-empty description
//
// Regenerate the file from the DB with scripts/export_programs.mjs.
//
//   node scripts/seed_programs.mjs            # dry run (default)
//   node scripts/seed_programs.mjs --commit    # apply

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const COMMIT = process.argv.includes("--commit");
const programs = JSON.parse(fs.readFileSync("scripts/data/programs.json", "utf8"));

const NO_EM_DASH_FIELDS = ["name", "description", "admission_requirements", "english_requirements"];
const UPSERT_FIELDS = [
  "name",
  "slug",
  "status",
  "duration_years",
  "tuition_international",
  "tuition_domestic",
  "tuition_domestic_is_csp",
  "currency",
  "application_url",
  "description",
  "curriculum",
  "admission_requirements",
  "english_requirements",
  "ielts_overall",
  "ielts_listening",
  "ielts_reading",
  "ielts_writing",
  "ielts_speaking",
  "pte_overall",
  "pte_listening",
  "pte_reading",
  "pte_writing",
  "pte_speaking",
  "intake_dates",
  "last_verified_at",
  "source_url",
];

// Validate before touching the DB. Em dashes and missing keys are fatal; a
// published row with no description is only warned about here (the write-path
// guard in src/lib/queries/programs.ts blocks new ones, but the import left a
// backlog this script still has to be able to restore faithfully).
const errors = [];
let emptyPublished = 0;
for (const p of programs) {
  for (const f of NO_EM_DASH_FIELDS) {
    if (typeof p[f] === "string" && p[f].includes("—")) {
      errors.push(`${p.name}: em dash in "${f}"`);
    }
  }
  if (p.status === "published" && !p.description?.trim()) emptyPublished += 1;
  if (!p.id || !p.university_slug) errors.push(`${p.name}: missing id or university_slug`);
  if (!p.slug) errors.push(`${p.name}: missing slug (re-run scripts/export_programs.mjs)`);
}
if (errors.length) {
  console.error(`${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
if (emptyPublished) {
  console.warn(`WARNING: ${emptyPublished} published rows have no description (import backlog).`);
}

const client = new pg.Client({ connectionString: env.DATABASE_URL });
await client.connect();

const unis = Object.fromEntries(
  (await client.query("select id, slug from universities")).rows.map((r) => [r.slug, r.id]),
);
const levels = Object.fromEntries(
  (await client.query("select id, name from degree_levels")).rows.map((r) => [r.name, r.id]),
);
const subjects = Object.fromEntries(
  (await client.query("select id, slug from subjects")).rows.map((r) => [r.slug, r.id]),
);

let inserted = 0;
let updated = 0;
const existing = new Set(
  (await client.query("select id from programs")).rows.map((r) => r.id),
);

if (!COMMIT) {
  for (const p of programs) (existing.has(p.id) ? (updated += 1) : (inserted += 1));
  console.log(`DRY RUN - ${programs.length} rows: ${updated} update, ${inserted} insert`);
  console.log("Re-run with --commit to apply.");
  await client.end();
  process.exit(0);
}

for (const p of programs) {
  const universityId = unis[p.university_slug];
  if (!universityId) throw new Error(`unknown university_slug: ${p.university_slug}`);
  const degreeLevelId = p.degree_level ? (levels[p.degree_level] ?? null) : null;
  const subjectId = p.subject_slug ? (subjects[p.subject_slug] ?? null) : null;

  const cols = ["id", "university_id", "degree_level_id", "subject_id", ...UPSERT_FIELDS];
  const values = [p.id, universityId, degreeLevelId, subjectId, ...UPSERT_FIELDS.map((f) => p[f] ?? null)];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const setClause = cols
    .filter((c) => c !== "id")
    .map((c) => `${c} = excluded.${c}`)
    .join(", ");

  const { rowCount } = await client.query(
    `insert into programs (${cols.join(", ")}) values (${placeholders})
     on conflict (id) do update set ${setClause}, updated_at = now()`,
    values,
  );
  existing.has(p.id) ? (updated += 1) : (inserted += 1);
  void rowCount;
}

console.log(`Applied ${programs.length} rows: ${updated} updated, ${inserted} inserted.`);
console.log("Bust ISR: POST /api/revalidate for table 'programs'.");
await client.end();
