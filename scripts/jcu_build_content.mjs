import fs from "fs";

const extracted = JSON.parse(fs.readFileSync("scratch/jcu_extracted.json", "utf8"));
const desc = JSON.parse(fs.readFileSync("scratch/jcu_desc_clean.json", "utf8"));

// End-on Honours rows that reuse their base bachelor's marketing page as the
// foundation of the description, with the honours year's own real facts
// (credit points, admission, curriculum) layered on top.
const HONOURS_BASE_URL = {
  "Bachelor of Arts (Honours) [End-on]": "https://www.jcu.edu.au/courses/bachelor-of-arts",
  "Bachelor of Business (Honours) [End-on]": "https://www.jcu.edu.au/courses/bachelor-of-business",
  "Bachelor of Commerce (Honours) [End-on]": "https://www.jcu.edu.au/courses/bachelor-of-commerce",
  "Bachelor of Information Technology (Honours) [End-on]": "https://www.jcu.edu.au/courses/bachelor-of-information-technology",
  "Bachelor of Laws (Honours) [End-on]": "https://www.jcu.edu.au/courses/bachelor-of-laws",
  "Bachelor of Physiotherapy (Honours) [End-on]": "https://www.jcu.edu.au/courses/bachelor-of-physiotherapy",
  "Bachelor of Science (Honours) [End-on]": "https://www.jcu.edu.au/courses/bachelor-of-science",
};

function clip(s, n) {
  if (!s) return "";
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastPeriod = cut.lastIndexOf(". ");
  return lastPeriod > n * 0.5 ? cut.slice(0, lastPeriod + 1) : cut + "...";
}

function honoursDescription(row, baseUrl) {
  const base = desc[baseUrl];
  const baseName = row.name.replace(/\s*\(Honours\)\s*\[End-on\]/, "");
  const intro = base ? clip(base.intro, 500) : "";
  const cp = row.credit_points ? `${row.credit_points} credit points` : "";
  return `${intro} Students who complete the ${baseName} pass degree can apply to progress into this End-on Honours year, an additional ${cp} of supervised research and coursework at JCU's ${row.academic_org}, subject to the College Dean's approval and any quota on honours places. ${row.name} graduates finish with an AQF Level 8 honours qualification on top of their original degree, opening research and further-study pathways the pass degree alone does not.`.replace(/\s+/g, " ").trim();
}

function marketingDescription(row) {
  const m = desc[row.marketing_url];
  if (!m) return null;
  let text = clip(m.intro, 500);
  if (m.whatToExpect) text += " " + clip(m.whatToExpect, 500);
  return text.replace(/\s+/g, " ").trim();
}

function handbookOnlyDescription(row, extra) {
  const cp = row.credit_points && row.credit_points !== "0" ? `${row.credit_points} credit points` : "a supervised research program";
  const firstGroup = row.curriculum ? row.curriculum.split(";")[0].replace(/^([a-z])/, (m) => m.toUpperCase()) : "";
  return `The ${row.name} is offered by JCU's ${row.academic_org}. ${extra} It comprises ${cp}${firstGroup ? `, built around ${firstGroup}` : ""}. Applicants work with JCU's Graduate Research School on candidature, supervision and milestones throughout the degree.`.replace(/\s+/g, " ").trim();
}

// Handbook "Entry Requirements" text for a few general degrees is limited to a
// single VCE-prerequisite line; the marketing page's own Entry Requirements
// box carries the real published ATAR alongside it, so fold it in.
const ADMISSION_ENRICH = {
  "Bachelor of Arts": "Domestic entry requires ATAR 59 or equivalent. Recommended knowledge: English (Units 3/4,C).",
  "Bachelor of Human Services": "Domestic entry requires ATAR 60 or equivalent. Recommended knowledge: English (Units 3/4,C).",
  "Bachelor of Laws": "Domestic entry requires ATAR 75 or equivalent. Recommended knowledge: English (Units 3/4,C).",
  "Bachelor of Social Work": "Domestic entry requires ATAR 62 or equivalent. Recommended knowledge: English (Units 3/4,C).",
  "Bachelor of Business - Bachelor of Psychological Science": "Recommended knowledge: English (Units 3/4,C).",
  "Diploma of Higher Education": "Entry requirements vary by major: the Business major requires English (Units 3/4,C); all other majors have no specific subject prerequisite. For non-English speaking background applicants in the Business major, English language proficiency of Band 1 (Schedule II of the JCU Admissions Policy) applies.",
};

