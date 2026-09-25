// Curtin University tail closure (2026-09-25): archive the 3 rows out of the original
// 19 incomplete rows that carry real, first-party evidence of discontinuation rather
// than being completed to Bond standard. Sets BOTH status='archived' and
// discontinued_note (a past bug in archive_programs.mjs silently dropped
// discontinued_note from writes).
import pg from "pg";
import fs from "fs";
import path from "path";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const ROWS = [
  {
    id: "642f3479-4c38-4ef6-9258-e9b4d6d20471",
    name: "Graduate Certificate in Employment Relations",
    reason: "Three independent signals confirm this award no longer exists in Curtin's current catalogue as of 2026-09-25. (1) Its own www.curtin.edu.au/study/offering/course-pg-graduate-certificate-in-employment-relations--gc-emprl/ URL 404s (checked directly, not via an aggregator). (2) handbook.curtin.edu.au's AppSync course-detail API returns no record for gc-emprl under any version suffix v1 through v5 (each attempt errors MIN_ENTRIES, the same error the handbook API returns for a course code that has never existed or has been fully retired from its system). (3) Curtin's own live 'Human Resources & Leadership' postgraduate study-area listing page (curtin.edu.au/study/study-areas/business-management-law/postgraduate-human-resources/), which is the current front-end catalogue for this discipline, lists only Master of Commerce (Human Resources), Master of Corporate Governance and Leadership, and Master of Commerce (Sustainable Business Leadership) - no Employment Relations award of any level. Third-party aggregators (IDP, Good Universities Guide, PostgradAustralia) still show a 2026 intake for this course, but per this rotation's established finding that CRICOS/aggregator listings can lag real teach-out, the university's own handbook API and live study-area page are treated as decisive here.",
  },
  {
    id: "d1aecd9c-4459-480e-8c99-fd68f28078e1",
    name: "Graduate Certificate in Luxury Marketing Management",
    reason: "This award's own www.curtin.edu.au/study/offering/course-pg-graduate-certificate-in-luxury-marketing-management--gc-luxmmt/ URL 301-redirects to an entirely unrelated live course, Marketing Major (MCom) (course-pg-marketing-major-mcom--mjrp-markg) - a strong first-party signal the university itself is redirecting stale traffic away from a retired course rather than serving a 404. Confirming this, a handbook.curtin.edu.au course-or-unit search for the phrase 'Luxury' (which would match this course, its parent Master of Luxury Branding, or the related Luxury Marketing Management Specialisation, all previously indexed) returns zero results of any kind, meaning Curtin has removed the entire luxury-marketing course family from its current handbook, not just this one award.",
  },
  {
    id: "6fc3ba72-63bb-4319-8ed6-f2681067b83a",
    name: "Graduate Diploma in Clinical Leadership",
    reason: "No award of this exact name and level exists in Curtin's current handbook or live site as of 2026-09-25. A handbook.curtin.edu.au course-or-unit search for 'Clinical Leadership' returns only the Graduate Certificate in Clinical Leadership (gc-cllead) and a Clinical Leadership Specialisation nested inside the Master of Advanced Practice (sppc-clldr) - no standalone Graduate Diploma. The generic Graduate Diploma in Clinical Specialisation (gd-clspec), which would be the structurally expected intermediate exit award between the Grad Cert and the Master of Advanced Practice for any specialisation including Clinical Leadership, also returns no handbook record under any version suffix (MIN_ENTRIES on every attempt) and its own www.curtin.edu.au marketing URL 404s. This indicates the Diploma-level exit award was removed from the Master of Advanced Practice's award ladder at some point, leaving only the Graduate Certificate (entry-level) and the Master (completion) - the DB row is a real CRICOS-registered artifact (096307J) of an award tier that no longer has a live equivalent.",
  },
];

const COMMIT = process.argv.includes("--commit");

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const logFile = path.join("scripts", "data", "curtin-tail-archived.json");
const log = fs.existsSync(logFile)
  ? JSON.parse(fs.readFileSync(logFile, "utf8"))
  : { note: "Curtin tail-closure archive log, 2026-09-25 session. Reverse with: update programs set status='published' where id = '<id>'.", entries: [] };

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
