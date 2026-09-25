import pg from "pg";
import fs from "fs";
import path from "path";

// Archive the 2 Bond University tail rows (Graduate Certificate in International
// Relations, Master of Science by Research (Health Sciences)) confirmed genuinely
// discontinued/absent from the live catalogue during the 2026-09-25 tail-completion
// sprint, writing BOTH status='archived' and discontinued_note (aib_nida_archive.mjs
// pattern; a past bug in archive_programs.mjs silently dropped discontinued_note from
// writes -- always archive last, per repo convention).
//
//   node scripts/bond_tail_archive.mjs scripts/data/bond_tail_archive.json          # dry run
//   node scripts/bond_tail_archive.mjs scripts/data/bond_tail_archive.json --commit
//
// Input: JSON array of { id, name, reason }

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const file = process.argv[2];
const COMMIT = process.argv.includes("--commit");
if (!file) { console.error("pass a JSON file"); process.exit(1); }
const items = JSON.parse(fs.readFileSync(file, "utf8"));

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const logFile = path.join("scripts", "data", "bond-tail-archived.json");
const log = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : { entries: [] };

for (const it of items) {
  const { rows } = await c.query("select name, status from programs where id = $1", [it.id]);
  if (!rows.length) { console.log(`  SKIP ${it.id} - not found`); continue; }
  console.log(`  ${COMMIT ? "archived" : "would archive"}: ${rows[0].name} (${rows[0].status}) - ${it.reason}`);
  if (COMMIT) {
    await c.query(
      "update programs set status = 'archived', discontinued_note = $2, updated_at = now() where id = $1",
      [it.id, it.reason],
    );
    log.entries.push({ id: it.id, name: rows[0].name, reason: it.reason, archived_at: new Date().toISOString() });
  }
}

if (COMMIT) {
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2) + "\n");
  console.log(`\nLogged to ${logFile}. Re-export + revalidate.`);
} else {
  console.log("\nRe-run with --commit to apply.");
}
await c.end();
