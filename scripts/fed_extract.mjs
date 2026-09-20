import * as cheerio from "cheerio";
import fs from "fs";

// Extract description/curriculum/admission/english from a FedUni course page.
// Usage: node scripts/fed_extract.mjs <url> [outfile.json]

const url = process.argv[2];
const out = process.argv[3];

function clean(s) {
  return s
    .replace(/\s+/g, " ")
    .replace(/[–—]/g, ",")
    .trim();
}

function sectionAfter($, tagSel, headingText, stopTags) {
  const h = $(tagSel)
    .filter((i, el) => $(el).text().trim() === headingText)
    .first();
  if (!h.length) return null;
  let out = [];
  let el = h.next();
  let guard = 0;
  while (el.length && guard < 60) {
    const tag = el.prop("tagName");
    if (stopTags.includes(tag)) break;
    const t = $(el).text().trim();
    if (t) out.push(t);
    el = el.next();
    guard++;
  }
  return out.join(" ");
}

async function main() {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    console.log(JSON.stringify({ url, error: `HTTP ${res.status}` }));
    return;
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $("h1").first().text().trim();
  const overview = sectionAfter($, "h2", "Course overview", ["H2"]);

  // Sample course structure years
  const years = [];
  $("h3").each((i, el) => {
    const t = $(el).text().trim();
    if (/^Year \d/.test(t)) years.push(t);
  });
  const yearTexts = years.map((y) => `${y}: ${sectionAfter($, "h3", y, ["H2", "H3"])}`);

  const entryReq = $("#entry-requirement").length ? $("#entry-requirement").text().trim() : null;

  console.log(
    JSON.stringify(
      {
        url,
        title,
        overview,
        curriculum: yearTexts.join("\n"),
        entryReq,
      },
      null,
      2,
    ),
  );
}

main();
