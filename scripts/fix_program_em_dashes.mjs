import pg from "pg";
import fs from "fs";

// Replaces em dashes in the program fields that render on the public site.
// Dry run by default; pass --apply to write.
//
//   node scripts/fix_program_em_dashes.mjs           # preview every change
//   node scripts/fix_program_em_dashes.mjs --apply   # write them
//
// `curriculum` is left alone on purpose: its " — " is a field delimiter that
// parseCurriculumLine() splits out, so it never reaches the page.

const APPLY = process.argv.includes("--apply");

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

// name: an em dash there separates the degree from its specialisation, so a
// colon reads correctly ("Bachelor of Business: Marketing"). The prose fields
// use the dash as a mid-sentence break, so a comma is the safe swap.
function fixName(s) {
  return s.replace(/\s+—\s+/g, ": ").replace(/—/g, "-");
}
function fixProse(s) {
  return s.replace(/\s+—\s+/g, ", ").replace(/\s*—\s*/g, ", ");
}

const COLS = {
  name: fixName,
  description: fixProse,
  admission_requirements: fixProse,
  english_requirements: fixProse,
};

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  let changed = 0;

  for (const [col, fix] of Object.entries(COLS)) {
    const { rows } = await client.query(
      `select id, name, ${col} as val from programs where status = 'published' and ${col} like '%—%'`,
    );
    for (const r of rows) {
      const next = fix(r.val);
      if (next === r.val) continue;
      console.log(`\n[${col}] ${r.name}`);
      console.log(`  -  ${r.val}`);
      console.log(`  +  ${next}`);
      changed++;
      if (APPLY) {
        await client.query(
          `update programs set ${col} = $1, updated_at = now() where id = $2`,
          [next, r.id],
        );
      }
    }
  }

  console.log(
    `\n${changed} field(s) ${APPLY ? "updated" : "would change (dry run; pass --apply to write)"}.`,
  );
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
