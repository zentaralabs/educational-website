import pg from "pg";
import fs from "fs";

// Applies a single migration SQL file by path:
//   node scripts/apply_migration.mjs supabase/migrations/0024_add_university_selectivity_band.sql
// This repo has no migration runner; migrations are plain SQL applied against
// DATABASE_URL. Idempotency is the migration's responsibility.

const path = process.argv[2];
if (!path) {
  console.error("usage: node scripts/apply_migration.mjs <path-to-sql>");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const sql = fs.readFileSync(path, "utf8");
const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log(`applied ${path}`);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
