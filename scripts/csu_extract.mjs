// Fetch CSU handbook JSON (Next.js __NEXT_DATA__) for each mapped course code and
// extract description-building facts, curriculum structure, admission requirements,
// and English language requirements. No browser needed - handbook.csu.edu.au is not
// Cloudflare-gated and serves full SSR HTML with embedded page data to plain curl/fetch.
import fs from "fs";

const YEAR = 2026;

function clean(s) {
  if (!s) return "";
  return String(s)
    .replace(/<li>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchHandbook(code, year = YEAR) {
  const url = `https://handbook.csu.edu.au/course/${year}/${code}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return { ok: false, status: res.status, url };
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) return { ok: false, status: "no-next-data", url };
  const data = JSON.parse(m[1]);
  const pc = data.props.pageProps.pageContent;
  return { ok: true, url, pc };
}

function walkCurriculum(node, out, path) {
  if (!node) return;
  const title = node.title && String(node.title).trim();
  const newPath = title ? [...path, title] : path;
  if (Array.isArray(node.relationship)) {
    for (const rel of node.relationship) {
      const name = rel.academic_item_name;
      const code = rel.academic_item_code;
      if (name) {
        out.push({ path: newPath.join(" > "), code, name });
      }
    }
  }
  if (Array.isArray(node.container)) {
    for (const c of node.container) walkCurriculum(c, out, newPath);
  }
}

function summarizeCurriculum(pc) {
  const cs = pc.curriculumStructure;
  if (!cs) return "";
  const items = [];
  walkCurriculum(cs, items, []);
  if (!items.length) return "";
  // group by path
  const groups = new Map();
  for (const it of items) {
    if (!groups.has(it.path)) groups.set(it.path, []);
    const label = it.code ? `${it.name} (${it.code})` : it.name;
    groups.get(it.path).push(label);
  }
  const lines = [];
  for (const [path, subs] of groups) {
    const dedup = [...new Set(subs)];
    lines.push(`${path}: ${dedup.join("; ")}`);
  }
  return lines.join("\n");
}

function summarizeEntryRequirements(pc) {
  const parts = [];
  if (pc.atar) parts.push(`Minimum ATAR: ${pc.atar}`);
  const reqs = pc.requirement_entry_requirements || [];
  for (const r of reqs) {
    for (const item of r.requirements || []) {
      const text = clean(item.presentation_description || item.description);
      if (text) parts.push(text);
    }
  }
  const minEntry = clean(pc.minimum_entry_requirements);
  if (minEntry) parts.push(minEntry);
  return parts.join("\n\n").trim();
}

function summarizeEnglishRequirements(pc) {
  const parts = [];
  const reqs = pc.requirement_language_requirements || [];
  for (const r of reqs) {
    for (const item of r.requirements || []) {
      const text = clean(item.presentation_description || item.description);
      if (text) parts.push(text);
    }
  }
  const eng = clean(pc.english_language);
  if (eng) parts.push(eng);
  return parts.join("\n\n").trim();
}

export { fetchHandbook, summarizeCurriculum, summarizeEntryRequirements, summarizeEnglishRequirements, clean };

// CLI test mode
if (process.argv[2] === "--test") {
  const code = process.argv[3];
  const r = await fetchHandbook(code);
  if (!r.ok) { console.log("FAIL", r); process.exit(1); }
  console.log("TITLE:", r.pc.title);
  console.log("--- CURRICULUM ---");
  console.log(summarizeCurriculum(r.pc));
  console.log("--- ADMISSION ---");
  console.log(summarizeEntryRequirements(r.pc));
  console.log("--- ENGLISH ---");
  console.log(summarizeEnglishRequirements(r.pc));
  console.log("--- ACCREDITATION ---");
  console.log(JSON.stringify(r.pc.external_accreditations));
  console.log("--- FACULTY ---");
  console.log(r.pc.parent_academic_org);
  console.log("--- DURATION/CP ---");
  console.log(r.pc.duration_ft_std, r.pc.credit_points, r.pc.study_level_ref);
}
