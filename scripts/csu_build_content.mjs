// Charles Sturt University build-out: combine handbook.csu.edu.au structural data
// (scripts/data/csu_raw_extract.json) with real marketing descriptions scraped from
// study.csu.edu.au's embedded ocb_metadata JSON (scripts/data/csu_descriptions.json)
// into final Bond-standard content, and (with --commit) write it to Postgres.
import fs from "node:fs";
import pg from "pg";

const DRY = !process.argv.includes("--commit");
const raw = JSON.parse(fs.readFileSync("scripts/data/csu_raw_extract.json", "utf8"));
const descriptions = JSON.parse(fs.readFileSync("scripts/data/csu_descriptions.json", "utf8"));
const urlIndex = JSON.parse(fs.readFileSync("scripts/data/csu_url_index.json", "utf8"));
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

// Facts-only description for the small number of rows with no marketing page
// (newer/embedded-exit courses). Never invented - every clause is a real field
// pulled from the handbook JSON.
// Manually-sourced context for the 2 exit-only Grad Certs whose OWN handbook page
// carries no alt_exit_options text (the articulation is described on the PARENT
// Master's page instead - confirmed during research, see csu_manual_map.json notes).
const EXIT_AWARD_CONTEXT = {
  "Graduate Certificate in Agricultural Business Management [Exit Only]":
    "It is a real embedded exit-point-only award within the Master of Agriculture's structure: CSU's own Master of Agriculture handbook page states students may elect to transfer and exit the Master of Agriculture after completing the requirements for the Graduate Certificate in Agricultural Business Management.",
  "Graduate Certificate in Agriculture [Exit Only]":
    "It is a real embedded exit-point-only award: its own handbook overview states it articulates into the Master of Agriculture, with automatic admission and credit for equivalent subjects on completion.",
};

function factualDescription(name, r) {
  const parts = [];
  const level = (r.study_level || "").toLowerCase();
  parts.push(`Charles Sturt University's ${name} is a currently active ${level || ""} award (course code ${r.code}), offered through the ${r.faculty || "relevant CSU faculty"}.`);
  if (r.duration) parts.push(`Standard full-time duration is ${r.duration} year${r.duration == 1 ? "" : "s"}, worth ${r.credit_points} credit points.`);
  if (r.accreditations && r.accreditations.length) {
    parts.push(`It carries professional accreditation from ${r.accreditations.join(", ")}.`);
  }
  if (EXIT_AWARD_CONTEXT[name]) {
    parts.push(EXIT_AWARD_CONTEXT[name]);
  } else if (r.alt_exit_options && /exit point only|exit only/i.test(name)) {
    parts.push(`This is an embedded exit-point-only award: ${r.alt_exit_options}`);
  } else if (r.alt_exit_options) {
    parts.push(r.alt_exit_options);
  }
  return dedash(cleanWhitespace(parts.join(" ")));
}

// A few DB names carry a longer or older title than CSU's own current live
// title for the same real course code - append an honest one-line note rather
// than silently passing the mismatch through.
const NAME_VARIANCE_NOTE = {
  "Bachelor of Pharmacy":
    "Note: Charles Sturt has restructured this course as the Bachelor of Pharmacy (Honours), effective for the 2027 intake; the content above reflects that current, real course.",
  "Master of Project Management and Leadership (Professional Practice)":
    "Note: Charles Sturt's own current course title is simply Master of Project Management; the content above reflects that current, real course.",
  "Graduate Diploma of Project Management and Leadership":
    "Note: Charles Sturt's own current course title is simply Graduate Diploma of Project Management; the content above reflects that current, real course.",
};

function buildDescription(name, info, r) {
  const d = descriptions[name];
  let text;
  if (d && d.overview) {
    text = d.overview;
    if (d.career && d.career.length > 20 && !text.includes(d.career.slice(0, 30))) {
      text = text + "\n\nCareer opportunities: " + d.career;
    }
  } else {
    text = factualDescription(name, r);
  }
  if (NAME_VARIANCE_NOTE[name]) {
    text = text + "\n\n" + NAME_VARIANCE_NOTE[name];
  }
  return dedash(cleanWhitespace(text));
}

