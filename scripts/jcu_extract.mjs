// Extract admission_requirements, english_requirements, curriculum text from a
// handbook.jcu.edu.au course's pageContent JSON (CourseLoop CMS).
// Usage: node scripts/jcu_extract.mjs <code> [year]
import { flattenCurriculum, extractFields } from "./jcu_lib.mjs";

const code = process.argv[2];
const year = process.argv[3] || "2027";
const url = `https://handbook.jcu.edu.au/course/${year}/${code}`;
const res = await fetch(url);
if (res.status !== 200) { console.error("status", res.status); process.exit(1); }
const html = await res.text();
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const data = JSON.parse(m[1]);
const pc = data.props.pageProps.pageContent;
const fields = extractFields(pc);
console.log(JSON.stringify(fields, null, 1));
