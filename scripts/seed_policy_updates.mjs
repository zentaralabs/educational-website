import pg from "pg";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

// Bump only when the whole set below has actually been re-checked against the
// official source in each row's `source_urls`.
const TODAY = "2026-09-04";
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL ?? "https://www.wheretoapply.xyz").replace(/\/$/, "");
const INDEXNOW_KEY = "b1d94f7a2c8e4056a3f61e0d5c927b8f";

// Best-effort IndexNow ping so Bing/Yandex re-crawl /updates fast after a
// reseed. Never throws. (Copy of src/lib/indexnow.ts, kept local like the
// other seed scripts.)
async function pingIndexNow(paths) {
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((p) => `${SITE_URL}${p}`),
      }),
    });
    console.log("indexnow", res.status);
  } catch (e) {
    console.log("indexnow failed (ignored):", e.message);
  }
}

// ---------------------------------------------------------------------------
// The log. Every entry was checked on TODAY against the official page in
// `sources` (immi.homeaffairs.gov.au or education.gov.au). Keep entries to
// the change itself: what it is, when it starts, who it touches, what to do.
// Zero em dashes (node scripts/check_em_dashes.mjs).
//
//   slug -> the /updates#<slug> anchor and the idempotent upsert key
// ---------------------------------------------------------------------------
const updates = [
  {
    slug: "student-visa-charge-2500-july-2026",
    title: "Student visa application charge rises to A$2,500",
    category: "fees-and-charges",
    announced_date: "2026-07-01",
    effective_date: "2026-07-01",
    summary:
      "From 1 July 2026 the Subclass 500 student visa application charge is A$2,500 for the main applicant, with a separate charge for each family member who applies. A lower charge applies to citizens of Pacific Island countries and Timor-Leste, citizens of ASEAN countries, and applicants in the independent ELICOS and non-award sectors.",
    impact:
      "Budget the higher charge per person in your application, and check in ImmiAccount whether your passport or course type qualifies for the reduced charge before you pay.",
    affects: ["Student visa applicants", "Families applying together"],
    detail_url: null,
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    ],
  },
  {
    slug: "ministerial-direction-115-student-visa-priorities",
    title: "Ministerial Direction 115 replaces MD111 for offshore student visas",
    category: "student-visa",
    announced_date: "2025-11-14",
    effective_date: "2025-11-14",
    summary:
      "Offshore Subclass 500 applications lodged on or after 14 November 2025 are processed under Ministerial Direction 115, which replaced Ministerial Direction 111. MD115 sets three processing priority levels instead of two, based on how far a student's education provider has progressed against its share of the National Planning Level: Priority 1 below the threshold, Priority 2 once the provider reaches 80 per cent of its allocation, and Priority 3 once it exceeds the allocation by 15 per cent.",
    impact:
      "Your processing priority is fixed by your provider's allocation status on the day you lodge, not by your nationality or course alone. Higher education students can check a provider's current status on the Department of Education's Visa Prioritisation Status page before lodging. A Ministerial Direction is not a cap and does not change whether a visa is granted.",
    affects: ["Offshore student visa applicants", "Higher education and VET students"],
    detail_url: null,
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-processing-times/visa-processing-priorities/student-visa",
      "https://www.education.gov.au/managed-system-international-education-2026/resources/visa-prioritisation-status",
    ],
  },
  {
    slug: "national-planning-level-295000-2026",
    title: "2026 National Planning Level set at 295,000 new student places",
    category: "university-sector",
    announced_date: "2025-08-04",
    effective_date: "2026-01-01",
    summary:
      "The Government set a National Planning Level of 295,000 new international student commencements for 2026, which is 25,000 higher than 2025. No active provider's 2026 allocation is lower than its 2025 allocation. From 2026, students moving to a public university from an Australian secondary school, or from an affiliated pathway provider or TAFE, are exempt from the planning level.",
    impact:
      "The planning level shapes how quickly each provider fills its places, and therefore your processing priority under Ministerial Direction 115. It is not a cap on individual visa applications.",
    affects: ["Prospective international students", "Pathway and TAFE students"],
    detail_url: null,
    sources: [
      "https://www.education.gov.au/managed-system-international-education/2026-managed-growth-settings",
    ],
  },
  {
    slug: "approved-english-tests-updated-2025",
    title: "The list of accepted English tests changed",
    category: "english-language",
    announced_date: "2025-08-07",
    effective_date: "2025-08-07",
    summary:
      "From 7 August 2025 the Department updated which English language tests it accepts for Australian visas. For tests sat on or after that date it accepts IELTS Academic and General Training, PTE Academic, TOEFL iBT, OET, Cambridge C1 Advanced, CELPIP General, LANGUAGECERT Academic and the Michigan English Test, all taken at a secure test centre. At-home and online versions are not accepted. TOEFL iBT results must be booked under the 'Taking TOEFL for Australia' pathway to count.",
    impact:
      "A test sat on or before 6 August 2025 can still be used for up to three years, depending on the visa. Book an in-centre test and confirm it is on the current list before you pay.",
    affects: ["Student visa applicants", "Temporary Graduate visa applicants"],
    detail_url: null,
    sources: [
      "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language",
    ],
  },
];

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  let n = 0;
  for (const u of updates) {
    // Upsert on slug: a partial run must never wipe the log.
    await client.query(
      `insert into policy_updates
        (slug, title, category, announced_date, effective_date, summary,
         impact, affects, detail_url, source_urls, is_estimated, status,
         last_verified_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false,'published',$11)
       on conflict (slug) do update set
         title = excluded.title, category = excluded.category,
         announced_date = excluded.announced_date,
         effective_date = excluded.effective_date, summary = excluded.summary,
         impact = excluded.impact, affects = excluded.affects,
         detail_url = excluded.detail_url, source_urls = excluded.source_urls,
         is_estimated = excluded.is_estimated, status = 'published',
         last_verified_at = excluded.last_verified_at, updated_at = now()`,
      [
        u.slug,
        u.title,
        u.category,
        u.announced_date,
        u.effective_date,
        u.summary,
        u.impact,
        u.affects,
        u.detail_url,
        u.sources,
        TODAY,
      ],
    );
    n++;
  }
  console.log(`upserted ${n} policy updates`);

  const em = await client.query(
    `select slug from policy_updates
     where title like '%—%' or summary like '%—%' or impact like '%—%'`,
  );
  console.log(
    em.rows.length
      ? `EM-DASH FOUND: ${em.rows.map((r) => r.slug).join(", ")}`
      : "em-dash check: clean",
  );

  await pingIndexNow(["/updates", "/sitemap.xml"]);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
