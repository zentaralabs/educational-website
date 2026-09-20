import fs from "fs";

const matches = JSON.parse(fs.readFileSync("scripts/data/scu_url_matches.json", "utf8"));
const cls = JSON.parse(fs.readFileSync("scripts/data/final_classification.json", "utf8"));

const final = [];
for (const row of matches) {
  const name = row.name;
  if (cls.archive[name]) {
    final.push({ id: row.id, name, status: "archive", reason: cls.archive[name] });
    continue;
  }
  if (cls.specialMatches[name]) {
    final.push({ id: row.id, name, status: "match", url: cls.specialMatches[name].url, note: cls.specialMatches[name].note });
    continue;
  }
  if (cls.corrections[name]) {
    const c = cls.corrections[name];
    if (typeof c === "string") {
      // means archive
      final.push({ id: row.id, name, status: "archive", reason: cls.archive[name] || c });
    } else {
      final.push({ id: row.id, name, status: "match", url: c.url, note: c.note });
    }
    continue;
  }
  // default: use matched url (prefer 2026)
  if (row.matchType === "exact" && row.url2026) {
    final.push({ id: row.id, name, status: "match", url: row.url2026 });
  } else if (row.matchType === "exact" && row.url2027) {
    final.push({ id: row.id, name, status: "match", url: row.url2027 });
  } else if (row.matchType === "fuzzy-contains" && row.url2026) {
    final.push({ id: row.id, name, status: "match", url: row.url2026, note: "fuzzy match on: " + row.matchKey });
  } else {
    final.push({ id: row.id, name, status: "unresolved" });
  }
}

fs.writeFileSync("scripts/data/scu_final_urls.json", JSON.stringify(final, null, 2));
console.log("match:", final.filter((f) => f.status === "match").length);
console.log("archive:", final.filter((f) => f.status === "archive").length);
console.log("unresolved:", final.filter((f) => f.status === "unresolved").length);
final.filter((f) => f.status === "unresolved").forEach((f) => console.log(" - UNRESOLVED:", f.name));
