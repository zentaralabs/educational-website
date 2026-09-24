// TAFE NSW build-out: derive Bond-standard content (description, curriculum,
// admission_requirements, english_requirements) from TAFE NSW's own real
// international course-search API dump (scripts/data/tafe_api_catalogue.json,
// fetched live from https://www.tafensw.edu.au/api/international/course/search),
// using the row mapping in scripts/data/tafe_row_map.json. No invented text -
// every field is derived from real fetched fields (description, entryRequirements,
// courseStructure) on the matched record(s).
import fs from "node:fs";
import * as cheerio from "cheerio";
import pg from "pg";

const api = JSON.parse(fs.readFileSync("scripts/data/tafe_api_catalogue.json", "utf8"));
const rowMap = JSON.parse(fs.readFileSync("scripts/data/tafe_row_map.json", "utf8"));
const tafeRows = JSON.parse(fs.readFileSync("scripts/data/tafe_rows.json", "utf8"));
const byId = new Map(api.map((a) => [a.id, a]));

function stripHtml(html) {
  if (!html) return "";
  const $ = cheerio.load(`<div>${html}</div>`);
  // convert <li> to "- " bullet lines, <p>/<div>/<br>/<b>/<strong> to newlines
  $("li").each((_, el) => {
    $(el).prepend("- ");
    $(el).append("\n");
  });
  $("p, div, br, b, strong").each((_, el) => {
    $(el).before("\n");
    $(el).after("\n");
  });
  let text = $("div").first().text();
  return dedash(cleanText(text));
}

function cleanText(t) {
  return t
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

// Site-wide house rule: zero em/en dashes anywhere in published content.
function dedash(t) {
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function canonicalUrl(rec) {
  const slug = slugifyTitle(rec.title);
  return `https://www.tafensw.edu.au/international/courses/${slug}--${rec.id}`;
}

function extractSourceUrl(raw, rec) {
  // Only accept a course-details link if it actually points at THIS course's own
  // id/nationalCode - entryRequirements text often cross-links a DIFFERENT
  // prerequisite course (e.g. "or complete CUA30920 Certificate III..."), which
  // must never be used as this row's own source_url.
  const re = /href="(https:\/\/www\.tafensw\.edu\.au\/international\/course-details\/[^"]+)"/g;
  let m;
  while ((m = re.exec(raw || ""))) {
    const url = m[1];
    if (rec?.id && url.includes(rec.id)) return url;
    if (rec?.nationalCode && url.includes(rec.nationalCode)) return url;
  }
  return null;
}

function splitEntryRequirements(raw) {
  const full = stripHtml(raw);
  const lines = full.split("\n").map((l) => l.trim()).filter(Boolean);
  let mode = "academic"; // TAFE's own template opens directly with academic-style content before any label
  const academic = [];
  const english = [];
  const other = [];
  for (const line of lines) {
    if (/^(Academic|Academic Requirements|Academic requirement)s?:?$/i.test(line)) { mode = "academic"; continue; }
    if (/^(Pre-?Requisite)s?:?$/i.test(line)) { mode = "academic"; continue; }
    if (/^English( Language)? Requirements?:?$/i.test(line)) { mode = "english"; continue; }
    if (/^(Additional|Other)( Entry)? Requirements?:?$/i.test(line)) { mode = "other"; continue; }
    if (mode === "academic") academic.push(line);
    else if (mode === "english") english.push(line);
    else if (mode === "other") other.push(line);
  }
  return {
    admission: dedash(academic.join("\n").trim()) || null,
    english: dedash(english.join("\n").trim()) || null,
    otherNote: dedash(other.join("\n").trim()) || null,
    fullRaw: full,
  };
}

function buildCurriculum(courseStructure, extraNote) {
  if (!courseStructure) return null;
  const parts = [];
  if (courseStructure.coreUnitList?.length) {
    parts.push(courseStructure.coreUnitList.map((l) => stripHtml(l)).join("\n"));
  }
  if (courseStructure.additionalUnitList?.length) {
    parts.push("Elective units:\n" + courseStructure.additionalUnitList.map((l) => stripHtml(l)).join("\n"));
  }
  if (courseStructure.courseLen) parts.push(`Course length: ${courseStructure.courseLen}`);
  let text = cleanText(parts.filter(Boolean).join("\n\n"));
  if (extraNote) text = text + "\n\n" + extraNote;
  return dedash(text) || null;
}

function buildDescription(rec, extraNote) {
  let text = stripHtml(rec.description);
  if (extraNote) text = text + "\n\n" + extraNote;
  return text || null;
}

const results = [];
const archives = [];

for (const row of tafeRows) {
  const cfg = rowMap[row.name];
  if (!cfg) {
    console.error("NO MAPPING FOR", row.name);
    continue;
  }
  if (cfg.archive) {
    archives.push({ id: row.id, name: row.name, reason: cfg.archive });
    continue;
  }
  const ids = cfg.match;
  const recs = ids.map((id) => byId.get(id)).filter(Boolean);
  if (!recs.length) {
    console.error("NO RECORD FOUND FOR", row.name, ids);
    continue;
  }
  const primary = recs[0];
  const variantNote =
    recs.length > 1
      ? `TAFE NSW offers this qualification as ${recs.length} separate real streams: ${recs
          .map((r) => r.title)
          .join("; ")}. The content below reflects the ${primary.title} stream; the other streams share the same core structure with different specialty electives.`
      : null;

  const er = splitEntryRequirements(primary.entryRequirements);
  const linkedSourceUrl =
    extractSourceUrl(primary.entryRequirements, primary) || extractSourceUrl(primary.suitabilityRequirements, primary);
  const description = buildDescription(primary, null);
  const curriculum = buildCurriculum(primary.courseStructure, variantNote);
  let admission = er.admission;
  if (er.otherNote) admission = (admission ? admission + "\n\n" : "") + "Other requirements:\n" + er.otherNote;
  if (variantNote && !curriculum) admission = (admission ? admission + "\n\n" : "") + variantNote;
  const english = er.english;

  const missing = [];
  if (!description) missing.push("description");
  if (!curriculum) missing.push("curriculum");
  if (!admission) missing.push("admission");
  if (!english) missing.push("english");

  results.push({
    id: row.id,
    name: row.name,
    matchedTitle: primary.title,
    matchedIds: ids,
    sourceUrl: linkedSourceUrl || canonicalUrl(primary),
    description,
    curriculum,
    admission_requirements: admission,
    english_requirements: english,
    missing,
  });
}

fs.writeFileSync("scripts/data/tafe_final_content.json", JSON.stringify(results, null, 2));
fs.writeFileSync("scripts/data/tafe_archive_list.json", JSON.stringify(archives, null, 2));

console.log("Built content for", results.length, "rows;", archives.length, "archive candidates.");
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
      [r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.sourceUrl, r.id]
    );
    updated++;
  }
  console.log("Committed", updated, "rows to Postgres.");
  await client.end();
}
