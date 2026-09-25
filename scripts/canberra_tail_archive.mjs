// University of Canberra tail closure (2026-09-25): archive rows from the 36-row
// incomplete worklist that carry real, first-party evidence of discontinuation or
// genuine non-existence, rather than being completed to Bond standard. Sets BOTH
// status='archived' and discontinued_note (archive_programs.mjs silently drops
// discontinued_note, a known project bug; this script follows the curtin/murdoch/bond
// tail-closure pattern instead).
//
// Rows come from scripts/data/canberra_tail_archive_candidates.json (written by
// canberra_tail_build_content.mjs after merging every cluster's _archive_candidates),
// reviewed by hand before this script is run with --commit.
import pg from "pg";
import fs from "fs";
import path from "path";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const candidatesFile = path.join("scripts", "data", "canberra_tail_archive_candidates.json");
const ROWS = fs.existsSync(candidatesFile) ? JSON.parse(fs.readFileSync(candidatesFile, "utf8")) : [];

if (!ROWS.length) {
  console.log("No archive candidates found in", candidatesFile);
  process.exit(0);
}

const COMMIT = process.argv.includes("--commit");

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const logFile = path.join("scripts", "data", "canberra-tail-archived.json");
const log = fs.existsSync(logFile)
  ? JSON.parse(fs.readFileSync(logFile, "utf8"))
  : { note: "University of Canberra tail-closure archive log, 2026-09-25 session. Reverse with: update programs set status='published' where id = '<id>'.", entries: [] };

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
