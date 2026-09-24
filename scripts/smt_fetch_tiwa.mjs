import fs from "fs";

const urls = fs.readFileSync("/tmp/tiwa_course_urls.txt", "utf8").trim().split("\n");
const outDir = "scripts/data/tiwa_pages";
fs.mkdirSync(outDir, { recursive: true });

async function fetchWithRetry(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (res.ok) return await res.text();
      console.error("HTTP", res.status, url);
    } catch (e) {
      console.error("err", url, e.message);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

const results = [];
let i = 0;
for (const url of urls) {
  i++;
  const slug = url.split("/").pop();
  const fp = `${outDir}/${slug}.html`;
  if (fs.existsSync(fp)) {
    console.log(i, "/", urls.length, "cached", slug);
    continue;
  }
  const html = await fetchWithRetry(url);
  if (html) {
    fs.writeFileSync(fp, html);
    console.log(i, "/", urls.length, "fetched", slug);
  } else {
    console.log(i, "/", urls.length, "FAILED", slug);
  }
}
console.log("done");
