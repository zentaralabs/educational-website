import pg from "pg";
import fs from "fs";
import path from "path";

// Belt-and-suspenders for the "Australia only" launch state.
//
// Every non-launched country (countries.is_launched = false) still has
// university/scholarship rows at status = 'published'. Those rows are held back
// from the public site ONLY by the is_launched filter that every public query
// carries. This script moves them to status = 'draft' so Supabase RLS (anon can
// read published rows only) becomes a second, independent gate — a future query
// that forgets the is_launched join still can't leak them.
//
// Reversible: at country launch, flip that country's rows back to 'published'
// (and set countries.is_launched = true). Prior state is written to
// scripts/data/unlaunched-countries-draft-<timestamp>.json for rollback.
//
//   node scripts/set_unlaunched_countries_draft.mjs            # dry run
//   node scripts/set_unlaunched_countries_draft.mjs --commit   # apply

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const COMMIT = process.argv.includes("--commit");
const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const q = async (s, p = []) => (await c.query(s, p)).rows;

const unis = await q(`
  select u.id, u.slug, u.status, co.code as country
  from universities u join countries co on co.id = u.country_id
  where co.is_launched = false and u.status = 'published'
  order by co.code, u.slug
`);
const schols = await q(`
  select s.id, s.slug, s.status, co.code as country
  from scholarships s join countries co on co.id = s.country_id
  where co.is_launched = false and s.status = 'published'
  order by co.code, s.slug
`);

const byCountry = {};
for (const r of unis) byCountry[r.country] = (byCountry[r.country] || 0) + 1;
console.log("Universities to set draft:", byCountry, `(total ${unis.length})`);
console.log("Scholarships to set draft:", schols.length, schols.map((s) => `${s.country}/${s.slug}`).join(", "));

if (!COMMIT) {
  console.log("\nDry run. Re-run with --commit to apply.");
  await c.end();
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backup = { stamp, universities: unis, scholarships: schols };
const outDir = path.join("scripts", "data");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `unlaunched-countries-draft-${stamp}.json`);
fs.writeFileSync(outFile, JSON.stringify(backup, null, 2));
console.log(`\nBackup written: ${outFile}`);

await c.query("begin");
try {
  const uniIds = unis.map((r) => r.id);
  const scholIds = schols.map((r) => r.id);
  if (uniIds.length) {
    await c.query("update universities set status = 'draft' where id = any($1::uuid[])", [uniIds]);
  }
  if (scholIds.length) {
    await c.query("update scholarships set status = 'draft' where id = any($1::uuid[])", [scholIds]);
  }
  await c.query("commit");
  console.log(`Committed: ${uniIds.length} universities + ${scholIds.length} scholarships → draft.`);
} catch (e) {
  await c.query("rollback");
  console.error("Rolled back:", e.message);
  process.exitCode = 1;
}

await c.end();
