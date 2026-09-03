/**
 * Populates `meta_title` on guides and blog posts whose editorial headline is
 * longer than a search result can show (migration 0025).
 *
 * Google renders roughly 60 characters of a <title>. Every headline below was
 * over that, so the words carrying the query were being cut out of the
 * snippet. The page keeps its full headline as the H1; only the <title> and
 * og:title use the short form.
 *
 * Idempotent: re-running just re-sets the same values.
 *
 *   node scripts/seed_meta_titles.mjs
 */
import pg from "pg";
import fs from "fs";

const GUIDES = {
  "ielts-vs-pte-for-australian-university-admission":
    "IELTS vs PTE for Australian University Admission",
  "commonwealth-supported-places-explained":
    "Commonwealth Supported Places (CSP) Explained",
  "how-to-ask-for-a-letter-of-recommendation":
    "How to Ask for a Letter of Recommendation",
  "how-to-write-a-personal-statement":
    "How to Write a Personal Statement for University",
  "check-australian-university-student-visa-priority":
    "Check a University's Student Visa Priority Status",
  "real-cost-of-studying-in-australia":
    "The Real Cost of Studying in Australia",
  "bringing-family-on-an-australian-student-visa":
    "Bringing Family on an Australian Student Visa",
  "cricos-and-course-accreditation-explained":
    "CRICOS and AQF: Course Accreditation Explained",
  "which-australian-courses-lead-to-permanent-residence":
    "Which Australian Courses Lead to Permanent Residence",
  "choosing-a-regional-area-to-study-in-australia":
    "Studying in Regional Australia: What Counts",
  "training-visa-407-vs-skills-in-demand-visa-482":
    "407 Training Visa vs 482 Skills in Demand Visa",
  "getting-your-qualifications-recognised-in-australia":
    "Getting Your Qualifications Recognised in Australia",
};

const BLOG_POSTS = {
  "genuine-student-test-explained":
    "What the Genuine Student Test Actually Asks",
  "adelaide-university-merger-what-it-means":
    "Adelaide University Merger: What It Means for You",
  "ministerial-direction-115-student-visa-priority":
    "Ministerial Direction 115 and Student Visa Priority",
  "australia-student-visa-fee-increase-2026":
    "Australia Student Visa Fee Increase, July 2026",
  "student-visa-refusal-rate-20-year-high-2026":
    "Student Visa Refusal Rate Hits a 20-Year High",
  "2025-26-state-nomination-allocations-190-491":
    "2025-26 State Nomination Allocations: 190 and 491",
  "ministerial-direction-119-skilled-visa-priorities":
    "Ministerial Direction 119: Skilled Visa Priorities",
  "skillselect-round-4-june-2026-subclass-189":
    "SkillSelect Round: 4 June 2026, Subclass 189",
};

const TITLE_MAX = 60;

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

// Guard against a long "short" title sneaking in on a later edit.
for (const [table, map] of [["guides", GUIDES], ["blog_posts", BLOG_POSTS]]) {
  for (const [slug, title] of Object.entries(map)) {
    if (title.length > TITLE_MAX) {
      console.error(`${table}/${slug}: meta_title is ${title.length} chars, max ${TITLE_MAX}`);
      process.exit(1);
    }
    if (/[—–]/.test(title)) {
      console.error(`${table}/${slug}: meta_title contains an em or en dash`);
      process.exit(1);
    }
  }
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  let updated = 0;
  let missing = 0;
  for (const [table, map] of [["guides", GUIDES], ["blog_posts", BLOG_POSTS]]) {
    for (const [slug, metaTitle] of Object.entries(map)) {
      const res = await client.query(
        `update ${table} set meta_title = $1 where slug = $2`,
        [metaTitle, slug],
      );
      if (res.rowCount === 0) {
        console.warn(`  no row: ${table}/${slug}`);
        missing++;
      } else {
        console.log(`  ${table}/${slug} -> "${metaTitle}" (${metaTitle.length})`);
        updated++;
      }
    }
  }
  console.log(`\nupdated ${updated} rows${missing ? `, ${missing} slugs not found` : ""}`);
} finally {
  await client.end();
}
