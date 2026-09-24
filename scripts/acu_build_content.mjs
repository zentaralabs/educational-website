import fs from "fs";

// Synthesize Bond-standard content for ACU rows from acu_raw_merged.json
// (real fetched marketing + handbook page content) plus the ACU Admission to
// Coursework Programs Policy Schedule 4 English band table (hardcoded below,
// sourced from https://policy.acu.edu.au/document/view.php?id=312).

const merged = JSON.parse(fs.readFileSync("scripts/data/acu_raw_merged.json", "utf8"));
const urlIndex = JSON.parse(fs.readFileSync("scripts/data/acu_url_index.json", "utf8"));
const byId = Object.fromEntries(urlIndex.map((r) => [r.id, r]));

const BANDS = {
  A: "IELTS Academic overall 6.0, no band below 5.5 (or PTE Academic 50 with min 42 all four skills, or TOEFL iBT 60, or Cambridge C1 Advanced 169, or ACU English Language Test/EAP grade C)",
  B: "IELTS Academic overall 6.0 (6.0 writing and speaking, 5.5 listening and reading), or PTE Academic 50 (min 50 writing/speaking, 42 reading/listening), or TOEFL iBT 60, or Cambridge C1 Advanced 176, or ACU EAP grade C",
  C: "IELTS Academic overall 6.5, no band below 6.0 (or PTE Academic 58 with min 50 all four skills, or TOEFL iBT 79, or Cambridge C1 Advanced 185, or ACU EAP grade B)",
  D: "IELTS Academic overall 7.0, no band below 6.0 (or PTE Academic 65 with min 50 all four skills, or TOEFL iBT 94, or Cambridge C1 Advanced 185 with min 169 all tests, or ACU EAP grade A)",
  E: "IELTS Academic overall 7.0, no band below 6.5 (or PTE Academic 65 with min 58 all four skills, or TOEFL iBT 94, or Cambridge C1 Advanced 185 with min 176 all tests, or ACU EAP grade A)",
  F1: "IELTS Academic overall 7.0 (7.0 in listening, reading and speaking, 6.5 in writing), or PTE Academic 66 (min 66 listening/reading/speaking, min 56 writing), or TOEFL iBT 94, or Cambridge C1 Advanced 185 (min 176 writing). For undergraduate Nursing and Midwifery, applicants may instead meet the Nursing and Midwifery Board of Australia (NMBA) English language skills registration standard directly, including via the Occupational English Test (OET)",
  G: "IELTS Academic overall 7.0, individual score of 7.0 in all four skills (or PTE Academic 65 with min 65 all four skills, or TOEFL iBT 94, or Cambridge C1 Advanced 185 with min 185 all tests; Cambridge C1 Advanced not accepted for Postgraduate Psychology courses)",
  H: "A minimum of IELTS 7.0 in reading and writing and a minimum of 7.5 in listening and speaking (per the AITSL initial teacher education English proficiency standard), or PTE Academic min 65 reading/writing and min 73 listening/speaking, or TOEFL iBT min 24 reading/27 writing/27 listening/24 speaking, or Cambridge C1 Advanced min 185 reading/writing and min 191 listening/speaking",
  HDR: "Academic IELTS 6.5 overall, including individual scores of 6.0 in all four skills, per ACU's Higher Degree Research Policy (Appendix C) for applicants whose prior qualification was not taught in English",
};

function elp(band, note) {
  return note ? `${BANDS[band]}. ${note}` : BANDS[band];
}

