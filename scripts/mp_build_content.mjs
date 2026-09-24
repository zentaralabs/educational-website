// Melbourne Polytechnic build-out: turn scripts/data/mp_raw_extract.json into
// clean final content and (with --commit) write it to Postgres.
import fs from "node:fs";
import pg from "pg";

const DRY = !process.argv.includes("--commit");
const raw = JSON.parse(fs.readFileSync("scripts/data/mp_raw_extract.json", "utf8"));
const urlIndex = JSON.parse(fs.readFileSync("scripts/data/mp_url_index.json", "utf8"));
const programs = JSON.parse(fs.readFileSync("scripts/data/programs.json", "utf8"));

function dedash(s) {
  if (!s) return s;
  return s
    .replace(/\s*[–—]\s*/g, ", ")
    .replace(/--+/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",")
    .trim();
}

function cleanWhitespace(s) {
  if (!s) return s;
  return s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

// Insert newlines before inline "English:" / "Other:" / "Academic:" labels
// that got concatenated with no separator in the raw scrape.
function splitLabels(s) {
  if (!s) return s;
  return s.replace(/\s*(Academic:|English:|Other:)\s*/g, "\n$1 ").trim();
}

function buildDescription(name, overviewRaw) {
  if (!overviewRaw) return null;
  let t = overviewRaw;
  t = t.replace(/Overview\s*/i, "");
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  // Drop the leading run of short stat-box label/value lines (Campus,
  // Duration, Requirements, Next Intake and their paired values) - these are
  // never followed immediately by more short lines once real prose starts.
  let i = 0;
  const shortJunk = /^(Campus|Duration|Requirements|Next Intake|Click here to see entry requirements)\b/i;
  while (i < lines.length) {
    const l = lines[i];
    if (shortJunk.test(l) || (l.length <= 40 && i > 0 && shortJunk.test(lines[i - 1] || ""))) {
      i++;
      continue;
    }
    if (l.length <= 40) {
      // could be a short standalone value line (e.g. plain campus name) before prose starts
      i++;
      continue;
    }
    break;
  }
  let kept = lines.slice(i);
  let text = kept.join("\n");
  // collapse "[Heading]\nHeading" duplicate lines that appear when a
  // sub-heading's own text is repeated as the first line of its own body
  text = text.replace(/\[([^\]]+)\]\n\1\n/g, "$1:\n");
  text = text.replace(/\[([^\]]+)\]/g, "$1:");
  text = cleanWhitespace(text);
  text = dedash(text);
  return text || null;
}

function buildCurriculum(unitsRaw) {
  if (!unitsRaw) return null;
  // Pull "CODE Subject Name" pairs: a line that's a course-style code
  // (letters+digits, e.g. BIT111, CUAACD531, 22650VIC-style) followed by the
  // subject name on the next non-empty line.
  const lines = unitsRaw.split("\n").map((l) => l.trim()).filter(Boolean);
  const codeRe = /^[A-Z]{2,6}[0-9]{2,4}[A-Z]?$/;
  const units = [];
  for (let i = 0; i < lines.length; i++) {
    if (codeRe.test(lines[i]) && lines[i + 1]) {
      const name = lines[i + 1];
      if (!codeRe.test(name) && name.length > 2 && name.length < 120) {
        units.push(`${lines[i]} - ${name}`);
      }
    }
  }
  if (units.length >= 3) {
    const unique = [...new Set(units)];
    return dedash(unique.join("\n"));
  }
  // fallback: no clean code/name table found - return a cleaned prose version
  const prose = lines.filter((l) => l.length > 15 && !/^(Code|Subject|Type|Hours|Elective|Description|Year|Semester)$/i.test(l));
  return prose.length ? dedash(prose.slice(0, 40).join("\n")) : null;
}

function buildAdmission(requirementsRaw, domesticOnlyBanner, cricos) {
  if (!requirementsRaw) return null;
  let t = requirementsRaw;
  t = splitLabels(t);
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const junkLine = /^(Your literacy, numeracy and digital literacy capability\.|Your goals and the suitability of the course\.|Any additional support you might need to complete the course\.)$/i;
  const kept = lines.filter((l) => !junkLine.test(l));
  let text = kept.join("\n");
  text = text.replace(/\[([^\]]+)\]/g, "$1:");
  text = cleanWhitespace(text);
  text = dedash(text);
  if (domesticOnlyBanner && !cricos) {
    text =
      "Melbourne Polytechnic's own course page states this course is not currently available for international student enrolment (no CRICOS registration is listed for it).\n" +
      text;
  } else if (domesticOnlyBanner && cricos) {
    text =
      "Melbourne Polytechnic's course page currently shows a notice that this course is not open to new international applications, alongside the published entry criteria below (the course carries CRICOS code " +
      cricos +
      ").\n" +
      text;
  }
  return text || null;
}

function buildEnglish(englishSentence, domesticOnlyBanner, cricos) {
  if (englishSentence) {
    let t = splitLabels(englishSentence);
    t = cleanWhitespace(t);
    t = dedash(t);
    return t;
  }
  if (domesticOnlyBanner && !cricos) {
    return "Melbourne Polytechnic's own course page confirms this course is not currently available to international students, and no CRICOS registration or IELTS/PTE figure is published for it.";
  }
  return null;
}

const finalContent = {};
for (const [name, path] of Object.entries(urlIndex)) {
  if (path === null) continue;
  const r = raw[name];
  if (!r || r.error) {
    console.log("SKIP (fetch error):", name);
    continue;
  }
  const description = buildDescription(name, r.overviewRaw);
  const curriculum = buildCurriculum(r.unitsRaw);
  const admission_requirements = buildAdmission(r.requirementsRaw, r.domesticOnlyBanner, r.cricos);
  const english_requirements = buildEnglish(r.englishSentence, r.domesticOnlyBanner, r.cricos);
  finalContent[name] = {
    source_url: r.url,
    description,
    curriculum,
    admission_requirements,
    english_requirements,
    missing: [
      !description && "description",
      !curriculum && "curriculum",
      !admission_requirements && "admission_requirements",
      !english_requirements && "english_requirements",
    ].filter(Boolean),
  };
}

fs.writeFileSync("scripts/data/mp_final_content.json", JSON.stringify(finalContent, null, 2));
const missingRows = Object.entries(finalContent).filter(([, v]) => v.missing.length);
console.log(`Built content for ${Object.keys(finalContent).length} rows; ${missingRows.length} rows have a missing field:`);
for (const [name, v] of missingRows) console.log(" -", name, v.missing.join(","));

if (DRY) {
  console.log("\nDry run only (no DB writes). Pass --commit to write.");
  process.exit(0);
}

const nameToId = {};
for (const p of programs) {
  if (p.university_slug === "melbourne-polytechnic" && p.status === "published") {
    nameToId[p.name] = p.id;
  }
}

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);
const client = new pg.Client({ connectionString: env.DATABASE_URL });
await client.connect();
let updated = 0;
for (const [name, c] of Object.entries(finalContent)) {
  const id = nameToId[name];
  if (!id) {
    console.log("NO DB ID FOUND for", name);
    continue;
  }
  if (c.missing.length) {
    console.log("SKIP DB WRITE (missing field):", name, c.missing.join(","));
    continue;
  }
  await client.query(
    `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4, source_url=$5, application_url=$5, updated_at=now() WHERE id=$6`,
    [c.description, c.curriculum, c.admission_requirements, c.english_requirements, c.source_url, id]
  );
  updated++;
}
console.log(`Updated ${updated} rows in Postgres.`);
await client.end();
