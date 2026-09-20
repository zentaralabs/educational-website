import pg from "pg";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const rows = [
  {
    id: "6699b9d7-327e-405f-819d-c9d5067280b4",
    note: "No live une.edu.au course page or CRICOS entry found under this name; absent from UNE's 2026 international course-fee index.",
  },
  {
    id: "3dc716eb-68a6-4dc2-82cd-49fe57e9899a",
    note: "No live une.edu.au course page found; absent from UNE's 2026 international course-fee index. Only an honorary Doctor of Education mention found in UNE search results.",
  },
];

for (const r of rows) {
  const { rowCount } = await c.query(
    "update programs set discontinued_note = $2, updated_at = now() where id = $1",
    [r.id, r.note],
  );
  console.log(r.id, "updated:", rowCount);
}
await c.end();
