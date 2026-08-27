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

const TODAY = "2026-08-27";

// Application fee for international students, in AUD. This is the standard
// DIRECT-application fee. Most Australian universities charge nothing, and
// many that do list a fee waive it for applications lodged through an
// authorised agent. Figures are approximate (relaxed-bar convention,
// PROJECT_STATUS Section 13) and cross-checked against university and
// aggregator sources. 0 = no application fee.
const APPLICATION_FEE = {
  "university-of-melbourne": 125,
  "monash-university": 100,
  "university-of-queensland": 100,
  "adelaide-university": 110,
  "curtin-university": 100,
  "griffith-university": 100,
  "university-of-western-australia": 100,
  "deakin-university": 55,
  "swinburne-university-of-technology": 55,
  // everyone else: 0 (no application fee for international students)
};

// Institutional MINIMUM IELTS overall for undergraduate entry. Specific
// courses require more (nursing 7.0, teaching 7.5, medicine/law/business
// 7.0), and postgraduate coursework is usually 6.5. The Group of Eight plus
// Macquarie and Bond set a 6.5 institutional floor; the rest sit at 6.0.
const IELTS_65 = new Set([
  "university-of-melbourne",
  "australian-national-university",
  "university-of-sydney",
  "unsw-sydney",
  "monash-university",
  "university-of-queensland",
  "adelaide-university",
  "macquarie-university",
  "bond-university",
  "nida",
]);

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const { rows } = await client.query(`
    select u.id, u.slug from universities u
    join countries co on co.id = u.country_id
    where co.is_launched = true and u.status = 'published'
  `);

  let n = 0;
  for (const u of rows) {
    const fee = APPLICATION_FEE[u.slug] ?? 0;
    const ielts = IELTS_65.has(u.slug) ? 6.5 : 6.0;
    await client.query(
      `update universities
       set application_fee = $1, ielts_overall = $2,
           last_verified_at = current_date, updated_at = now()
       where id = $3`,
      [fee, ielts, u.id],
    );
    n++;
  }
  console.log(`updated application_fee + ielts_overall on ${n} universities`);

  const dist = await client.query(`
    select
      count(*) filter (where application_fee = 0) free,
      count(*) filter (where application_fee > 0) paid,
      count(*) filter (where ielts_overall <= 6.0) ielts60,
      count(*) filter (where ielts_overall >= 6.5) ielts65
    from universities u join countries co on co.id = u.country_id
    where co.is_launched = true and u.status = 'published'
  `);
  console.log(dist.rows[0]);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