// Manual band assignment per row name (from ACU's Course Minimum English
// Language Proficiency Requirement table, Schedule 4 of the Admission to
// Coursework Programs Policy). Diplomas/certificates -> Band A by default.
const ENGLISH_OVERRIDE = {
  "Bachelor of Accounting and Finance": elp("B"),
  "Bachelor of Allied Health": elp("C", "This is an exit-only award for students completing part of the Bachelor of Occupational Therapy, Physiotherapy or Speech Pathology; it carries the same Health Sciences English standard as those parent degrees' non-named tier."),
  "Bachelor of Arts": elp("B"),
  "Bachelor of Biomedical Science (Honours)": elp("C"),
  "Bachelor of Business": elp("B"),
  "Bachelor of Computer Science": elp("B"),
  "Bachelor of Criminology and Criminal Justice": elp("B"),
  "Bachelor of Early Childhood Education (Birth to Five Years)": elp("C"),
  "Bachelor of Education (Primary and Secondary)": elp("H", "This is an Initial Teacher Education course and follows the AITSL-based band, not the standard undergraduate band."),
  "Bachelor of Educational Studies": elp("B", "This is a general-education exit award built from Initial Teacher Education units rather than an ITE award itself, so it carries the standard undergraduate band rather than the AITSL ITE band."),
  "Bachelor of Exercise and Sports Science": elp("C"),
  "Bachelor of High Performance Sport (Honours)": elp("C"),
  "Bachelor of Human Rights": elp("B"),
  "Bachelor of Information Technology": elp("B"),
  "Bachelor of Laws": elp("E"),
  "Bachelor of Nursing": elp("F1", "Bands F1 (tests taken on or before 22 April 2026) and F2 (on or after 23 April 2026) both apply; F1 figures given here as the current standard. Applicants may alternatively meet the Nursing and Midwifery Board of Australia's own English language skills registration standard, including via the Occupational English Test (OET)."),
  "Bachelor of Nutrition Science (Honours)": elp("C"),
  "Bachelor of Occupational Therapy": elp("G"),
  "Bachelor of Paramedicine": elp("F1"),
  "Bachelor of Physiotherapy": elp("G"),
  "Bachelor of Psychological Science": elp("F1"),
  "Bachelor of Psychology (Honours)": elp("F1"),
  "Bachelor of Social and Environmental Sustainability": elp("B"),
  "Bachelor of Social Work": elp("G"),
  "Bachelor of Speech Pathology": elp("G", "ACU's own English Language Test/EAP pathway is not accepted for this course; applicants must meet the IELTS/PTE/TOEFL/C1 figures directly."),
  "Bachelor of Theology": elp("B"),
  "Bachelor of Visual Arts and Design": elp("B"),
  "Bachelor of Youth Work": elp("B"),
  "Diploma in Biomedical Science": elp("A"),
  "Diploma in Business": elp("A"),
  "Diploma in Criminology": elp("A"),
  "Diploma in Educational Studies (Tertiary Preparation)": elp("H"),
  "Diploma in Exercise Science": elp("A"),
  "Diploma in Information Technology": elp("A"),
  "Diploma in Liberal Arts": elp("A"),
  "Diploma in Nutrition Science": elp("A"),
  "Diploma in Visual Arts and Design": elp("A"),
  "Doctor of Ministry": elp("HDR"),
  "Doctor of Philosophy": elp("HDR"),
  "Foundation Studies": elp("A", "Foundation Studies is ACU's own pre-university pathway program; the policy directs applicants to the program's own specific requirements, which align with the base Band A standard."),
  "Graduate Certificate in Business Administration": elp("C"),
  "Graduate Certificate in Information Technology": elp("C", "Postgraduate Digital and Human Futures courses carry Band C; Information Technology postgraduate coursework is treated the same as other non-named postgraduate courses."),
  "Graduate Diploma in Public Health": elp("C", "Health Sciences postgraduate coursework not separately named in the policy table carries the Band C standard."),
  "Master of Business Administration": elp("C"),
  "Master of Clinical Exercise Physiology": elp("E"),
  "Master of Dietetic Practice": elp("G"),
  "Master of Education": elp("C", "Graduate Entry Initial Teacher Education courses carry Band I, but Master of Education is a postgraduate course for already-qualified teachers rather than an entry ITE award, so it carries the standard postgraduate Band C."),
  "Master of Information Technology": elp("C"),
  "Master of Leadership and Management in Health Care": elp("C", "Health Sciences postgraduate coursework not separately named in the policy table carries the Band C standard."),
  "Master of Liberal Arts (Western Civilisation)": elp("C"),
  "Master of Philosophy": elp("HDR"),
  "Master of Professional Accounting": elp("C"),
  "Master of Professional Psychology": elp("G"),
  "Master of Psychology (Clinical)": elp("G"),
  "Master of Public Health": elp("C"),
  "Master of Social Work (Qualifying)": elp("G"),
  "Master of Teaching (Secondary)": elp("I", "Graduate Entry Initial Teacher Education courses, including vertical degrees, carry the highest AITSL-based band."),
  "Master of Teaching (Secondary)/Graduate Certificate of Religious Education": elp("I", "Graduate Entry Initial Teacher Education courses, including vertical degrees, carry the highest AITSL-based band; this combined award includes the Master of Teaching (Secondary)."),
};

