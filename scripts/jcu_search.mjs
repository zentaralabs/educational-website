// Query handbook.jcu.edu.au's search-all API for a course name and print raw JSON.
// node scripts/jcu_search.mjs "Bachelor of Nursing Science"
const q = process.argv.slice(2).join(" ");
if (!q) { console.error("pass a query"); process.exit(1); }
const url = `https://handbook.jcu.edu.au/api/search/search-all?from=0&query=${encodeURIComponent(q)}&searchType=advanced&siteId=jcu-prod-pres&siteYear=current&size=20`;
const res = await fetch(url);
const data = await res.json();
console.log(JSON.stringify(data, null, 1));
