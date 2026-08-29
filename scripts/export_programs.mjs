import pg from "pg";
import fs from "fs";
import path from "path";

// Read-only DB -> file export of every program row, written to
// scripts/data/programs.json (one JSON array, stable key order, sorted by
// university slug then program name so diffs stay legible).
//
// This file is the version-controlled source of truth for program data, which
// otherwise lives only in Supabase (it was originally bulk-imported with no
// seed script). Workflow: edit programs in the admin panel, run this export,
// commit the diff. Apply a committed programs.json back to the DB with
// scripts/seed_programs.mjs.
//
//   node scripts/export_programs.mjs

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

// Columns we own as content. Excludes created_at / updated_at (churn) and the
// raw fk ids in favour of human-readable slugs/names resolved via joins.
const FIELDS = [
  "id",
  "name",
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

const client = new pg.Client({ connectionString: env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(`
  select
    p.*,
    u.slug as university_slug,
    dl.name as degree_level,
    s.slug as subject_slug
  from programs p
  join universities u on u.id = p.university_id
  left join degree_levels dl on dl.id = p.degree_level_id
  left join subjects s on s.id = p.subject_id
  order by u.slug, p.name, p.id
`);

const out = rows.map((r) => {
  const rec = {
    university_slug: r.university_slug,
    degree_level: r.degree_level,
    subject_slug: r.subject_slug,
  };
  for (const f of FIELDS) rec[f] = r[f] ?? null;
  return rec;
});

const dir = path.join("scripts", "data");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "programs.json");
fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n");

const byStatus = out.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] ?? 0) + 1;
  return acc;
}, {});
const emptyPublished = out.filter(
  (r) => r.status === "published" && !r.description?.trim(),
).length;

console.log(`Wrote ${out.length} programs to ${file}`);
console.table(byStatus);
console.log(`Published with empty description: ${emptyPublished}`);

await client.end();
