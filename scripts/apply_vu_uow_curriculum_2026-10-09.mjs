/**
 * Fill missing subject lists ("curriculum") for 4 programs from their university's own
 * pages (read in a real browser 2026-10-09):
 *  - Victoria University (Graduate Certificate in Marketing, Graduate Certificate in
 *    Business Administration, Diploma of Youth Work): the "Course structure" and "Units"
 *    sections of vu.edu.au/courses/<course> (credit-point rules, unit names, unit codes).
 *  - University of Wollongong (Bachelor of Exercise Science and Rehabilitation): the 2026
 *    course handbook (courses.uow.edu.au/courses/2026/851_2) rules and named subject groups.
 * Data: scripts/data/vu-uow-buildout/curriculum-final.json.
 *
 * Rows whose page is gone or belongs to a different registration are NOT filled
 * (see unresolved-4-rows.md).
 *
 * DRY RUN BY DEFAULT; pass --apply to write (SUPABASE_SERVICE_ROLE_KEY from
 * .env.local). A row is only written if its live curriculum is still empty;
 * anything else is reported STALE and skipped, never overwritten.
 *
 *   node scripts/apply_vu_uow_curriculum_2026-10-09.mjs [--apply]
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const APPLY = process.argv.includes("--apply");
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.split("=")[0], l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const reader = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const writer = APPLY ? createClient(url, env.SUPABASE_SERVICE_ROLE_KEY) : null;
const rows = JSON.parse(fs.readFileSync("scripts/data/vu-uow-buildout/curriculum-final.json", "utf8"));
let ok = 0, stale = 0, failed = 0;
for (const r of rows) {
  if (/[?]|undefined|null|credit points\.?$/.test(r.curriculum) || !r.curriculum.includes(" — ")) { console.log(`BAD      ${r.name}`); failed++; continue; }
  const { data: live, error } = await reader.from("programs").select("id, curriculum").eq("id", r.id).single();
  if (error || !live) { console.log(`ERROR    ${r.name}: ${error?.message}`); failed++; continue; }
  if ((live.curriculum ?? "").trim() !== "") { console.log(`STALE    ${r.name}: curriculum no longer empty, skipped`); stale++; continue; }
  console.log(`${APPLY ? "WRITE" : "PREVIEW"}  ${r.name}  ${r.curriculum.split("\n").length} lines, ${r.curriculum.length} chars`);
  if (APPLY) {
    const { error: e } = await writer.from("programs").update({ curriculum: r.curriculum }).eq("id", r.id);
    if (e) { console.log(`  FAILED: ${e.message}`); failed++; continue; }
  }
  ok++;
}
console.log(`\n${ok} ${APPLY ? "written" : "ready"}, ${stale} stale, ${failed} failed, of ${rows.length}`);
