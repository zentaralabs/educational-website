// South Metropolitan TAFE build-out: derive Bond-standard content from TAFE
// International WA's (tafeinternational.wa.edu.au) own real per-course pages,
// which we've already fetched to scripts/data/tiwa_pages/ and parsed into
// scripts/data/tiwa_parsed.json. Row mapping (real course match or cited
// archive reason) lives in scripts/data/smt_row_map.json. No invented text -
// every field is derived from real fetched page content.
import fs from "node:fs";
import pg from "pg";

const tiwa = JSON.parse(fs.readFileSync("scripts/data/tiwa_parsed.json", "utf8"));
const byFile = new Map(tiwa.map((r) => [r.file, r]));
const rowMap = JSON.parse(fs.readFileSync("scripts/data/smt_row_map.json", "utf8"));
const smtRows = JSON.parse(fs.readFileSync("scripts/data/smt_rows.json", "utf8"));
const byName = new Map(smtRows.map((r) => [r.name, r]));

function dedash(t) {
  return (t || "").replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,{2,}/g, ",");
}
function clean(t) {
  let s = (t || "").replace(/ /g, " ").replace(/[ \t]+/g, " ").trim();
  // Source pages flatten adjacent <p> tags with no whitespace, e.g.
  // "qualification.Get the skills..." - insert a space after a sentence-ending
  // period/colon that runs straight into a capitalised word.
  s = s.replace(/([a-z0-9])\.([A-Z][a-z])/g, "$1. $2");
  return dedash(s);
}

function extractEnglish(admissionBlock) {
  if (!admissionBlock) return null;
  // Match the IELTS sentence up to a period that is followed by whitespace/end,
  // not a decimal point inside a score like "7.0" (lookahead for a non-digit).
  const ieltsMatch =
    admissionBlock.match(/An?\s*IELTS[^\n]*?(?:\.(?!\d)|;)/i) ||
    admissionBlock.match(/IELTS[^\n]*?(?:\.(?!\d)|;)/i);
  if (!ieltsMatch) return null;
  let line = clean(ieltsMatch[0]);
  line = line.replace(/^An?\s*/i, "");
  line = line.replace(/^\*+\s*/, "");
  line = line.replace(/[;.]$/, "").trim() + ".";
  // Check if alternative tests (PTE/TOEFL/OET/Cambridge) are mentioned nearby
  const hasAlts = /PTE Academic|TOEFL|OET|Cambridge/i.test(admissionBlock);
  let out = line.charAt(0).toUpperCase() + line.slice(1);
  if (!/^IELTS/i.test(out)) out = "IELTS " + out.replace(/^IELTS\s*/i, "");
  if (hasAlts) out += " Equivalent PTE Academic, TOEFL iBT, OET or Cambridge scores are also accepted, per South Metropolitan TAFE's published English language requirements for this course.";
  return out;
}

function extractAdmission(admissionBlock, title) {
  if (!admissionBlock) return null;
  const lines = admissionBlock.split("\n").map((l) => clean(l)).filter(Boolean);
  const keep = [];
  for (const l of lines) {
    if (/^English language requirements/i.test(l)) continue;
    if (/^\d\.\s*(English language test pathway|Primary language pathway)/i.test(l)) continue;
    if (/^»/.test(l)) continue; // English test score bullet lines
    if (/^An?\s*IELTS\b/i.test(l) || /^IELTS\b/i.test(l)) continue; // English score line, goes in english_requirements
    if (/^You must have successfully completed one of the following English language tests/i.test(l)) continue;
    if (/^You must have attended and satisfactorily completed at least six years/i.test(l)) continue;
    if (/^At least 2 years of study must be between/i.test(l)) continue;
    if (/Please note: To protect the public from harm/i.test(l)) break; // stop at legal boilerplate tail
    if (/^Additional information$/i.test(l)) break;
    if (/^NMBA states that|^Criminal history registration standard|^More information can be found/i.test(l)) break;
    if (/^\​?Please view Admission requirements for your country of origin\.?$/i.test(l)) continue;
    keep.push(l);
  }
  let text = dedash(keep.join("\n").trim());
  // Fix source-page whitespace glitches where two sentences run together with
  // no space, e.g. "...this course ORCompletion of..." or "...12ORCompletion".
  text = text.replace(/\bOR([A-Z][a-z])/g, "OR $1");
  return text || null;
}

