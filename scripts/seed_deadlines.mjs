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
// (Semester 1 = Feb/Mar start, Semester 2 = Jul start) and, per the Study
// Australia guidance and university admissions pages, recommend applying
// roughly 3-6 months ahead: Sem 1 by Oct-Dec of the previous year, Sem 2 by
// Mar-Apr. Postgraduate coursework and competitive/professional programs
// (medicine, JD, some design) close earlier. These rows encode the standard
// recommended dates for the next cycle at each level, framed honestly.

// key -> { type, date, when, level }
const INTAKES = {
  s1_ug: { type: "Semester 1", date: "2026-11-30", when: "February or March 2027", level: "Undergraduate" },
  s1_pg: { type: "Semester 1", date: "2026-10-31", when: "February or March 2027", level: "Graduate" },
  s1_fp: { type: "Semester 1", date: "2026-11-30", when: "February or March 2027", level: "Foundation/Pathway" },
  s2_ug: { type: "Semester 2", date: "2027-04-30", when: "July 2027", level: "Undergraduate" },
  s2_pg: { type: "Semester 2", date: "2027-04-15", when: "July 2027", level: "Graduate" },
  s2_fp: { type: "Semester 2", date: "2027-04-30", when: "July 2027", level: "Foundation/Pathway" },
  // Bond: three trimesters a year, Jan/May/Sep.
  t1: { type: "Trimester 1", date: "2026-12-01", when: "January 2027", level: "Undergraduate" },
  t1p: { type: "Trimester 1", date: "2026-12-01", when: "January 2027", level: "Graduate" },
  t2: { type: "Trimester 2", date: "2027-04-01", when: "May 2027", level: "Undergraduate" },
  t2p: { type: "Trimester 2", date: "2027-04-01", when: "May 2027", level: "Graduate" },
  t3: { type: "Trimester 3", date: "2027-08-01", when: "September 2027", level: "Undergraduate" },
  t3p: { type: "Trimester 3", date: "2027-08-01", when: "September 2027", level: "Graduate" },
  // NIDA: audition-based, one annual cohort.
  nida: { type: "Semester 1", date: "2026-09-30", when: "February 2027", level: "Undergraduate" },
  nidap: { type: "Semester 1", date: "2026-09-30", when: "February 2027", level: "Graduate" },
};

// slug -> ordered list of intake keys. Not listed = standard: s1_ug, s1_pg,
// s2_ug, s2_pg (plus s1_fp/s2_fp if the school offers Foundation/Pathway).
const OVERRIDES = {
  "bond-university": ["t1", "t1p", "t2", "t2p", "t3", "t3p"],
  nida: ["nida", "nidap"],
  "greenwich-college": ["s1_fp", "s2_fp"],
  "south-metropolitan-tafe": ["s1_fp", "s2_fp"],
  "box-hill-institute": ["s1_ug", "s2_ug"],
  "victoria-university-polytechnic": ["s1_ug", "s2_ug"],
  "tafe-nsw": ["s1_ug", "s2_ug"],
};

function noteFor(intake, name) {
  const base =
    `Recommended date to have your international application in for the ${intake.when} intake. ` +
    `Australian universities do not set one hard deadline: this is the standard "apply by" guidance ` +
    `(roughly three to four months before the intake). Applications are usually still accepted after it ` +
    `while places remain and there is time for a student visa.`;
  if (intake.level === "Graduate") {
    return (
      base +
      ` Postgraduate coursework and professional programs (medicine, law, some design and business) ` +
      `often close earlier, so check the date for your specific course with ${name}.`
    );
  }
  if (intake.level === "Foundation/Pathway") {
    return (
      base +
      ` Pathway and foundation programs often run extra intakes through the year; confirm the next start with ${name}.`
    );
  }
  return (
    base +
    ` Competitive courses such as medicine and programs needing a portfolio or audition close earlier. ` +
    `Confirm the date for your course with ${name}.`
  );
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const wantedTypes = [
    "Semester 1",
    "Semester 2",
    "Trimester 1",
    "Trimester 2",
    "Trimester 3",
  ];
  const typeId = {};
  for (const name of wantedTypes) {
    const r = await client.query(
      `insert into deadline_types (name) values ($1)
       on conflict (name) do update set name = excluded.name returning id`,
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

  const del = await client.query(`
    delete from deadlines
    where university_id in (
      select u.id from universities u join countries co on co.id = u.country_id
      where co.is_launched = true
    )
  `);
  console.log(`deleted ${del.rowCount} old AU deadline rows`);

  let inserted = 0;
  for (const u of unis) {
    let keys = OVERRIDES[u.slug];
    if (!keys) {
      keys = [];
      const has = (l) => u.levels.includes(l);
      if (has("Undergraduate") || !has("Graduate")) keys.push("s1_ug", "s2_ug");
      if (has("Graduate")) keys.push("s1_pg", "s2_pg");
      if (has("Foundation/Pathway")) keys.push("s1_fp", "s2_fp");
    }

    for (const key of keys) {
      const intake = INTAKES[key];
      await client.query(
        `insert into deadlines
          (university_id, degree_level_id, deadline_type_id, deadline_date,
           notes, is_rolling, status, last_verified_at, source_url)
         values ($1,$2,$3,$4,$5,false,'published',$6,$7)`,
        [
          u.id,
          dlevel[intake.level],
          typeId[intake.type],
          intake.date,
          noteFor(intake, u.name),
          TODAY,
          u.website_url,
        ],
      );
      inserted++;
    }
  }
  console.log(
    `inserted ${inserted} dated deadline rows across ${unis.length} universities`,
  );

  const check = await client.query(`
    select dt.name, dg.name lvl, to_char(d.deadline_date,'Mon DD') dt, count(*)
    from deadlines d
    join universities u on u.id = d.university_id
    join countries co on co.id = u.country_id
    join deadline_types dt on dt.id = d.deadline_type_id
    join degree_levels dg on dg.id = d.degree_level_id
    where co.is_launched = true and d.status = 'published'
    group by 1, 2, 3 order by 1, 2
  `);
  check.rows.forEach((r) =>
    console.log(`  ${r.name} / ${r.lvl} / ${r.dt}: ${r.count}`),
  );
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
