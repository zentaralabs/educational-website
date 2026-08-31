import pg from "pg";
import fs from "fs";

// Hand-assigned selectivity bands for every published Australian institution.
//
// Why this is hand-assigned and not computed: Australian universities do not
// publish an admission rate the way US universities do. The acceptance_rate
// column previously used to derive the band held an unsourced third-party
// estimate for every institution, and 1-2 points of estimate noise was enough
// to push peer universities into different bands. A four-tier editorial call
// with a stated rationale is more honest than a false-precision percentage.
//
// Bands (hardest to most open):
//   highly-selective   entry is genuinely competitive institution-wide
//   selective          real bar, but broad graduate entry from a good bachelor's (the Go8)
//   competitive        mainstream public entry: attainable, with harder named courses
//   broadly-accessible open admissions across most courses, with pathway options
//
// Notes are one line, plain sentences, zero em dashes (house style). They are
// shown on the public profile page under the Selectivity fact.

const TODAY = "2026-08-31";

const GO8_NOTE_LEAD = "Group of Eight, research-intensive.";
const COMPETITIVE_NOTE =
  "Mainstream public university. Entry is real but attainable from a recognised bachelor's or Year 12 equivalent, while named professional courses such as nursing, teaching and psychology set higher course-specific bars.";
const OPEN_UNI_NOTE =
  "Open admissions across most courses, often accepting a wide range of prior qualifications and running foundation or diploma pathways for applicants who fall short. Competitive courses still set their own requirements.";
const PRIVATE_COLLEGE_NOTE =
  "Private higher-education provider with open, rolling admissions for most courses and several intakes a year.";
const TAFE_NOTE =
  "Vocational provider with open enrolment for most certificates and diplomas. Some courses have capacity limits or prerequisite units.";

