import fs from "fs";

function extract(raw) {
  let t = raw.replace(/\\n/g, "\n");
  // Cut everything from "Fast Facts" onward up to "Course detail" (fees/QTAC noise),
  // keep the intro para; then append the "What to expect" body if present.
  const introEnd = t.search(/\n\s*(Download Brochure|Share\n|Fast Facts)/);
  const intro = introEnd > -1 ? t.slice(0, introEnd) : t.slice(0, 800);
  // find "What to expect" section
  let wte = "";
  const m = t.match(/What to expect\n+([\s\S]{0,2500}?)(?:Additional information|Career Opportunities|Admissions transparency|Handbook\n|View the handbook|$)/);
  if (m) wte = m[1];
  function clean(s) {
    return s
      .replace(/\s+/g, " ")
      .replace(/\.([a-zA-Z])/g, ". $1")
      .replace(/—|–/g, ",")
      .replace(/\bSaved\b\s*/g, "")
      .replace(/\bApply\b\s*/g, "")
      .replace(/\bEnquire\b\s*/g, "")
      .replace(/\bChat\b\s*/g, "")
      .replace(/\bBack\b\s*/g, "")
      .trim();
  }
  // strip the course name heading line from intro (first line)
  const lines = intro.split("\n").map((l) => l.trim()).filter(Boolean);
  // heading is usually first non-boilerplate line; drop leading Saved/Apply/Enquire/Chat/Back tokens
  const boiler = new Set(["Saved", "Apply", "Enquire", "Chat", "Back"]);
  let bodyLines = lines.filter((l) => !boiler.has(l));
  // drop a leading heading line (repeats the course name, no sentence punctuation)
  if (bodyLines.length && !/[.!?]$/.test(bodyLines[0]) && bodyLines[0].length < 80) {
    bodyLines = bodyLines.slice(1);
  }
  const introText = clean(bodyLines.join(" ")).replace(/\s+,/g, ",");
  return { intro: introText, whatToExpect: clean(wte) };
}

const files = ["jcu_desc_entries_1.json", "jcu_desc_entries_2.json", "jcu_desc_entries_3.json", "jcu_desc_entries_4.json"];
const out = {};
for (const f of files) {
  const arr = JSON.parse(fs.readFileSync("scratch/" + f, "utf8"));
  for (const [url, text] of arr) {
    out[url] = extract(text);
  }
}
fs.writeFileSync("scratch/jcu_desc_clean.json", JSON.stringify(out, null, 1));
console.log("processed", Object.keys(out).length, "urls");
