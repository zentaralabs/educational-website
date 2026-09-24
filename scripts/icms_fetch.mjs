// Generic fetch+clean-text helper for icms.edu.au / aspire.edu.au pages.
// Usage: node scripts/icms_fetch.mjs <url> [<url2> ...]
import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

for (const url of process.argv.slice(2)) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    console.log("=====", url, res.status);
    if (res.status !== 200) continue;
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, svg").remove();
    $("li, p, div, br, h1, h2, h3, h4, h5, b, strong, tr, td").each((_, el) => {
      $(el).before("\n").after("\n");
    });
    const text = $("body").text().replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").split("\n").map(s=>s.trim()).filter(Boolean).join("\n");
    console.log(text);
    console.log();
  } catch (e) {
    console.log("=====", url, "FETCH ERROR", e.message);
  }
}
