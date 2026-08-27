import pg from "pg";
import fs from "fs";

// Read-only sweep for em dashes (U+2014) in published, user-facing DB content.
// House style is zero em dashes in anything that renders on the public site
// (they read as AI-generated). The seed scripts guard content they write, but
// rows edited afterwards through the admin panel are not re-checked. This
// script only SELECTs; fix any hits in the admin editor.
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
    table: "visas",
    id: "slug",
    cols: ["name", "short_description", "summary", "pr_pathway", "eligibility", "conditions", "content"],
  },
  { table: "universities", id: "slug", cols: ["who_is_it_for", "how_to_apply"] },
  {
    table: "programs",
    id: "name",
    // `curriculum` is deliberately excluded: parseCurriculumLine() in
    // programs/[programId]/page.tsx uses " — " as a field delimiter that is
    // split out and never rendered, so an em dash there is expected.
    cols: ["name", "description", "admission_requirements", "english_requirements"],
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

    const where = scan.map((c) => `${c} like '%—%'`).join(" or ");
    const statusFilter = have.has("status") ? "status = 'published' and" : "";
    const { rows } = await client.query(
      `select ${id} as ident, ${scan
        .map((c) => `(${c} like '%—%') as "${c}"`)
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

  console.log(total === 0 ? "\nClean: no em dashes in published content." : `\n${total} row(s) to fix.`);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
