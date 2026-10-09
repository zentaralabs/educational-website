/**
 * Fold 5 Western Sydney programs into the university's course list by setting
 * merge_into_list (migration 0041). They exist in no current WSU handbook year
 * (2024-2027) and the CRICOS code in our database differs from the one WSU shows
 * today for the nearest current course, so they look like old registrations. No
 * subject list could be sourced. They were thin (70-83 words), not in the
 * sitemap, and none had Google impressions in the 3 months to 2026-10-05.
 * List: scripts/data/wsu-buildout/merge-into-list-5.json
 * (reasons: unresolved-5-rows.md).
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
const rows = JSON.parse(fs.readFileSync("scripts/data/wsu-buildout/merge-into-list-5.json", "utf8"));
let ok = 0, skipped = 0, failed = 0;
for (const r of rows) {
  const { data: live, error } = await reader.from("programs").select("id, status, merge_into_list, has_own_page, content_indexable, seo_noindex").eq("id", r.id).single();
  if (error || !live) { console.log(`ERROR    ${r.name}: ${error?.message}`); failed++; continue; }
  if (live.content_indexable && !live.seo_noindex) { console.log(`SKIP     ${r.name}: currently indexable, not merging`); skipped++; continue; }
  if (live.merge_into_list) { console.log(`DONE     ${r.name}: already merged`); skipped++; continue; }
  console.log(`${APPLY ? "WRITE" : "PREVIEW"}  ${r.name}`);
  if (APPLY) {
    const { error: e } = await writer.from("programs").update({ merge_into_list: true }).eq("id", r.id);
    if (e) { console.log(`  FAILED: ${e.message}`); failed++; continue; }
  }
  ok++;
}
console.log(`\n${ok} ${APPLY ? "merged" : "ready"}, ${skipped} skipped, ${failed} failed, of ${rows.length}`);
