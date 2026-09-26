// Deakin University tail closure (2026-09-26): archive rows with real, cited
// discontinuation evidence rather than completing them to Bond standard. Sets
// BOTH status='archived' and discontinued_note (a past bug in archive_programs.mjs
// silently dropped discontinued_note from writes -- see macquarie-program-buildout notes).
import pg from "pg";
import fs from "fs";
import path from "path";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const ROWS = [
  {
    id: "d51c8e8c-98d2-4b39-8624-df1b52da52aa",
    name: "Bachelor of Environmental Engineering (Honours)",
    reason: "Deakin's live Bachelor of Engineering (Honours) page (deakin.edu.au/course/bachelor-engineering-honours) now lists only four specialisations: civil, electrical and renewable energy, mechanical, and mechatronics engineering. No environmental engineering option is listed, and no standalone /major/environmental-engineering page exists (404). The 2026-09-13 build documented this specialisation as folded into the Civil Engineering major at that time; the live Civil major page (deakin.edu.au/major/civil-engineering) no longer references environmental engineering at all, confirming the specialisation has since been fully discontinued rather than merely folded in.",
  },
  {
    id: "5f51a264-bed2-4278-b41f-f5fb97b2ffe8",
    name: "Bachelor of Creative Arts (Honours)",
    reason: "No live Deakin course page exists for a standalone 'Bachelor of Creative Arts (Honours)'. Confirmed against Deakin's live full course-name index (deakin.edu.au/_design/search-endpoints/html-list/courses, 619 entries) and site search: the only honours-level Creative Arts pathway is the already-published, separate DB row Bachelor of Communication and Creative Arts (Honours) (deakin.edu.au/course/bachelor-communication-and-creative-arts-honours). This matches the original 2026-09-13 sprint's own conclusion.",
  },
  {
    id: "8c499c8d-4d18-4592-aa7c-946d9e9a56df",
    name: "Bachelor of Early Childhood and Primary Education",
    reason: "deakin.edu.au/course/bachelor-early-childhood-and-primary-education now 404s. Wayback Machine shows this exact URL redirecting to Deakin's own dedicated 'Discontinued course' page as of a 2026-04-08 snapshot, a first-party confirmation of discontinuation. Deakin's separate Bachelor of Early Childhood Education (undergraduate, live) and Master of Teaching (Early Childhood) (postgraduate, live and already a Bond-standard DB row) remain the current pathways for this subject area.",
  },
  {
    id: "d6ae8646-a3b4-4262-abf9-ec22bd2fdbb7",
    name: "Bachelor of Education (Early Years)",
    reason: "deakin.edu.au/course/bachelor-education-early-years 404s. Wayback Machine's last live (HTTP 200) snapshot of this exact URL is from 2018, confirming a long-standing discontinuation. Zero matches in Deakin's current 619-course full-text catalogue index or live site search. Current early-years pathways run through the live Bachelor of Early Childhood Education and Master of Teaching (Early Childhood).",
  },
  {
    id: "94a3174d-d315-4c74-9714-a1ed3cd926bc",
    name: "Graduate Certificate of Commerce",
    reason: "deakin.edu.au/course/graduate-certificate-commerce 404s. Wayback Machine's last live snapshot of this exact URL is from 2018. Zero matches in Deakin's current 619-course full-text catalogue index or live site search. Deakin's postgraduate business offering has moved to the Master of Business family (Marketing, Finance, Professional Accounting, Business Administration, etc.), none of which include a graduate-certificate-level Commerce award today.",
  },
  {
    id: "e23f22ed-73c6-4b62-80ec-8db10502467d",
    name: "Graduate Diploma of Early Childhood Education",
    reason: "deakin.edu.au/course/graduate-diploma-early-childhood-education redirects to Deakin's own dedicated 'Discontinued course' page, a first-party confirmation of discontinuation. Wayback Machine's last live (HTTP 200) snapshot of this exact URL is from 2024-09-28, roughly two years before this check.",
  },
  {
    id: "a608b611-483d-45ac-8ad9-10efb12d980a",
    name: "Graduate Diploma of Humanitarianism and Development",
    reason: "deakin.edu.au/course/graduate-diploma-humanitarianism-and-development redirects to Deakin's own dedicated 'Discontinued course' page, a first-party confirmation of discontinuation. Wayback Machine's last live snapshot of this exact URL is from 2025-06-19, roughly 15 months before this check. The subject area remains live at the masters level as the separate, already-published DB rows Master of Humanitarianism and Development and Master of Humanitarian, Development and Disaster Studies.",
  },
  {
    id: "eb3cacb8-754a-4cc9-b83f-33aa017c34a0",
    name: "Master of Commerce",
    reason: "deakin.edu.au/course/master-commerce 404s. Zero matches in Deakin's current 619-course full-text catalogue index or live site search (which surfaces only Master of Business (Marketing), Master of Finance, Master of Professional Accounting and Master of Business Administration as related results). Deakin's postgraduate commerce/business offering has moved entirely to this Master of Business family; no bare or specialisation-qualified Master of Commerce exists today.",
  },
  {
    id: "e94b0bc4-8532-4e96-825b-c636456abd5e",
    name: "Master of Energy System Management (Professional)",
    reason: "deakin.edu.au/course/master-energy-system-management-professional 404s. Wayback Machine's last live snapshot of this exact URL is from 2024-06-19, roughly 27 months before this check. Zero matches in Deakin's current 619-course full-text catalogue index or live site search.",
  },
  {
    id: "76182be9-daf4-4629-aad0-e80056471084",
    name: "Master of Information Technology Management",
    reason: "deakin.edu.au/course/master-information-technology-management redirects to Deakin's own dedicated 'Discontinued course' page, a first-party confirmation of discontinuation. Wayback Machine's last live snapshot of this exact URL is from 2025-08-11, roughly 13 months before this check, so the removal is comparatively recent but genuine and first-party confirmed.",
  },
  {
    id: "70baaaf9-f665-4cff-bbaf-57d3f461256d",
    name: "Master of Infrastructure Engineering and Management (Professional)",
    reason: "deakin.edu.au/course/master-infrastructure-engineering-and-management-professional 404s. Wayback Machine's last live snapshot of this exact URL is from 2024-06-15, roughly 27 months before this check. Zero matches in Deakin's current 619-course full-text catalogue index or live site search.",
  },
  {
    id: "0c1080fb-af08-48ce-b5ab-6d0176de4d87",
    name: "Master of Teaching English to Speakers of Other Languages",
    reason: "deakin.edu.au/course/master-teaching-english-to-speakers-of-other-languages 404s. No master's-level TESOL course under any URL naming has ever been archived by the Wayback Machine for this domain; only Graduate Certificate-level TESOL/TESOL-adjacent pages exist, and all of those are last live between 2013 and 2016 (9+ years ago). Zero matches in Deakin's current 619-course full-text catalogue index or live site search.",
  },
  {
    id: "10ab71e6-c3bb-4451-9bbc-f41e930d5321",
    name: "Master of Technology and Innovation Leadership",
    reason: "deakin.edu.au/course/master-technology-and-innovation-leadership redirects to Deakin's own dedicated 'Discontinued course' page, a first-party confirmation of discontinuation. Wayback Machine's last live snapshot of this exact URL is from 2025-05-27, roughly 16 months before this check, so the removal is comparatively recent but genuine and first-party confirmed.",
  },
];

const COMMIT = process.argv.includes("--commit");

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();

const logFile = path.join("scripts", "data", "deakin-tail-archived.json");
const log = fs.existsSync(logFile)
  ? JSON.parse(fs.readFileSync(logFile, "utf8"))
  : { note: "Deakin tail-closure archive log, 2026-09-26 session. Reverse with: update programs set status='published' where id = '<id>'.", entries: [] };

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