const MANUAL = {
  "Master of Nursing": {
    description: "JCU Online's Master of Nursing gives registered nurses the qualifications and skills to evolve their career as healthcare itself changes, delivered 100% online and part-time so students can study one subject at a time and complete the degree in as little as two years part-time. Students choose to specialise in advanced practice, education, or leadership and management, or combine two for a double major. The eight core subjects cover digital health and informatics, effective clinical governance, professional communication in healthcare, synthesising and critically appraising evidence, quantitative and qualitative research methods, practice development, and professional portfolios for career advancement. Graduates are prepared to take on more complex clinical and leadership roles and deliver better patient care in a rapidly changing health system.",
  },
  "Master of Philosophy (Indigenous)": {
    description: "The Master of Philosophy (Indigenous) is run by JCU's Indigenous Education and Research Centre for students undertaking a significant independent research thesis on an Indigenous-focused topic, with commencement dates in March, July and October each year and study available online, in Townsville or in Cairns. It is a self-guided research degree: candidates develop their own research problems and questions, learn to design data-collection tools, and build a working relationship with academic supervisors over the two-year full-time candidature. Entry follows the Australian Qualifications Framework's Level 9 Masters guidelines; applicants with a GPA below 5.5 in their final year of coursework are encouraged to contact the Indigenous Education and Research Centre directly to discuss alternative pathways to admission.",
    english_requirements: null, // honest-null: verified zero IELTS/English text anywhere on the live handbook page
  },
};

const out = [];
const notes = [];
for (const row of extracted) {
  if (row.skip || row.error) continue;
  let description = null;
  if (MANUAL[row.name]) {
    description = MANUAL[row.name].description;
  } else if (HONOURS_BASE_URL[row.name]) {
    description = honoursDescription(row, HONOURS_BASE_URL[row.name]);
  } else if (row.marketing_url && desc[row.marketing_url]) {
    description = marketingDescription(row);
  } else if (row.name === "Bachelor of Medical Science (Honours) [End-on]") {
    description = handbookOnlyDescription(row, "This is an End-on Honours year for students who have completed three, four or five years of JCU's MBBS medical program with a credit average, giving high-achieving medical students a dedicated research year before continuing their medical degree.");
  } else if (row.name === "Bachelor of Biomedical Sciences (Honours) [End-on]") {
    description = handbookOnlyDescription(row, "It is an End-on Honours research year for graduates of a cognate AQF Level 7 bachelor degree who achieved a credit average, normally taken within two years of completing that pass degree.");
  } else if (row.name === "Bachelor of Sport and Exercise Science (Honours) [End-on]") {
    description = handbookOnlyDescription(row, "It is an End-on Honours research year for graduates of a cognate AQF Level 7 bachelor degree who achieved a credit average, giving students in sport and exercise science a supervised independent research project beyond their pass degree.");
  } else if (row.name === "Doctor of Education") {
    description = handbookOnlyDescription(row, "It is a research doctorate for experienced education practitioners: applicants must have practised in education or a related field, approved by the Head of the School of Education, for a minimum of three years before admission.");
  } else if (row.name === "Doctor of Philosophy (Education)") {
    description = handbookOnlyDescription(row, "It is JCU's research doctorate for education, run through the College of Arts, Society and Education, leading candidates through an independent supervised thesis under the University's standard Higher Degree by Research framework.");
  }
  if (!description) { notes.push(`NO DESCRIPTION: ${row.name}`); continue; }

  const englishOverride = MANUAL[row.name] && "english_requirements" in MANUAL[row.name] ? MANUAL[row.name].english_requirements : undefined;
  const english = englishOverride === null ? null : (englishOverride !== undefined ? englishOverride : row.english_requirements);

  let admission = row.admission_requirements;
  if (ADMISSION_ENRICH[row.name]) {
    if (admission && admission.trim() === "English (Units 3/4,C)") admission = "";
    admission = admission ? `${admission} ${ADMISSION_ENRICH[row.name]}` : ADMISSION_ENRICH[row.name];
  }

  out.push({
    id: row.id,
    name: row.name,
    description,
    curriculum: row.curriculum,
    admission_requirements: admission,
    english_requirements: english || null,
    source_url: row.source_url,
    _honest_null_english: english === null,
  });
}

fs.writeFileSync("scratch/jcu_final_content.json", JSON.stringify(out, null, 1));
console.log("built:", out.length);
console.log(notes.join("\n"));
console.log("honest-null english:", out.filter((o) => o._honest_null_english).map((o) => o.name));
