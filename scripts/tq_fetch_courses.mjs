// TAFE Queensland build-out: fetch every course page needed by tq_row_map.json
// into a local cache. tafeqld.edu.au has no Cloudflare gating, plain fetch works.
import fs from "node:fs";

const rowMap = JSON.parse(fs.readFileSync("scripts/data/tq_row_map.json", "utf8"));
const cacheDir = "scripts/data/tq_cache";
fs.mkdirSync(cacheDir, { recursive: true });

const urls = new Set();
for (const v of Object.values(rowMap)) {
  if (v.action === "build") for (const u of v.urls) urls.add(u);
}
console.log("Unique URLs to fetch:", urls.size);

function urlToFile(u) {
  const seg = u.replace("https://tafeqld.edu.au/course/", "").replace(/\//g, "_");
  return `${cacheDir}/${seg}.html`;
}

let ok = 0, fail = 0;
for (const u of urls) {
  const file = urlToFile(u);
  if (fs.existsSync(file)) { ok++; continue; }
  try {
    const res = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } });
    if (res.status !== 200) { console.error("BAD STATUS", res.status, u); fail++; continue; }
    const html = await res.text();
    fs.writeFileSync(file, html);
    ok++;
  } catch (e) {
    console.error("FETCH FAIL", u, e.message);
    fail++;
  }
  await new Promise((r) => setTimeout(r, 150));
}
console.log("Fetched OK:", ok, "Failed:", fail);
