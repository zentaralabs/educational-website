import fs from "fs";

const extracted = JSON.parse(fs.readFileSync("scripts/data/scu_extracted.json", "utf8"));

function fixDashes(s) {
  if (!s) return s;
  return s
    .replace(/\s*[–—]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",");
}

function cleanEnglish(s) {
  if (!s) return s;
  let t = s;
  t = t.replace(
    /Language requirements English language requirements apply to International applicants and other applicants whose previous study was\s*undertaken in a language other than English\. The minimum English language requirements for such applicants\s*for entry to this course are as follows\. Don.t meet the English language requirements\? View our English language programs\.\s*/,
    ""
  );
  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
}

function cleanWhitespace(s) {
  if (!s) return s;
  return s.replace(/ /g, " ").replace(/[ \t]+/g, " ").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
}

const out = [];
const problems = [];
for (const item of extracted) {
  if (item.error) {
    problems.push(`${item.name}: fetch error - ${item.error}`);
    continue;
  }
  let description = fixDashes(cleanWhitespace(item.description));
  let curriculum = fixDashes(cleanWhitespace(item.curriculum));
  let admission_requirements = fixDashes(cleanWhitespace(item.admission_requirements));
  let english_requirements = fixDashes(cleanWhitespace(cleanEnglish(item.english_requirements)));

  if (!description || description.length < 40) problems.push(`${item.name}: description too short/missing (${description?.length || 0} chars)`);
  if (!curriculum || curriculum.length < 20) problems.push(`${item.name}: curriculum too short/missing (${curriculum?.length || 0} chars)`);
  if (!english_requirements) problems.push(`${item.name}: english_requirements missing`);
  // admission_requirements can legitimately be short/ATAR-not-applicable; only flag if fully empty
  if (!admission_requirements) problems.push(`${item.name}: admission_requirements missing`);

  out.push({
    id: item.id,
    name: item.name,
    description,
    curriculum,
    admission_requirements,
    english_requirements,
    source_url: item.url,
  });
}

fs.writeFileSync("scripts/data/scu_updates.json", JSON.stringify(out, null, 2));
console.log("Rows prepared:", out.length);
if (problems.length) {
  console.log("\n--- PROBLEMS ---");
  problems.forEach((p) => console.log(" -", p));
} else {
  console.log("No problems detected.");
}
