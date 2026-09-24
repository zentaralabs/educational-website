// Melbourne Polytechnic build-out: fetch each mapped course page and extract
// description / curriculum / admission_requirements / english_requirements
// from the real server-rendered HTML (no fabrication - every field is text
// found on the live page).
//
// Technique: insert a unique text-node marker immediately before every
// heading (h1-h4), then take body.text() - this flattens the whole page in
// true document order regardless of how deeply headings/content are nested
// inside tab panels, so section boundaries can be found by simple string
// splitting instead of fragile DOM-sibling-walking (this site wraps each
// section in nested tab-panel divs, so sibling-walking silently truncates).
import fs from "node:fs";
import * as cheerio from "cheerio";

const BASE = "https://www.melbournepolytechnic.edu.au";
const urlIndex = JSON.parse(fs.readFileSync("scripts/data/mp_url_index.json", "utf8"));
const MARK = "@@MPHEAD@@";

function cleanText(t) {
  return t
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

async function fetchPage(path) {
  const url = BASE + path;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  return { url, status: res.status, html };
}

// Returns an ordered array of { heading, text } segments covering the whole
// document, in true document order.
function segmentByHeadings($) {
  $("h1,h2,h3,h4").each((_, el) => {
    const t = cleanText($(el).text());
    $(el).before(`\n${MARK}${t}${MARK}\n`);
  });
  const flat = $("body").text();
  const parts = flat.split(new RegExp(`${MARK}(.*?)${MARK}`, "s"));
  // parts alternates: [textBeforeFirstHeading, heading1, textAfterHeading1, heading2, textAfterHeading2, ...]
  const segments = [];
  for (let i = 1; i < parts.length; i += 2) {
    segments.push({ heading: cleanText(parts[i]), text: cleanText(parts[i + 1] || "") });
  }
  return segments;
}

// Collect text from the LAST segment matching startHeading, continuing
// through subsequent segments (concatenating their own heading + text) until
// a segment heading matches one of endHeadings.
function collectSection(segments, startHeading, endHeadings) {
  let startIdx = -1;
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i].heading.toLowerCase() === startHeading.toLowerCase()) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return null;
  let out = [segments[startIdx].text];
  for (let i = startIdx + 1; i < segments.length; i++) {
    const h = segments[i].heading;
    if (endHeadings.some((e) => h.toLowerCase() === e.toLowerCase())) break;
    out.push(`[${h}]\n${segments[i].text}`);
  }
  return out.filter(Boolean).join("\n");
}

function extractEnglishSentence(block) {
  if (!block) return null;
  const lines = block.split("\n");
  const hits = [];
  for (const line of lines) {
    if (/IELTS|PTE Academic|TOEFL|English language|Pearson|VIT website|Victorian Institute of Teaching/i.test(line)) {
      hits.push(line.trim());
    }
  }
  if (hits.length) return hits.join(" ");
  return null;
}

function findBanner(fullText) {
  return /not available for international students/i.test(fullText);
}

async function main() {
  const results = {};
  const entries = Object.entries(urlIndex).filter(([, v]) => v !== null);
  for (const [name, path] of entries) {
    process.stdout.write(`Fetching ${name} ...`);
    try {
      const { url, status, html } = await fetchPage(path);
      const $ = cheerio.load(html);
      $("script,style,noscript").remove();
      const fullTextForBanner = cleanText($("body").text());
      const segments = segmentByHeadings($);

      const overviewRaw = collectSection(segments, "Overview", ["Career Pathways"]);
      const unitsRaw = collectSection(segments, "Units of Study", ["Fees & Costs", "Fees and Costs", "Fees & costs"]);
      const requirementsRaw = collectSection(segments, "Requirements", ["Next Steps"]);
      const banner = findBanner(fullTextForBanner);
      const englishSentence = extractEnglishSentence(requirementsRaw);
      const codeMatch = fullTextForBanner.match(/Code:\s*([A-Z0-9]+)/);
      const cricosMatch = fullTextForBanner.match(/CRICOS:\s*([A-Z0-9]+)/);

      results[name] = {
        url,
        status,
        overviewRaw,
        unitsRaw,
        requirementsRaw,
        englishSentence,
        domesticOnlyBanner: banner,
        code: codeMatch ? codeMatch[1] : null,
        cricos: cricosMatch ? cricosMatch[1] : null,
      };
      console.log(
        " ok",
        status,
        overviewRaw ? "OV" : "no-OV",
        unitsRaw ? "UNITS" : "no-UNITS",
        requirementsRaw ? "REQ" : "no-REQ",
        englishSentence ? "ENG" : "no-ENG",
        banner ? "[BANNER]" : "",
        cricosMatch ? `CRICOS:${cricosMatch[1]}` : "no-CRICOS"
      );
    } catch (e) {
      console.log(" ERROR", e.message);
      results[name] = { error: e.message };
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  fs.writeFileSync("scripts/data/mp_raw_extract.json", JSON.stringify(results, null, 2));
  console.log("Wrote scripts/data/mp_raw_extract.json");
}

main();