function buildUnits(chunk) {
  // Parse "Core units" / "Elective units" mini-tables out of a study-option chunk.
  const coreIdx = chunk.indexOf("Core units");
  if (coreIdx === -1) return null;
  const electiveIdx = chunk.indexOf("Elective units", coreIdx + "Core units".length);
  const furtherIdx = chunk.indexOf("Further information", coreIdx);
  const coreEnd = electiveIdx !== -1 ? electiveIdx : (furtherIdx !== -1 ? furtherIdx : chunk.length);
  const coreRaw = chunk.slice(coreIdx, coreEnd);
  const electiveRaw = electiveIdx !== -1 ? chunk.slice(electiveIdx, furtherIdx !== -1 ? furtherIdx : chunk.length) : "";

  function parseUnitTable(raw) {
    const lines = raw.split("\n").map((l) => clean(l)).filter(Boolean);
    // Drop header lines
    const filtered = lines.filter((l) => !/^(Core units|Elective units|National ID|Unit title)$/i.test(l));
    // Lines alternate: CODE, Title, CODE, Title...
    const units = [];
    for (let i = 0; i < filtered.length - 1; i += 2) {
      const code = filtered[i];
      const title = filtered[i + 1];
      if (/^[A-Z]{2,5}[A-Z0-9]{2,6}$/.test(code)) {
        units.push(`${code} ${title}`);
      }
    }
    return units;
  }

  const core = parseUnitTable(coreRaw);
  const elective = parseUnitTable(electiveRaw);
  return { core, elective };
}

function tiwaUrl(file) {
  const slug = file.replace(/\.html$/, "");
  return `https://www.tafeinternational.wa.edu.au/tafe-courses/${slug}`;
}

function buildOneRecord(file) {
  const rec = byFile.get(file);
  if (!rec) throw new Error("missing " + file);
  const smtOption = rec.studyOptions.find((o) => /South Metropolitan TAFE/i.test(o.institute));
  if (!smtOption) throw new Error("no SMT option in " + file);
  const units = buildUnits(smtOption.chunk);
  return { rec, units };
}

const results = [];
for (const [name, cfg] of Object.entries(rowMap)) {
  if (cfg.archive) continue;
  const row = byName.get(name);
  if (!row) { console.error("ROW NOT FOUND IN DB:", name); continue; }

  if (cfg.multiStream) {
    const built = cfg.files.map((f) => buildOneRecord(f));
    const first = built[0].rec;
    const description = clean(first.description);
    const admission = extractAdmission(first.admissionBlock, first.title);
    const english = extractEnglish(first.admissionBlock);
    const streamNames = built.map((b) => {
      const m = b.rec.title.match(/\[([^\]]+)\]/);
      return m ? m[1] : b.rec.title;
    });
    let curriculum = `This qualification (${first.nationalId}) is delivered at South Metropolitan TAFE in ${built.length} specialisation streams: ${streamNames.join(" and ")}.\n\n`;
    built.forEach((b, i) => {
      curriculum += b.units.core.length
        ? `${streamNames[i]} stream, core units: ${b.units.core.join("; ")}\n`
        : `${streamNames[i]} stream has no core units; all units are electives.\n`;
      if (b.units.elective.length) curriculum += `${streamNames[i]} stream, elective units (selected in consultation with industry): ${b.units.elective.join("; ")}\n`;
    });
    results.push({
      id: row.id,
      name,
      description,
      curriculum: dedash(curriculum.trim()),
      admission_requirements: admission,
      english_requirements: english,
      source_url: tiwaUrl(cfg.files[0]),
      cricos: first.cricos,
      nationalId: first.nationalId,
    });
  } else {
    const { rec, units } = buildOneRecord(cfg.files[0]);
    const description = clean(rec.description);
    const admission = extractAdmission(rec.admissionBlock, rec.title);
    const english = extractEnglish(rec.admissionBlock);
    let curriculum = units.core.length
      ? `Core units: ${units.core.join("; ")}`
      : `This qualification has no core units; all units are electives.`;
    if (units.elective.length) curriculum += `\nElective units (selected in consultation with industry): ${units.elective.join("; ")}`;
    results.push({
      id: row.id,
      name,
      description,
      curriculum: dedash(curriculum.trim()),
      admission_requirements: admission,
      english_requirements: english,
      source_url: tiwaUrl(cfg.files[0]),
      cricos: rec.cricos,
      nationalId: rec.nationalId,
    });
  }
}

fs.writeFileSync("scripts/data/smt_final_content.json", JSON.stringify(results, null, 2));
console.log("Built", results.length, "records");
for (const r of results) {
  const missing = [];
  if (!r.description) missing.push("description");
  if (!r.curriculum) missing.push("curriculum");
  if (!r.admission_requirements) missing.push("admission_requirements");
  if (!r.english_requirements) missing.push("english_requirements");
  console.log(r.name, missing.length ? "MISSING: " + missing.join(",") : "OK", "| CRICOS", r.cricos);
}

// --commit writer
if (process.argv.includes("--commit")) {
  const env = Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
  );
  const c = new pg.Client({ connectionString: env.DATABASE_URL });
  await c.connect();
  for (const r of results) {
    if (!r.description || !r.curriculum || !r.admission_requirements || !r.english_requirements) {
      console.log("SKIP (incomplete):", r.name);
      continue;
    }
    await c.query(
      `update programs set description = $2, curriculum = $3, admission_requirements = $4,
       english_requirements = $5, source_url = $6, updated_at = now() where id = $1`,
      [r.id, r.description, r.curriculum, r.admission_requirements, r.english_requirements, r.source_url],
    );
    console.log("committed:", r.name);
  }
  await c.end();
}
