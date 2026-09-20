import fs from "fs";

const programs = JSON.parse(fs.readFileSync("scripts/data/programs.json", "utf8"));
const facts = JSON.parse(fs.readFileSync("scripts/data/une_extracted_facts.json", "utf8"));
const elrMap = JSON.parse(fs.readFileSync("scripts/data/une_elr_map.json", "utf8"));

const rows = programs.filter(
  (p) => p.university_slug === "university-of-new-england" && p.status === "published"
);

function noDash(s) {
  if (!s) return s;
  return s
    .replace(/\s*[–—]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s+\./g, ".");
}

function clean(s) {
  if (!s) return "";
  return noDash(s.replace(/\s+/g, " ").trim());
}

// ---------- description ----------
function stripBoilerplate(infoText) {
  let t = infoText || "";
  t = t.replace(/^Course information\s*Download course brochure/i, "");
  return t.trim();
}

function firstSentences(text, n) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, n).join(" ");
}

function composeDescription(name, f) {
  const body = stripBoilerplate(f.infoText || "");
  // Cut at "Why study" or "What makes our course different" marker
  const cut = body.split(/Why study|What makes our course different/)[0];
  let core = firstSentences(cut, 4).trim();
  if (!core) core = firstSentences(body, 4).trim();
  if (!core) {
    core = `${name} is offered by the University of New England (UNE CRICOS ${f.cricos || "n/a"}).`;
  }
  let desc = `${core}`;
  if (f.notAvailIntl) {
    desc += ` This course is currently not open to international student admission at UNE; the information above reflects UNE's domestic course page.`;
  }
  return clean(desc).slice(0, 1400);
}

