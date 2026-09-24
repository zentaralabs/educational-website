// Fetch and extract description/curriculum/admission/english fields from unisq.edu.au course pages.
// Plain server-rendered HTML, no Cloudflare gating, no JS rendering needed.
import fs from "node:fs";

const idx = JSON.parse(fs.readFileSync("scripts/data/usq_url_index.json", "utf8"));

function strip(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionAfter(html, marker, len = 4000) {
  const i = html.indexOf(marker);
  if (i === -1) return null;
  return html.slice(i, i + len);
}

async function extractOne(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return { ok: false, status: res.status };
  const html = await res.text();

  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/&amp;/g, "&") : null;

  // Overview / description: use the CMS's own HTML comment section markers,
  // which cleanly bound the real overview prose before any testimonial/quote
  // card bleeds in (found via <!-- Overview --> ... <!-- Testimonial --> etc).
  let description = null;
  {
    const i1 = html.indexOf("<!-- Overview -->");
    const candidates = ["<!-- Testimonial -->", "<!-- Career Outcomes", "<!-- USP -->"]
      .map((m) => html.indexOf(m))
      .filter((x) => x !== -1 && (i1 === -1 || x > i1));
    const end = candidates.length ? Math.min(...candidates) : -1;
    if (i1 !== -1 && end !== -1) {
      description = strip(html.slice(i1, end)).replace(/^Overview\s*/, "").trim();
    } else if (i1 !== -1) {
      description = strip(html.slice(i1, i1 + 3500)).replace(/^Overview\s*/, "").trim();
    }
  }

  // Curriculum: Degree structure section, real unit codes
  let curriculum = null;
  {
    const i = html.indexOf("Degree structure");
    if (i !== -1) {
      const chunk = html.slice(i, i + 9000);
      const cutMatch = chunk.slice(20).match(/>Other study options<|>Double degrees<|>Short courses<|>Career outcomes<|>Professional accreditation</);
      const cut = cutMatch ? 20 + cutMatch.index : chunk.length;
      curriculum = strip(chunk.slice(0, cut));
    }
  }

  // Admission requirements: try year-twelve (undergrad) then academic-entry-requirements (postgrad/research)
  let admission = null;
  {
    for (const marker of [
      "entry-requirements-eligibility-accordion-year-twelve",
      "entry-requirements-eligibility-accordion-academic-entry-requirements",
    ]) {
      const i = html.indexOf(marker);
      if (i !== -1) {
        const chunk = html.slice(i, i + 3000);
        const cutMatch = chunk.slice(50).match(/<button[^>]*accordion-button/);
        const cut = cutMatch ? 50 + cutMatch.index : chunk.length;
        const text = strip(chunk.slice(0, cut));
        admission = admission ? admission + " " + text : text;
      }
    }
    // also grab QTAC application/degree-code block for undergrad context
    const codeMatch = html.match(/Degree code<\/[^>]*>\s*<[^>]*>([A-Z]{3,6})</);
  }

  // English requirements
  let english = null;
  {
    for (const marker of [
      "entry-requirements-all-applicants-accordion-english-language-requirements",
      "entry-requirements-eligibility-accordion-english-language-requirements",
    ]) {
      const i = html.indexOf(marker);
      if (i !== -1) {
        const chunk = html.slice(i, i + 2000);
        const cutMatch = chunk.slice(50).match(/<button[^>]*accordion-button/);
        const cut = cutMatch ? 50 + cutMatch.index : chunk.length;
        english = strip(chunk.slice(0, cut));
        break;
      }
    }
  }

  // ATAR figure if present
  let atar = null;
  {
    const m = html.match(/ATAR\s*<\/[^>]*>\s*<[^>]*>\s*([\d.]+)/);
    if (m) atar = m[1];
  }

  return { ok: true, title, description, curriculum, admission, english, atar };
}

const results = {};
const ids = Object.keys(idx);
let i = 0;
for (const id of ids) {
  const entry = idx[id];
  i++;
  if (!entry.url) {
    results[id] = { name: entry.name, url: null, skip: "no_url_archive_candidate" };
    continue;
  }
  try {
    const r = await extractOne(entry.url);
    results[id] = { name: entry.name, url: entry.url, ...r };
    console.error(`[${i}/${ids.length}] ${entry.name} -> ${r.ok ? "OK" : "FAIL " + r.status}`);
  } catch (e) {
    results[id] = { name: entry.name, url: entry.url, ok: false, error: String(e) };
    console.error(`[${i}/${ids.length}] ${entry.name} -> ERROR ${e}`);
  }
  await new Promise((r) => setTimeout(r, 150));
}

fs.writeFileSync("scripts/data/usq_raw_extract.json", JSON.stringify(results, null, 2));
console.error("Done. Wrote scripts/data/usq_raw_extract.json");
