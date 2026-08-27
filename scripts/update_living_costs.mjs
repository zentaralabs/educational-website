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

// Anchored to the Australian Government's official 12-month student-visa
// living-cost figure for a single student: AUD 29,710 (2026), from
// immi.homeaffairs.gov.au. Adjusted by city using published 2026
// international-student cost ranges (Study Australia, Numbeo, university
// international-student cost pages): Sydney and Melbourne run above the
// government figure, Adelaide / Perth / regional below it. These are
// estimates, surfaced as such on the site, not per-university verified data.
const GOV_FIGURE = 29710;

function costForCity(city) {
  if (!city) return GOV_FIGURE;
  const c = city.toLowerCase();
  if (c.includes("sydney") || c.includes("manly")) return 34000;
  if (c.includes("melbourne") || c.includes("geelong")) return 32000;
  if (c.includes("canberra")) return 30000;
  if (c.includes("darwin")) return 28000;
  if (
    c.includes("brisbane") ||
    c.includes("gold coast") ||
    c.includes("sippy downs") ||
    c.includes("sunshine")
  )
    return 29000;
  if (c.includes("perth") || c.includes("fremantle")) return 28000;
  if (c.includes("adelaide")) return 27000;
  if (c.includes("hobart") || c.includes("launceston")) return 27000;
  if (c.includes("newcastle") || c.includes("wollongong")) return 27000;
  if (c.includes("townsville") || c.includes("cairns")) return 26000;
  if (
    c.includes("ballarat") ||
    c.includes("armidale") ||
    c.includes("toowoomba") ||
    c.includes("lismore") ||
    c.includes("coffs") ||
    c.includes("cooranbong") ||
    c.includes("bathurst") ||
    c.includes("wagga") ||
    c.includes("regional")
  )
    return 26000;
  // Multi-campus / national providers: use the government figure unchanged.
  return GOV_FIGURE;
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const { rows } = await client.query(`
    select u.id, u.slug, u.city
    from universities u join countries co on co.id = u.country_id
    where co.is_launched = true and u.status = 'published'
  `);
  let n = 0;
  for (const u of rows) {
    const cost = costForCity(u.city);
    await client.query(
      "update universities set living_cost_annual = $1, updated_at = now() where id = $2",
      [cost, u.id],
    );
    n++;
  }
  console.log(`updated living_cost_annual on ${n} universities`);
  const dist = await client.query(`
    select living_cost_annual, count(*)
    from universities u join countries co on co.id = u.country_id
    where co.is_launched = true and u.status = 'published'
    group by 1 order by 1
  `);
  dist.rows.forEach((r) => console.log(`  $${r.living_cost_annual}: ${r.count}`));
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
