/**
 * Fill the missing subject lists ("curriculum") for 70 University of Melbourne
 * coursework programs from the university's own 2026 Handbook
 * (handbook.unimelb.edu.au/2026/courses/<code>/course-structure, read
 * 2026-10-09). Data: scripts/data/melbourne-buildout/curriculum-final.json
 * (raw pages: raw-structures.json, review file: curriculum-preview.md).
 *
 * DRY RUN BY DEFAULT: reads the live rows with the anon key and prints what
 * would change. Pass --apply to write with SUPABASE_SERVICE_ROLE_KEY from
 * .env.local. The existing database webhook revalidates the pages.
 *
 *   node scripts/apply_melbourne_curriculum_2026-10-09.mjs            # preview
 *   node scripts/apply_melbourne_curriculum_2026-10-09.mjs --apply    # write
 *
 * A row is only written if its live curriculum is still empty (new fill) or still
 * equals the `previous` text this script wrote earlier (tidy-up); anything else is
 * reported as STALE and skipped, never overwritten.
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

const rows = JSON.parse(fs.readFileSync("scripts/data/melbourne-buildout/curriculum-final.json", "utf8"));
let ok = 0, stale = 0, failed = 0, fills = 0, replaces = 0, same = 0;
for (const r of rows) {
  if (/[?]|undefined|null/.test(r.curriculum) || !r.curriculum.includes(" — ")) {
    console.log(`BAD      ${r.name}`); failed++; continue;
  }
  const { data: live, error } = await reader
    .from("programs").select("id, curriculum, status").eq("id", r.id).single();
  if (error || !live) { console.log(`ERROR    ${r.name}: ${error?.message}`); failed++; continue; }
  const cur = (live.curriculum ?? "").trim();
  let mode;
  if (cur === "") mode = "fill";
  else if (cur === r.curriculum.trim()) { same++; continue; }
  else if (r.previous && cur === r.previous.trim()) mode = "replace";
  else { console.log(`STALE    ${r.name}: curriculum changed since it was written, skipped`); stale++; continue; }
  console.log(`${APPLY ? "WRITE" : "PREVIEW"}  ${mode.padEnd(7)} ${r.name} (${r.handbook_code})  ${r.curriculum.split("\n").length} lines, ${r.curriculum.length} chars`);
  if (APPLY) {
    const { error: e } = await writer.from("programs").update({ curriculum: r.curriculum }).eq("id", r.id);
    if (e) { console.log(`  FAILED: ${e.message}`); failed++; continue; }
  }
  mode === "fill" ? fills++ : replaces++; ok++;
}
console.log(`\n${ok} ${APPLY ? "written" : "ready"} (${fills} new, ${replaces} tidied), ${same} already up to date, ${stale} stale, ${failed} failed, of ${rows.length}`);
