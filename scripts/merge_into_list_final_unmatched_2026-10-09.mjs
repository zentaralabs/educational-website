/**
 * Fold the 7 last unmatched programs into their university's course list by setting
 * merge_into_list (migration 0041): QUT Bachelor of Media and Communication,
 * Wollongong Master of Applied Finance and Bachelor of Journalism, Adelaide
 * Bachelor of Criminology (Honours), Victoria University Graduate Diploma in Business
 * (Accounting), Sydney Graduate Diploma in Engineering and Master of Project and
 * Program Management. Each one's official page is gone, describes a different award, or
 * carries a different CRICOS registration, so no subject list could be sourced. All are
 * thin (under 85 words), not in the sitemap, and none had Google impressions in the
 * 3 months to 2026-10-05.
 * List: scripts/data/final-unmatched/merge-into-list-7.json
 *
 * DRY RUN BY DEFAULT; pass --apply to write.
 * Rollback: update programs set merge_into_list = false where id in (...);
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
const rows = JSON.parse(fs.readFileSync("scripts/data/final-unmatched/merge-into-list-7.json", "utf8"));
let ok = 0, skipped = 0, failed = 0;
for (const r of rows) {
  const { data: live, error } = await reader.from("programs").select("id, merge_into_list, content_indexable, seo_noindex").eq("id", r.id).single();
  if (error || !live) { console.log(`ERROR    ${r.name}: ${error?.message}`); failed++; continue; }
  if (live.content_indexable && !live.seo_noindex) { console.log(`SKIP     ${r.name}: currently indexable, not merging`); skipped++; continue; }
  if (live.merge_into_list) { console.log(`DONE     ${r.name}: already merged`); skipped++; continue; }
  console.log(`${APPLY ? "WRITE" : "PREVIEW"}  ${r.university} / ${r.name}`);
  if (APPLY) {
    const { error: e } = await writer.from("programs").update({ merge_into_list: true }).eq("id", r.id);
    if (e) { console.log(`  FAILED: ${e.message}`); failed++; continue; }
  }
  ok++;
}
console.log(`\n${ok} ${APPLY ? "merged" : "ready"}, ${skipped} skipped, ${failed} failed, of ${rows.length}`);
