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

// Values and mechanics are cross-checked against the official scholarship page
// and reputable aggregators, following this project's relaxed approximate-bar
// convention (PROJECT_STATUS Section 13). Amounts and deadlines on university
// scholarships change yearly — every row carries source_url and last_verified_at.

const NATIONAL = [
  {
    name: "Australia Awards Scholarships",
    slug: "australia-awards-scholarships",
    scope: "national",
    amount: "Full tuition, airfares, and living allowance",
    study_level: "Any",
    separate_application: true,
    deadline_date: null,
    eligibility:
      "Citizens of participating developing countries in Asia, the Pacific, Africa, and the Middle East, applying from their home country. Applicants are assessed on development impact potential as much as academic merit, and must return home for at least two years after finishing.",
    description:
      "Australia Awards are the Australian Government's flagship development scholarships, funded through the foreign aid program. They cover the full cost of study: tuition, return airfares, a contribution to living expenses, an establishment allowance, and Overseas Student Health Cover.\n\nThey are aimed at people from partner countries who will return to contribute to their country's development, so the selection process weighs your professional background and development goals heavily. Fields of study are usually tied to your country's agreed priority areas. Applications open annually through the Australia Awards portal, with country-specific closing dates.",
    external_url: "https://www.dfat.gov.au/people-to-people/australia-awards",
    source_url: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
  },
  {
    name: "Destination Australia Scholarships",
    slug: "destination-australia-scholarships",
    scope: "national",
    amount: "Up to AUD 15,000 per year",
    study_level: "Any",
    separate_application: true,
    deadline_date: null,
    eligibility:
      "Domestic and international students starting a new full-time course (Certificate IV to PhD, one to four years) at an approved provider located in regional Australia. You must live and study in the regional area.",
    description:
      "Destination Australia is a Commonwealth program that funds regional education providers to offer scholarships of up to AUD 15,000 a year to students who study and live in regional Australia. Over a thousand are offered nationally each year, paid in instalments across the year.\n\nUnlike most national scholarships it is open to both domestic and international students. You do not apply to the government directly. Instead you apply to the participating regional university or campus, which selects recipients against its own criteria and timeline. It stacks well with studying regionally for the skilled-migration points that come with it.",
    external_url: "https://www.education.gov.au/destination-australia",
    source_url: "https://www.education.gov.au/destination-australia",
  },
  {
    name: "Research Training Program (RTP) Scholarship",
    slug: "research-training-program-rtp-scholarship",
    scope: "national",
    amount: "Tuition offset plus a stipend around AUD 37,000 per year (2026)",
    study_level: "Research",
    separate_application: true,
    deadline_date: null,
    eligibility:
      "Domestic and international students enrolled in an accredited research doctorate (PhD) or research masters at an Australian university. Highly competitive, allocated on research record and proposal strength.",
    description:
      "The RTP is how the Australian Government funds most higher-degree research students. Universities receive a block grant and award it as some combination of three things: a full tuition-fee offset, a living stipend (the 2026 full-time rate is about AUD 37,010 a year, tax-free), and allowances for relocation, thesis costs, or health cover.\n\nInternational and domestic students compete in the same pool. The stipend runs for up to three years for a PhD, the fee offset up to four. You apply through your chosen university's graduate research school, not the government, usually alongside or just after your admission application. Individual universities top up the base rate to varying degrees.",
    external_url: "https://www.education.gov.au/research-block-grants/research-training-program",
    source_url: "https://www.education.gov.au/research-block-grants/research-training-program",
  },
];

