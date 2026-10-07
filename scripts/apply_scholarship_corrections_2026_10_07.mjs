// One-off: applies only the 2026-10-07 scholarship corrections to the live DB
// (not the full seed). Safe to re-run. Usage: node scripts/apply_scholarship_corrections_2026_10_07.mjs [--dry]
import pg from "pg";
import fs from "fs";
import { SCHOLARSHIP_CORRECTIONS_2026_10_07 as C, VERIFIED_ON } from "./scholarship_corrections_2026_10_07.mjs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; }),
);
const dry = process.argv.includes("--dry");
const client = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query("begin");
for (const [slug, patch] of Object.entries(C)) {
  if (/—/.test(JSON.stringify(patch))) throw new Error(`em dash in ${slug}`);
  const cols = Object.keys(patch);
  const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
  const r = await client.query(
    `update scholarships set ${setClause}, last_verified_at = $${cols.length + 1}, updated_at = now()
     where slug = $${cols.length + 2} returning slug`,
    [...cols.map((c) => patch[c]), VERIFIED_ON, slug],
  );
  if (r.rowCount !== 1) throw new Error(`expected 1 row for ${slug}, got ${r.rowCount}`);
  console.log("updated", slug, cols.join(","));
}
await client.query(dry ? "rollback" : "commit");
console.log(dry ? "DRY RUN rolled back" : "committed");
await client.end();
