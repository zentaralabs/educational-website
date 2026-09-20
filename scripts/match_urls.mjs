import fs from "fs";

const programs = JSON.parse(fs.readFileSync("scripts/data/programs.json", "utf8"));
const urlMap = JSON.parse(fs.readFileSync("scripts/data/course_url_map.json", "utf8"));

const rows = programs.filter(
  (p) => p.university_slug === "southern-cross-university" && p.status === "published"
);

// Build name -> {2026: url, 2027: url}
const byName = {};
for (const [url, label] of Object.entries(urlMap)) {
  const m = label.match(/^(.*) - (20\d\d)$/);
  if (!m) continue;
  const name = m[1].trim();
  const year = m[2];
  byName[name] = byName[name] || {};
  byName[name][year] = url;
}

function norm(s) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[().,-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const nameKeys = Object.keys(byName);
const normMap = {};
for (const k of nameKeys) normMap[norm(k)] = k;

const results = [];
for (const row of rows) {
  const n = norm(row.name);
  let matchKey = normMap[n];
  let matchType = matchKey ? "exact" : null;
  if (!matchKey) {
    const candidates = nameKeys.filter((k) => norm(k).includes(n) || n.includes(norm(k)));
    if (candidates.length === 1) {
      matchKey = candidates[0];
      matchType = "fuzzy-contains";
    } else if (candidates.length > 1) {
      matchKey = candidates[0];
      matchType = "fuzzy-ambiguous(" + candidates.length + ")";
    }
  }
  const urls = matchKey ? byName[matchKey] : null;
  results.push({
    id: row.id,
    name: row.name,
    matchKey,
    matchType,
    url2026: urls?.["2026"] || null,
    url2027: urls?.["2027"] || null,
  });
}

fs.writeFileSync("scripts/data/scu_url_matches.json", JSON.stringify(results, null, 2));
const matched = results.filter((r) => r.matchKey);
const unmatched = results.filter((r) => !r.matchKey);
console.log("Total rows:", results.length);
console.log("Matched:", matched.length);
console.log("Unmatched:", unmatched.length);
console.log("\n--- UNMATCHED ---");
unmatched.forEach((r) => console.log(" -", r.name));
console.log("\n--- FUZZY (verify) ---");
results
  .filter((r) => r.matchType && r.matchType.startsWith("fuzzy"))
  .forEach((r) => console.log(" -", r.name, "=>", r.matchKey, r.matchType));
