import fs from "fs";
import { fetchHandbook, summarizeCurriculum, summarizeEntryRequirements, summarizeEnglishRequirements, clean } from "./csu_extract.mjs";

const index = JSON.parse(fs.readFileSync("scripts/data/csu_url_index.json", "utf8"));

const results = {};
for (const [name, info] of Object.entries(index)) {
  if (info.archive) { results[name] = { archive: true }; continue; }
  const code = info.pCode;
  process.stdout.write(`Fetching ${name} (${code})... `);
  let r = await fetchHandbook(code, 2026);
  if (!r.ok) {
    // try 2027 (some courses start next year)
    r = await fetchHandbook(code, 2027);
  }
  if (!r.ok) {
    console.log("FAIL", r.status);
    results[name] = { error: r.status, code };
    continue;
  }
  const pc = r.pc;
  results[name] = {
    code,
    handbookUrl: r.url,
    title: pc.title,
    atar: pc.atar,
    faculty: pc.parent_academic_org,
    duration: pc.duration_ft_std,
    credit_points: pc.credit_points,
    study_level: pc.study_level_ref,
    accreditations: (pc.external_accreditations || []).map((a) => a.accrediting_body).filter(Boolean),
    curriculum: summarizeCurriculum(pc),
    admission_requirements: summarizeEntryRequirements(pc),
    english_requirements: summarizeEnglishRequirements(pc),
    alt_exit_options: clean(pc.alt_exit_options),
  };
  console.log("OK");
  await new Promise((res) => setTimeout(res, 150));
}

fs.writeFileSync("scripts/data/csu_raw_extract.json", JSON.stringify(results, null, 2));
const failed = Object.entries(results).filter(([, v]) => v.error);
console.log(`\nDone. ${Object.keys(results).length} rows, ${failed.length} failed.`);
failed.forEach(([n, v]) => console.log(" FAIL:", n, v.code, v.error));
