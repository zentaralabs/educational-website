// University of Canberra tail closure (2026-09-25 session): writes real content for the
// remaining incomplete published rows. Content sourced directly from canberra.edu.au's
// per-course pages (Admission requirements accordion, English language requirements
// modal, Course requirements structure section) and, for a small number of bare-umbrella
// or research-degree rows, honest disclosure of shared/central policy content per this
// project's established pattern. Merges every scripts/data/canberra_tail_cluster_*.json
// file present (cluster1 = hand-built by the orchestrating session; cluster_business,
// cluster_research, cluster_bachelors = parallel research sub-agents).
//
// Only fields present in a given row's content object are written, so already-correct
// fields (and any field a sub-agent chose not to touch because it couldn't source it) are
// left untouched.
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const dataDir = "scripts/data";
const clusterFiles = fs
  .readdirSync(dataDir)
  .filter((f) => /^canberra_tail_cluster.*\.json$/.test(f));

console.log("Merging cluster files:", clusterFiles.join(", "));

const content = {};
const archiveCandidates = [];

for (const file of clusterFiles) {
  const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  for (const [id, entry] of Object.entries(raw)) {
    if (id === "_archive_candidates") {
      for (const cand of entry) archiveCandidates.push({ ...cand, source_file: file });
      continue;
    }
    content[id] = { ...entry, _source_file: file };
  }
}

function dedash(t) {
  if (typeof t !== "string") return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

const FIELDS = ["description", "curriculum", "admission_requirements", "english_requirements"];

const updates = [];
for (const [id, c] of Object.entries(content)) {
  const set = {};
  for (const f of FIELDS) {
    if (c[f] !== undefined && c[f] !== null && String(c[f]).trim() !== "") {
      set[f] = dedash(String(c[f]).trim());
    }
  }
  if (Object.keys(set).length === 0) continue;
  updates.push({ id, name: c.name || id, set, source: c._source_file });
}

console.log(`\nPrepared ${updates.length} rows to write.`);
for (const r of updates) {
  console.log(" -", r.name, "| fields:", Object.keys(r.set).join(", "), `[${r.source}]`);
}

if (archiveCandidates.length) {
  console.log(`\n${archiveCandidates.length} archive candidate(s) flagged (not written by this script):`);
  for (const a of archiveCandidates) console.log(" -", a.name, "|", a.reason?.slice(0, 120));
  fs.writeFileSync(
    path.join(dataDir, "canberra_tail_archive_candidates.json"),
    JSON.stringify(archiveCandidates, null, 2) + "\n",
  );
}

if (process.argv.includes("--commit")) {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
  );
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  let updated = 0;
  for (const r of updates) {
    const cols = Object.keys(r.set);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const values = cols.map((c) => r.set[c]);
    await client.query(
      `UPDATE programs SET ${setClause}, last_verified_at = now(), updated_at = now() WHERE id = $${cols.length + 1}`,
      [...values, r.id],
    );
    updated++;
  }
  console.log(`\nCommitted ${updated} rows to Postgres.`);
  await client.end();
} else {
  console.log("\nRe-run with --commit to apply.");
}
