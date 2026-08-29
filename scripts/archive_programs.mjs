import pg from "pg";
import fs from "fs";
import path from "path";

// Archive specific programs by id, with a reason. Used during the description
// pass when an official course page says a program is discontinued, suspended,
// or replaced. Soft delete (status='archived'); reasons are appended to
// scripts/data/archived-discontinued.json so the change is documented and
// reversible.
//
//   node scripts/archive_programs.mjs <id> "reason" [<id> "reason" ...]           # dry run
//   node scripts/archive_programs.mjs <id> "reason" [...] --commit

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const args = process.argv.slice(2).filter((a) => a !== "--commit");
const COMMIT = process.argv.includes("--commit");
const pairs = [];
for (let i = 0; i < args.length; i += 2) pairs.push([args[i], args[i + 1]]);
if (!pairs.length || pairs.some(([id, reason]) => !id || !reason)) {
  console.error("usage: node scripts/archive_programs.mjs <id> \"reason\" [...] [--commit]");
  process.exit(1);
}

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const logFile = path.join("scripts", "data", "archived-discontinued.json");
const log = fs.existsSync(logFile)
  ? JSON.parse(fs.readFileSync(logFile, "utf8"))
  : { note: "Programs an official university page says are discontinued/suspended/replaced, archived during the description pass. Reverse with: update programs set status='published' where id = '<id>'.", entries: [] };

for (const [id, reason] of pairs) {
  const { rows } = await c.query("select name, status from programs where id = $1", [id]);
  if (!rows.length) { console.log(`  SKIP ${id} - not found`); continue; }
  console.log(`  ${COMMIT ? "archived" : "would archive"}: ${rows[0].name} (${rows[0].status}) - ${reason}`);
  if (COMMIT) {
    await c.query("update programs set status = 'archived', updated_at = now() where id = $1", [id]);
    log.entries.push({ id, name: rows[0].name, reason, archived_at: new Date().toISOString() });
  }
}

if (COMMIT) {
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2) + "\n");
  console.log(`\nLogged to ${logFile}. Re-export + revalidate.`);
} else {
  console.log("\nRe-run with --commit to apply.");
}
await c.end();
