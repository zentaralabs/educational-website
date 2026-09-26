import fs from "fs";
import pg from "pg";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);
const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();
const ids = ["3dc6d8fc-1a63-499b-adc9-ae6b02156831", "336dfe62-153d-44be-899b-8ad4cf3ec657"];
for (const id of ids) {
  const { rows } = await c.query("select curriculum from programs where id=$1", [id]);
  const fixed = rows[0].curriculum.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
  await c.query("update programs set curriculum=$1, updated_at=now() where id=$2", [fixed, id]);
  console.log("fixed", id);
}
await c.end();