// [name, slug, universitySlug, amount, level, separateApplication, eligibility, description, externalUrl]
const UNI = [
  [
    "Melbourne International Undergraduate Scholarship",
    "melbourne-international-undergraduate-scholarship",
    "university-of-melbourne",
    "25%, 50%, or 100% first-year tuition remission",
    "Undergraduate",
    false,
    "Commencing international undergraduate students who hold an unconditional offer. Awarded on academic merit, with quotas by course and region, and weighted toward students from countries where cost is a barrier.",
    "The University of Melbourne's main entry scholarship for international bachelor students. It reduces first-year tuition by a quarter, a half, or in a small number of cases the full amount, and around 110 are awarded each year.\n\nThere is no separate form. Every eligible applicant with an unconditional undergraduate offer is automatically assessed on merit. Because it only applies to the first year, factor the standard fee into your budget for years two and three.",
    "https://scholarships.unimelb.edu.au/awards/melbourne-international-undergraduate-scholarship",
  ],
  [
    "Monash International Merit Scholarship",
    "monash-international-merit-scholarship",
    "monash-university",
    "AUD 15,000 per year (from 2026)",
    "Any",
    true,
    "Commencing international students in most undergraduate and postgraduate coursework degrees at the Australian campuses, assessed on academic results. Some disciplines and pathway entries are excluded.",
    "Monash's broad merit award for international students, paid at AUD 15,000 a year for each full year of study until you reach the credit points your degree requires. It is one of the more widely available flagship scholarships because it is not capped at a handful of recipients.\n\nYou submit a short separate application after you receive your Monash offer. It cannot usually be combined with other Monash scholarships, so check which award you are better off taking.",
    "https://www.monash.edu/study/fees-scholarships/scholarships/find-a-scholarship/international-merit-5770",
  ],
  [
    "UNSW International Scholarships",
    "unsw-international-scholarships",
    "unsw-sydney",
    "Partial tuition, commonly AUD 5,000 to 20,000, some full",
    "Any",
    true,
    "Commencing international students with strong academic records. A family of awards covering achievement-based, equity-based, and country- or region-specific scholarships across undergraduate and postgraduate coursework.",
    "UNSW runs a set of international scholarships rather than a single scheme. The achievement awards are the most common, giving partial tuition relief to students with high grades, while a smaller number of full-tuition awards exist in specific faculties and for research.\n\nMost require a separate application after you have an offer, though a few are automatic. Deadlines cluster a few months before each term start, and UNSW's trimester calendar means there are three intake cycles a year to plan around.",
    "https://www.unsw.edu.au/scholarships",
  ],
  [
    "ANU Chancellor's International Scholarship",
    "anu-chancellors-international-scholarship",
    "australian-national-university",
    "25% or 50% tuition reduction",
    "Any",
    false,
    "Commencing international students in eligible undergraduate and postgraduate coursework programs, assessed automatically on the academic merit of the admission application.",
    "ANU's automatic merit scholarship for international students. It reduces tuition by a quarter or a half for the full duration of the degree, not just the first year, which makes it more valuable over time than a first-year-only award of the same headline rate.\n\nNo separate application. Every eligible applicant is considered when their admission is assessed, and the offer, if made, comes with or shortly after the admission offer. ANU also runs more selective full scholarships that do require applications.",
    "https://www.anu.edu.au/study/scholarships",
  ],
  [
    "Sydney Vice-Chancellor's International Scholarships Scheme",
    "sydney-vice-chancellors-international-scholarships-scheme",
    "university-of-sydney",
    "Up to AUD 60,000 toward tuition",
    "Any",
    false,
    "Commencing international students with an unconditional offer for an undergraduate or postgraduate coursework degree by the relevant round deadline. Assessed automatically on academic merit.",
    "The University of Sydney's headline international award, lifted to AUD 60,000 for 2026. It is applied as a tuition reduction across the degree.\n\nThere is no form to complete. Hold an unconditional offer by a round deadline and you are automatically considered on merit. Some students, particularly from India, can hold it alongside a country-specific Sydney scholarship, effectively stacking the support.",
    "https://www.sydney.edu.au/scholarships/e/vice-chancellor-international-scholarships-scheme.html",
  ],
  [
    "UQ International Scholarship",
    "uq-international-scholarship",
    "university-of-queensland",
    "Partial to full tuition, varies by award",
    "Any",
    true,
    "Commencing international students across undergraduate, postgraduate coursework, and research programs. A group of awards including merit scholarships and the more selective Global Leaders scholarship.",
    "UQ groups its international support under a set of scholarships rather than one scheme. Merit awards give partial tuition relief to strong applicants, while the Global Leaders scholarship is more competitive and looks at leadership and community involvement alongside grades.\n\nMost require a separate application after you receive a UQ offer, with rounds a few months before each semester. Research students are usually funded through the RTP and UQ's own graduate research scholarships instead.",
    "https://scholarships.uq.edu.au/scholarships/international",
  ],
  [
    "UWA Global Excellence Scholarship",
    "uwa-global-excellence-scholarship",
    "university-of-western-australia",
    "Commonly AUD 5,000 to 20,000 toward tuition",
    "Any",
    false,
    "Commencing international students in most coursework degrees, assessed on the academic merit of the admission application. Rates step up with your entry grade average.",
    "UWA's automatic merit scholarship for international students. The value is banded: a higher weighted average at entry moves you into a larger tuition reduction, applied across the degree.\n\nNo separate application is needed for the standard bands. Perth also counts as a regional area for skilled migration, so a UWA scholarship pairs with extra points toward the 190 and 491 visas.",
    "https://www.uwa.edu.au/study/how-to-apply/scholarships-and-fees",
  ],
  [
    "UTS International Undergraduate Academic Excellence Scholarship",
    "uts-international-undergraduate-academic-excellence-scholarship",
    "university-of-technology-sydney",
    "25% to 50% tuition for the course duration",
    "Undergraduate",
    true,
    "Commencing international undergraduate students with a strong academic record entering an eligible UTS bachelor degree. A parallel postgraduate version exists.",
    "UTS gives a tuition reduction of a quarter to a half for the full length of an eligible undergraduate degree to international students with high entry grades. A matching scheme covers postgraduate coursework.\n\nYou apply separately after receiving a UTS offer, before you accept it. UTS is in central Sydney with strong industry-placement programs, which helps offset living costs through part-time and internship work.",
    "https://www.uts.edu.au/study/international/essential-information/scholarships",
  ],
  [
    "Macquarie University Vice-Chancellor's International Scholarship",
    "macquarie-vice-chancellors-international-scholarship",
    "macquarie-university",
    "AUD 10,000 partial tuition, some full",
    "Any",
    false,
    "Commencing international students in most undergraduate and postgraduate coursework degrees, assessed automatically on academic merit at the point of admission.",
    "Macquarie's standard international merit award applies a partial tuition reduction, commonly around AUD 10,000, automatically to eligible applicants. A smaller number of full and higher-value scholarships in specific faculties require separate applications.\n\nMacquarie sits next to a large corporate and technology precinct in Sydney's north, with its own metro station, so graduate employment and internships are a practical part of the value.",
    "https://www.mq.edu.au/study/admissions-and-entry/scholarships",
  ],
  [
    "Deakin Vice-Chancellor's International Scholarship",
    "deakin-vice-chancellors-international-scholarship",
    "deakin-university",
    "100% tuition",
    "Any",
    true,
    "A small number of exceptional commencing international students in eligible undergraduate and postgraduate coursework degrees. Highly competitive, merit-based.",
    "Deakin's top international award is a full tuition waiver for the whole degree, given to a small number of outstanding applicants each intake. Deakin also runs mid-tier partial scholarships (commonly a quarter of tuition) that are more widely available.\n\nThe full award requires a separate application after your offer and is genuinely selective. If you are not competitive for it, the automatic partial awards still meaningfully reduce cost.",
    "https://www.deakin.edu.au/study/fees-and-scholarships/scholarships",
  ],
  [
    "Curtin International Scholarships",
    "curtin-international-scholarships",
    "curtin-university",
    "25% tuition (Merit), some higher",
    "Any",
    false,
    "Commencing international students at the Perth campus with strong academic results. The Merit scholarship is the main automatic award; faculty and country scholarships sit alongside it.",
    "Curtin's Merit scholarship gives a 25% tuition reduction for the length of an eligible degree, assessed automatically from your admission application. Higher-value and faculty-specific awards, and country-based scholarships, need separate applications.\n\nCurtin's applied-engineering and resources focus reflects the Western Australian economy, and Perth's regional classification adds skilled-migration points on top of the fee saving.",
    "https://scholarships.curtin.edu.au/",
  ],
  [
    "Griffith Remarkable Scholarship",
    "griffith-remarkable-scholarship",
    "griffith-university",
    "50% tuition for the program duration",
    "Any",
    true,
    "Commencing international students in most undergraduate and postgraduate coursework degrees at Griffith, assessed on academic merit and a short written application.",
    "Griffith's flagship international award halves tuition for the full length of an eligible degree. It is one of the more generous widely-available scholarships, and Griffith also offers smaller automatic awards (commonly 20 to 25%).\n\nThe Remarkable Scholarship needs a separate application, including a short statement, submitted after you receive a Griffith offer. Campuses span Brisbane and the Gold Coast, the latter with lower living costs than Sydney or Melbourne.",
    "https://www.griffith.edu.au/scholarships",
  ],
  [
    "La Trobe University Excellence Scholarship",
    "la-trobe-university-excellence-scholarship",
    "la-trobe-university",
    "15% to 30% tuition",
    "Any",
    false,
    "Commencing international students in eligible undergraduate and postgraduate coursework degrees, assessed automatically on entry grades. Regional-campus study can add a further scholarship.",
    "La Trobe applies an automatic tuition reduction, banded by your entry average, across an eligible degree. Students at its regional campuses in Bendigo or Albury-Wodonga can also receive a separate regional scholarship, and those locations carry skilled-migration advantages.\n\nNo separate application for the standard award. La Trobe is less selective than the Group of Eight, which makes the scholarship accessible to a wider range of applicants.",
    "https://www.latrobe.edu.au/scholarships",
  ],
  [
    "QUT International Merit Scholarship",
    "qut-international-merit-scholarship",
    "queensland-university-of-technology",
    "25% tuition, up to 100% for select awards",
    "Any",
    true,
    "Commencing international students with strong academic records entering eligible QUT coursework degrees. A range of awards from partial to full tuition across faculties.",
    "QUT offers international merit scholarships from a 25% tuition reduction up to, in a few faculty-specific cases, the full amount. Most build industry placements into the degree, so the practical value goes beyond the fee saving.\n\nApplications are separate and open after you have a QUT offer, with rounds ahead of each semester. Brisbane's living costs are lower than Sydney's or Melbourne's while still being a state capital.",
    "https://www.qut.edu.au/study/fees-and-scholarships/scholarships",
  ],
  [
    "RMIT International Excellence Scholarship",
    "rmit-international-excellence-scholarship",
    "rmit-university",
    "20% to 50% tuition",
    "Any",
    true,
    "Commencing international students in eligible undergraduate and postgraduate coursework programs at the Melbourne campus, assessed on academic merit.",
    "RMIT's international excellence scholarships reduce tuition by a fifth to a half for the length of an eligible degree, with the larger bands reserved for the strongest applicants. RMIT's design, media, and applied-technology focus and central Melbourne location are the draw.\n\nA separate application is required after your offer. Living in the Melbourne CBD raises costs but gives excellent access to part-time work and transport.",
    "https://www.rmit.edu.au/study-with-us/international-students/apply-to-rmit-international-students/scholarships-for-international-students",
  ],
  [
    "University of Newcastle International Scholarship",
    "university-of-newcastle-international-scholarship",
    "university-of-newcastle",
    "20% tuition, some higher",
    "Any",
    false,
    "Commencing international students in most coursework degrees, assessed automatically on academic merit. Additional country and faculty awards require separate applications.",
    "Newcastle applies an automatic tuition reduction, commonly around 20%, to eligible international students for the length of the degree. The university is strong in medicine and engineering and pioneered problem-based learning in its medical program.\n\nNewcastle is a coastal city two hours north of Sydney with markedly lower living costs, which stretches the scholarship further than the same award would in Sydney.",
    "https://www.newcastle.edu.au/scholarships",
  ],
  [
    "University of Wollongong Vice-Chancellor's International Scholarship",
    "wollongong-vice-chancellors-international-scholarship",
    "university-of-wollongong",
    "30% tuition for the course duration",
    "Any",
    false,
    "Commencing international students in eligible undergraduate and postgraduate coursework degrees, assessed automatically on the merit of the admission application.",
    "UOW's main international award reduces tuition by around 30% for the full degree, applied automatically to eligible applicants. More selective partial and full awards exist for specific regions and disciplines.\n\nWollongong is an hour south of Sydney on the coast, with much lower living costs and strong engineering and computing programs linked to local industry.",
    "https://www.uow.edu.au/study/scholarships/",
  ],
  [
    "Tasmanian International Scholarship (TIS)",
    "tasmanian-international-scholarship",
    "university-of-tasmania",
    "25% tuition for the course duration",
    "Any",
    false,
    "Commencing international students in most coursework degrees at the University of Tasmania, applied automatically. Higher-value awards for specific colleges require applications.",
    "The TIS gives international students a 25% tuition reduction for the length of an eligible degree, automatically. UTAS is the only university in Tasmania, with world-class marine and Antarctic science, and the whole state is classified regional for skilled migration.\n\nThat combination of an automatic fee cut, low living costs in Hobart and Launceston, and strong visa incentives makes Tasmania one of the more cost-effective study destinations in the country.",
    "https://www.utas.edu.au/scholarships",
  ],
  [
    "Western Sydney University International Scholarship",
    "western-sydney-university-international-scholarship",
    "western-sydney-university",
    "AUD 5,000 to full tuition, varies by award",
    "Any",
    true,
    "Commencing international students across undergraduate and postgraduate coursework degrees. A range from partial fee grants to a small number of full Vice-Chancellor's scholarships.",
    "Western Sydney University runs several international scholarships, from partial grants that most strong applicants can access to a small number of highly competitive full Vice-Chancellor's Academic Excellence awards.\n\nMost need a separate application after your offer. The university built its reputation on widening access, with strong support services for first-in-family students, though Sydney living costs still apply across its Greater Western Sydney campuses.",
    "https://www.westernsydney.edu.au/international/study/scholarships",
  ],
  [
    "Bond University International Scholarships",
    "bond-university-international-scholarships",
    "bond-university",
    "25%, 50%, or full tuition",
    "Any",
    true,
    "Commencing international students at Bond, assessed on academic merit and, for higher bands, a written application and interview. Sport and program-specific awards also exist.",
    "Bond, a private university, offers international scholarships from a quarter of tuition up to the full amount for exceptional applicants. Because Bond runs three semesters a year and lets students finish a bachelor degree in two years, a scholarship compounds with the time saved.\n\nThe larger awards require a separate application with a statement and sometimes an interview. Bond charges international and domestic students the same fee and has no subsidised places, so scholarship support matters more here than at a public university.",
    "https://bond.edu.au/international/why-bond/scholarships-international-students",
  ],
];

