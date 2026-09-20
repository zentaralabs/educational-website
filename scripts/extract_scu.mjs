import fs from "fs";
import * as cheerio from "cheerio";

const finalUrls = JSON.parse(fs.readFileSync("scripts/data/scu_final_urls.json", "utf8"));
const CACHE_DIR = "scripts/data/scu_html_cache";
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function noDash(s) {
  if (!s) return s;
  return s.replace(/[–—]/g, ",").replace(/,\s*,/g, ",").replace(/\s+,/g, ",");
}

function cleanText(s) {
  if (!s) return "";
  return s.replace(/ /g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchCached(url) {
  const cacheFile = CACHE_DIR + "/" + Buffer.from(url).toString("base64url") + ".html";
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, "utf8");
  }
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } });
  const html = await res.text();
  fs.writeFileSync(cacheFile, html);
  await new Promise((r) => setTimeout(r, 300));
  return html;
}

function extractCourseFields($) {
  // Overview / description
  let description = "";
  const overviewHeader = $("h2").filter((i, el) => $(el).text().trim() === "Overview").first();
  if (overviewHeader.length) {
    // grab following paragraphs until next h2/h3
    let node = overviewHeader.parent();
    let text = [];
    // search within the same section container
    const section = overviewHeader.closest("section, div");
    section.find("p").each((i, el) => {
      const t = $(el).text().trim();
      if (t) text.push(t);
    });
    description = text.slice(0, 6).join(" ");
  }

  // ATAR (domestic snapshot)
  let atar = null;
  $(".course-snapshot__item").each((i, el) => {
    const label = $(el).find(".course-snapshot__label-text").text().trim();
    if (label === "ATAR") {
      const val = $(el).find(".course-snapshot__text").first().text().replace(/\s+/g, " ").trim();
      if (!atar) atar = val;
    }
  });

  // Entry requirements section
  let englishReq = "";
  let admissionReq = "";
  const entryHeader = $("#course-entry-requirements");
  if (entryHeader.length) {
    let el = entryHeader.parent().length ? entryHeader : entryHeader;
    // Walk siblings after the h3 until next h3/h2
    let cur = entryHeader.get(0);
    let parts = [];
    let node = cur.next;
    while (node) {
      if (node.type === "tag" && (node.name === "h2" || (node.name === "h3" && node !== cur))) break;
      if (node.type === "tag") {
        const $node = $(node);
        if (node.name === "table") {
          const rows = [];
          $node.find("tr").each((i, tr) => {
            const cells = $(tr).find("td,th").map((j, td) => $(td).text().trim()).get();
            if (cells.length) rows.push(cells.join(": "));
          });
          parts.push(rows.join("; "));
        } else {
          const t = $node.text().trim();
          if (t) parts.push(t);
        }
      }
      node = node.next;
    }
    englishReq = parts.join(" ");
  }

  // Course requirements (unit-count / structure requirement, also exit awards)
  let courseRequirements = "";
  const reqHeader = $("#course-require");
  if (reqHeader.length) {
    let node = reqHeader.get(0).next;
    let parts = [];
    while (node) {
      if (node.type === "tag" && (node.name === "h2" || node.name === "h3")) break;
      if (node.type === "tag") {
        const t = $(node).text().trim();
        if (t) parts.push(t);
      }
      node = node.next;
    }
    courseRequirements = parts.join(" ");
  }

  admissionReq = [atar ? `ATAR: ${atar}` : null, courseRequirements].filter(Boolean).join(". ");

  // Course structure - Schedule of Units tab
  let curriculum = "";
  const schedulePane = $("#course-schedule-tab-pane");
  if (schedulePane.length) {
    const sections = [];
    let currentHeading = null;
    let pendingUnits = [];
    const flush = () => {
      if (pendingUnits.length) {
        sections.push((currentHeading ? currentHeading + ": " : "") + pendingUnits.join(", "));
      }
      pendingUnits = [];
    };
    schedulePane.find("h3, h4, table").each((i, el) => {
      const tag = el.tagName;
      if (tag === "h3" || tag === "h4") {
        flush();
        currentHeading = $(el).text().trim();
      } else if (tag === "table") {
        $(el)
          .find("tbody tr")
          .each((j, tr) => {
            const cells = $(tr)
              .find("td")
              .map((k, td) => $(td).text().trim())
              .get();
            if (cells.length >= 2 && cells[0]) pendingUnits.push(`${cells[0]} ${cells[1]}`);
          });
      }
    });
    flush();
    curriculum = sections.join(" | ");
  }
  if (!curriculum) {
    // fallback: course progression tab text (some courses only describe structure in prose)
    const progPane = $("#course-progression-tab-pane .course-progression__text");
    if (progPane.length) curriculum = progPane.text().trim();
  }

  return {
    description: cleanText(description),
    admission_requirements: cleanText(admissionReq),
    english_requirements: cleanText(englishReq),
    curriculum: cleanText(curriculum),
  };
}

async function main() {
  const toFetch = finalUrls.filter((f) => f.status === "match");
  const results = [];
  for (const row of toFetch) {
    try {
      const html = await fetchCached(row.url);
      const $ = cheerio.load(html);
      const title = $("title").text();
      const fields = extractCourseFields($);
      results.push({ id: row.id, name: row.name, url: row.url, title, ...fields, note: row.note || null });
      console.log("OK:", row.name, "| desc:", fields.description.length, "| curr:", fields.curriculum.length, "| adm:", fields.admission_requirements.length, "| eng:", fields.english_requirements.length);
    } catch (e) {
      console.log("ERROR:", row.name, e.message);
      results.push({ id: row.id, name: row.name, url: row.url, error: e.message });
    }
  }
  fs.writeFileSync("scripts/data/scu_extracted.json", JSON.stringify(results, null, 2));
}

main();
