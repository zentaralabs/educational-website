// University of Newcastle tail closure (2026-09-25): archive the 7 rows from the
// 33-row incomplete worklist that carry real, first-party evidence of discontinuation,
// rename/supersession, or genuine non-existence, rather than being completed to Bond
// standard. Sets BOTH status='archived' and discontinued_note (archive_programs.mjs
// silently drops discontinued_note, a known project bug; this script follows the
// curtin/murdoch/canberra tail-closure pattern instead).
//
// Rows come from scripts/data/newcastle_tail_archive_candidates.json, each with a cited
// reason (2025-vs-2026 handbook diff, CRICOS cross-check, Wayback Machine check).
import pg from "pg";
import fs from "fs";
import path from "path";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const candidatesFile = path.join("scripts", "data", "newcastle_tail_archive_candidates.json");
const ROWS = fs.existsSync(candidatesFile) ? JSON.parse(fs.readFileSync(candidatesFile, "utf8")) : [];

if (!ROWS.length) {
  console.log("No archive candidates found in", candidatesFile);
  process.exit(0);
}

const COMMIT = process.argv.includes("--commit");

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const logFile = path.join("scripts", "data", "newcastle-tail-archived.json");
const log = fs.existsSync(logFile)
  ? JSON.parse(fs.readFileSync(logFile, "utf8"))
  : { note: "University of Newcastle tail-closure archive log, 2026-09-25 session. Reverse with: update programs set status='published' where id = '<id>'.", entries: [] };

for (const r of ROWS) {
  const { rows } = await c.query("select name, status from programs where id = $1", [r.id]);
  if (!rows.length) { console.log(`  SKIP ${r.id} - not found`); continue; }
  console.log(`  ${COMMIT ? "archived" : "would archive"}: ${rows[0].name} (${rows[0].status})`);
  console.log(`    reason: ${r.reason}`);
  if (COMMIT) {
    await c.query(
      "update programs set status = 'archived', discontinued_note = $2, updated_at = now() where id = $1",
      [r.id, r.reason],
    );
    log.entries.push({ id: r.id, name: rows[0].name, reason: r.reason, archived_at: new Date().toISOString() });
  }
}

if (COMMIT) {
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2) + "\n");
  console.log(`\nLogged to ${logFile}. Re-export + revalidate.`);
} else {
  console.log("\nRe-run with --commit to apply.");
}
await c.end();
