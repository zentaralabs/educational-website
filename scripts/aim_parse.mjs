// Parse cached AIM course pages into flattened text for manual inspection.
import fs from "node:fs";
import * as cheerio from "cheerio";

const dir = "scripts/data/aim_cache";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
const out = {};

for (const f of files) {
  const html = fs.readFileSync(`${dir}/${f}`, "utf8");
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  $("li, p, div, br, h1, h2, h3, h4, h5, h6, b, strong, tr, td").each((_, el) => {
    $(el).before("\n").after("\n");
  });
  const text = $("body").text().replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").split("\n").map((s) => s.trim()).filter(Boolean).join("\n");
  out[f] = text;
  fs.writeFileSync(`${dir}/${f.replace(".html", ".txt")}`, text);
}
console.log("parsed", files.length, "files");
