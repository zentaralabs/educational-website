import fs from "fs";

const lines = fs.readFileSync("scripts/data/scu_sitemap_courses.txt", "utf8").trim().split("\n");

// group by base slug (without trailing /year/)
const bySlug = {};
for (const url of lines) {
  const m = url.match(/^https:\/\/www\.scu\.edu\.au\/study\/courses\/([a-z0-9-]+)\/(20\d\d)\/$/);
  if (!m) continue;
  const [, slug, year] = m;
  bySlug[slug] = bySlug[slug] || {};
  bySlug[slug][year] = url;
}

fs.writeFileSync("scripts/data/scu_slug_years.json", JSON.stringify(bySlug, null, 2));
console.log("Unique course slugs:", Object.keys(bySlug).length);
