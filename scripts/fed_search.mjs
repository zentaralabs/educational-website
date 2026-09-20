import fs from "fs";

// Query FedUni's real course-search API by keyword and dump raw results.
// Usage: node scripts/fed_search.mjs "<query>"
const q = process.argv.slice(2).join(" ");
const url = `https://www.federation.edu.au/api/CourseApi/course-search?pageId=12&pageSize=20&Keyword=${encodeURIComponent(q)}`;
const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
const data = await res.json();
console.log(JSON.stringify(data.result, null, 2));