// Existing Adelaide rows: fill the new public fields (they already have slug,
// name, scope, amount, eligibility, external_url from an earlier pass).
const ADELAIDE_UPDATES = {
  "adelaide-academic-excellence-scholarship": {
    study_level: "Any",
    separate_application: false,
    description:
      "Adelaide University's top automatic entry scholarship for international students, giving a 50% tuition reduction for the standard length of an eligible degree. Awarded on the academic merit of your admission application, with no separate form.\n\nAdelaide counts as a regional area for skilled migration, so the fee saving pairs with extra points toward the 491 and 190 visas, and living costs in Adelaide are well below Sydney or Melbourne.",
  },
  "adelaide-emerging-leaders-award": {
    study_level: "Any",
    separate_application: false,
    description:
      "A 25% tuition reduction for the length of an eligible degree, awarded automatically to international students with strong academic results who fall just below the Academic Excellence band. No separate application is needed.",
  },
  "adelaide-merit-scholarship": {
    study_level: "Any",
    separate_application: false,
    description:
      "A 15% tuition reduction applied automatically for the length of an eligible degree, for international students with solid academic records. It is the most widely awarded of Adelaide's automatic entry scholarships.",
  },
  "adelaide-global-alumni-scholarship": {
    study_level: "Any",
    separate_application: false,
    description:
      "A 10% tuition reduction for international students who, or whose immediate family members, have previously graduated from Adelaide University or one of its predecessor institutions. Applied automatically when the relationship is confirmed.",
  },
  "adelaide-partner-award": {
    study_level: "Any",
    separate_application: false,
    description:
      "A 10% tuition reduction for international students applying through one of Adelaide University's approved partner institutions or agents in their home country. Confirmed through the partner rather than a direct application.",
  },
};

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows: countryRows } = await client.query("select id, code from countries");
  const auId = countryRows.find((r) => r.code === "AU")?.id ?? null;

  const { rows: uniRows } = await client.query("select id, slug from universities");
  const uniIdBySlug = Object.fromEntries(uniRows.map((r) => [r.slug, r.id]));

  async function upsert(row) {
    const cols = Object.keys(row);
    const ph = cols.map((_, i) => `$${i + 1}`);
    const vals = cols.map((c) => row[c]);
    const res = await client.query(
      `insert into scholarships (${cols.join(", ")}, status, last_verified_at)
       values (${ph.join(", ")}, 'published', $${cols.length + 1})
       on conflict (slug) do update set
         ${cols.filter((c) => c !== "slug").map((c) => `${c} = excluded.${c}`).join(", ")},
         status = 'published', last_verified_at = excluded.last_verified_at, updated_at = now()
       returning id`,
      [...vals, TODAY],
    );
    return res.rows[0].id;
  }

  for (const n of NATIONAL) {
    await upsert({ ...n, country_id: auId });
    console.log("national", n.slug);
  }

  for (const [
    name,
    slug,
    uniSlug,
    amount,
    study_level,
    separate_application,
    eligibility,
    description,
    external_url,
  ] of UNI) {
    if (/—/.test(description + eligibility)) throw new Error(`em dash in ${slug}`);
    const id = await upsert({
      name,
      slug,
      scope: "university-specific",
      amount,
      study_level,
      separate_application,
      eligibility,
      description,
      external_url,
      source_url: external_url,
      deadline_date: null,
    });
    const uniId = uniIdBySlug[uniSlug];
    if (!uniId) {
      console.log("  WARN no university", uniSlug);
      continue;
    }
    await client.query(
      `insert into scholarship_universities (scholarship_id, university_id)
       values ($1, $2) on conflict do nothing`,
      [id, uniId],
    );
    console.log("uni", slug, "->", uniSlug);
  }

  for (const [slug, patch] of Object.entries(ADELAIDE_UPDATES)) {
    if (/—/.test(patch.description)) throw new Error(`em dash in ${slug}`);
    await client.query(
      `update scholarships set study_level = $1, separate_application = $2,
        description = $3, last_verified_at = $4, updated_at = now()
       where slug = $5`,
      [patch.study_level, patch.separate_application, patch.description, TODAY, slug],
    );
    console.log("adelaide", slug);
  }

  const { rows: bad } = await client.query(
    "select slug from scholarships where status='published' and (name like '%—%' or description like '%—%' or eligibility like '%—%')",
  );
  console.log(bad.length ? "EM-DASH FOUND" : "em-dash check clean", bad.map((b) => b.slug));

  const { rows: count } = await client.query(
    "select count(*) c, count(description) d from scholarships where status='published'",
  );
  console.log(count[0]);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
