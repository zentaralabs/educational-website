// TAFE Queensland build-out: parse cached course pages into structured records
// (description, curriculum units by section, general admission text, any
// course-specific IELTS override) for tq_build_content.mjs to combine with
// row-level mapping + the global English/academic policy tiers.
import fs from "node:fs";
import * as cheerio from "cheerio";

const cacheDir = "scripts/data/tq_cache";
const files = fs.readdirSync(cacheDir).filter((f) => f.endsWith(".html"));

function dedash(t) {
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
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

function extractToggleSections($) {
  // Each accordion item: title h3 + sibling content div
  const sections = {};
  $(".cmp-custom-toggle-content__container-section-title-description").each((_, el) => {
    const title = $(el).text().trim();
    const contentDiv = $(el).closest(".cmp-custom-toggle-content__container-section-title").next(
      ".cmp-custom-toggle-content__container-section-content",
    );
    const div = contentDiv.length ? contentDiv : $(el).parent().parent().next();
    sections[title] = div;
  });
  return sections;
}

function textOf($, el) {
  if (!el || !el.length) return "";
  const $$ = cheerio.load(`<div>${el.html() || ""}</div>`);
  $$("li").each((_, li) => {
    $$(li).prepend("- ");
    $$(li).append("\n");
  });
  $$("p, div, br, h3, h4, h5, b, strong, tr").each((_, e) => {
    $$(e).before("\n");
    $$(e).after("\n");
  });
  return clean($$("div").first().text());
}

const results = {};
for (const f of files) {
  const html = fs.readFileSync(`${cacheDir}/${f}`, "utf8");
  const $ = cheerio.load(html);
  const title = $("title").text().replace(" | TAFE Queensland", "").trim();

  const descContainer = $(".cmp-custom-cources-overview__container-left").first();
  let description = clean(descContainer.text()).replace(/^Course overview\n?/, "");
  description = description || null;

  // Curriculum: walk each accordion panel, grouping by its own "Year X"/"Core units" heading
  const curriculumLines = [];
  $(".cmp-custom-units__wrapper-accordion-panel").each((_, panel) => {
    $(panel)
      .find("li.cmp-custom-units__wrapper-accordion-panel-body-content-heading")
      .each((_, h) => {
        const label = $(h).text().trim();
        if (label && !/^(UNIT CODE|UNIT NAME)$/i.test(label)) curriculumLines.push(`\n${label}:`);
      });
    $(panel)
      .find(".cmp-custom-units__wrapper-accordion-panel-body-content-code-modal-wrapper")
      .each((_, modal) => {
        const name = $(modal)
          .find(".cmp-custom-units__wrapper-accordion-panel-body-content-code-modal-wrapper-title")
          .first()
          .text()
          .trim();
        const code = $(modal)
          .find(".cmp-custom-units__wrapper-accordion-panel-body-content-code-modal-wrapper-code-value")
          .first()
          .text()
          .trim();
        if (name) curriculumLines.push(code ? `${code} - ${name}` : name);
      });
  });
  const curriculum = clean(curriculumLines.join("\n")) || null;

  const sections = extractToggleSections($);
  let entryText = "";
  for (const [t, div] of Object.entries(sections)) {
    if (/entry requirement/i.test(t)) entryText += textOf($, div) + "\n\n";
  }
  entryText = clean(entryText);

  let importantInfo = "";
  for (const [t, div] of Object.entries(sections)) {
    if (/important information/i.test(t)) importantInfo += textOf($, div) + "\n\n";
  }
  importantInfo = clean(importantInfo);

  const ieltsMatch = (entryText + "\n" + importantInfo).match(
    /IELTS[^\n]*?(?:\.(?!\d)|$)/i,
  );

  results[f] = {
    file: f,
    title,
    description: description || null,
    curriculum,
    entryText: entryText || null,
    importantInfo: importantInfo || null,
    courseSpecificIelts: ieltsMatch ? clean(ieltsMatch[0]) : null,
  };
}

fs.writeFileSync("scripts/data/tq_extracted.json", JSON.stringify(results, null, 2));
console.log("Extracted", Object.keys(results).length, "pages.");
const noDesc = Object.values(results).filter((r) => !r.description);
const noCurric = Object.values(results).filter((r) => !r.curriculum);
const noEntry = Object.values(results).filter((r) => !r.entryText);
console.log("Missing description:", noDesc.length, noDesc.map((r) => r.title));
console.log("Missing curriculum:", noCurric.length, noCurric.map((r) => r.title));
console.log("Missing entry text:", noEntry.length, noEntry.map((r) => r.title));
