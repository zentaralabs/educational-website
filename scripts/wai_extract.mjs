import fs from "fs";
import path from "path";

const dir = "/tmp/angliss_pages";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"));

function textBetween(html, startMarker, endMarkers) {
  const i = html.indexOf(startMarker);
  if (i === -1) return null;
  let end = html.length;
  for (const m of endMarkers) {
    const j = html.indexOf(m, i + startMarker.length);
    if (j !== -1 && j < end) end = j;
  }
  return html.slice(i, end);
}

function stripTags(s) {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&rsquo;/g, "'").replace(/&amp;/g, "&").replace(/&eacute;/g,"e").replace(/\s+/g, " ").trim();
}

const out = {};

for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), "utf8");
  const h1m = html.match(/<h1>([^<]*)<\/h1>/);
  const title = h1m ? h1m[1].trim() : null;

  const detailsBlock = textBetween(html, "COURSE DETAILS", ["</section>", "s-course-structure"]);
  const codeM = detailsBlock && detailsBlock.match(/Course Code<\/h4>\s*([A-Z0-9]+)/);
  const levelM = detailsBlock && detailsBlock.match(/Course Level<\/h4>\s*([A-Za-z ]+?)</);
  const durationM = detailsBlock && detailsBlock.match(/Duration<\/h4>\s*<p>([^<]+)<\/p>/);
  const intakeM = detailsBlock && detailsBlock.match(/Course Intake<\/h4>\s*([^<]+)</);

  // course structure
  const structBlock = textBetween(html, 'id="course-structure"', ["</section>"]);
  let structure = [];
  if (structBlock) {
    const stageRe = /<h4>([^<]+)<\/h4>([\s\S]*?)(?=<div class="c-stage-group">|<\/div>\s*<\/div>\s*<div class="course-view")/g;
    let m;
    while ((m = stageRe.exec(structBlock))) {
      const stageName = m[1].trim();
      const itemsHtml = m[2];
      const itemRe = /<span>([^<]*)<\/span><span>([^<]*)<\/span>/g;
      let im;
      const items = [];
      while ((im = itemRe.exec(itemsHtml))) {
        items.push(`${im[1].trim()} ${im[2].trim()}`.trim());
      }
      structure.push({ stage: stageName, items });
    }
  }

  // overview / description
  const overviewBlock = textBetween(html, 'id="overview"', ["</section>"]);
  const descM = overviewBlock && overviewBlock.match(/Course Description<\/h3>([\s\S]*?)<\/div>\s*<div class="cta-col"/);
  const description = descM ? stripTags(descM[1]) : null;

  // entry requirements
  const entryBlock = textBetween(html, 'id="entry-requirements"', ["</section>"]);
  const entryText = entryBlock ? stripTags(entryBlock) : null;

  out[f] = { title, code: codeM && codeM[1], level: levelM && levelM[1].trim(), duration: durationM && durationM[1].trim(), intake: intakeM && intakeM[1].trim(), structure, description, entryText };
}

fs.writeFileSync("/tmp/angliss_pages/extracted.json", JSON.stringify(out, null, 2));
console.log("done", Object.keys(out).length);
