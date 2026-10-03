/**
 * Content corrections from the 2026-10-02 SEO re-audit.
 *
 * DRY RUN BY DEFAULT: reads the live rows with the public (anon) key, prints
 * each field's current value next to the proposed one, and writes nothing.
 * Pass --apply to write. Applying uses SUPABASE_SERVICE_ROLE_KEY from
 * .env.local. The existing database webhook revalidates the pages.
 *
 *   node scripts/fix_content_2026-10-02.mjs            # preview only
 *   node scripts/fix_content_2026-10-02.mjs --apply    # write to production
 *
 * Every replacement is an exact-string swap: if the live text no longer
 * matches (someone edited it since the audit) the change is reported as
 * STALE and skipped, never forced.
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

// table, slug column value, field, exact old text, new text, page path to revalidate
const CHANGES = [
  {
    table: "scholarships",
    slug: "sydney-vice-chancellors-international-scholarships-scheme",
    field: "description",
    old: "It is applied as a tuition reduction across the degree.",
    new: "It is applied as a tuition reduction in the student's first year only and is not renewed in later years.",
    path: "/scholarships/sydney-vice-chancellors-international-scholarships-scheme",
    why: "Summary said 'across the degree'; the detail paragraph says it is awarded once, in the first year, and not renewed.",
  },
  {
    table: "scholarships",
    slug: "adelaide-academic-excellence-scholarship",
    field: "description",
    old: "Adelaide University's top automatic entry scholarship for international students, giving a 50% tuition reduction for the standard length of an eligible degree. Awarded on the academic merit of your admission application, with no separate form.",
    new: "Adelaide University's top entry scholarship for international students, giving a 50% tuition reduction for the standard length of an eligible degree. Awarded on academic merit, but you must complete a separate application form.",
    path: "/scholarships/adelaide-academic-excellence-scholarship",
    why: "Opening paragraph said 'automatic ... no separate form'; the badge, eligibility, later paragraph and FAQ all say a separate application is required.",
  },
  {
    table: "visa_subclasses",
    slug: "student-500",
    field: "stay_period",
    old: "Up to 6 years, matched to your course length",
    new: "Up to 5 years for most university courses, matched to your course length (up to 6 years if you package two or more courses)",
    path: "/visas/student-500",
    why: "Home Affairs length-of-stay rules (per a search summary of the official page; verify before applying): generally up to 5 years for tertiary students, up to 6 for packaged courses or school students.",
  },
];

let pending = 0, stale = 0;
for (const c of CHANGES) {
  const { data, error } = await reader.from(c.table).select(`id, ${c.field}`).eq("slug", c.slug).maybeSingle();
  console.log(`\n=== ${c.table} / ${c.slug} / ${c.field}`);
  console.log(`why: ${c.why}`);
  if (error || !data) { console.log("  NOT FOUND", error?.message ?? ""); stale++; continue; }
  const current = data[c.field] ?? "";
  if (!current.includes(c.old)) { console.log("  STALE: live text no longer contains the expected string; skipped.\n  live:", current.slice(0, 300)); stale++; continue; }
  console.log("  - ", c.old, "\n  + ", c.new);
  pending++;
  if (APPLY) {
    const { error: werr } = await writer.from(c.table).update({ [c.field]: current.replace(c.old, c.new) }).eq("id", data.id);
    if (werr) { console.log("  WRITE FAILED:", werr.message); continue; }
    console.log("  written.");
    // No manual revalidation: the Supabase database webhook on these tables calls
    // /api/revalidate on UPDATE, and the pages also refresh within `revalidate`.
  }
}
console.log(`\n${APPLY ? "APPLIED" : "DRY RUN"}: ${pending} change(s) ${APPLY ? "written" : "ready"}, ${stale} skipped.`);
if (!APPLY) console.log("Re-run with --apply to write to production.");
