import pg from "pg";
import fs from "fs";
import path from "path";

// One-off cleanup: archive the thin "permutation" program rows that the bulk
// import created for four universities (Bond, Murdoch, Canberra, Adelaide) but
// never wrote content for:
//
//   * combined / double degrees  -- "Bachelor of X / Bachelor of Laws" etc.
//     Near-zero individual search demand, content would just restate the two
//     single degrees, both of which stay published.
//   * "(N Year Program)" twins   -- the standard-length duplicate of an
//     accelerated degree already listed under its plain name.
//
// Only rows that are BOTH status='published' AND have an empty description are
// touched, so anything already written up is left alone. status -> 'archived'
// (project policy is soft-delete only; the row and its id are preserved). The
// archived ids are written to scripts/data/archived-permutations.json so the
// change can be reversed with a one-line UPDATE.
//
//   node scripts/trim_program_permutations.mjs           # dry run (default)
//   node scripts/trim_program_permutations.mjs --commit   # apply

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

const UNIS = [
  "Bond University",
  "Murdoch University",
  "University of Canberra",
  "Adelaide University",
];

// A combined degree names two qualifications joined by a slash, or "... and
// Master/Doctor of ...". Single degrees with "and" in the title (e.g. "Bachelor
// of Politics and International Relations") are deliberately NOT matched.
const COMBINED_SQL = `(
  p.name ~ '(Bachelor|Master|Doctor|Diploma|Graduate Certificate|Graduate Diploma) of .+/(Bachelor|Master|Doctor|Diploma|Juris Doctor)'
  or p.name ~ '(Bachelor|Master) of .+ / (Bachelor|Master|Doctor|Juris) '
  or p.name ~ '/(Bachelor|Master) of '
  or p.name ~ ' and (Master|Doctor) of '
)`;
const TWIN_SQL = `p.name ~* '\\((3 [Yy]ear|2 [Yy]ear) [Pp]rogram\\)'`;

const client = new pg.Client({ connectionString: env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `
  select p.id, p.name, u.name as university,
    case when ${COMBINED_SQL} then 'combined' else 'twin' end as reason
  from programs p
  join universities u on u.id = p.university_id
  where u.name = any($1)
    and p.status = 'published'
    and (p.description is null or trim(p.description) = '')
    and (${COMBINED_SQL} or ${TWIN_SQL})
  order by u.name, p.name
  `,
  [UNIS],
);

const byReason = rows.reduce((acc, r) => {
  acc[r.reason] = (acc[r.reason] ?? 0) + 1;
  return acc;
}, {});

console.log(`${COMMIT ? "ARCHIVING" : "DRY RUN - would archive"} ${rows.length} programs\n`);
for (const r of rows) {
  console.log(`  [${r.reason}] ${r.university} - ${r.name}`);
}
console.log();
console.table(byReason);

if (!COMMIT) {
  console.log("\nRe-run with --commit to apply.");
  await client.end();
  process.exit(0);
}

const ids = rows.map((r) => r.id);
await client.query(
  `update programs set status = 'archived', updated_at = now() where id = any($1)`,
  [ids],
);

const dir = path.join("scripts", "data");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, "archived-permutations.json"),
  JSON.stringify(
    {
      archived_at: new Date().toISOString(),
      note: "Program permutation rows archived by trim_program_permutations.mjs. Reverse: update programs set status='published' where id = any(<ids>).",
      programs: rows,
    },
    null,
    2,
  ) + "\n",
);

console.log(`\nArchived ${ids.length} programs. Ids saved to scripts/data/archived-permutations.json`);
console.log("Now bust the ISR cache: POST /api/revalidate for table 'programs'.");

await client.end();
