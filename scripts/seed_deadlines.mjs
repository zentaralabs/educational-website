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

// Australian universities do not publish a single hard "application deadline"
// for international students the way US schools do. They run fixed intakes
// (usually Semester 1 in Feb/Mar and Semester 2 in Jul) and publish a
// RECOMMENDED application date ahead of each, then keep accepting applications
// while places and visa-processing time remain. Competitive courses close
// earlier. These rows encode the standard recommended dates for the next
// cycle, framed honestly in the notes.

// intake label -> { type, date, month phrase for the note }
const INTAKES = {
  s1: { type: "Semester 1", date: "2026-11-30", when: "February or March 2027" },
  s2: { type: "Semester 2", date: "2027-05-31", when: "July 2027" },
  t1: { type: "Trimester 1", date: "2026-12-01", when: "January 2027" },
  t2: { type: "Trimester 2", date: "2027-04-01", when: "May 2027" },
  t3: { type: "Trimester 3", date: "2027-08-01", when: "September 2027" },
  mit1: { type: "Semester 1", date: "2027-01-31", when: "March 2027" },
  mit3: { type: "Additional intake", date: "2027-09-30", when: "November 2027" },
  tor2: { type: "Additional intake", date: "2027-04-30", when: "June 2027" },
  tor3: { type: "Additional intake", date: "2027-08-31", when: "October 2027" },
  gw1: { type: "Semester 1", date: "2027-01-10", when: "February 2027" },
  gw2: { type: "Additional intake", date: "2027-04-15", when: "May 2027" },
  gw3: { type: "Semester 2", date: "2027-07-10", when: "August 2027" },
  gw4: { type: "Additional intake", date: "2027-10-10", when: "November 2027" },
  nida1: { type: "Semester 1", date: "2026-09-30", when: "February 2027" },
};

// slug -> list of intake keys. Default (not listed) = ["s1", "s2"].
const OVERRIDES = {
  "bond-university": ["t1", "t2", "t3"],
  nida: ["nida1"],
  "greenwich-college": ["gw1", "gw2", "gw3", "gw4"],
  "melbourne-institute-of-technology": ["mit1", "s2", "mit3"],
  "torrens-university-australia": ["s1", "tor2", "tor3"],
};

function noteFor(when, name) {
  return (
    `Recommended date to have your international application in for the ${when} intake. ` +
    `Undergraduate and postgraduate coursework applications follow the same timeline. ` +
    `Most courses keep accepting applications after this date while places remain and there is time to arrange a student visa; ` +
    `competitive courses such as medicine, dentistry, and some design and business programs close earlier. ` +
    `Confirm the closing date for your specific course with ${name}.`
  );
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  // Deadline types
  const wantedTypes = [
    "Semester 1",
    "Semester 2",
    "Trimester 1",
    "Trimester 2",
    "Trimester 3",
    "Additional intake",
  ];
  const typeId = {};
  for (const name of wantedTypes) {
    const r = await client.query(
      `insert into deadline_types (name) values ($1)
       on conflict (name) do update set name = excluded.name
       returning id`,
      [name],
    );
    typeId[name] = r.rows[0].id;
  }

  const dlevel = Object.fromEntries(
    (await client.query("select id, name from degree_levels")).rows.map((r) => [
      r.name,
      r.id,
    ]),
  );

  // AU universities + their real program-derived degree levels + website
  const { rows: unis } = await client.query(`
    select u.id, u.slug, u.name, u.website_url,
      coalesce(
        (select array_agg(distinct d.name)
         from programs p join degree_levels d on d.id = p.degree_level_id
         where p.university_id = u.id and p.status = 'published'),
        array['Undergraduate']::text[]
      ) as levels
    from universities u
    join countries co on co.id = u.country_id
    where co.is_launched = true and u.status = 'published'
    order by u.slug
  `);

  // Wipe existing AU published deadlines (all were generic rolling placeholders)
  const del = await client.query(`
    delete from deadlines
    where university_id in (
      select u.id from universities u join countries co on co.id = u.country_id
      where co.is_launched = true
    )
  `);
  console.log(`deleted ${del.rowCount} old AU deadline rows`);

  // One row per (university, intake). Semester 1 and Semester 2 dates are the
  // same for undergraduate and postgraduate coursework at every AU university,
  // so we don't split by level (the note says so). Pure pathway/VET providers
  // are tagged Foundation/Pathway; everyone else Undergraduate.
  const PATHWAY_ONLY = new Set([
    "greenwich-college",
    "box-hill-institute",
    "south-metropolitan-tafe",
    "victoria-university-polytechnic",
    "william-angliss-institute",
    "melbourne-polytechnic",
  ]);

  let inserted = 0;
  for (const u of unis) {
    const intakeKeys = OVERRIDES[u.slug] ?? ["s1", "s2"];
    const levelId = PATHWAY_ONLY.has(u.slug)
      ? dlevel["Foundation/Pathway"]
      : dlevel["Undergraduate"];

    for (const key of intakeKeys) {
      const intake = INTAKES[key];
      await client.query(
        `insert into deadlines
          (university_id, degree_level_id, deadline_type_id, deadline_date,
           notes, is_rolling, status, last_verified_at, source_url)
         values ($1,$2,$3,$4,$5,false,'published',$6,$7)`,
        [
          u.id,
          levelId,
          typeId[intake.type],
          intake.date,
          noteFor(intake.when, u.name),
          TODAY,
          u.website_url,
        ],
      );
      inserted++;
    }
  }
  console.log(`inserted ${inserted} dated deadline rows across ${unis.length} universities`);

  const check = await client.query(`
    select dt.name, dg.name lvl, count(*)
    from deadlines d
    join universities u on u.id = d.university_id
    join countries co on co.id = u.country_id
    join deadline_types dt on dt.id = d.deadline_type_id
    join degree_levels dg on dg.id = d.degree_level_id
    where co.is_launched = true and d.status = 'published'
    group by 1, 2 order by 1, 2
  `);
  check.rows.forEach((r) => console.log(`  ${r.name} / ${r.lvl}: ${r.count}`));
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
