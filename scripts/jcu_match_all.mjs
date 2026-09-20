import fs from "fs";

const programs = JSON.parse(fs.readFileSync("scripts/data/programs.json", "utf8"));
const rows = programs.filter(
  (r) => r.university_slug === "james-cook-university" && r.status === "published",
);
console.log("rows:", rows.length);

function norm(s) {
  return s.toLowerCase().replace(/\[.*?\]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

const out = [];
for (const row of rows) {
  const q = row.name.replace(/\[.*?\]/g, "").trim(); // strip bracketed variant tag for search
  const url = `https://handbook.jcu.edu.au/api/search/search-all?from=0&query=${encodeURIComponent(q)}&searchType=advanced&siteId=jcu-prod-pres&siteYear=current&size=20`;
  let items = [];
  try {
    const res = await fetch(url);
    const data = await res.json();
    items = (data.data && data.data.results) || [];
  } catch (e) {
    console.error("ERR", row.name, e.message);
  }
  const targetNorm = norm(row.name);
  let exact = items.find((it) => norm(it.title) === targetNorm);
  out.push({
    id: row.id,
    name: row.name,
    exact: exact ? { code: exact.code, title: exact.title, uri: exact.uri, score: exact.score } : null,
    candidates: items.slice(0, 8).map((it) => ({ code: it.code, title: it.title, uri: it.uri, score: it.score })),
  });
  await new Promise((r) => setTimeout(r, 150));
}

fs.writeFileSync("scratch/jcu_matches.json", JSON.stringify(out, null, 2));
console.log("done, exact matches:", out.filter((o) => o.exact).length, "/", out.length);
