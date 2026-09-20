import pg from "pg";
import fs from "fs";
import path from "path";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const COMMIT = process.argv.includes("--commit");
const args = JSON.parse(fs.readFileSync("scripts/data/scu_archive_args.json", "utf8"));
const pairs = [];
for (let i = 0; i < args.length; i += 2) pairs.push([args[i], args[i + 1]]);

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
