/**
 * Fill missing subject lists ("curriculum") for 12 Swinburne University of
 * Technology programs from the university's own course handbook pages
 * (www.swinburne.edu.au/course/<level>/<course>/handbook/, read 2026-10-09;
 * unit tables and course rules only). Data:
 * scripts/data/swinburne-buildout/curriculum-final.json.
 *
 * Only courses whose handbook page clearly matches the course are included;
 * rows whose saved link points at a different course, or that have no page of
 * their own, are deliberately NOT filled (see the PR description).
 *
 * DRY RUN BY DEFAULT; pass --apply to write (SUPABASE_SERVICE_ROLE_KEY from
 * .env.local). A row is only written if its live curriculum is still empty;
 * anything else is reported STALE and skipped, never overwritten.
 *
 *   node scripts/apply_swinburne_curriculum_2026-10-09.mjs [--apply]
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
const rows = JSON.parse(fs.readFileSync("scripts/data/swinburne-buildout/curriculum-final.json", "utf8"));
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
