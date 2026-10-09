/**
 * Lengthen the descriptions of 6 University of Technology Sydney research degrees
 * (Doctor of Philosophy and five masters by research) from 76-83 words to 85+ by adding
 * facts from the university's own course pages (UTS course code, CRICOS code,
 * duration, campus, faculty), read 2026-10-09.
 * Data: scripts/data/uts-buildout/research-descriptions.json.
 *
 * DRY RUN BY DEFAULT; pass --apply to write (SUPABASE_SERVICE_ROLE_KEY from
 * .env.local). A row is only written if its live description still equals the
 * `previous` text; otherwise it is reported STALE and skipped.
 *
 *   node scripts/apply_uts_research_descriptions_2026-10-09.mjs [--apply]
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
const rows = JSON.parse(fs.readFileSync("scripts/data/uts-buildout/research-descriptions.json", "utf8"));
let ok = 0, stale = 0, failed = 0;
for (const r of rows) {
  const { data: live, error } = await reader.from("programs").select("id, description").eq("id", r.id).single();
  if (error || !live) { console.log(`ERROR    ${r.name}: ${error?.message}`); failed++; continue; }
  if ((live.description ?? "").trim() !== r.previous.trim()) { console.log(`STALE    ${r.name}: description changed, skipped`); stale++; continue; }
  console.log(`${APPLY ? "WRITE" : "PREVIEW"}  ${r.name}  ${r.words_before} -> ${r.words_after} words`);
  if (APPLY) {
    const { error: e } = await writer.from("programs").update({ description: r.description }).eq("id", r.id);
    if (e) { console.log(`  FAILED: ${e.message}`); failed++; continue; }
  }
  ok++;
}
console.log(`\n${ok} ${APPLY ? "written" : "ready"}, ${stale} stale, ${failed} failed, of ${rows.length}`);
