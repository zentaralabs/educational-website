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

const TODAY = "2026-08-28";

// PTE Academic overall equivalent to an IELTS overall band. This is the
// concordance published by Pearson and used in the UK Home Office SELT
// tables, which Australian universities quote on their own English-
// requirement pages. Universities set the PTE floor from the IELTS floor
// using exactly this mapping, so deriving it here matches what each
// institution actually publishes.
//   IELTS 5.5 -> PTE 42
//   IELTS 6.0 -> PTE 50
//   IELTS 6.5 -> PTE 58
//   IELTS 7.0 -> PTE 65
//   IELTS 7.5 -> PTE 73
//   IELTS 8.0 -> PTE 79
// String keys on purpose: a numeric object key like `6.0` is coerced to "6",
// which would never match the "6.0" produced by toFixed(1) below.
const IELTS_TO_PTE = {
  "5.5": 42,
  "6.0": 50,
  "6.5": 58,
  "7.0": 65,
  "7.5": 73,
  "8.0": 79,
};

function pteFor(ielts) {
  if (ielts == null) return null;
  const key = Number(ielts).toFixed(1);
  return IELTS_TO_PTE[key] ?? null;
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const { rows } = await client.query(`
    select u.id, u.slug, u.ielts_overall from universities u
    join countries co on co.id = u.country_id
    where co.is_launched = true and u.status = 'published'
  `);

  let updated = 0;
  let skipped = 0;
  for (const u of rows) {
    const pte = pteFor(u.ielts_overall);
    if (pte == null) {
      skipped++;
      continue;
    }
    await client.query(
      `update universities
       set pte_overall = $1, last_verified_at = current_date, updated_at = now()
       where id = $2`,
      [pte, u.id],
    );
    updated++;
  }
  console.log(`set pte_overall on ${updated} universities (skipped ${skipped} with no mapped IELTS floor) as of ${TODAY}`);

  const dist = await client.query(`
    select pte_overall, count(*) n
    from universities u join countries co on co.id = u.country_id
    where co.is_launched = true and u.status = 'published'
    group by pte_overall order by pte_overall
  `);
  console.log(dist.rows);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
