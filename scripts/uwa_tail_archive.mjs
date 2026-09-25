// University of Western Australia tail closure (2026-09-25): archive rows with real,
// cited discontinuation/rescission evidence rather than completing them to Bond
// standard. Sets BOTH status='archived' and discontinued_note (a past bug in
// archive_programs.mjs silently dropped discontinued_note from writes).
import pg from "pg";
import fs from "fs";
import path from "path";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const ROWS = [
  {
    id: "01c9d265-55bd-4262-a18b-4092bf794cf5",
    name: "Diploma in Science - 8 months",
    reason: "UWA College discontinued this INTO-delivered pathway program: the February 2024 cohort was its last intake, per INTO's own partner portal closure notice (partnerportal2.intoglobal.com/en/news/program-closure-uwa-colleges-diploma-in-science), citing low demand and uncertainty around the continuation of some Bachelor of Science major progression routes. The course code (UWC04) remains published as a historical record in UWA's own handbook, but the program is closed to new applicants as of 2026 and does not run.",
  },
  {
    id: "7e060374-8656-4b26-b7df-dac28eb90e65",
    name: "Diploma in Science - 12 months",
    reason: "UWA College discontinued this INTO-delivered pathway program: the February 2024 cohort was its last intake, per INTO's own partner portal closure notice (partnerportal2.intoglobal.com/en/news/program-closure-uwa-colleges-diploma-in-science), citing low demand and uncertainty around the continuation of some Bachelor of Science major progression routes. The course code (UWC14) remains published as a historical record in UWA's own handbook, but the program is closed to new applicants as of 2026 and does not run.",
  },
  {
    id: "3e9fc733-1d69-4cde-b954-46a1d2799a4b",
    name: "Diploma in Engineering - 10 Months",
    reason: "UWA's INTO course pages describe this diploma (course code UWC08) as being progressively phased out in favour of a new Engineering Degree Transfer Program, with the diploma's own application window stated as closing 18 September 2026, a date now in the past as of this session (2026-09-25). No successor DB row exists yet for the Engineering Degree Transfer Program to redirect to; archived rather than built out as an active offering.",
  },
  {
    id: "2c6e2159-9c81-4b03-99d5-563946a217ac",
    name: "Diploma in Engineering - 14 months",
    reason: "UWA's INTO course pages describe this diploma (course code UWC18) as being progressively phased out in favour of a new Engineering Degree Transfer Program, with the diploma's own application window stated as closing 18 September 2026, a date now in the past as of this session (2026-09-25). No successor DB row exists yet for the Engineering Degree Transfer Program to redirect to; archived rather than built out as an active offering.",
  },
  {
    id: "20e4f208-c2a1-4b53-b726-4a863da88dc4",
    name: "Bachelor of Automation and Robotics",
    reason: "UWA's own handbook (course code BP007) lists this degree as rescinded, available only to re-enrolling students, not open to new (including new international) admissions as of the 2026 Handbook. New applicants are directed to the Automation and Robotics Engineering major offered within UWA's Bachelor of Engineering (Honours), which leads into the Master of Professional Engineering with provisional Engineers Australia accreditation. Archived rather than built out as an actively recruiting program.",
  },
  {
    id: "302bc1a0-c6a9-4ae8-8a3c-f65fc63fa706",
    name: "Bachelor of Design",
    reason: "UWA's own handbook (course code BP003) lists this degree as rescinded, available only to re-enrolling students, not open to new (including new international) admissions as of the 2026 Handbook. New applicants are directed to the Architecture and Landscape Architecture majors offered within the Bachelor of Environmental Design (a separate, currently active DB row). Archived rather than built out as an actively recruiting program.",
  },
  {
    id: "2f2ad33e-2915-438d-8847-b142f89a7d9f",
    name: "Bachelor of Science (Marine Science)",
    reason: "Confirmed fabricated duplicate from the original PR #52 build, found during this session's fabrication spot-check. Its stored CRICOS code (068914G) actually belongs to UWA's plain general Bachelor of Science (course code BP004), not a marine-science-specific product; there is no separate 'Bachelor of Science (Marine Science)' award at UWA. The real, separate marine science undergraduate degree is Bachelor of Marine Science (CRICOS 107723J, course code BP023), which is a distinct, already-published, verified DB row (id a37a6fd1-765a-428f-a248-b5b2b86e9f64). This row's own curriculum field was generic unsourced prose with no real unit codes, and its admission_requirements field contained a self-aware editorial disclaimer inconsistent with genuine handbook text. Archived as a duplicate rather than corrected in place, to avoid two published rows competing for the same real course.",
  },
];

const COMMIT = process.argv.includes("--commit");

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const logFile = path.join("scripts", "data", "uwa-tail-archived.json");
const log = fs.existsSync(logFile)
  ? JSON.parse(fs.readFileSync(logFile, "utf8"))
  : { note: "UWA tail-closure archive log, 2026-09-25 session. Reverse with: update programs set status='published' where id = '<id>'.", entries: [] };

for (const r of ROWS) {
  const { rows } = await c.query("select name, status from programs where id = $1", [r.id]);
  if (!rows.length) { console.log(`  SKIP ${r.id} - not found`); continue; }
  console.log(`  ${COMMIT ? "archived" : "would archive"}: ${rows[0].name} (${rows[0].status})`);
  if (COMMIT) {
    await c.query(
      "update programs set status = 'archived', discontinued_note = $2, updated_at = now() where id = $1",
      [r.id, r.reason],
    );
    log.entries.push({ id: r.id, name: r.name, reason: r.reason, archived_at: new Date().toISOString() });
  }
}

if (COMMIT) {
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  console.log(`Wrote ${logFile}`);
}

await c.end();
