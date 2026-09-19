import fs from "fs";
import { parsePage, loadCache } from "./extract_usc.mjs";

const results = JSON.parse(fs.readFileSync("/tmp/usc_match_results.json"));
const rows = JSON.parse(fs.readFileSync("scripts/data/programs.json"));
const usc = rows.filter(r=>r.university_slug==="university-of-the-sunshine-coast" && r.status==="published");
const byId = Object.fromEntries(usc.map(r=>[r.id, r]));

// Table 2 non-standard English requirements, keyed by exact program name as UniSC lists it.
const NONSTANDARD_ENGLISH = {
  "Bachelor of Occupational Therapy (Honours)": "IELTS (Academic) overall 7.0, with 7.0 in listening, reading and speaking and 6.5 in writing (or equivalent TOEFL iBT 94/PTE 66/OET 360, listening&reading&speaking with 350 writing). Required for AHPRA (Occupational Therapy Board) registration on graduation.",
  "Bachelor of Social Work": "IELTS (Academic) overall 7.0 with a minimum of 7.0 in each subtest (or equivalent TOEFL iBT 98/PTE 65, no subscore below 65).",
  "Bachelor of Social Work/Bachelor of Criminology and Justice": "IELTS (Academic) overall 7.0 with a minimum of 7.0 in each subtest (or equivalent TOEFL iBT 98/PTE 65, no subscore below 65).",
  "Master of Social Work (Qualifying)": "IELTS (Academic) overall 7.0 with a minimum of 7.0 in each subtest (or equivalent TOEFL iBT 98/PTE 65, no subscore below 65).",
  "Bachelor of Nursing Science": "IELTS (Academic) overall 7.0, with 7.0 in listening, reading and speaking and 6.5 in writing (or equivalent TOEFL iBT 91/PTE 63/OET overall pass). This is UniSC's non-standard nursing requirement, aligned with AHPRA registration expectations.",
  "Bachelor of Nursing Science: Graduate Entry": "IELTS (Academic) overall 7.0, with 7.0 in listening, reading and speaking and 6.5 in writing (or equivalent TOEFL iBT 91/PTE 63/OET overall pass). This is UniSC's non-standard nursing requirement, aligned with AHPRA registration expectations.",
  "Bachelor of Paramedicine": "IELTS (Academic) overall 7.0, with 7.0 in listening, reading and speaking and 6.5 in writing (or equivalent TOEFL iBT 94/PTE 66/OET B in listening,reading,speaking and C+ in writing). Required for AHPRA (Paramedicine Board) registration on graduation.",
  "Bachelor of Medical Science": "IELTS (Academic) overall 7.0 with a minimum of 6.5 in all subtests.",
  "Bachelor of Dietetics (Honours)": "IELTS (Academic) overall 7.0 with a minimum 7.0 in writing and speaking and 6.5 in reading and listening (or equivalent TOEFL iBT 100/PTE 65).",
  "Bachelor of Laws": "IELTS (Academic) overall 7.0 with a minimum 7.0 in writing and speaking and 6.5 in reading and listening (or equivalent TOEFL iBT 100/PTE 65).",
  "Bachelor of Education (Primary)": "IELTS (Academic) overall 7.5 with a minimum 8.0 in speaking and listening and 7.0 in reading and writing.",
  "Bachelor of Primary Education": "IELTS (Academic) overall 7.5 with a minimum 8.0 in speaking and listening and 7.0 in reading and writing.",
  "Bachelor of Education Studies (Early Childhood)": "IELTS (Academic) overall 7.5 with a minimum 8.0 in speaking and listening and 7.0 in reading and writing.",
  "Master of Teaching (Secondary)": "IELTS (Academic) overall 7.5 with a minimum 8.0 in speaking and listening and 7.0 in all other subtests.",
  "Bachelor of Clinical Exercise Physiology": "IELTS (Academic) overall 7.0 with a minimum of 7.0 in all subtests (or equivalent TOEFL iBT 105/PTE 65).",
  "Master of Nursing (Clinical Leadership)": "IELTS (Academic) overall 7.0 with a minimum of 7.0 in all subtests (or equivalent TOEFL iBT 105/PTE 65). This program is not available to international students on a Student visa.",
  "Master of Professional Psychology": "IELTS (Academic) overall 7.0 with a minimum 7.0 in listening, reading and speaking and 6.5 in writing (or equivalent TOEFL iBT 94/PTE 66/OET 360). Required for provisional registration with the Psychology Board of Australia (AHPRA) before commencing the program.",
  "Master of Psychology (Clinical)": "IELTS (Academic) overall 7.0 with a minimum 7.0 in listening, reading and speaking and 6.5 in writing (or equivalent TOEFL iBT 94/PTE 66/OET 360). Required for provisional registration with the Psychology Board of Australia (AHPRA) before commencing the program.",
  "Bachelor of Prosthetics and Orthotics": "IELTS (Academic) overall 7.0, with 7.0 in listening, reading and speaking and 6.5 in writing (or equivalent TOEFL iBT 94/PTE 66/OET overall pass B in listening,reading,speaking and C+ in writing).",
  "Bachelor of Physiotherapy (Honours)": "IELTS (Academic) overall 7.0 with a minimum of 7.0 in each subtest (or equivalent TOEFL iBT 94/PTE 65/OET overall pass, no subscore below B).",
  "Master of Dietetics (Sports Nutrition)": "IELTS (Academic) overall 7.0 with a minimum of 7.0 in each subtest (or equivalent TOEFL iBT 98/PTE 65).",
};

