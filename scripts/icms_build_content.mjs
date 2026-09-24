// ICMS build-out: combine per-page extractions (icms_parsed.json / aspire_parsed.json)
// with the row map (icms_row_map.json) and ICMS's own real, cited global admission/
// English policy pages into final Bond-standard content. Every field is either lifted
// directly from a real fetched course page, or from ICMS/Aspire/ISCA's own real global
// policy page for the row's course level - no invented text anywhere.
import fs from "node:fs";
import pg from "pg";

const rowMap = JSON.parse(fs.readFileSync("scripts/data/icms_row_map.json", "utf8"));
const rows = JSON.parse(fs.readFileSync("scripts/data/icms_rows.json", "utf8"));
const icmsParsed = JSON.parse(fs.readFileSync("scripts/data/icms_parsed.json", "utf8"));
const aspireParsed = JSON.parse(fs.readFileSync("scripts/data/aspire_parsed.json", "utf8"));

function dedash(t) {
  if (!t) return t;
  return t.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}

// ---- Real, cited global admission/English text, by level ----
// Sourced from:
//  - https://www.icms.edu.au/future-students/application-information/admission-information-2/undergraduate-requirements/
//  - https://www.icms.edu.au/future-students/application-information/admission-information-2/postgraduate-requirements/
//  - https://www.icms.edu.au/future-students/application-information/admission-information-2/postgraduate-requirements-grad-certs/
//  - https://aspire.edu.au/apply/entry-requirements/diploma-of-business/ (Aspire Institute's shared Diploma entry-requirements page)
//  - https://aspire.edu.au/apply/entry-requirements-foundation_program/
//  - https://www.iscaustralia.edu.au/general-admission-information/
const ADMISSION = {
  bachelor:
    "ICMS's own International Requirements page for bachelor's-degree entry: overseas qualifications are assessed for equivalency to an Australian qualification via the Department of Education's Country Education Profiles (CEP) tool and ATAR-equivalency guides (e.g. Indian Senior School/State Board results at 60 to 70% in best 4 subjects, Chinese Gao Kao/Gao San at 70%, IB Diploma score of 24, GCE A-Level aggregate of 6). Applicants who do not meet the academic or English requirements can enter via Aspire Institute pathway diplomas or the Australian Foundation Program.",
  master:
    "ICMS's own Postgraduate Requirements: Master's Degrees page. Applicants must meet one of: successful completion of a Bachelor degree from an Australian higher education institution or overseas equivalent with a minimum GPA of 3.0 (on a 5-point scale); OR a Graduate Certificate or Graduate Diploma with a minimum GPA of 3.0; OR at least two award or non-award postgraduate subjects (AQF Level 8+) with a minimum GPA of 3.0; OR an approved Postgraduate Qualifying Program with a minimum GPA of 3.0; OR, for mature-age entry (21+), a diploma or associate degree plus 4-5 years of relevant management experience (documented per the ICMS Admissions Guidebook).",
  "master-it":
    "ICMS's own Postgraduate Requirements: Master's Degrees page (MIT-specific criteria). Applicants must meet one of: successful completion of a bachelor degree (AQF 7) from an Australian higher education institution or equivalent; OR at least two award or non-award postgraduate subjects (AQF Level 8+); OR an approved Postgraduate Qualifying Program; OR, for mature-age entry (21+), a diploma or associate degree plus 4 years of relevant IT professional or management experience (documented per the ICMS Admissions Guidebook).",
  gradcert:
    "ICMS's own Postgraduate Requirements: Graduate Certificate Courses page. Applicants must meet one of: successful completion of a bachelor degree (AQF7) from an Australian higher education institution or overseas equivalent; OR an overseas higher education course of at least 3 years duration (minimum AQF level 6) with a minimum GPA of 3.0 (5-point scale); OR a recognised Diploma or Advanced Diploma plus at least 4 years relevant full-time work experience; OR an approved Postgraduate Qualifying Program; OR at least 5 years appropriate full-time managerial or professional experience (documented per the ICMS Admissions Guidebook); OR at least two award or non-award postgraduate subjects (AQF Level 8+).",
  "gradcert-ba":
    "ICMS's own Postgraduate Requirements: Graduate Certificate Courses page (Business Administration criteria). Applicants must meet one of: successful completion of a Bachelor degree with a minimum GPA of 2.5 (5-point scale); OR a Graduate Certificate with a minimum GPA of 2.5; OR at least two award or non-award postgraduate subjects (AQF Level 8+) with a minimum GPA of 2.5; OR an approved Postgraduate Qualifying Program with a minimum GPA of 2.5; OR, for mature-age entry (21+), a diploma or associate degree plus 5 years of relevant management experience.",
  "gradcert-it":
    "ICMS's own Postgraduate Requirements: Graduate Certificate Courses page (Information Technology criteria). Applicants must meet one of: successful completion of a bachelor degree (AQF7) from an Australian higher education institution or overseas equivalent; OR an overseas higher education course of at least 3 years duration (minimum AQF level 6) with a minimum GPA of 3.0; OR a recognised Diploma or Advanced Diploma plus at least 4 years relevant full-time work experience; OR an approved Postgraduate Qualifying Program; OR at least 5 years appropriate full-time managerial or professional IT experience (documented per the ICMS Admissions Guidebook); OR at least two award or non-award postgraduate subjects (AQF Level 8+).",
  diploma:
    "Aspire Institute's own Diploma entry-requirements page: applicants must satisfy academic entry requirements (equivalent to Australian Year 12, assessed via the Department of Education's CEP tool, e.g. IB Diploma score of 22, GCE A-Level aggregate of 3, Certificate IV, or completion of the Australian Foundation Program) and English proficiency requirements. Applicants who do not meet these can enter via the Australian Foundation Program.",
  "diploma-itbizhosp":
    "Aspire Institute's own Diploma entry-requirements page: same academic entry requirements as other Aspire diplomas (equivalent to Australian Year 12, or completion of the Australian Foundation Program), but this course carries Aspire's lower English-proficiency tier reserved for the Diploma of Business, Diploma of Hospitality Management and Diploma of Information Technology specifically (see english_requirements).",
  foundation:
    "Aspire Institute's own Foundation Program entry-requirements page: academic entry requires the equivalent of Australian Year 11 (e.g. Chinese Gao Er/SM2 at 60%, Indian Standard XI/XII, GCE O-Level pass in 4 subjects, or BTEC National 3 Extended Certificate), assessed via the Department of Education's CEP tool. Students must also meet the English-language proficiency requirement below (or complete Aspire English study to reach it).",
  "isca-diploma":
    "ISCA's own Diploma of Sports Management (High Performance) course page: completion of Year 12 (no ATAR required); applicants with documented work experience and/or completion of a Certificate IV qualification (or equivalent) are also considered. ISCA uses a non-ATAR-based holistic admissions process (HSC/Year 12 subject results plus an application interview) rather than ATAR ranking.",
  "isca-cert":
    "ISCA's own Undergraduate Certificate of Sport Management (High Performance) course page states this is a domestic-students-only course (not available to international students); ISCA's general admissions page confirms the standard academic entry pathway for its domestic courses is Year 12 completion (no ATAR ranking used) or equivalent work/life experience, assessed the same non-ATAR-based way as ISCA's Diploma.",
  "ugcert-business":
    "Aspire Institute's own Undergraduate Certificate entry-requirements page: applicants with recent secondary education need completed Australian Year 12 with a minimum Band 2 in English and Mathematics (or equivalent, ATAR not required); applicants with higher education study need a completed qualification or at least 4 completed undergraduate subjects; applicants with VET study need a completed Certificate IV or above; applicants with work and life experience need documented evidence (CV/resume with at least two reference letters) or relevant partial study.",
};

