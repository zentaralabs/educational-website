import fs from "node:fs";

const files = process.argv.slice(2);
const out = {};

const STOP = ["Sample subjects", "ApplyNow", "Pathway Programs", "ENQUIRE", "Note:"];

function findStop(text, from) {
  let best = -1;
  for (const m of STOP) {
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

    let description = null;
    const anchorIdx = text.indexOf("You are here:");
    const qfIdx = text.search(/Quick Facts/);
    if (anchorIdx !== -1 && qfIdx !== -1 && qfIdx > anchorIdx) {
      // skip the breadcrumb line itself
      const afterBreadcrumb = text.indexOf("\n", anchorIdx) + 1;
      description = text.slice(afterBreadcrumb, qfIdx).trim();
    }

    let curriculum = null;
    const rcs = text.search(/Recommended Course Structure|Standard Delivery Course Structure/);
    if (rcs !== -1) {
      const stop = findStop(text, rcs);
      curriculum = text.slice(rcs, stop).trim();
    }

    let cricos = null;
    const m = text.match(/CRICOS Code\n([A-Z0-9]+)/) || text.match(/CRICOS Code:?\s*([A-Z0-9]+)/);
    if (m) cricos = m[1];

    out[url] = { description, curriculum, cricos };
  }
}

fs.writeFileSync("scripts/data/aspire_parsed.json", JSON.stringify(out, null, 2));
console.log("Parsed", Object.keys(out).length, "pages");
for (const [url, rec] of Object.entries(out)) {
  console.log(url, "| desc:", rec.description ? rec.description.length : 0, "| curr:", rec.curriculum ? rec.curriculum.length : 0, "| cricos:", rec.cricos);
}