function cleanText(t) {
  if (!t) return "";
  return t
    .replace(/—/g, ",")
    .replace(/–/g, " to ")
    .replace(/StatePrerequisites/g, "")
    .replace(/([a-z])([A-Z][a-z])/g, "$1. $2")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(t, n) {
  if (!t) return "";
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const lastPeriod = cut.lastIndexOf(". ");
  return (lastPeriod > n * 0.5 ? cut.slice(0, lastPeriod + 1) : cut).trim();
}

function buildCurriculum(row, name) {
  const d = merged[row.id];
  const units = d.units || [];
  let unitsText = "";
  if (units.length) {
    const shown = units.slice(0, 16);
    unitsText = `Core / specified units include: ${shown.join("; ")}.`;
    if (d.unitTotalCount && d.unitTotalCount > shown.length) {
      unitsText += ` The full schedule includes further elective and core curriculum units (${d.unitTotalCount} unit offerings in total).`;
    }
  }
  const completion = cleanText(d.completion || "");
  let out = [completion, unitsText].filter(Boolean).join(" ");
  if (!out && d.hb_rationale) out = cleanText(d.hb_rationale);
  return truncate(cleanText(out), 2200);
}

function buildAdmission(row, name) {
  const d = merged[row.id];
  const atar = d.atar;
  let entry = cleanText(d.entryText || "");
  // strip generic boilerplate tail that starts repeating across every page
  const cutMarkers = ["Applicants with recent secondary education", "View transparency admission information"];
  for (const m of cutMarkers) {
    const idx = entry.indexOf(m);
    if (idx > 0) entry = entry.slice(0, idx).trim();
  }
  entry = entry.replace(/^Entry requirements\s*(Expand all)?\s*/, "").trim();
  entry = truncate(entry, 1400);
  let prefix = "";
  if (atar) prefix = `Year 12 completion (or equivalent), ATAR ${atar}. `;
  else if (!/bachelor|master|graduate|doctor|diploma/i.test(name) === false && !atar) prefix = "";
  return truncate(cleanText(prefix + entry), 1800);
}

const MANUAL = {
  "Bachelor of Allied Health": {
    description: "The Bachelor of Allied Health is an exit only award at ACU: it is not applied for directly, but is available to eligible students who have completed sufficient credit within the Bachelor of Occupational Therapy, Bachelor of Physiotherapy or Bachelor of Speech Pathology but do not continue to complete one of those full professional degrees. It allows a student to graduate with a recognised university award rather than leaving with no qualification.",
    curriculum: "To qualify for the degree, a student must complete 240 credit points from the Schedule of Unit Offerings, consisting of 220 to 230 credit points from the Bachelor of Occupational Therapy units (excluding that course's Core Curriculum units), OR 220 to 230 credit points from the Bachelor of Physiotherapy units (excluding Core Curriculum), OR 220 to 230 credit points from the Bachelor of Speech Pathology units (excluding Core Curriculum), plus 10 to 20 credit points of University Core Curriculum units. It does not have its own separate unit set; its content is entirely drawn from whichever of the three parent degrees the student was enrolled in.",
    admission_requirements: "This is an exit point award only, available to eligible students already enrolled in and progressing through the Bachelor of Occupational Therapy, Bachelor of Physiotherapy or Bachelor of Speech Pathology at ACU; it is not a course a new applicant can apply to directly.",
  },
  "Bachelor of Educational Studies": {
    description: "The Bachelor of Educational Studies is a general education award for students who have substantially completed, but not finished, an ACU undergraduate Initial Teacher Education degree (such as a Bachelor of Education). It allows a student to graduate with a recognised university award recognising the general education component of their teaching studies, without the professional teaching accreditation that comes with completing the full teaching degree.",
    curriculum: cleanText(merged["91b91be1-59a5-4843-a125-7e664649cc4a"].completion) + " Part A is satisfied by 210 credit points already completed within any ACU undergraduate Initial Teacher Education course (for example Bachelor of Education (Primary), Bachelor of Education (Primary and Secondary), or Bachelor of Education (Secondary) and its double degrees). Part B is the 10cp unit EDES206 Social Justice and Community Engagement for Educators.",
    admission_requirements: "This award is built from units already completed within an ACU undergraduate Initial Teacher Education course; eligibility requires substantial progress (210 credit points of General Education units) within one of those courses rather than direct first-year entry.",
  },
  "Diploma in Information Technology": {
    description: "The Diploma in Information Technology (Online) is a flexible, fully online pathway program. It suits students who prefer self paced, low pressure study without scheduled on campus classes, while still providing dedicated academic support and access to experienced online educators. Students who complete the Diploma can apply for entry into the Bachelor of Information Technology or a related double degree, with credit for the 8 units (80 credit points) completed in the Diploma applied to the first year of the corresponding bachelor degree. It can also be completed as a standalone qualification, and has lower entry requirements than a bachelor's degree.",
    curriculum: "To complete the Diploma in Information Technology, a student must complete 80 credit points across 8 units, delivered across four ACU Terms in Year 1: DPBI100 Academic Literacy in Business and Information Technology, ITED100 Information Technology in Action, BUSD113 Managing People and Organisations, ITED200 Data and Information Management, ITED204 Introduction to Cyber Security, ITED201 Fundamentals of Information Technology, ITED102 Python Fundamentals for Data Science, and ITED217 Programming Concepts.",
  },
  "Master of Leadership and Management in Health Care": {
    curriculum: "To complete the course, a student typically completes specified Leadership and Management in Healthcare units across two years including HLSC604 Quality and Safety in Health Care, PHIL623 Healthcare Ethics: Principles in Practice, HLSC603 Organisational Culture and Management, HLSC605 Leadership in Health Care, HLSC606 Workforce Management, HLSC640 Interpreting Health Research, HLSC607 Policy and Planning in Health Care, HLSC661 Facilitative Leadership, Coaching and Mentoring, HLSC506 Strategic Management in Digital Health Service Delivery, HLSC660 Redesign in Health Service Delivery, HLSC662 Leading Change in Health Services, BUSN602 Money Management, HLSC679 Global Perspectives on Healthcare, one open elective unit, and the 20cp HLSC617 Independent Project completed over two terms.",
  },
  "Doctor of Philosophy": {
    curriculum: "The Doctor of Philosophy is a research higher degree with no taught unit schedule. Candidates undertake a substantial, independent piece of original research under academic supervision, culminating in a thesis, in accordance with ACU's Higher Degree Research Policy and Regulations. Enrolment and progression are managed through individually approved candidature milestones (such as confirmation of candidature and progress reviews) rather than a fixed sequence of units.",
    admission_requirements: "Applicants must evidence, per Section 5 of ACU's Higher Degree Research Policy: an Australian undergraduate degree with Honours (AQF level 8) at a minimum of Second Class Division A (Distinction average) or international equivalent, or a Masters degree by research (Distinction average), or a Masters degree by coursework (Distinction average) with a substantial research component, or an equivalent AQF level 8 or 9 qualification with substantial original research, or demonstrated equivalent research capacity. Meeting eligibility is not itself a guarantee of admission; the research proposal, availability of supervision, and referee reports are also considered.",
  },
  "Master of Philosophy": {
    curriculum: "The Master of Philosophy is a research higher degree with no taught unit schedule. Candidates undertake a substantial, independent piece of original research under academic supervision, culminating in a thesis, in accordance with ACU's Higher Degree Research Policy and Regulations.",
    admission_requirements: "Applicants must evidence, per Section 5 of ACU's Higher Degree Research Policy: an Australian undergraduate degree with Honours (AQF level 8) at a minimum of Second Class Division A (Distinction average) or international equivalent, or a Masters degree by research (Distinction average), or a Masters degree by coursework (Distinction average) with a substantial research component, or an equivalent AQF level 8 or 9 qualification with substantial original research, or demonstrated equivalent research capacity.",
  },
  "Doctor of Ministry": {
    admission_requirements: "Applicants must evidence, per Section 5 of ACU's Higher Degree Research Policy: an Australian undergraduate degree with Honours (AQF level 8) at a minimum of Second Class Division A (Distinction average) or international equivalent, or a Masters degree by research (Distinction average), or a Masters degree by coursework (Distinction average) with a substantial research component in a relevant discipline, or an equivalent AQF level 8 or 9 qualification with substantial original research, or demonstrated equivalent research/ministry practice capacity.",
  },
};

const results = [];
const skipped = [];
for (const row of urlIndex) {
  const d = merged[row.id];
  if (!d) { skipped.push(row.name + " (no raw data)"); continue; }
  const manual = MANUAL[row.name] || {};
  const description = manual.description || truncate(cleanText(d.description || d.hb_rationale || ""), 2200);
  const curriculum = manual.curriculum || buildCurriculum(row, row.name);
  const admission_requirements = manual.admission_requirements || buildAdmission(row, row.name);
  const english_requirements = ENGLISH_OVERRIDE[row.name];
  const source_url = d.marketing_status === 200 ? row.marketing_url : row.handbook_url;

  if (!description || !curriculum || !admission_requirements || !english_requirements) {
    skipped.push(`${row.name} -> missing: ${[!description && "description", !curriculum && "curriculum", !admission_requirements && "admission", !english_requirements && "english"].filter(Boolean).join(",")}`);
    continue;
  }
  results.push({ id: row.id, description, curriculum, admission_requirements, english_requirements, source_url });
}

fs.writeFileSync("scripts/data/acu_final_content.json", JSON.stringify(results, null, 2));
console.log(`Built content for ${results.length}/${urlIndex.length} rows.`);
if (skipped.length) {
  console.log("SKIPPED:");
  skipped.forEach((s) => console.log(" -", s));
}
