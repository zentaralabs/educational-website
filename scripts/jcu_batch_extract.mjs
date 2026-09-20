import fs from "fs";
import { extractFields } from "./jcu_lib.mjs";

// Read matches, and an optional override map (id -> {code}) for rows that
// needed manual resolution (duplicates, variant-tag collisions, misses).
const matches = JSON.parse(fs.readFileSync("scratch/jcu_matches.json", "utf8"));
const overridesPath = "scratch/jcu_overrides.json";
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, "utf8")) : {};

const out = [];
for (const m of matches) {
  const code = overrides[m.id]?.code || m.exact?.code;
  const skip = overrides[m.id]?.skip;
  if (skip) { out.push({ id: m.id, name: m.name, skip }); continue; }
  if (!code) { out.push({ id: m.id, name: m.name, error: "no code" }); continue; }
  const year = overrides[m.id]?.year || "2027";
  try {
    const res = await fetch(`https://handbook.jcu.edu.au/course/${year}/${code}`);
    if (res.status !== 200) { out.push({ id: m.id, name: m.name, code, error: `status ${res.status}` }); continue; }
    const html = await res.text();
    const jm = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    const data = JSON.parse(jm[1]);
    const pc = data.props.pageProps.pageContent;
    const fields = extractFields(pc);
    out.push({ id: m.id, name: m.name, code, source_url: `https://handbook.jcu.edu.au/course/${year}/${code}`, ...fields });
  } catch (e) {
    out.push({ id: m.id, name: m.name, code, error: e.message });
  }
  await new Promise((r) => setTimeout(r, 120));
}
fs.writeFileSync("scratch/jcu_extracted.json", JSON.stringify(out, null, 1));
const ok = out.filter((o) => o.admission_requirements || o.english_requirements);
console.log(`done: ${ok.length}/${out.length} with some requirement text`);
console.log("errors:", out.filter((o) => o.error).map((o) => `${o.name}: ${o.error}`).join("\n"));
