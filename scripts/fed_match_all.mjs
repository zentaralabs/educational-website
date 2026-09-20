import fs from "fs";

const programs = JSON.parse(fs.readFileSync("scripts/data/programs.json", "utf8"));
const rows = programs.filter(
  (r) => r.university_slug === "federation-university-australia" && r.status === "published",
);
console.log("rows:", rows.length);

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const out = [];
for (const row of rows) {
  const q = row.name.replace(/\(.*?\)/g, "").trim(); // strip parens for broader search
  const url = `https://www.federation.edu.au/api/CourseApi/course-search?pageId=12&pageSize=20&Keyword=${encodeURIComponent(q)}`;
  let items = [];
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    items = data.result.items || [];
  } catch (e) {
    console.error("ERR", row.name, e.message);
  }
  const targetNorm = norm(row.name);
  // exact header match first
  let exact = items.find((it) => norm(it.header) === targetNorm);
  out.push({
    id: row.id,
    name: row.name,
    exact: exact ? { code: exact.code, header: exact.header, href: exact.link.href } : null,
    candidates: items.slice(0, 8).map((it) => ({ code: it.code, header: it.header, href: it.link.href })),
  });
  await new Promise((r) => setTimeout(r, 300));
}

fs.writeFileSync("scratch/fed_matches.json", JSON.stringify(out, null, 2));
console.log("done, exact matches:", out.filter((o) => o.exact).length);