function buildCurriculum(r) {
  if (!r.curriculum) return null;
  let t = dedash(cleanWhitespace(r.curriculum));
  t = t.replace(/ \)/g, ")");
  return t;
}

function buildAdmission(r) {
  if (!r.admission_requirements) return null;
  return dedash(cleanWhitespace(r.admission_requirements));
}

// CSU's real general English Language Proficiency (ELP) policy, by study level,
// sourced from https://study.csu.edu.au/international/how-to-apply/course-entry-requirements
// (fetched directly, real text). Many course pages just point to this general
// policy rather than overriding it with a course-specific figure - when that's
// the case we append the real applicable tier so the field is actually useful,
// rather than leaving a bare "standard requirements apply" pointer.
function generalElpTier(studyLevel) {
  const lvl = (studyLevel || "").toLowerCase();
  if (lvl.includes("research") || lvl.includes("higher degree")) {
    return "For higher degree by research courses, Charles Sturt's general policy requires Academic IELTS (or equivalent) with a minimum overall score of 6.5 and no individual component score below 6.0, obtained within the last 2 years.";
  }
  if (lvl.includes("postgraduate")) {
    return "For postgraduate coursework courses, Charles Sturt's general policy requires Academic IELTS (or equivalent) with a minimum overall score of 6.0 and no individual component score below 6.0, obtained within the last 2 years.";
  }
  return "For undergraduate courses, Charles Sturt's general policy requires Academic IELTS (or equivalent) with a minimum overall score of 6.0 and no individual component score below 5.5, obtained within the last 2 years.";
}

function buildEnglish(r) {
  if (!r.english_requirements) return null;
  let t = dedash(cleanWhitespace(r.english_requirements));
  if (/Standard English Language Proficiency \(ELP\) requirements apply/i.test(t) && t.length < 300) {
    t = t + "\n\n" + generalElpTier(r.study_level) + " Source: https://study.csu.edu.au/international/how-to-apply/course-entry-requirements";
  }
  return t;
}

const finalContent = {};
const archiveList = [];

for (const [name, info] of Object.entries(urlIndex)) {
  if (info.archive) {
    archiveList.push({ id: info.id, name, reason: info.reason });
    continue;
  }
  const r = raw[name];
  if (!r || r.error) {
    console.log("SKIP (fetch error):", name, r && r.error);
    continue;
  }
  const description = buildDescription(name, info, r);
  const curriculum = buildCurriculum(r);
  const admission_requirements = buildAdmission(r);
  const english_requirements = buildEnglish(r);
  const source_url = info.catalogueUrl || r.handbookUrl;
  finalContent[name] = {
    id: info.id,
    source_url,
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

fs.writeFileSync("scripts/data/csu_final_content.json", JSON.stringify(finalContent, null, 2));
fs.writeFileSync("scripts/data/csu_archive_list.json", JSON.stringify(archiveList, null, 2));

const missingRows = Object.entries(finalContent).filter(([, v]) => v.missing.length);
console.log(`Built content for ${Object.keys(finalContent).length} rows; ${missingRows.length} rows have a missing field.`);
for (const [name, v] of missingRows) console.log(" -", name, v.missing.join(","));
console.log(`Archive candidates: ${archiveList.length}`);

if (DRY) {
  console.log("\nDry run only (no DB writes). Pass --commit to write.");
  process.exit(0);
}

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);
const client = new pg.Client({ connectionString: env.DATABASE_URL });
await client.connect();
let updated = 0;
for (const [name, c] of Object.entries(finalContent)) {
  if (c.missing.length) {
    console.log("SKIP DB WRITE (missing field):", name, c.missing.join(","));
    continue;
  }
  await client.query(
    `UPDATE programs SET description=$1, curriculum=$2, admission_requirements=$3, english_requirements=$4, source_url=$5, application_url=$5, updated_at=now() WHERE id=$6`,
    [c.description, c.curriculum, c.admission_requirements, c.english_requirements, c.source_url, c.id]
  );
  updated++;
}
console.log(`Updated ${updated} rows in Postgres.`);
await client.end();
