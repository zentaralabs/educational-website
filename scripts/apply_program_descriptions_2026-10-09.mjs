/**
 * Restore 22 program pages that the 2026-10-08 85-word rule (migration 0039)
 * took out of the index although they had Google impressions, by replacing
 * their short descriptions with sourced 120-151 word ones. Once a row's
 * description reaches 85 words, `content_indexable` flips back to true and
 * the page returns to the sitemap with `index, follow`.
 *
 * Drafts and sources: scripts/data/program-description-drafts-2026-10-08.{json,md}
 * (each description written from the university's own course page, read
 * 2026-10-08). Two drafted rows are deliberately skipped: the UniSC Master of
 * Health Promotion (online only, no CRICOS code) and the UNE Bachelor of
 * Education (Early Childhood and Primary) (closed to international students).
 *
 * DRY RUN BY DEFAULT: reads the live rows with the anon key, prints old and new
 * word counts, and writes nothing. Pass --apply to write with
 * SUPABASE_SERVICE_ROLE_KEY from .env.local. The existing database webhook
 * revalidates the pages.
 *
 *   node scripts/apply_program_descriptions_2026-10-09.mjs            # preview
 *   node scripts/apply_program_descriptions_2026-10-09.mjs --apply    # write
 *
 * A row is only written if its live description still equals the text the
 * draft was written against (scripts/data/programs.json at aa3a606);
 * otherwise it is reported as STALE and skipped, never forced.
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

const SKIP = new Set([
  "university-of-the-sunshine-coast/programs/master-of-health-promotion",
  "university-of-new-england/programs/bachelor-of-education-early-childhood-and-primary",
]);

const drafts = JSON.parse(fs.readFileSync("scripts/data/program-description-drafts-2026-10-08.json", "utf8"))
  .filter((d) => !SKIP.has(d.key));
const baseline = JSON.parse(fs.readFileSync("scripts/data/programs.json", "utf8"));
const words = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;

let ok = 0, stale = 0, failed = 0;
for (const d of drafts) {
  const [uniSlug, , slug] = d.key.split("/");
  const base = baseline.find((r) => r.university_slug === uniSlug && r.slug === slug);
  if (!base) { console.log(`MISSING  ${d.key} (not in programs.json)`); failed++; continue; }
  if (/[—–]/.test(d.description)) { console.log(`DASH     ${d.key}`); failed++; continue; }

  const { data: live, error } = await reader
    .from("programs").select("id, description, seo_noindex, status").eq("id", base.id).single();
  if (error || !live) { console.log(`ERROR    ${d.key}: ${error?.message}`); failed++; continue; }
  if ((live.description || "").trim() !== (base.description || "").trim()) {
    console.log(`STALE    ${d.key}: live description changed since the draft, skipped`); stale++; continue;
  }

  const flags = [live.status !== "published" && `status=${live.status}`, live.seo_noindex && "seo_noindex=true"].filter(Boolean);
  console.log(`${APPLY ? "WRITE" : "PREVIEW"}  ${d.key}  ${words(live.description)} -> ${words(d.description)} words${flags.length ? "  !! " + flags.join(", ") : ""}`);

  if (APPLY) {
    const { error: e } = await writer.from("programs").update({ description: d.description }).eq("id", base.id);
    if (e) { console.log(`  FAILED: ${e.message}`); failed++; continue; }
  }
  ok++;
}
console.log(`\n${ok} ${APPLY ? "written" : "ready"}, ${stale} stale, ${failed} failed, of ${drafts.length}`);