// ---------- curriculum ----------
function composeCurriculum(name, f) {
  const items = (f.structSample || []).filter(Boolean);
  if (!items.length) {
    return clean(
      `${name} at UNE is a research higher degree with no fixed subject schedule. Candidates undertake a supervised research project (thesis) under the guidance of a UNE academic supervisor, with progress milestones (confirmation of candidature, annual progress review) rather than coursework units. See UNE's Graduate Research School and course handbook for candidature milestones specific to this award.`
    );
  }
  // pull unit codes/names out of the blob strings
  const unitRe = /([A-Za-z0-9 ,'’&:\-]+?)\s*\(([A-Z]{3,4}\d{3})\)\s*[–—-]\s*(\d+)\s*credit points?/g;
  const units = [];
  for (const chunk of items) {
    let m;
    const re = new RegExp(unitRe);
    while ((m = re.exec(chunk))) {
      units.push({ name: m[1].trim(), code: m[2], cp: m[3] });
    }
  }
  const sampleUnits = units.slice(0, 8).map((u) => `${u.name} (${u.code})`);
  const totalCp = units.reduce((sum, u) => sum + parseInt(u.cp, 10), 0);
  let text = `The course structure lists ${units.length || f.structCount} unit entries across its schedule. `;
  if (sampleUnits.length) {
    text += `Units include ${sampleUnits.slice(0, 6).join(", ")}, among others. `;
  }
  text += `Full unit-by-unit sequencing, credit point values, and any major or specialisation options are set out in UNE's Course Structure (Program of Study) tab for this course, and the authoritative version of record is UNE's own Course Handbook.`;
  return clean(text).slice(0, 1400);
}

// ---------- admission ----------
function extractRules(entryText) {
  const rules = [];
  const re = /Rule ([A-D]): ([^.]+\.)/g;
  let m;
  while ((m = re.exec(entryText || ""))) {
    rules.push(`Rule ${m[1]}: ${m[2].trim()}`);
  }
  return rules;
}

function extractPostgradSentence(entryText) {
  const m = (entryText || "").match(
    /You can apply for this course if you have completed[^.]+\./
  );
  return m ? m[0].trim() : null;
}

function composeAdmission(name, f) {
  let parts = [];
  if (f.atar) {
    parts.push(`Completion of Year 12 with a Guaranteed ATAR of ${f.atar} (Rule A) or equivalent higher education, VET study, or work experience.`);
  }
  const rules = extractRules(f.entryText);
  if (rules.length > 1) {
    parts.push(
      `This course is offered under multiple admission rules: ${rules.join(" ")}`
    );
  } else if (!f.atar) {
    const pg = extractPostgradSentence(f.entryText);
    if (pg) parts.push(pg);
  }
  if (!parts.length) {
    parts.push(
      `Entry is assessed against UNE's Admission, Credit and Enrolment Policy; see the course's own Entry Requirements tab for the exact academic and English language criteria that apply to ${name}.`
    );
  }
  if (f.notAvailIntl) {
    parts.push(
      `IMPORTANT: UNE's live course page states this course is not currently available to international students; the criteria above are UNE's domestic entry requirements.`
    );
  }
  return clean(parts.join(" ")).slice(0, 1400);
}

// ---------- english ----------
function composeEnglish(f) {
  const slug = (f.elrSlugs || [])[0] || "standard";
  const band = elrMap[slug] || elrMap.standard;
  const allEqualMin =
    band.listening === band.reading &&
    band.reading === band.writing &&
    band.writing === band.speaking;
  let base;
  if (allEqualMin) {
    base = `IELTS Academic ${band.overall} overall, no band below ${band.listening}`;
  } else {
    base = `IELTS Academic ${band.overall} overall (Listening ${band.listening}, Reading ${band.reading}, Writing ${band.writing}, Speaking ${band.speaking})`;
  }
  const notes = {
    nursing:
      " (Nursing and Midwifery Board of Australia / ANMAC registration standard; test results must be attained within 2 years of application)",
    "social-work":
      " (Australian Association of Social Workers registration-aligned standard; test results must be attained within 2 years of application)",
    pharmacy:
      " (Pharmacy Board of Australia registration-aligned standard; test results must be attained within 2 years of application)",
    "education-nesa":
      " (NSW Education Standards Authority initial-teacher-education standard; test results must be attained within 2 years of application)",
    law: " (School of Law English Language Requirement; test results must be attained within 2 years of application)",
    "hdr-other":
      " (UNE higher-degree-research English Language Requirement; test results must be attained within 2 years of application)",
    standard: "; test results must be attained within 2 years of application",
  };
  return clean(base + (notes[slug] || notes.standard));
}

// ---------- special-case name mapping ----------
const nameOverrides = {
  "Bachelor of Laws - Undergraduate 4 Years": "Bachelor of Laws",
};

const archiveCandidates = {
  "Bachelor of Agricultural and Resource Economics": {
    reason:
      "Not found at any guessed /study/courses/ slug (404), absent from UNE's authoritative 2026 international course-fee list (une.edu.au/international/fees-and-scholarships/course-fees-2026), and absent from UNE's course search results for 'Agricultural' / 'Resource Economics'. No live UNE page or CRICOS entry for this exact award name found.",
  },
  "Doctor of Education": {
    reason:
      "No /study/courses/ page found under any guessed slug (404), and absent from UNE's authoritative 2026 international course-fee list, which lists every currently CRICOS-registered course. UNE's search results for 'Doctor of Education' return only an honorary-doctorate mention (Professor John Pegg's honorary DEduc) and academic-dress/graduation pages, not a live coursework or research Doctor of Education program.",
  },
};

const results = [];
const owed = [];
const archive = [];

for (const row of rows) {
  if (archiveCandidates[row.name]) {
    archive.push({ id: row.id, name: row.name, reason: archiveCandidates[row.name].reason });
    continue;
  }
  const lookupName = nameOverrides[row.name] || row.name;
  const f = facts[lookupName];
  if (!f || f.notFound) {
    owed.push({ id: row.id, name: row.name, reason: "no extracted facts / page not found" });
    continue;
  }
  const description = composeDescription(row.name, f);
  const curriculum = composeCurriculum(row.name, f);
  const admission_requirements = composeAdmission(row.name, f);
  const english_requirements = composeEnglish(f);
  results.push({
    id: row.id,
    name: row.name,
    slug: f.slug,
    cricos: f.cricos,
    description,
    curriculum,
    admission_requirements,
    english_requirements,
  });
}

fs.writeFileSync("scripts/data/une_updates.json", JSON.stringify(results, null, 1));
fs.writeFileSync("scripts/data/une_owed.json", JSON.stringify(owed, null, 1));
fs.writeFileSync("scripts/data/une_archive.json", JSON.stringify(archive, null, 1));

console.log("updates:", results.length, "owed:", owed.length, "archive:", archive.length);
