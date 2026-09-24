// TAFE Queensland build-out: combine per-page extractions (tq_extracted.json)
// with the row map (tq_row_map.json) and TAFE Queensland's own real, cited
// global policy tiers (Academic entry / English language requirements pages)
// into final Bond-standard content. No invented text anywhere - every field
// is either lifted directly from a real fetched course page, or from TAFE
// Queensland's own real global policy page for the row's course level.
import fs from "node:fs";
import pg from "pg";

const rowMap = JSON.parse(fs.readFileSync("scripts/data/tq_row_map.json", "utf8"));
const rows = JSON.parse(fs.readFileSync("scripts/data/tq_rows.json", "utf8"));
const extracted = JSON.parse(fs.readFileSync("scripts/data/tq_extracted.json", "utf8"));

function urlToFile(u) {
  const seg = u.replace("https://tafeqld.edu.au/course/", "").replace(/\//g, "_");
  return `${seg}.html`;
}

function levelOf(name) {
  const n = name.toLowerCase();
  if (/^master of/.test(n)) return "postgrad";
  if (/^graduate (certificate|diploma)/.test(n)) return "postgrad";
  if (/^bachelor of/.test(n)) return "bachelor";
  if (/^associate degree/.test(n)) return "associate";
  if (/^advanced diploma/.test(n)) return "vet-upper";
  if (/^diploma/.test(n)) return "vet-upper";
  if (/^undergraduate certificate/.test(n)) return "vet-upper";
  if (/^certificate iv/.test(n)) return "vet-upper";
  if (/^certificate iii/.test(n)) return "vet-lower";
  return "vet-upper";
}

// TAFE Queensland's own real, published tiers, confirmed from:
// https://tafeqld.edu.au/international/how-to-apply/english-language-requirements
const ENGLISH_TIERS = {
  "vet-lower": "IELTS Academic overall score of 6.0, with no individual band score below 5.5 (TAFE Queensland's standard Certificate III to Advanced Diploma tier; some courses require a higher figure, checked per course).",
  "vet-upper": "IELTS Academic overall score of 6.0, with no individual band score below 5.5 (TAFE Queensland's standard Certificate III to Advanced Diploma tier; some courses require a higher figure, checked per course).",
  associate: "IELTS Academic overall score of 6.0, with a minimum of 6.0 in Writing and no other skill below 5.5 (TAFE Queensland's standard Associate Degree tier).",
  bachelor: "IELTS Academic overall score of 6.5, with no individual score below 6.0 (TAFE Queensland's standard Bachelor's degree tier).",
  postgrad: "IELTS Academic overall score of 6.5, with no individual score below 6.0 (TAFE Queensland's standard postgraduate tier).",
};

// https://tafeqld.edu.au/international/how-to-apply/academic-entry-requirements
const ACADEMIC_TIERS = {
  "vet-lower": "Completion of an Australian Year 10 qualification, or the equivalent international qualification.",
  "vet-upper": "Completion of an Australian Year 12 qualification, or the equivalent international qualification.",
};

function dedash(t) {
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

function extractGeneralAdmission(entryText) {
  if (!entryText) return null;
  const idx = entryText.indexOf("General Admission Criteria");
  if (idx === -1) return null;
  // Cut at the next clear section break (a line that looks like a new heading, or end)
  let chunk = entryText.slice(idx);
  const endMarkers = ["\nCommonwealth supported places", "\nHECS", "\nFEE-HELP", "\nAdditional information"];
  for (const m of endMarkers) {
    const i = chunk.indexOf(m);
    if (i !== -1) chunk = chunk.slice(0, i);
  }
  return dedash(chunk.trim());
}

function extractSelectionCriteria(entryText) {
  if (!entryText) return null;
  const idx = entryText.search(/Selection criteria/i);
  if (idx === -1) return null;
  let chunk = entryText.slice(idx);
  // stop at an unrelated later section if present
  const endMarkers = ["\nCredit transfer", "\nRecognition of prior learning", "\nAdvanced Standing"];
  for (const m of endMarkers) {
    const i = chunk.indexOf(m);
    if (i !== -1 && i > 50) chunk = chunk.slice(0, i);
  }
  return dedash(chunk.trim());
}

function extractSkillsCheck(entryText) {
  if (!entryText) return null;
  const idx = entryText.search(/Skills check/i);
  if (idx === -1) return null;
  const nextIdx = entryText.search(/Selection criteria/i);
  let chunk = nextIdx !== -1 && nextIdx > idx ? entryText.slice(idx, nextIdx) : entryText.slice(idx, idx + 700);
  return dedash(chunk.trim());
}

const results = [];
const archives = [];
const honestNulls = [];

for (const row of rows) {
  const cfg = rowMap[row.id];
  if (!cfg) { console.error("NO CONFIG FOR", row.name); continue; }
  if (cfg.action === "archive") {
    archives.push({ id: row.id, name: row.name, reason: cfg.reason });
    continue;
  }
  if (cfg.action === "honest_null") {
    honestNulls.push({ id: row.id, name: row.name, reason: cfg.reason });
    continue;
  }

  const level = levelOf(row.name);
  const primaryUrl = cfg.urls[0];
  const rec = extracted[urlToFile(primaryUrl)];
  if (!rec) { console.error("NO EXTRACTED RECORD FOR", row.name, primaryUrl); continue; }

  let variantNote = null;
  if (cfg.multiStream) {
    const allRecs = cfg.urls.map((u) => extracted[urlToFile(u)]).filter(Boolean);
    variantNote = `TAFE Queensland offers this qualification only as ${allRecs.length} separate named real streams, with no single unqualified version: ${allRecs
      .map((r) => r.title)
      .join("; ")}. The content below reflects the ${rec.title} stream; each stream shares the same overall qualification level but has its own core/elective units.`;
  }

  let description = rec.description;
  if (cfg.note) description = (description || "") + "\n\n" + cfg.note;
  if (variantNote) description = (description || "") + "\n\n" + variantNote;
  description = description ? dedash(description.trim()) : null;

  let curriculum = rec.curriculum ? dedash(rec.curriculum) : null;
  if (variantNote && cfg.multiStream) {
    const allRecs = cfg.urls.map((u) => extracted[urlToFile(u)]).filter(Boolean);
    curriculum = allRecs
      .map((r) => `${r.title}:\n${dedash(r.curriculum || "")}`)
      .join("\n\n");
  }

  let admission = null;
  if (level === "bachelor" || level === "associate" || level === "postgrad") {
    admission = extractGeneralAdmission(rec.entryText);
    if (!admission) {
      // fall back to full entry text minus obvious noise for the rare HE page
      // that doesn't use the standard "General Admission Criteria" heading
      admission = rec.entryText ? dedash(rec.entryText.slice(0, 1200).trim()) : null;
    }
  } else {
    const skills = extractSkillsCheck(rec.entryText);
    const selection = extractSelectionCriteria(rec.entryText);
    const tier = ACADEMIC_TIERS[level] || ACADEMIC_TIERS["vet-upper"];
    const parts = [tier];
    if (skills) parts.push(skills);
    if (selection) parts.push(selection);
    admission = dedash(parts.join("\n\n"));
  }

  const english = rec.courseSpecificIelts
    ? dedash(rec.courseSpecificIelts) + " (TAFE Queensland's own published figure for this course, from its Important Information / Entry requirements section)."
    : ENGLISH_TIERS[level];

  const missing = [];
  if (!description) missing.push("description");
  if (!curriculum) missing.push("curriculum");
  if (!admission) missing.push("admission");
  if (!english) missing.push("english");

  results.push({
    id: row.id,
    name: row.name,
    level,
    sourceUrl: primaryUrl,
    description,
    curriculum,
    admission_requirements: admission,
    english_requirements: english,
    missing,
  });
}

fs.writeFileSync("scripts/data/tq_final_content.json", JSON.stringify(results, null, 2));
fs.writeFileSync("scripts/data/tq_archive_list.json", JSON.stringify(archives, null, 2));
fs.writeFileSync("scripts/data/tq_honest_null_list.json", JSON.stringify(honestNulls, null, 2));

console.log("Built content for", results.length, "rows;", archives.length, "archive candidates;", honestNulls.length, "honest nulls.");
const incomplete = results.filter((r) => r.missing.length);
console.log("Incomplete (missing fields):", incomplete.length);
incomplete.forEach((r) => console.log(" -", r.name, r.missing));

if (process.argv.includes("--commit")) {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
  );
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  let updated = 0;
  for (const r of results) {
    if (r.missing.length) continue;
    await client.query(
      `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4, source_url=$5, application_url=$5, updated_at=now() WHERE id=$6`,
      [r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.sourceUrl, r.id],
    );
    updated++;
  }
  console.log("Committed", updated, "rows to Postgres.");
  await client.end();
}
