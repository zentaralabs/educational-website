// Parse every downloaded TIWA (tafeinternational.wa.edu.au) course page into a
// structured record: title, national code, WA course code, CRICOS code,
// description ("Why choose this course?"), admission requirements (incl IELTS
// line), and a list of "study option" blocks (institute, campus, core/elective
// units), so we can pick the South Metropolitan TAFE-specific block per course.
import fs from "node:fs";
import * as cheerio from "cheerio";

const dir = "scripts/data/tiwa_pages";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));

function dedash(t) {
  return (t || "").replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}
function clean(t) {
  return dedash(
    (t || "")
      .replace(/ /g, " ")
      .replace(/[ \t]+/g, " ")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n")
      .trim(),
  );
}

const records = [];

for (const f of files) {
  const html = fs.readFileSync(`${dir}/${f}`, "utf8");
  const $ = cheerio.load(html);
  $("script, style, noscript, header, footer, nav").remove();

  const title = $("h1").first().text().trim() || $("title").text().replace(/\|.*/, "").trim();
  // The page flattens adjacent block elements with no whitespace between them
  // (e.g. bullet-list items in the "Why choose this course?" prose run
  // together as "...challengesCase management..."). Insert an explicit
  // newline around every block/heading/list element before flattening so
  // $("body").text() preserves real sentence and item boundaries.
  $("li, p, div, br, h1, h2, h3, h4, b, strong, tr").each((_, el) => {
    $(el).before("\n");
    $(el).after("\n");
  });
  const bodyText = $("body").text();

  const nationalIdM = bodyText.match(/National ID\s*([A-Z0-9]{6,10})/);
  const waCodeM = bodyText.match(/WA Course Code\s*([A-Z0-9]{2,6})/);
  const cricosM = bodyText.match(/CRICOS code\s*([0-9A-Z]{6,8})/);

  // "Why choose this course?" description
  let description = null;
  const whyIdx = bodyText.indexOf("Why choose this course?");
  const careerIdx = bodyText.indexOf("Career opportunities");
  if (whyIdx !== -1 && careerIdx !== -1 && careerIdx > whyIdx) {
    description = clean(bodyText.slice(whyIdx + "Why choose this course?".length, careerIdx));
  }

  // Admission requirements block (shared across the whole course/page)
  let admissionBlock = null;
  const admIdx = bodyText.indexOf("Admission requirements");
  const studyOptIdx = bodyText.indexOf("Your study options");
  if (admIdx !== -1 && studyOptIdx !== -1 && studyOptIdx > admIdx) {
    admissionBlock = clean(bodyText.slice(admIdx + "Admission requirements".length, studyOptIdx));
  }

  // Split into per-study-option chunks using "Where |" + institute markers.
  // Each chunk roughly starts at a semester header and ends before the next.
  const instituteRe = /Where\s*\|\s*([^(]+?)\s*\((\d{5})\)/g;
  const instituteMatches = [...bodyText.matchAll(instituteRe)];

  const studyOptions = [];
  for (let i = 0; i < instituteMatches.length; i++) {
    const m = instituteMatches[i];
    const start = m.index;
    const end = i + 1 < instituteMatches.length ? instituteMatches[i + 1].index : bodyText.length;
    const chunk = bodyText.slice(start, end);
    studyOptions.push({
      institute: m[1].trim(),
      instituteCode: m[2],
      chunk,
    });
  }

  records.push({
    file: f,
    title: clean(title),
    nationalId: nationalIdM ? nationalIdM[1] : null,
    waCode: waCodeM ? waCodeM[1] : null,
    cricos: cricosM ? cricosM[1] : null,
    description,
    admissionBlock,
    studyOptions,
  });
}

fs.writeFileSync("scripts/data/tiwa_parsed.json", JSON.stringify(records, null, 2));
console.log("Parsed", records.length, "TIWA course pages");
const withSMT = records.filter((r) => r.studyOptions.some((o) => /South Metropolitan TAFE/i.test(o.institute)));
console.log("Courses with a South Metropolitan TAFE study option:", withSMT.length);
for (const r of withSMT) console.log(" -", r.title, "|", r.nationalId, "|", r.file);