function englishForLevel(level) {
  if (level === "Undergraduate") return "IELTS (Academic) overall 6.0 with a minimum of 5.5 in each subtest (UniSC's standard undergraduate requirement; equivalent TOEFL iBT 76/PTE 50 also accepted).";
  if (level === "PhD" || level === "Research") return "IELTS (Academic) overall 6.5 with a minimum of 6.0 in each subtest (UniSC's standard Higher Degree by Research requirement; equivalent TOEFL iBT 85/PTE 58 also accepted).";
  return "IELTS (Academic) overall 6.5 with a minimum of 6.0 in each subtest (UniSC's standard postgraduate coursework requirement; equivalent TOEFL iBT 85/PTE 58 also accepted).";
}

function englishFor(row) {
  if (NONSTANDARD_ENGLISH[row.name]) return NONSTANDARD_ENGLISH[row.name];
  return englishForLevel(row.degree_level);
}

function sweepDashes(s) {
  if (!s) return s;
  return s
    .replace(/\s*—\s*/g, ", ")
    .replace(/(\d)–(\d)/g, "$1 to $2")
    .replace(/\s*–\s*/g, ", ");
}

const out = [];
const failures = [];
for (const r of results) {
  if (r.archive) continue;
  const row = byId[r.id];
  const html = loadCache(r.matched);
  if (!html) { failures.push({name:r.name, reason:"no cached html", url:r.matched}); continue; }
  const parsed = parsePage(html);
  if (!parsed.curriculum) {
    failures.push({name:r.name, reason:"missing curriculum section", url:r.matched});
    continue;
  }
  // Build description: prefer the real meta description, but fall back to (or dedupe against)
  // the hero intro text when the meta description is thin/generic boilerplate
  // ("Program requirements of the X." / "Program structure, ... for the X").
  let description = parsed.metaDescription;
  const isThin = !description || /program requirements/i.test(description) || /^Program (requirements|structure)[, ]/i.test(description) || description.length < 90;
  if (isThin) {
    const introBody = (parsed.intro || "").split("\n").slice(1).join("\n").trim();
    // take the first 1-2 real paragraphs (skip the repeated leading heading line)
    let paras = introBody.split(/\n\n+/).filter(Boolean);
    // drop a dangling trailing heading-only line like "In this program you will:"
    while (paras.length && /:\s*$/.test(paras[paras.length - 1]) && paras.length > 1) paras.pop();
    description = paras.slice(0, 3).join("\n\n") || description;
  }
  out.push({
    id: r.id,
    name: r.name,
    source_url: r.matched,
    description: sweepDashes(description),
    intro: parsed.intro,
    curriculum: sweepDashes(parsed.curriculum),
    admission_requirements: sweepDashes(parsed.admission) || null,
    admission_gap: !parsed.admission,
    english_requirements: sweepDashes(englishFor(row)),
  });
}
console.log("built:", out.length, "failures:", failures.length);
failures.forEach(f=>console.log("FAIL:", f.name, "|", f.reason, "|", f.url));
fs.writeFileSync("/tmp/usc_updates.json", JSON.stringify(out, null, 2));
