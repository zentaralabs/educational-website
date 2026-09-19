import pg from "pg";
import fs from "fs";

// Read-only sweep for em dashes (U+2014) and en dashes used as a
// sentence-separator (U+2013) in published, user-facing DB content. House
// style is zero em/en dashes in anything that renders on the public site
// (they read as AI-generated); a genuine numeric/date range ("2024-2026")
// is fine but this script can't tell the difference from a raw LIKE scan,
// so review each hit before fixing. The seed scripts guard content they
// write (see NO_EM_DASH_FIELDS in seed_programs.mjs, which also checks en
// dashes), but rows edited afterwards through the admin panel are not
// re-checked, and this script previously only checked em dashes, which is
// why it can under-report relative to seed_programs.mjs's gate. This
// script only SELECTs; fix any hits in the admin editor or via a script.
//
//   node scripts/check_em_dashes.mjs

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

// table -> identifying column + prose columns to scan. Only rows with
// status = 'published' are checked (the public site never renders drafts).
const TARGETS = [
  { table: "guides", id: "slug", cols: ["title", "excerpt", "content"] },
  { table: "blog_posts", id: "slug", cols: ["title", "excerpt", "content"] },
  { table: "scholarships", id: "slug", cols: ["name", "description", "eligibility"] },
  {
    // The table is visa_subclasses, not "visas" (migration 0019). The old
    // "visas" entry silently matched nothing, so visa prose went unchecked.
    table: "visa_subclasses",
    id: "slug",
    cols: [
      "name",
      "short_description",
      "summary",
      "content",
      "english_requirement",
      "work_experience_requirement",
      "pr_pathway",
      "eligibility",
      "conditions",
    ],
  },
  { table: "invitation_rounds", id: "round_date", cols: ["notes", "occupation_notes"] },
  { table: "policy_updates", id: "slug", cols: ["title", "summary", "impact"] },
  { table: "deadlines", id: "university_id", cols: ["notes"] },
  {
    table: "universities",
    id: "slug",
    cols: ["who_is_it_for", "how_to_apply", "distinctive_summary", "international_student_notes"],
  },
  {
    table: "programs",
    id: "name",
    // `curriculum` is deliberately excluded: parseCurriculumLine() in
    // programs/[programId]/page.tsx uses " — " as a field delimiter that is
    // split out and never rendered, so an em dash there is expected.
    cols: [
      "name",
      "description",
      "admission_requirements",
      "english_requirements",
      "discontinued_note",
    ],
  },
];

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  let total = 0;

  for (const { table, id, cols } of TARGETS) {
    // Skip columns that don't exist on this deployment rather than erroring.
    const { rows: existing } = await client.query(
      `select column_name from information_schema.columns where table_name = $1`,
      [table],
    );
    const have = new Set(existing.map((r) => r.column_name));
    const scan = cols.filter((c) => have.has(c));
    if (scan.length === 0) continue;

    const where = scan.map((c) => `(${c} like '%—%' or ${c} like '%–%')`).join(" or ");
    const statusFilter = have.has("status") ? "status = 'published' and" : "";
    const { rows } = await client.query(
      `select ${id} as ident, ${scan
        .map((c) => `(${c} like '%—%' or ${c} like '%–%') as "${c}"`)
        .join(", ")}
       from ${table}
       where ${statusFilter} (${where})
       order by ${id}`,
    );

    if (rows.length) {
      console.log(`\n${table} (${rows.length}):`);
      for (const r of rows) {
        const hits = scan.filter((c) => r[c]);
        console.log(`  ${r.ident}  ->  ${hits.join(", ")}`);
      }
      total += rows.length;
    }
  }

  console.log(
    total === 0 ? "\nClean: no em/en dashes in published content." : `\n${total} row(s) to fix.`,
  );
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