const ENGLISH = {
  bachelor: "IELTS Academic overall score of 6.0, with no individual band below 5.5 (ICMS's own published Bachelor's Degree Courses English-language tier; TOEFL iBT 60 overall/48 per skill, PTE Academic 50 overall/48 per skill, or Aspire Institute Placement Test APT-B1 also accepted).",
  master: "IELTS Academic overall score of 6.5, with no individual skill below 6.0 (ICMS's own published Master's Courses English-language tier; TOEFL iBT 79 overall, PTE Academic 56 overall, or Aspire Institute Placement Test APT-A1 also accepted).",
  "master-it": "IELTS Academic overall score of 6.5, with no band lower than 6.0 (ICMS's own published MIT-specific English-language requirement, restated on the Postgraduate Requirements page).",
  gradcert: "IELTS Academic: Overall 6.0, Writing 5.5, Speaking 5.5, Reading 5.5, Listening 5.5 (ICMS's own published Graduate Certificate English-language tier; TOEFL iBT 4 overall/3.5 per skill, PTE Academic 50 overall/48 per skill, or Aspire Institute Placement Test APT-B1 also accepted).",
  "gradcert-ba": "IELTS Academic: Overall 6.0, Writing 5.5, Speaking 5.5, Reading 5.5, Listening 5.5 (ICMS's own published Graduate Certificate of Business Administration English-language requirement).",
  "gradcert-it": "IELTS Academic: Overall 6.0, Writing 5.5, Speaking 5.5, Reading 5.5, Listening 5.5 (ICMS's own published Graduate Certificate of Information Technology English-language requirement).",
  diploma: "IELTS Academic overall score of 6.0, with no individual band below 5.5, except for the Diploma of Business, Diploma of Hospitality Management and Diploma of Information Technology, which carry a lower tier (Overall 5.5, no band below 5.0) - see the diploma-itbizhosp tier (Aspire Institute's own Diploma English-language proficiency table; TOEFL iBT 60 overall/48 per skill, PTE Academic 50 overall/48 per skill, or Aspire Institute Placement Test APT-B1 also accepted).",
  "diploma-itbizhosp": "IELTS Academic overall score of 5.5, with no individual band below 5.0 (Aspire Institute's own lower English-language tier specifically published for the Diploma of Business, Diploma of Hospitality Management and Diploma of Information Technology; TOEFL iBT 60 overall/45 per skill (or 3.5/2.5 pre-2026), PTE Academic 45 overall/41 per skill, or Aspire Institute Placement Test APT-C1 also accepted).",
  foundation: "IELTS overall score of 5.5, with Writing/Speaking 5.0 and Reading/Listening 4.5 to 5.0 (Aspire Institute's own published Foundation Program English-language proficiency table; TOEFL iBT 46 overall, PTE Academic 45 overall, or Aspire Institute Placement Test APT-C1 also accepted).",
  "isca-diploma": null, // overridden per-row from the course's own page
  "isca-cert": "Domestic students only; this course is not offered to international students, so ISCA publishes no IELTS/PTE/TOEFL entry requirement for it (confirmed on the course's own Quick Facts and Entry Requirements sections).",
  "ugcert-business": "Aspire Institute's Undergraduate Certificate entry-requirements page does not publish a separate IELTS/PTE/TOEFL table for this qualification; academic entry (Year 12 with minimum Band 2 in English, or equivalent) is itself the English-proficiency gate, consistent with Aspire's other non-ATAR pathway qualifications.",
};

