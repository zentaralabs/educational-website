import * as cheerio from "cheerio";
import fs from "fs";

const list = JSON.parse(fs.readFileSync("scratch/fed_to_fetch.json", "utf8"));

function sectionAfter($, tagSel, headingText, stopTags) {
  const h = $(tagSel)
    .filter((i, el) => $(el).text().trim() === headingText)
    .first();
  if (!h.length) return null;
  let out = [];
  let el = h.next();
  let guard = 0;
  while (el.length && guard < 80) {
    const tag = el.prop("tagName");
    if (stopTags.includes(tag)) break;
    const t = $(el).text().trim();
    if (t) out.push(t);
    el = el.next();
    guard++;
  }
  return out.join(" ");
}

const results = [];
for (const item of list) {
  const url = item.exact.href;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      results.push({ id: item.id, name: item.name, url, error: `HTTP ${res.status}` });
      continue;
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $("h1").first().text().trim();
    const overview = sectionAfter($, "h2", "Course overview", ["H2"]);
    const years = [];
    $("h3").each((i, el) => {
      const t = $(el).text().trim();
      if (/^Year \d/.test(t)) years.push(t);
    });
    const yearTexts = years.map((y) => `${y}: ${sectionAfter($, "h3", y, ["H2", "H3"])}`);
    // fallback: "Sample course structure" full text if no Year headings (research/TAFE style)
    let structureFallback = null;
    if (!years.length) {
      structureFallback = sectionAfter($, "h2", "Course details", ["H2"]);
    }
    const entryReq = $("#entry-requirement").length ? $("#entry-requirement").text().trim() : null;
    results.push({
      id: item.id,
      name: item.name,
      url,
      title,
      overview,
      curriculum: yearTexts.join("\n"),
      structureFallback,
      entryReq,
    });
    console.error("fetched", item.name);
  } catch (e) {
    results.push({ id: item.id, name: item.name, url, error: e.message });
  }
  await new Promise((r) => setTimeout(r, 250));
}

fs.writeFileSync("scratch/fed_raw_extract.json", JSON.stringify(results, null, 2));
console.error("DONE", results.length);
