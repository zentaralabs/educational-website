// Murdoch University tail closure (2026-09-25): archive the 2 rows out of the original
// 17 incomplete rows that carry real, first-party evidence of discontinuation rather
// than being completed to Bond standard. Sets BOTH status='archived' and
// discontinued_note (a past bug in archive_programs.mjs silently dropped
// discontinued_note from writes).
//
// Evidence for both: Murdoch's own Handbook course-version JSON
// (handbook.murdoch.edu.au/courses/<ver>/<code>, __NEXT_DATA__.props.pageProps.pageContent)
// explicitly flags is_discontinued: true, and no live marketing page exists for either
// code under any of the 5 known murdoch.edu.au/course/<segment>/<code> URL segments
// (undergraduate, postgraduate, honours, research, enabling) as of 2026-09-25 - confirmed
// with direct curl checks, all 404. Both codes are still shown as CRICOS-registered with
// current-looking fees when queried live against cricos.education.gov.au's Course Search
// (094589K / 034962B), which is noted here rather than hidden: per this rotation's
// established finding (Holmes Institute sprint, 2026-09-25), a CRICOS/TEQSA register can
// outlive a course's own marketing page and teach-out status by some time, so a live
// CRICOS listing alone does not override a specific, named "discontinued" flag from the
// university's own primary academic system of record.
import pg from "pg";
import fs from "fs";
import path from "path";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const ROWS = [
  {
    id: "00f9ed38-8303-4ea2-90cd-c8decc48b94a",
    name: "Graduate Certificate in Energy and Carbon Studies",
    reason: "Murdoch's own Handbook course-version data (handbook.murdoch.edu.au/courses/20/C1137) explicitly flags this course is_discontinued: true. No live marketing page exists under any of the 5 known murdoch.edu.au/course/<segment>/C1137 URL segments (checked 2026-09-25, all 404). CRICOS course code 094589K is still listed as registered with a current-looking fee ($22,280) as of 2026-09-25, consistent with a teach-out lag rather than continued active enrolment; see this rotation's Holmes Institute finding that CRICOS/TEQSA registration can outlive a course's real status.",
  },
  {
    id: "a781229f-7238-4576-b298-2d18332daaa9",
    name: "Graduate Diploma in Energy and the Environment",
    reason: "Murdoch's own Handbook course-version data (handbook.murdoch.edu.au/courses/20/G1062) explicitly flags this course is_discontinued: true. No live marketing page exists under any of the 5 known murdoch.edu.au/course/<segment>/G1062 URL segments (checked 2026-09-25, all 404). CRICOS course code 034962B is still listed as registered with a current-looking fee ($44,560) as of 2026-09-25, consistent with a teach-out lag rather than continued active enrolment; see this rotation's Holmes Institute finding that CRICOS/TEQSA registration can outlive a course's real status.",
  },
];

const COMMIT = process.argv.includes("--commit");

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const logFile = path.join("scripts", "data", "archived-discontinued.json");
const log = fs.existsSync(logFile)
  ? JSON.parse(fs.readFileSync(logFile, "utf8"))
  : { note: "Programs an official university page says are discontinued/suspended/replaced, archived during the description pass. Reverse with: update programs set status='published' where id = '<id>'.", entries: [] };

for (const r of ROWS) {
  const { rows } = await c.query("select name, status from programs where id = $1", [r.id]);
  if (!rows.length) { console.log(`  SKIP ${r.id} - not found`); continue; }
  console.log(`  ${COMMIT ? "archived" : "would archive"}: ${rows[0].name} (${rows[0].status})`);
  if (COMMIT) {
    await c.query(
      "update programs set status = 'archived', discontinued_note = $2, updated_at = now() where id = $1",
      [r.id, r.reason],
    );
    log.entries.push({ id: r.id, name: rows[0].name, reason: r.reason, archived_at: new Date().toISOString() });
  }
}

if (COMMIT) {
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2) + "\n");
  console.log(`\nLogged to ${logFile}. Re-export + revalidate.`);
} else {
  console.log("\nRe-run with --commit to apply.");
}
await c.end();
