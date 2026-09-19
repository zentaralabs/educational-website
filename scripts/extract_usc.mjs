import fs from "fs";
import * as cheerio from "cheerio";

function cleanText(s) {
  return s
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Convert a cheerio element's inner content to readable plain text,
// preserving paragraph/list-item breaks.
function elText($, el) {
  const $$ = cheerio.load($.html(el));
  $$("br").replaceWith("\n");
  $$("li").each((_, li) => {
    $$(li).prepend("\n- ");
  });
  $$("p, h1,h2,h3,h4,h5,h6, dt, dd, tr").each((_, block) => {
    $$(block).append("\n");
  });
  return cleanText($$.root().text());
}

export function loadCache(url) {
  const fname = url.replace("https://www.unisc.edu.au/", "").replace(/\//g, "__") + ".html";
  const p = "/tmp/usc_pages/" + fname;
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}

export function parsePage(html) {
  const $ = cheerio.load(html);
  const metaDescription = $('meta[name="description"]').attr("content") || null;

  // Intro: the hero heading + paragraphs, extracted via raw-string search between the
  // breadcrumb nav (last breadcrumb item = program name) and the audience-toggle marker.
  let intro = null;
  {
    const raw = html;
    const breadcrumbMatches = [...raw.matchAll(/<li[^>]*>\s*<a[^>]*>([^<]+)<\/a>\s*<\/li>/g)];
    let startIdx = raw.search(/You're viewing this page as/);
    if (startIdx < 0) startIdx = raw.search(/This program is only available to international students|id="career-outcomes"|id="program-detail"/);
    if (startIdx > 0) {
      // walk backwards to the nearest preceding breadcrumb nav close to find a sane start point
      const navEnd = raw.lastIndexOf("</nav>", startIdx);
      const from = navEnd > 0 ? navEnd : Math.max(0, startIdx - 4000);
      const chunk = raw.slice(from, startIdx);
      const $$ = cheerio.load("<div>" + chunk + "</div>");
      intro = elText($$, $$.root().get(0));
    }
  }

  const programDetail = $("#program-detail");
  const entryRequirements = $("#entry-requirements");

  let curriculum = null;
  if (programDetail.length) {
    const clone = programDetail.clone();
    // find the "Program structure" accordion heading and take everything up to Program requirements/Study sequences
    let html2 = clone.html() || "";
    const idx = html2.search(/Program [Ss]tructure/);
    if (idx >= 0) {
      const stopMatch = html2.slice(idx).search(/Program requirements|Study sequences|Student profile/);
      const chunk = stopMatch > 0 ? html2.slice(idx, idx + stopMatch) : html2.slice(idx, idx + 8000);
      const $$ = cheerio.load("<div>" + chunk + "</div>");
      curriculum = elText($$, $$.root().get(0));
    }
  }

  let admission = null;
  if (entryRequirements.length) {
    const clone = entryRequirements.clone();
    // drop the English-language-requirements sub-block entirely
    clone.find("h4").each((_, h4) => {
      const t = $(h4).text().trim();
      if (/english language requirements/i.test(t)) {
        // remove this h4 and everything until the next h4 or end of parent
        let el = $(h4);
        let toRemove = [el];
        let next = el.next();
        while (next.length && next.get(0).tagName !== "h4") {
          toRemove.push(next);
          next = next.next();
        }
        toRemove.forEach((e) => e.remove());
      }
    });
    let admissionFull = elText($, clone.get(0));
    // trim the generic IAR boilerplate that repeats verbatim on every program page
    const cutIdx = admissionFull.search(/UniSC strongly supports the rights of all people/);
    admission = cutIdx > 0 ? admissionFull.slice(0, cutIdx).trim() : admissionFull;
  }

  return { metaDescription, intro, curriculum, admission };
}
