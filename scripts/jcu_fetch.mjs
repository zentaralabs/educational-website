// Fetch a handbook.jcu.edu.au course page and dump its pageContent JSON.
// node scripts/jcu_fetch.mjs <code> [year]   (year defaults to 2027, the current handbook year)
import fs from "fs";

const code = process.argv[2];
const year = process.argv[3] || "2027";
if (!code) { console.error("pass a course code"); process.exit(1); }

const url = `https://handbook.jcu.edu.au/course/${year}/${code}`;
const res = await fetch(url);
const html = await res.text();
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!m) { console.error("no NEXT_DATA found, status", res.status); process.exit(1); }
const data = JSON.parse(m[1]);
const pc = data.props.pageProps.pageContent;
console.log(JSON.stringify(pc));
