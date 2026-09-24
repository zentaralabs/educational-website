// Parse the flattened text dumps produced by icms_fetch.mjs into
// { description, curriculum, cricos } records, keyed by URL.
import fs from "node:fs";

const files = process.argv.slice(2);
const out = {};

const STOP_MARKERS = [
  "Pathway Programs",
  "ENQUIRE NOW",
  "Note: Both A and B code",
  "APPLY NOW",
  "SCHOLARSHIPS",
  "TUITION FEES",
  "START DATES",
  "ENTRY REQUIREMENTS",
  "Sample subjects",
  "Related Content",
  "COURSE LOCATOR",
];

function findStop(text, from) {
  let best = -1;
  for (const m of STOP_MARKERS) {
    const i = text.indexOf(m, from);
    if (i !== -1 && (best === -1 || i < best)) best = i;
  }
  return best === -1 ? text.length : best;
}

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const chunks = raw.split(/^===== /m).slice(1);
  for (const chunk of chunks) {
    const [firstLine, ...rest] = chunk.split("\n");
    const url = firstLine.split(" ")[0];
    const text = rest.join("\n");

    // description: from just after "Course Overview\nCourse Structure" pair to "Quick facts"/"Quick Facts"
    let descStart = -1;
    const tabMatch = text.match(/Course [Oo]verview\nCourse [Ss]tructure/);
    if (tabMatch) descStart = tabMatch.index + tabMatch[0].length;
    let descEnd = text.search(/Quick [Ff]acts/);
    let description = null;
    if (descStart !== -1 && descEnd !== -1 && descEnd > descStart) {
      description = text.slice(descStart, descEnd).trim();
    }

    // curriculum: from first "Trimester 1" to first stop marker after it
    let curriculum = null;
    const t1 = text.indexOf("Trimester 1");
    if (t1 !== -1) {
      const stop = findStop(text, t1);
      curriculum = text.slice(t1, stop).trim();
    }

    // cricos code
    let cricos = null;
    const m = text.match(/CRICOS [Cc]ourse [Cc]ode:?\s*([A-Z0-9]+)/) || text.match(/CRICOS [Cc]ode:?\s*([A-Z0-9]+)/);
    if (m) cricos = m[1];

    out[url] = { description, curriculum, cricos };
  }
}

fs.writeFileSync("scripts/data/icms_parsed.json", JSON.stringify(out, null, 2));
console.log("Parsed", Object.keys(out).length, "pages");
for (const [url, rec] of Object.entries(out)) {
  console.log(url, "| desc:", rec.description ? rec.description.length : 0, "| curr:", rec.curriculum ? rec.curriculum.length : 0, "| cricos:", rec.cricos);
}
