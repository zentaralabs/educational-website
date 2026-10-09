/**
 * Wave 1 of lengthening short program descriptions to 85+ words: 42 programs that
 * had Google impressions in the 3 months to 2026-10-05 and already have a verified
 * subject list. Each gets one to three sentences built only from fields we already
 * hold for that course (verified duration, the university's own English-language and
 * admission requirement text, and the first named subjects in its subject list). Pages
 * where the additions would carry no real information (or still fall short of 85
 * words) were left out. Data: scripts/data/lengthen-wave1/descriptions.json.
 *
 * DRY RUN BY DEFAULT; pass --apply to write (SUPABASE_SERVICE_ROLE_KEY from
 * .env.local). A row is only written if its live description still equals the
 * `previous` text; otherwise it is reported STALE and skipped.
 *
 *   node scripts/apply_lengthen_wave1_descriptions_2026-10-09.mjs [--apply]
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
const rows = JSON.parse(fs.readFileSync("scripts/data/lengthen-wave1/descriptions.json", "utf8"));
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