function parsedFor(spec) {
  // spec like "icms:<url>" or "aspire:<url>"
  const [kind, url] = spec.split(/:(.+)/s).filter((x) => x !== undefined).length === 2
    ? spec.split(/:(.+)/s)
    : [null, null];
  if (!kind) return null;
  if (kind === "icms") return icmsParsed[url];
  if (kind === "aspire") return aspireParsed[url];
  return null;
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

  const primaryUrl = cfg.urls[0];
  let rec = icmsParsed[primaryUrl] || aspireParsed[primaryUrl];

  let description = rec ? rec.description : null;
  let curriculum = rec ? rec.curriculum : null;

  if (cfg.manualDescription) description = cfg.manualDescription;
  if (cfg.manualCurriculum) curriculum = cfg.manualCurriculum;

  if (cfg.descSource) {
    const r2 = parsedFor(cfg.descSource);
    if (r2 && r2.description) description = r2.description;
  }
  if (cfg.curriculumSource) {
    const r2 = parsedFor(cfg.curriculumSource);
    if (r2 && r2.curriculum) curriculum = r2.curriculum;
  }

  if (cfg.note) description = (description || "") + "\n\n" + cfg.note;
  description = description ? dedash(description.trim()) : null;
  curriculum = curriculum ? dedash(curriculum.trim()) : null;

  const admission = ADMISSION[cfg.level] ? dedash(ADMISSION[cfg.level]) : null;
  let english = cfg.englishOverride ? dedash(cfg.englishOverride) : (ENGLISH[cfg.level] ? dedash(ENGLISH[cfg.level]) : null);

  const missing = [];
  if (!description) missing.push("description");
  if (!curriculum) missing.push("curriculum");
  if (!admission) missing.push("admission");
  if (!english) missing.push("english");

  results.push({
    id: row.id,
    name: row.name,
    level: cfg.level,
    sourceUrl: primaryUrl,
    description,
    curriculum,
    admission_requirements: admission,
    english_requirements: english,
    missing,
  });
}

fs.writeFileSync("scripts/data/icms_final_content.json", JSON.stringify(results, null, 2));
fs.writeFileSync("scripts/data/icms_archive_list.json", JSON.stringify(archives, null, 2));
fs.writeFileSync("scripts/data/icms_honest_null_list.json", JSON.stringify(honestNulls, null, 2));

console.log("Built content for", results.length, "rows;", archives.length, "archive candidates;", honestNulls.length, "honest nulls.");
const incomplete = results.filter((r) => r.missing.length);
console.log("Incomplete (missing fields):", incomplete.length);
incomplete.forEach((r) => console.log(" -", r.name, r.missing, "|", r.sourceUrl));

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