const ASSIGNMENTS = {
  // --- Selective: the Group of Eight -------------------------------------
  "australian-national-university": {
    band: "selective",
    note: `${GO8_NOTE_LEAD} Most coursework masters accept a solid bachelor's; undergraduate entry and flagship programs like PPE, law and advanced science are materially harder.`,
  },
  "university-of-melbourne": {
    band: "selective",
    note: `${GO8_NOTE_LEAD} Graduate entry is broad from a good bachelor's, but the Melbourne Model makes most professional fields graduate-only and competitive.`,
  },
  "university-of-sydney": {
    band: "selective",
    note: `${GO8_NOTE_LEAD} Graduate entry is reasonable from a credit average; law, medicine, and some design and business courses sit well above the institutional bar.`,
  },
  "unsw-sydney": {
    band: "selective",
    note: `${GO8_NOTE_LEAD} Most courses are attainable from a credit average; engineering, medicine and actuarial studies are higher.`,
  },
  "university-of-queensland": {
    band: "selective",
    note: `${GO8_NOTE_LEAD} Most masters accept a credit-to-distinction average from a three-year bachelor's; medicine and dentistry are separate and highly competitive.`,
  },
  "monash-university": {
    band: "selective",
    note: `${GO8_NOTE_LEAD} Australia's largest university, with broad entry across most faculties and pharmacy, medicine and law materially harder.`,
  },
  "university-of-western-australia": {
    band: "selective",
    note: `${GO8_NOTE_LEAD} Graduate entry is broad from a good bachelor's; the graduate-entry medical and dental courses are the exception.`,
  },
  "adelaide-university": {
    band: "selective",
    note: "Formed from the 2026 merger of the University of Adelaide and the University of South Australia. Carries Group of Eight standing with broad entry across most courses and harder medical and health programs.",
  },

  // --- Highly selective: audition or portfolio entry, tiny intake -------
  nida: {
    band: "highly-selective",
    note: "Entry is by audition or portfolio and interview for a very small annual intake, which makes the acting and production courses among the hardest performing-arts places in the country to win.",
  },

  // --- Competitive: mainstream public universities ----------------------
  "australian-catholic-university": {
    band: "competitive",
    note: "Broad entry across education, health and arts. Nursing, teaching, paramedicine and psychology apply higher course-specific requirements.",
  },
  "curtin-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "deakin-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "edith-cowan-university": {
    band: "competitive",
    note: "Attainable entry across most courses. The performing-arts programs at WAAPA are audition-based and highly competitive.",
  },
  "flinders-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "griffith-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "james-cook-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "la-trobe-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "macquarie-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "murdoch-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "queensland-university-of-technology": { band: "competitive", note: COMPETITIVE_NOTE },
  "rmit-university": {
    band: "competitive",
    note: "Attainable entry for most courses. Design, architecture and animation are portfolio-assessed and competitive.",
  },
  "southern-cross-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "swinburne-university-of-technology": { band: "competitive", note: COMPETITIVE_NOTE },
  "university-of-canberra": { band: "competitive", note: COMPETITIVE_NOTE },
  "university-of-newcastle": { band: "competitive", note: COMPETITIVE_NOTE },
  "university-of-tasmania": { band: "competitive", note: COMPETITIVE_NOTE },
  "university-of-technology-sydney": { band: "competitive", note: COMPETITIVE_NOTE },
  "university-of-the-sunshine-coast": { band: "competitive", note: COMPETITIVE_NOTE },
  "university-of-wollongong": { band: "competitive", note: COMPETITIVE_NOTE },
  "western-sydney-university": { band: "competitive", note: COMPETITIVE_NOTE },
  "bond-university": {
    band: "competitive",
    note: "Private, with a three-semester calendar and rolling intakes. Entry is attainable across most courses; the law and medical programs are the selective exception.",
  },
  "university-of-notre-dame-australia": {
    band: "competitive",
    note: "Private, with a structured admissions interview for many courses. Entry is attainable, but medicine and some health courses are highly competitive.",
  },
  "avondale-university": {
    band: "competitive",
    note: "Small private university strongest in teaching and nursing, both of which carry the standard higher course-specific requirements.",
  },
  "australian-institute-of-music": {
    band: "competitive",
    note: "Entry to the performance degrees is by audition. The contemporary music, audio and entertainment-management courses are more broadly accessible.",
  },

  // --- Broadly accessible: regional, pathway-focused, private providers -
  "charles-darwin-university": { band: "broadly-accessible", note: OPEN_UNI_NOTE },
  "charles-sturt-university": { band: "broadly-accessible", note: OPEN_UNI_NOTE },
  "cquniversity-australia": { band: "broadly-accessible", note: OPEN_UNI_NOTE },
  "federation-university-australia": { band: "broadly-accessible", note: OPEN_UNI_NOTE },
  "university-of-new-england": { band: "broadly-accessible", note: OPEN_UNI_NOTE },
  "university-of-southern-queensland": { band: "broadly-accessible", note: OPEN_UNI_NOTE },
  "victoria-university": {
    band: "broadly-accessible",
    note: "Open admissions across most courses, with the First Year College block model built around a wide intake. Competitive courses still set their own requirements.",
  },
  "university-of-divinity": {
    band: "broadly-accessible",
    note: "Specialist provider. Entry is open for most awards, with research degrees assessed on prior study.",
  },
  "australian-institute-of-business": { band: "broadly-accessible", note: PRIVATE_COLLEGE_NOTE },
  "holmes-institute": { band: "broadly-accessible", note: PRIVATE_COLLEGE_NOTE },
  icms: { band: "broadly-accessible", note: PRIVATE_COLLEGE_NOTE },
  "kaplan-business-school": { band: "broadly-accessible", note: PRIVATE_COLLEGE_NOTE },
  "melbourne-institute-of-technology": { band: "broadly-accessible", note: PRIVATE_COLLEGE_NOTE },
  "torrens-university-australia": { band: "broadly-accessible", note: PRIVATE_COLLEGE_NOTE },
  "greenwich-college": { band: "broadly-accessible", note: PRIVATE_COLLEGE_NOTE },

  // --- Broadly accessible: TAFE and polytechnic ------------------------
  "box-hill-institute": { band: "broadly-accessible", note: TAFE_NOTE },
  "melbourne-polytechnic": { band: "broadly-accessible", note: TAFE_NOTE },
  "south-metropolitan-tafe": { band: "broadly-accessible", note: TAFE_NOTE },
  "tafe-nsw": { band: "broadly-accessible", note: TAFE_NOTE },
  "tafe-queensland": { band: "broadly-accessible", note: TAFE_NOTE },
  "victoria-university-polytechnic": { band: "broadly-accessible", note: TAFE_NOTE },
  "william-angliss-institute": {
    band: "broadly-accessible",
    note: "Specialist provider for foods, tourism, hospitality and events. Open enrolment for most courses.",
  },

  // --- Archived (2026 merger). Kept assigned in case they resurface. ----
  "university-of-adelaide": {
    band: "selective",
    note: `${GO8_NOTE_LEAD} Merged into Adelaide University in 2026.`,
  },
  "university-of-south-australia": {
    band: "competitive",
    note: "Merged into Adelaide University in 2026.",
  },
};

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

if (Object.values(ASSIGNMENTS).some((a) => /—|–/.test(a.note))) {
  console.error("ERR: an em or en dash slipped into a selectivity note");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows: auUnis } = await client.query(`
    select u.id, u.slug, u.name, u.status
    from universities u
    join countries co on co.id = u.country_id
    where co.code = 'AU'
  `);

  let updated = 0;
  const missing = [];
  for (const u of auUnis) {
    const a = ASSIGNMENTS[u.slug];
    if (!a) {
      if (u.status === "published") missing.push(`${u.slug} (${u.name})`);
      continue;
    }
    await client.query(
      `update universities
       set selectivity_band = $1, selectivity_note = $2, updated_at = now()
       where id = $3`,
      [a.band, a.note, u.id],
    );
    updated++;
  }

  console.log(`set selectivity_band on ${updated} AU institutions as of ${TODAY}`);
  if (missing.length) {
    console.warn(`\nWARNING: published AU institutions with no assignment:`);
    for (const m of missing) console.warn(`  - ${m}`);
  }

  const dist = await client.query(`
    select selectivity_band, count(*) n
    from universities u join countries co on co.id = u.country_id
    where co.code = 'AU'
    group by selectivity_band order by n desc
  `);
  console.log("\ndistribution:", dist.rows);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
