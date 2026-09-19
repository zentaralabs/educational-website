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

const TODAY = "2026-08-31";

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
    // Real, verified: 29 of 31 participating countries (incl. Nepal,
    // Bangladesh) close 30 Apr 2026 1400 AEST for 2027-commencing study;
    // Palau alone runs later (30 Jun 2026). Confirmed 2026-09-13 against
    // dfat.gov.au's own opening-and-closing-dates page.
    deadline_date: "2026-04-30",
    eligibility:
      "Citizens of participating developing countries in Asia, the Pacific, Africa, and the Middle East, applying from their home country. Applicants are assessed on development impact potential as much as academic merit, and must return home for at least two years after finishing.",
    description:
      "Australia Awards are the Australian Government's flagship development scholarships, funded through the foreign aid program. They cover the full cost of study: tuition, return airfares, a contribution to living expenses, an establishment allowance, and Overseas Student Health Cover.\n\nThey are aimed at people from partner countries who will return to contribute to their country's development, so the selection process weighs your professional background and development goals heavily. Fields of study are usually tied to your country's agreed priority areas. Applications open annually through the Australia Awards portal, with country-specific closing dates.",
    external_url: "https://www.dfat.gov.au/people-to-people/australia-awards",
    source_url: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships-opening-and-closing-dates",
  },
  // Destination Australia Scholarships removed 2026-09-13: confirmed via
  // education.gov.au that the program stopped funding new rounds from
  // 1 July 2024 (2024-25 Budget decision). Existing recipients are still
  // supported, but no new applicants are being accepted, so it no longer
  // belongs in the public catalog. The published DB row was archived by a
  // one-off migration rather than left for this array to manage — see
  // memory: scholarship-deadline-research-2026-09-13.
  {
    name: "Research Training Program (RTP) Scholarship",
    slug: "research-training-program-rtp-scholarship",
    scope: "national",
    amount: "Tuition offset plus a stipend around AUD 37,000 per year (2026)",
    study_level: "Research",
    separate_application: true,
    // Verified 2026-09-13: genuinely no single national date. Each
    // university's graduate research school sets its own RTP timeline,
    // usually tied to that university's own admission cycle.
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
    "20% automatic, up to full tuition for the competitive award",
    "Any",
    false,
    "Commencing international undergraduate and postgraduate coursework students from eligible countries. The 20 percent International Student Award is assessed automatically at admission, with shortlisted students invited to submit a short statement. The competitive International Scientia Coursework Scholarship needs a separate application.",
    "UNSW's headline international award is the International Student Award, a 20 percent tuition reduction for the full standard length of your program. It is assessed automatically when you apply, strong candidates may be asked for a brief statement about why they want to study at UNSW, and it can be combined with other UNSW scholarships.\n\nFor a larger amount, the competitive International Scientia Coursework Scholarship is worth full tuition or about AUD 20,000 a year and needs a separate application judged on academic record, leadership, and extracurricular impact. UNSW runs a trimester calendar, so there are three intake cycles a year to plan around.",
    "https://www.unsw.edu.au/study/your-future/international-scholarships",
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
  // FLAGGED 2026-09-13: this row is an umbrella covering several distinct
  // UQ scholarships. Confirmed UQ's automatic-entry awards (International
  // Excellence, International High Achievers, Faculty International) need
  // no application, but the Global Leaders scholarship this row also
  // describes varies by country — automatic for some (e.g. India), a
  // separate form for others (e.g. Europe). The `true`/prose below is
  // wrong for the automatic half and needs splitting into per-scholarship
  // rows to fix properly, not a one-line patch.
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
  // FLAGGED 2026-09-13: like the UQ row above, this is an umbrella entry.
  // Western Sydney's own page says its general "International Scholarships"
  // are automatically assessed with every coursework application, but this
  // row's prose also folds in a "small number of full Vice-Chancellor's
  // scholarships" that may be a separate, more selective, application-based
  // award — not confirmed either way. Needs splitting into per-scholarship
  // rows before the separate_application flag can be trusted.
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
  [
    "Flinders University International Academic Scholarships",
    "flinders-university-international-academic-scholarships",
    "flinders-university",
    "20% to 50% tuition reduction for the length of the course",
    "Any",
    false,
    "Commencing full-fee international students in most coursework degrees, with clinical and research programs excluded. The 20 to 30 percent tiers are assessed automatically on your entry results. The 50 percent Vice-Chancellor Excellence Scholarship needs a separate application, an ATAR near 95 or a postgraduate GPA around 6.5, and a short video from shortlisted candidates.",
    "Flinders runs a tiered set of international academic scholarships. Every eligible commencing student gets at least a 20 percent tuition reduction through the Kickstart award, and stronger entry results move you up to 25 or 30 percent, all assessed automatically when your application is considered.\n\nThe top tier, the Vice-Chancellor Excellence Scholarship, halves tuition for the whole course but needs a separate application. Flinders is in Adelaide, which counts as regional for skilled migration, so the fee saving pairs with extra visa points and living costs well below Sydney or Melbourne.",
    "https://www.flinders.edu.au/international/apply/scholarships/academic",
  ],
  [
    "George Swinburne International Excellence Scholarship",
    "george-swinburne-international-excellence-scholarship",
    "swinburne-university-of-technology",
    "20% or 30% tuition reduction for the standard course duration",
    "Any",
    false,
    "New international students starting an undergraduate or postgraduate coursework degree at Swinburne's Hawthorn campus in Melbourne, assessed automatically on academic merit. Not offered for the Sydney campus or for foundation and English programs.",
    "Swinburne's merit awards for international students cut tuition by 20 percent, or 30 percent for the George Swinburne International Excellence tier, for the full standard length of your course. Both are assessed automatically when you apply for an eligible Hawthorn-campus program, with no separate form.\n\nSwinburne is a technology-focused university in inner Melbourne with strong industry placement links. The award applies to coursework degrees only, so budget the standard fee if you plan to continue into a research degree afterwards.",
    "https://www.swinburne.edu.au/courses/scholarships/international-scholarships/",
  ],
  [
    "CDU Global Merit Scholarship",
    "cdu-global-merit-scholarship",
    "charles-darwin-university",
    "30% tuition reduction on eligible courses",
    "Any",
    false,
    "New international students in eligible vocational, undergraduate, postgraduate coursework, or research courses at Charles Darwin University who meet the academic and English requirements and commence in 2026. Assessed automatically, with the award shown in your letter of offer.",
    "Charles Darwin University's standard international award reduces tuition by 30 percent on eligible courses. There is no application: if you meet the entry criteria, the discount is built into your letter of offer.\n\nCDU is based in Darwin in the Northern Territory, which is classified regional for skilled migration and has some of the lowest living costs of any Australian capital. An automatic fee cut, extra visa points, and cheaper rent together make it one of the more cost-effective options in the country.",
    "https://www.cdu.edu.au/international/how-apply/scholarships",
  ],
  [
    "JCU International Excellence Scholarship",
    "jcu-international-excellence-scholarship",
    "james-cook-university",
    "25% tuition reduction for the length of the degree",
    "Any",
    false,
    "Commencing international students in an approved full undergraduate or postgraduate coursework degree at James Cook University, assessed automatically at admission on academic merit. Government-sponsored and exchange students are not eligible, and you must keep a solid GPA each semester to hold the award.",
    "James Cook University's main coursework award for international students takes 25 percent off tuition for the entire length of an eligible degree. Eligibility is assessed automatically during admission, and the scholarship offer arrives with your course offer.\n\nJCU's campuses are in Townsville and Cairns in tropical North Queensland, both classified regional for skilled migration and much cheaper to live in than the big cities. The university is known for marine biology, environmental science, and tropical medicine.",
    "https://www.jcu.edu.au/scholarships/search/international-excellence-scholarship",
  ],
  [
    "VU Block Model International Scholarship",
    "vu-block-model-international-scholarship",
    "victoria-university",
    "10% to 30% tuition reduction for the standard course duration",
    "Any",
    false,
    "New international students starting a foundation, undergraduate, or postgraduate coursework course at Victoria University's Melbourne campuses in 2026 or 2027. English, VET, and research courses are excluded. Assessed automatically after you apply, with the percentage set by your weighted average mark.",
    "Victoria University's main international award reduces tuition by 10 to 30 percent for the full standard length of your course, with the exact figure based on your academic results. A separate flat 10 percent VU International Scholarship covers students who fall outside the merit bands. Both are assessed automatically when you apply for an eligible course.\n\nVU teaches undergraduate units one at a time through its Block Model, which suits students who prefer to focus on a single subject at a time. The scholarship applies to coursework only.",
    "https://www.vu.edu.au/study-at-vu/fees-scholarships/scholarships/international-scholarships",
  ],
  [
    "Murdoch University International Scholarships",
    "murdoch-university-international-scholarships",
    "murdoch-university",
    "20% or 25% tuition reduction for eligible courses",
    "Any",
    false,
    "New international students from eligible countries commencing an eligible course at Murdoch University's Perth campuses in 2026, assessed automatically at admission with no separate application.",
    "Murdoch runs two automatic international awards: a 20 percent International Welcome Scholarship and a 25 percent International Futures Scholarship, each applied as a tuition reduction on eligible courses. Which one you receive, and which courses qualify, depends on the intake and your country, so confirm the current terms on the scholarship page.\n\nMurdoch is in Perth, Western Australia, which has lower living costs than Sydney or Melbourne and sits on the same time zone as much of Asia. The awards cover coursework degrees.",
    "https://www.murdoch.edu.au/study/scholarship/international-futures-scholarship---2026",
  ],
  [
    "UC International Merit Scholarships",
    "uc-international-merit-scholarships",
    "university-of-canberra",
    "10% to 25% tuition reduction for the length of the course",
    "Any",
    false,
    "New international students commencing an undergraduate or postgraduate coursework degree at the University of Canberra's Bruce campus. All applicants are assessed automatically, with the tier set by academic merit and, for the top band, country of origin.",
    "The University of Canberra assesses every international applicant for its merit scholarships automatically. The standard International Merit award gives 10 percent off total tuition, the High Achiever award 20 percent, and a Course Merit award for students from selected countries reaches 25 percent, each applied for the full length of the course.\n\nCanberra is a compact, planned city with some of the highest median graduate salaries in the country and easy access to public-sector employers. The awards apply to coursework degrees at the Bruce campus.",
    "https://www.canberra.edu.au/scholarship/uc-international-merit",
  ],
  [
    "ECU International Excellence Scholarship",
    "ecu-international-excellence-scholarship",
    "edith-cowan-university",
    "20% tuition reduction for the offered course duration",
    "Any",
    false,
    "International students from selected countries who receive an offer to start a bachelor or master degree at Edith Cowan University in semester one or two of 2026 and can show strong academic results. Assessed automatically by the admissions office, with no essay or interview. Places are limited.",
    "Edith Cowan University's main international award reduces tuition by 20 percent for the offered length of a bachelor or master course. There is no separate application: apply for an eligible ECU degree, meet the criteria, and the admissions office assesses you.\n\nECU is in Perth, Western Australia, and is consistently rated highly for teaching quality and student experience. Places are limited each intake, so apply early.",
    "https://www.ecu.edu.au/scholarships/offers",
  ],
  [
    "CQUniversity International Student Scholarship",
    "cquniversity-international-student-scholarship",
    "cquniversity-australia",
    "15% to 25% tuition reduction for the length of the course",
    "Any",
    false,
    "New international vocational, undergraduate, postgraduate coursework, or research students commencing an eligible course at any CQUniversity campus. Assessed automatically, with no minimum GPA for the base 25 percent International Student Scholarship. A separate International Merit Scholarship pays 15 to 25 percent based on prior results or English proficiency.",
    "CQUniversity's International Student Scholarship gives new students a 25 percent tuition reduction on eligible courses at any campus, assessed automatically with no minimum GPA. A parallel International Merit Scholarship ranges from 15 to 25 percent depending on your academic record.\n\nCQUniversity is one of Australia's largest regional universities, with campuses across Queensland and in several other states, most of them classified regional for skilled migration. Confirm which scholarship applies to your course and campus on the scholarship page.",
    "https://www.cqu.edu.au/study/international/international-scholarships",
  ],
  [
    "ACU Executive Dean's International Scholarship",
    "acu-executive-deans-international-scholarship",
    "australian-catholic-university",
    "10% to 20% tuition reduction per year, by faculty",
    "Any",
    false,
    "Commencing international students who are nationals of one of the eligible countries, which include India, Nepal, Sri Lanka, Bhutan, Vietnam, the Philippines, Indonesia, China and others, with results equivalent to a GPA of 5.5 on ACU's 7-point scale. Study abroad and exchange students are not eligible.",
    "ACU's main merit award for international students reduces annual tuition by 10 to 20 percent depending on your faculty, for the length of an eligible course, with business, law, education and arts at the top of that range.\n\nThere is no separate application. You are assessed for it automatically as part of admission and told the outcome with your offer. It cannot be combined with some other ACU scholarships, so check which award leaves you better off.",
    "https://www.acu.edu.au/study-at-acu/fees-and-scholarships/international-student-scholarships",
  ],
  [
    "Charles Sturt Vice-Chancellor International Excellence Scholarship",
    "charles-sturt-vice-chancellor-international-excellence-scholarship",
    "charles-sturt-university",
    "50% tuition reduction for the course duration",
    "Any",
    true,
    "New commencing international students studying on campus at a Charles Sturt location, in an approved course, with an academic entry score of 80 percent or higher. Not available to continuing or transferring students.",
    "Charles Sturt's flagship international award halves tuition for the whole degree. Charles Sturt teaches at regional New South Wales campuses including Wagga Wagga, Bathurst, Albury-Wodonga, Orange, Dubbo and Port Macquarie, so it also carries the regional study points toward the 190 and 491 visas.\n\nIt needs a separate application after you hold or accept an offer, and it is competitive, weighing community contribution alongside marks. Applications usually close mid-year for the following intake, so confirm the current round on the scholarship page.",
    "https://www.csu.edu.au/scholarships/scholarships-grants/find-scholarship/international/vice-chancellor-international-scholarship",
  ],
  [
    "Federation University Merit Scholarship",
    "federation-university-merit-scholarship",
    "federation-university-australia",
    "20% tuition reduction for the course duration",
    "Any",
    false,
    "Commencing international undergraduate or postgraduate coursework students in the top 25 percent of offer holders from their region. Assessed automatically, with no separate application.",
    "Federation University's Merit Scholarship reduces tuition by 20 percent for the length of an eligible course, awarded automatically to the stronger quarter of international offer holders. Federation also runs a more selective 50 percent Vice-Chancellor award for high-achieving students from South Asia, Southeast Asia and China, which needs a separate application and interview.\n\nFederation's main campuses are in Ballarat and Gippsland in regional Victoria, so studying there adds the regional points toward the 190 and 491 visas. International applicants are considered automatically for its full set of scholarships when they apply.",
    "https://www.federation.edu.au/study/information/international-students/scholarships-for-international-students/",
  ],
  [
    "UNE International Bursary",
    "une-international-bursary",
    "university-of-new-england",
    "20% tuition reduction, renewed yearly on results",
    "Any",
    false,
    "Commencing international students enrolling at the Armidale campus. The bursary continues each year if you keep a GPA of at least 4.5 on a 7-point scale, until the normal end of your course. Assessed on eligibility rather than a competitive application.",
    "The University of New England gives eligible commencing international students a 20 percent reduction on published annual tuition. Unlike a first-year-only award, it renews for each year of your course as long as you keep the required GPA.\n\nUNE is in Armidale in regional New South Wales, a genuinely regional area with low living costs, so the fee saving pairs with the regional study points toward the 190 and 491 visas. In 2026 the bursary is limited to on-campus study at Armidale.",
    "https://www.une.edu.au/international/fees-and-scholarships/scholarships-and-other-financial-support/bursaries",
  ],
  [
    "UniSQ International Student Support Scholarship",
    "unisq-international-student-support-scholarship",
    "university-of-southern-queensland",
    "10% tuition reduction for the course duration",
    "Any",
    false,
    "New international students starting an undergraduate, postgraduate coursework or research award at UniSQ, studying on campus, external or online. Assessed from the information in your admission application, with no separate form.",
    "The University of Southern Queensland applies a 10 percent tuition reduction for the length of an approved course to eligible new international students. It is assessed from your admission application, so there is nothing extra to submit.\n\nUniSQ's Toowoomba and Ipswich campuses are in regional Queensland, which adds the regional study points toward the 190 and 491 visas, and Toowoomba has some of the lowest student living costs of any sizeable Australian city. Applications stay open across all study periods.",
    "https://www.unisq.edu.au/scholarships/unisqi-international-student-support-scholarship-2026",
  ],
  [
    "UniSC International Student Scholarship",
    "unisc-international-student-scholarship",
    "university-of-the-sunshine-coast",
    "15% tuition reduction for commencing international students",
    "Any",
    false,
    "Commencing international students at the University of the Sunshine Coast in 2026. Included automatically in your offer, with no separate application.",
    "The University of the Sunshine Coast builds a 15 percent tuition reduction into the offer for eligible commencing international students. There is nothing to apply for separately.\n\nUniSC's main campus at Sippy Downs and its other South East Queensland campuses are classified regional for skilled migration, so the fee cut comes with the regional study points toward the 190 and 491 visas and lower living costs than Brisbane.",
    "https://www.unisc.edu.au/international/programs-and-fees/international-scholarships",
  ],
  [
    "Torrens University Motivational Scholarship",
    "torrens-university-motivational-scholarship",
    "torrens-university-australia",
    "Up to 25% of total course tuition",
    "Any",
    true,
    "New international students commencing in 2026 from eligible regions including South Asia and the Maldives, Southeast Asia, East Asia, the Middle East, Africa, Bhutan, Mauritius and the Philippines. A limited quota applies each intake.",
    "Torrens University's Motivational Scholarship reduces total course tuition by up to 25 percent for students from a broad list of regions that includes South Asia. Torrens, a private university, also runs a 30 percent scholarship for students starting in an accelerated Trimester 1 intake and a 25 percent business merit scholarship.\n\nThe Motivational Scholarship has limited places and is applied for after you receive a Torrens offer. Torrens campuses are in Sydney, Melbourne, Brisbane and Adelaide, and it charges the same fee to all students with no subsidised places.",
    "https://www.torrens.edu.au/how-to-apply/fees-scholarships/scholarships/international-scholarships/motivational-scholarship",
  ],
  [
    "Sydney Scholars India Scholarship Program",
    "sydney-scholars-india-scholarship-program",
    "university-of-sydney",
    "AUD 10,000 or AUD 20,000 in the first year, or full tuition for two undergraduates",
    "Any",
    true,
    "Commencing students who are citizens of India holding an unconditional offer for an eligible undergraduate or postgraduate coursework degree. Awarded on academic merit, with a small fixed number of each type each year.",
    "A dedicated University of Sydney program for Indian students. Each year it offers two full-tuition undergraduate scholarships for up to four years, ten first-year awards of AUD 20,000, and sixteen first-year awards of AUD 10,000.\n\nIt needs a separate application and is competitive because the numbers are fixed. Sydney's broader international scholarships, some assessed automatically without an application, can usually be held alongside a country scholarship, so most Indian applicants are considered for more than one form of support.",
    "https://www.sydney.edu.au/scholarships/e/sydney-scholars-india-scholarship-program.html",
  ],
  // FLAGGED 2026-09-13, not yet acted on: this scholarship's own dedicated
  // page (the source_url below) now redirects to Deakin's generic
  // international-scholarships hub, and it isn't listed among the hub's
  // current featured scholarships (Vice-Chancellor's International,
  // International Scholarship for Excellence, 20% Merit, College
  // Foundation Pathways, Southeast Asia Priority Bursary). This may mean
  // the program has quietly ended (the PR coverage found for it covers a
  // single "2026" cohort of 6 students) or that it's just between
  // announced rounds — not confident enough either way to archive it
  // without a closer check. Needs verification before the next re-seed.
  [
    "Deakin Vice-Chancellor's Meritorious Scholarship for India",
    "deakin-vice-chancellors-meritorious-scholarship-india",
    "deakin-university",
    "100% tuition for the full course",
    "Any",
    true,
    "Citizens of India commencing an undergraduate or postgraduate degree at Deakin's campuses in Victoria. A small fixed number each year, selected through a multi-stage process on academic record, leadership, and community impact.",
    "Deakin runs a dedicated full-tuition scholarship program for Indian students, active since 2014. Recent intakes have awarded six 100 percent scholarships covering the full duration of study.\n\nSelection is competitive and multi-stage, so a strong academic record alone is not enough. Indian students who are not selected are still assessed for Deakin's broader international scholarships, including automatic partial awards. Deakin's Geelong campuses also count as regional for skilled migration.",
    "https://www.deakin.edu.au/study/fees-and-scholarships/scholarships/find-a-scholarship/deakin-vice-chancellors-meritorious-100-scholarship-india",
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

// 2026-09-13 scholarship-deadline research pass (see memory:
// scholarship-deadline-research-2026-09-13). Two kinds of fix, both
// confirmed against each university's own official page:
//   1. Real, current deadline_date for scholarships that genuinely have one
//      (they had been left null pending this research).
//   2. separate_application corrected from true to false, plus a rewritten
//      description: three scholarships were seeded as requiring a separate
//      application (each with prose saying "you apply separately"), but
//      each university's own dedicated page for that exact scholarship
//      says applicants are automatically assessed when they apply to
//      study — no form, no separate deadline. Left as `true` these would
//      have looked eligible for a deadline that was never coming; as
//      `false` they now get the "tied to your program's application
//      deadline" treatment already shipped for the other ~30 automatic
//      scholarships.
//   UQ International Scholarship and Western Sydney University
//   International Scholarship were NOT included here even though their
//   prose has the same "separate application" claim: both DB rows are
//   umbrella entries covering several distinct real scholarships (UQ:
//   Excellence/High Achievers/Faculty, all automatic, plus the more
//   selective Global Leaders awards, which vary by country and can be
//   automatic or separate-application; Western Sydney: broad grants plus
//   a distinct competitive Vice-Chancellor's award) — flipping one boolean
//   would misrepresent whichever half of the umbrella it doesn't match, so
//   these need a proper split into per-scholarship rows before fixing,
//   not a one-line patch. Flagged inline at their UNI tuples instead.
const SCHOLARSHIP_FIXES = {
  "charles-sturt-vice-chancellor-international-excellence-scholarship": {
    deadline_date: "2026-06-30",
  },
  "sydney-scholars-india-scholarship-program": {
    deadline_date: "2026-05-24",
  },
  "monash-international-merit-scholarship": {
    separate_application: false,
    description:
      "Monash's broad merit award for international students, paid at AUD 15,000 a year for each full year of study until you reach the credit points your degree requires. It is one of the more widely available flagship scholarships because it is not capped at a handful of recipients.\n\nNo application is required. If you receive an unconditional undergraduate course offer from Monash, you are automatically considered. It cannot usually be combined with other Monash scholarships, so check which award you are better off taking.",
  },
  "qut-international-merit-scholarship": {
    separate_application: false,
    description:
      "QUT offers international merit scholarships from a 25% tuition reduction up to, in a few faculty-specific cases, the full amount. Most build industry placements into the degree, so the practical value goes beyond the fee saving.\n\nYou do not need to apply. QUT assesses your qualifications when you apply to study and lets you know if you meet the criteria, with the scholarship offer arriving alongside your admission offer. Brisbane's living costs are lower than Sydney's or Melbourne's while still being a state capital.",
  },
  "uts-international-undergraduate-academic-excellence-scholarship": {
    separate_application: false,
    description:
      "UTS gives a tuition reduction of a quarter to a half for the full length of an eligible undergraduate degree to international students with high entry grades. A matching scheme covers postgraduate coursework.\n\nNo separate application is needed: you are automatically assessed for this scholarship when you apply to study at UTS, unless a specific scholarship says otherwise. UTS is in central Sydney with strong industry-placement programs, which helps offset living costs through part-time and internship work.",
  },
};

// 2026-09-13 content-depth pass (a site audit flagged ~47 scholarship pages
// at 181-198 words, below a 300-word floor). Each entry here appends one
// genuinely researched paragraph — selection mechanics, timing, renewal
// conditions, or a publicly stated award count/value — to the description
// already set above by NATIONAL/UNI/ADELAIDE_UPDATES/SCHOLARSHIP_FIXES.
// Researched by 5 parallel agents fetching each scholarship's own official
// page (or, where that page blocked automated fetches, cross-checking
// search results against the same official domain). No amount, deadline,
// or eligibility field is touched here even where research surfaced a
// likely discrepancy — those are flagged separately for manual review
// rather than auto-applied, per this project's no-invented-facts rule.
// Slugs not listed here had nothing genuine to add beyond the existing
// description: their official page simply doesn't publish more (e.g.
// Adelaide's four smaller automatic-entry awards, Federation, Swinburne).
const SCHOLARSHIP_DEPTH_2026_09_13 = {
  "acu-executive-deans-international-scholarship": {
    description: "ACU's main merit award for international students reduces annual tuition by 10 to 20 percent depending on your faculty, for the length of an eligible course, with business, law, education and arts at the top of that range.\n\nThere is no separate application. You are assessed for it automatically as part of admission and told the outcome with your offer. It cannot be combined with some other ACU scholarships, so check which award leaves you better off.\n\nTo keep the discount for the full course, you need to stay continuously enrolled full time and keep tuition payments current, ACU can withdraw it if enrolment lapses or a semester is deferred. The eligible-nationality list is longer than a summary suggests, it also covers Cambodia, Hong Kong, Kenya, Malaysia, Nigeria, South Korea and Taiwan alongside the countries already named. Selection is purely on the GPA 5.5 threshold from your prior academic record, there is no essay, interview or separate ranked competition.",
  },
  "adelaide-academic-excellence-scholarship": {
    description: "Adelaide University's top automatic entry scholarship for international students, giving a 50% tuition reduction for the standard length of an eligible degree. Awarded on the academic merit of your admission application, with no separate form.\n\nAdelaide counts as a regional area for skilled migration, so the fee saving pairs with extra points toward the 491 and 190 visas, and living costs in Adelaide are well below Sydney or Melbourne.\n\nUnlike Adelaide's other automatic-entry awards, the Academic Excellence Scholarship requires completing a separate application form rather than being granted purely on your admission result, and the university describes only a limited number of places as available each year. No minimum WAM or percentile figure is published, high distinction average is the only stated bar.",
  },
  "anu-chancellors-international-scholarship": {
    description: "ANU's automatic merit scholarship for international students. It reduces tuition by a quarter or a half for the full duration of the degree, not just the first year, which makes it more valuable over time than a first-year-only award of the same headline rate.\n\nNo separate application. Every eligible applicant is considered when their admission is assessed, and the offer, if made, comes with or shortly after the admission offer. ANU also runs more selective full scholarships that do require applications.\n\nYou can only hold this scholarship once at a given study level, so a student who received it for an undergraduate degree cannot claim it again for a later postgraduate degree at ANU. Recipients who need to complete part of the course onshore must meet that condition to keep the award, and instead of the standard tuition deposit shown on the offer letter, scholarship holders pay a reduced deposit of AUD 10,000 to confirm enrolment.",
  },
  "australia-awards-scholarships": {
    description: "Australia Awards are the Australian Government's flagship development scholarships, funded through the foreign aid program. They cover the full cost of study: tuition, return airfares, a contribution to living expenses, an establishment allowance, and Overseas Student Health Cover.\n\nThey are aimed at people from partner countries who will return to contribute to their country's development, so the selection process weighs your professional background and development goals heavily. Fields of study are usually tied to your country's agreed priority areas. Applications open annually through the Australia Awards portal, with country-specific closing dates.\n\nFor the 2027 intake the application window closes on 30 April 2026 at 2pm AEST, a hard cut-off rather than a rolling date. DFAT has published that it offered around 1,551 long-term Australia Awards Scholarships across 55 partner countries for the 2025 intake, giving a sense of scale even though country-by-country quotas are not made public. Selection panels weigh your leadership record and development impact alongside academic results, and the two-year return-home condition is contractual, not just advisory.",
  },
  "bond-university-international-scholarships": {
    description: "Bond, a private university, offers international scholarships from a quarter of tuition up to the full amount for exceptional applicants. Because Bond runs three semesters a year and lets students finish a bachelor degree in two years, a scholarship compounds with the time saved.\n\nThe larger awards require a separate application with a statement and sometimes an interview. Bond charges international and domestic students the same fee and has no subsidised places, so scholarship support matters more here than at a public university.\n\nThe 25% award (International Stand Out Scholarship) needs an ATAR equivalent of 90 or an IB score of 32+ and is assessed automatically at the time of your program application, with no separate form. The 50% award (International Undergraduate Excellence Scholarship) sets a higher bar of ATAR 95 or IB 38+, excludes the Bond Medical Program, and does need its own application submitted to international@bond.edu.au after you already hold a program offer, by a closing date tied to your chosen semester. Neither publishes how many are awarded each round.",
  },
  "cdu-global-merit-scholarship": {
    description: "Charles Darwin University's standard international award reduces tuition by 30 percent on eligible courses. There is no application: if you meet the entry criteria, the discount is built into your letter of offer.\n\nCDU is based in Darwin in the Northern Territory, which is classified regional for skilled migration and has some of the lowest living costs of any Australian capital. An automatic fee cut, extra visa points, and cheaper rent together make it one of the more cost-effective options in the country.\n\nCDU's official scholarship page confirms the award is automatic, with no application, essay, or interview, based purely on meeting the academic and English entry requirements for an eligible course. The offer must be accepted in time to commence in the relevant intake, and successful completion of your most recent prior studies is required. The page does not publish a minimum GPA threshold, a cap on how many students receive the discount each year, or a total value disbursed, and it does not state whether the reduction carries over automatically into later years of a multi-year course or needs reconfirming each year.",
  },
  "charles-sturt-vice-chancellor-international-excellence-scholarship": {
    description: "Charles Sturt's flagship international award halves tuition for the whole degree. Charles Sturt teaches at regional New South Wales campuses including Wagga Wagga, Bathurst, Albury-Wodonga, Orange, Dubbo and Port Macquarie, so it also carries the regional study points toward the 190 and 491 visas.\n\nIt needs a separate application after you hold or accept an offer, and it is competitive, weighing community contribution alongside marks. Applications usually close mid-year for the following intake, so confirm the current round on the scholarship page.\n\nBeyond the 80 percent entry-score threshold, Charles Sturt asks shortlisted applicants for a personal statement covering community involvement, leadership roles, and how those experiences reflect the university's values, so the selection weighs more than transcripts. It is genuinely competitive: reporting on a past round found only three scholarships awarded from ten shortlisted applicants out of roughly 70 total applications, illustrating how few offers convert into awards. Charles Sturt does not publish a fixed number of places in its own guidelines, so that ratio should be read as an indicative example rather than a guaranteed rate.",
  },
  "deakin-vice-chancellors-international-scholarship": {
    description: "Deakin's top international award is a full tuition waiver for the whole degree, given to a small number of outstanding applicants each intake. Deakin also runs mid-tier partial scholarships (commonly a quarter of tuition) that are more widely available.\n\nThe full award requires a separate application after your offer and is genuinely selective. If you are not competitive for it, the automatic partial awards still meaningfully reduce cost.\n\nApplicants for Deakin's full-tuition Vice-Chancellor's International Scholarship submit a 300 word personal statement, two referee letters, academic transcripts, and evidence of extracurricular activity or work experience alongside their course application, so the selection looks past grades to leadership and community involvement. Scholarships are assessed on a rolling basis ahead of each trimester rather than on one fixed annual date, and only a small, unpublished number of awards are made each round, making it one of the more competitive scholarships on the site.",
  },
  "deakin-vice-chancellors-meritorious-scholarship-india": {
    description: "Deakin runs a dedicated full-tuition scholarship program for Indian students, active since 2014. Recent intakes have awarded six 100 percent scholarships covering the full duration of study.\n\nSelection is competitive and multi-stage, so a strong academic record alone is not enough. Indian students who are not selected are still assessed for Deakin's broader international scholarships, including automatic partial awards. Deakin's Geelong campuses also count as regional for skilled migration.\n\nIn its most recent published round, Deakin confirmed six full scholarships awarded to Indian students, each valued at over INR 6 million and covering the whole degree. Selection runs through application review, referee endorsement, and an interview, ending in a live presentation before a panel of academic and industry figures, alongside assessment of academic performance, co-curricular achievement, leadership, and global outlook. There is no separate form to fill in: every applicant to an eligible Deakin course in Victoria is automatically considered, though the application must be lodged through an authorised Deakin agent in India.",
  },
  "ecu-international-excellence-scholarship": {
    description: "Edith Cowan University's main international award reduces tuition by 20 percent for the offered length of a bachelor or master course. There is no separate application: apply for an eligible ECU degree, meet the criteria, and the admissions office assesses you.\n\nECU is in Perth, Western Australia, and is consistently rated highly for teaching quality and student experience. Places are limited each intake, so apply early.\n\nTo keep the scholarship for the whole course, recipients must stay in continuous good academic and financial standing, enrol full-time at 60 credit points each study period, and not defer for more than one semester without ECU's approval, so it is renewable but conditional rather than a one-off payment. Which countries qualify has changed between intakes: 2025 enrolments included India, Pakistan, Nepal and Kenya, while the 2026 round narrowed eligibility to India and Pakistan, so applicants from other countries should check the current year's list rather than assume past eligibility still applies.",
  },
  "flinders-university-international-academic-scholarships": {
    description: "Flinders runs a tiered set of international academic scholarships. Every eligible commencing student gets at least a 20 percent tuition reduction through the Kickstart award, and stronger entry results move you up to 25 or 30 percent, all assessed automatically when your application is considered.\n\nThe top tier, the Vice-Chancellor Excellence Scholarship, halves tuition for the whole course but needs a separate application. Flinders is in Adelaide, which counts as regional for skilled migration, so the fee saving pairs with extra visa points and living costs well below Sydney or Melbourne.\n\nFlinders' tiered structure is more granular than a flat 20 to 50 percent range: the Global Excellence Scholarship pays 25 percent for an ATAR of 70 to 79.95 (or GPA 5.5+) and 30 percent for an ATAR of 80+ (or GPA 6+), sitting between the 20 percent Kickstart award and the 50 percent Vice-Chancellor Excellence Scholarship, which requires an ATAR near 95 or postgraduate GPA around 6.5. Vice-Chancellor Excellence recipients must also join the Flinders International Ambassador Program as a condition of the award. All tiers exclude clinical and graduate-research courses, and most postgraduate professional programs are excluded from Global Excellence specifically.",
  },
  "griffith-remarkable-scholarship": {
    description: "Griffith's flagship international award halves tuition for the full length of an eligible degree. It is one of the more generous widely-available scholarships, and Griffith also offers smaller automatic awards (commonly 20 to 25%).\n\nThe Remarkable Scholarship needs a separate application, including a short statement, submitted after you receive a Griffith offer. Campuses span Brisbane and the Gold Coast, the latter with lower living costs than Sydney or Melbourne.\n\nGriffith sets a minimum cumulative GPA of 5.5 on its 7.0 point scale for the Remarkable Scholarship, both to be offered the award and to keep the 50 percent tuition reduction each trimester afterward. Applicants submit academic records and a personal statement, which a university panel reviews, so it is a ranked competition rather than an automatic top-up. Because the number of awards offered each intake is limited and varies year to year, apply as soon as you have a Griffith offer rather than waiting.",
  },
  "jcu-international-excellence-scholarship": {
    description: "James Cook University's main coursework award for international students takes 25 percent off tuition for the entire length of an eligible degree. Eligibility is assessed automatically during admission, and the scholarship offer arrives with your course offer.\n\nJCU's campuses are in Townsville and Cairns in tropical North Queensland, both classified regional for skilled migration and much cheaper to live in than the big cities. The university is known for marine biology, environmental science, and tropical medicine.\n\nJCU's official scholarship listing names the specific groups excluded beyond general government sponsorship: Australia Awards recipients, Saudi Arabian Cultural Mission (SACM) sponsored students, students transferring in from joint programs, and study abroad or exchange students. The university does not publish the exact GPA figure you must maintain each semester to keep the award, only that a strong result is required, so confirm the current threshold with JCU directly before relying on it for budgeting.",
  },
  "macquarie-vice-chancellors-international-scholarship": {
    description: "Macquarie's standard international merit award applies a partial tuition reduction, commonly around AUD 10,000, automatically to eligible applicants. A smaller number of full and higher-value scholarships in specific faculties require separate applications.\n\nMacquarie sits next to a large corporate and technology precinct in Sydney's north, with its own metro station, so graduate employment and internships are a practical part of the value.\n\nMacquarie's published entry bar for this award is a minimum ATAR equivalent of 85 for undergraduate applicants and a minimum WAM equivalent of 65 for postgraduate applicants. Rather than a single annual round, offers are made progressively through the year as applications come in, so early admission can improve your chances before a given intake's places are used up. It is assessed automatically alongside your course application, with no separate scholarship form to submit.",
  },
  "melbourne-international-undergraduate-scholarship": {
    description: "The University of Melbourne's main entry scholarship for international bachelor students. It reduces first-year tuition by a quarter, a half, or in a small number of cases the full amount, and around 110 are awarded each year.\n\nThere is no separate form. Every eligible applicant with an unconditional undergraduate offer is automatically assessed on merit. Because it only applies to the first year, factor the standard fee into your budget for years two and three.\n\nThe University of Melbourne awards roughly 110 of these scholarships a year, and eligibility is restricted to citizens of countries with a World Bank GDP per capita of US 10,000 dollars or less, on top of the course and regional quotas. Melbourne has flagged a change from 2027 onward, expanding to around 225 scholarships but at a flat 20 percent tuition sponsorship rather than today's tiered 25/50/100 percent structure, so a 2027-entry applicant should check the current terms rather than assume today's tiers still apply.",
  },
  "monash-international-merit-scholarship": {
    description: "Monash's broad merit award for international students, paid at AUD 15,000 a year for each full year of study until you reach the credit points your degree requires. It is one of the more widely available flagship scholarships because it is not capped at a handful of recipients.\n\nNo application is required. If you receive an unconditional undergraduate course offer from Monash, you are automatically considered. It cannot usually be combined with other Monash scholarships, so check which award you are better off taking.\n\nTo keep the scholarship each semester, Monash requires a distinction average, 70 percent or above, in your previous study period. It is not available to students completing Australian Year 12, to Bachelor of Medicine/Surgery or Medicine and Surgery Doctor entrants, to students coming through a Monash Pathway program such as Monash College or Monash University Foundation Year, or to students transferring from another Monash campus or another Australian university. You need a full, unconditional offer for a full-time degree at an Australian Monash campus to be considered.",
  },
  "murdoch-university-international-scholarships": {
    description: "Murdoch runs two automatic international awards: a 20 percent International Welcome Scholarship and a 25 percent International Futures Scholarship, each applied as a tuition reduction on eligible courses. Which one you receive, and which courses qualify, depends on the intake and your country, so confirm the current terms on the scholarship page.\n\nMurdoch is in Perth, Western Australia, which has lower living costs than Sydney or Melbourne and sits on the same time zone as much of Asia. The awards cover coursework degrees.\n\nThe International Futures Scholarship (25%) for 2026 is tied to a defined application window, opening 27 March 2026 and closing 30 September 2026, and it only covers ten named degrees including the Bachelor of Business, Bachelor of Engineering Honours, Bachelor of Psychology, Bachelor of Data Analytics, Bachelor of Agricultural Science, and several Master's programs, rather than all Murdoch courses. It cannot be combined with any other Murdoch scholarship, and once awarded the reduction is deducted automatically from tuition each teaching period rather than paid as a lump sum.",
  },
  "qut-international-merit-scholarship": {
    description: "QUT offers international merit scholarships from a 25% tuition reduction up to, in a few faculty-specific cases, the full amount. Most build industry placements into the degree, so the practical value goes beyond the fee saving.\n\nYou do not need to apply. QUT assesses your qualifications when you apply to study and lets you know if you meet the criteria, with the scholarship offer arriving alongside your admission offer. Brisbane's living costs are lower than Sydney's or Melbourne's while still being a state capital.\n\nQUT guarantees the 25 percent reduction for your first two semesters, then extends it each following semester only if you maintain a minimum GPA of 5.5 on QUT's 7.0 scale. No application is needed, eligibility and the renewal check are both assessed automatically from your academic record, so there is no essay, interview, or separate scholarship form at any point.",
  },
  "research-training-program-rtp-scholarship": {
    description: "The RTP is how the Australian Government funds most higher-degree research students. Universities receive a block grant and award it as some combination of three things: a full tuition-fee offset, a living stipend (the 2026 full-time rate is about AUD 37,010 a year, tax-free), and allowances for relocation, thesis costs, or health cover.\n\nInternational and domestic students compete in the same pool. The stipend runs for up to three years for a PhD, the fee offset up to four. You apply through your chosen university's graduate research school, not the government, usually alongside or just after your admission application. Individual universities top up the base rate to varying degrees.\n\nPlaces are allocated by each university's own selection panels, which rank applicants on prior academic results and research potential rather than through one national competition, so exact thresholds vary by faculty and institution. The government sets how many funded international places are released each year, and that number rose to 4,200 in 2026 from 3,950 in 2025, alongside a separate domestic allocation. Because funding arrives as a block grant, universities also differ in panel composition, top-up amounts and whether an interview or written proposal review is used, so applicants should confirm the process with their specific graduate research school.",
  },
  "sydney-scholars-india-scholarship-program": {
    description: "A dedicated University of Sydney program for Indian students. Each year it offers two full-tuition undergraduate scholarships for up to four years, ten first-year awards of AUD 20,000, and sixteen first-year awards of AUD 10,000.\n\nIt needs a separate application and is competitive because the numbers are fixed. Sydney's broader international scholarships, some assessed automatically without an application, can usually be held alongside a country scholarship, so most Indian applicants are considered for more than one form of support.\n\nSelection is made by a committee under the Associate Vice-President Sydney Future Students, weighing academic merit, a personal statement, and the strength of the admission application itself, not academic results alone. For the 2026 cycle applications run from 1 April to 24 May. Recipients must accept their unconditional offer by the deadline tied to their scholarship round or the offer is rescinded, and to keep receiving payments they must maintain a semester average mark of at least 65 with no outstanding fees, with the full-tuition award paid across up to four years and the smaller awards paid in semester instalments.",
  },
  "sydney-vice-chancellors-international-scholarships-scheme": {
    description: "The University of Sydney's headline international award, lifted to AUD 60,000 for 2026. It is applied as a tuition reduction across the degree.\n\nThere is no form to complete. Hold an unconditional offer by a round deadline and you are automatically considered on merit. Some students, particularly from India, can hold it alongside a country-specific Sydney scholarship, effectively stacking the support.\n\nSydney runs the scheme across five value tiers, AUD 60,000, 40,000, 20,000, 10,000 and 5,000, assessed by a three-person committee from Sydney Future Students and Admissions on the strength of the admission application. It is awarded only once, in a student's first year, and is not renewed in later years, though students receiving the award in two instalments must keep a semester average mark of at least 65 with no outstanding fees to receive the second payment. Applications are matched to specific round deadlines across the year rather than a single annual cutoff, so the exact deadline depends on which intake and round a student's offer falls into.",
  },
  "tasmanian-international-scholarship": {
    description: "The TIS gives international students a 25% tuition reduction for the length of an eligible degree, automatically. UTAS is the only university in Tasmania, with world-class marine and Antarctic science, and the whole state is classified regional for skilled migration.\n\nThat combination of an automatic fee cut, low living costs in Hobart and Launceston, and strong visa incentives makes Tasmania one of the more cost-effective study destinations in the country.\n\nEligible applications are forwarded automatically to the relevant school, institute or college, which ranks them and assesses eligibility, so the 25 percent reduction is not a fixed entitlement but depends on that internal ranking. As a general guide the university looks for the equivalent of a B+ average or higher, though the exact bar depends on the course and the applicant's home grading system, assessed case by case by an admissions officer. The reduction runs for the full course provided the student keeps satisfactory grades, and it is offered to new commencing students only, continuing students cannot apply or be reassessed into it partway through their course.",
  },
  "torrens-university-motivational-scholarship": {
    description: "Torrens University's Motivational Scholarship reduces total course tuition by up to 25 percent for students from a broad list of regions that includes South Asia. Torrens, a private university, also runs a 30 percent scholarship for students starting in an accelerated Trimester 1 intake and a 25 percent business merit scholarship.\n\nThe Motivational Scholarship has limited places and is applied for after you receive a Torrens offer. Torrens campuses are in Sydney, Melbourne, Brisbane and Adelaide, and it charges the same fee to all students with no subsidised places.\n\nApplications are assessed on a rolling basis per intake rather than against a fixed deadline, and applicants must submit a separate International Student Scholarship form for review rather than being considered automatically. To keep the scholarship a student must maintain a full-time load of one EFTSL over each 12-month study period, and the discount only applies to first-attempt subjects, a repeated or failed subject is charged at the full fee. It excludes Blue Mountains International Hotel Management School courses, so students in that school are not eligible even if they otherwise fit the regional eligibility list.",
  },
  "uc-international-merit-scholarships": {
    description: "The University of Canberra assesses every international applicant for its merit scholarships automatically. The standard International Merit award gives 10 percent off total tuition, the High Achiever award 20 percent, and a Course Merit award for students from selected countries reaches 25 percent, each applied for the full length of the course.\n\nCanberra is a compact, planned city with some of the highest median graduate salaries in the country and easy access to public-sector employers. The awards apply to coursework degrees at the Bruce campus.\n\nThe three tiers require different academic bars: the standard International Merit award (10 percent) and the higher High Achiever award (20 percent) are based on general academic merit, while the top Course Merit award (25 percent) is restricted to applicants from a specific list of countries including India, Nepal, Bangladesh, Pakistan, Sri Lanka, Bhutan, Vietnam, the Philippines, Kenya, Nigeria, Mauritius, Indonesia, South Korea, Japan and countries in Latin America. Typical thresholds cited are a GPA of 5 out of 7, or around 70 percent or higher for a bachelor's degree and around 65 percent or higher for a master's.",
  },
  "une-international-bursary": {
    description: "The University of New England gives eligible commencing international students a 20 percent reduction on published annual tuition. Unlike a first-year-only award, it renews for each year of your course as long as you keep the required GPA.\n\nUNE is in Armidale in regional New South Wales, a genuinely regional area with low living costs, so the fee saving pairs with the regional study points toward the 190 and 491 visas. In 2026 the bursary is limited to on-campus study at Armidale.\n\nThe GPA check happens at the end of each academic year, a student who drops below the 4.5 GPA threshold at that point loses the bursary for the following year rather than being reassessed mid-year. The bursary cannot be deferred, transferred to another student, or paid out as cash, and it applies to tuition fees only. If a student withdraws or transfers out of UNE before completing their course, the bursary is forfeited rather than carried over or refunded in any form.",
  },
  "unisc-international-student-scholarship": {
    description: "The University of the Sunshine Coast builds a 15 percent tuition reduction into the offer for eligible commencing international students. There is nothing to apply for separately.\n\nUniSC's main campus at Sippy Downs and its other South East Queensland campuses are classified regional for skilled migration, so the fee cut comes with the regional study points toward the 190 and 491 visas and lower living costs than Brisbane.\n\nThe reduction is applied directly to a student's account after they accept their offer and before each teaching period's fee due date, rather than being paid out separately. It cannot be combined with any other UniSC international scholarship or tuition reduction, so students who qualify for a different award need to pick one. To keep the discount for the whole program a student must remain classified as an international student throughout, and the offer cannot be deferred to start after 2026.",
  },
  "unisq-international-student-support-scholarship": {
    description: "The University of Southern Queensland applies a 10 percent tuition reduction for the length of an approved course to eligible new international students. It is assessed from your admission application, so there is nothing extra to submit.\n\nUniSQ's Toowoomba and Ipswich campuses are in regional Queensland, which adds the regional study points toward the 190 and 491 visas, and Toowoomba has some of the lowest student living costs of any sizeable Australian city. Applications stay open across all study periods.\n\nUniSQ excludes students already holding another UniSQ tuition scholarship, most sponsored students (an exception applies for NGO or low and middle income country sponsorship), and anyone studying through an offshore partner institution. Applicants also need to meet UniSQ's standard academic and English language entry requirements, and on campus students must secure their student visa. The reduction is confirmed once you hold a formal Offer Letter, so there is no separate scholarship form or interview stage to complete.",
  },
  "university-of-newcastle-international-scholarship": {
    description: "Newcastle applies an automatic tuition reduction, commonly around 20%, to eligible international students for the length of the degree. The university is strong in medicine and engineering and pioneered problem-based learning in its medical program.\n\nNewcastle is a coastal city two hours north of Sydney with markedly lower living costs, which stretches the scholarship further than the same award would in Sydney.\n\nNewcastle brands this the International Excellence Scholarship and calculates it as 20 percent of the gross international tuition fee across a standard full-time load of 80 units, so the dollar value depends on your program's unit costs. It is assessed automatically with your admission application, and the confirmed value appears in your Letter of Offer rather than a separate scholarship notice. Newcastle advises students to pay each term's tuition minus the expected scholarship amount by the due date rather than waiting for confirmation.",
  },
  "wollongong-vice-chancellors-international-scholarship": {
    description: "UOW's main international award reduces tuition by around 30% for the full degree, applied automatically to eligible applicants. More selective partial and full awards exist for specific regions and disciplines.\n\nWollongong is an hour south of Sydney on the coast, with much lower living costs and strong engineering and computing programs linked to local industry.\n\nUOW's current 30 percent international award is published under the name University Excellence Scholarship rather than Vice-Chancellor's International Scholarship, and it excludes Medicine and Surgery, Nursing, the Nutrition and Exercise Science streams, Social Work, and Psychology degrees. Separately, UOW's actual Vice-Chancellor's Leadership Scholarship covers 100 percent of tuition for the full undergraduate degree, with a 50 percent Vice-Chancellor's Leadership Scholarship specifically for Indian and Pakistani applicants.",
  },
  "unsw-international-scholarships": {
    description: "UNSW's headline international award is the International Student Award, a 20 percent tuition reduction for the full standard length of your program. It is assessed automatically when you apply, strong candidates may be asked for a brief statement about why they want to study at UNSW, and it can be combined with other UNSW scholarships.\n\nFor a larger amount, the competitive International Scientia Coursework Scholarship is worth full tuition or about AUD 20,000 a year and needs a separate application judged on academic record, leadership, and extracurricular impact. UNSW runs a trimester calendar, so there are three intake cycles a year to plan around.\n\nUNSW currently limits the automatic International Student Award to students commencing in 2026 or 2027, so it is tied to a specific commencement window rather than being open ended. The competitive International Scientia Coursework Scholarship weighs leadership shown at school, work or in the community alongside sporting, cultural, volunteering or work experience activities, not just grades, and recipients get invitations to exclusive networking events plus guaranteed entry to UNSW's Professional Development Program.",
  },
  "uts-international-undergraduate-academic-excellence-scholarship": {
    description: "UTS gives a tuition reduction of a quarter to a half for the full length of an eligible undergraduate degree to international students with high entry grades. A matching scheme covers postgraduate coursework.\n\nNo separate application is needed: you are automatically assessed for this scholarship when you apply to study at UTS, unless a specific scholarship says otherwise. UTS is in central Sydney with strong industry-placement programs, which helps offset living costs through part-time and internship work.\n\nUTS runs this scholarship automatically, assessing every commencing international undergraduate application without a separate scholarship form, based on your ATAR or a comparable Australian Year 12 equivalent result rather than an interview or essay. Search of UTS's own site indicates the award has more recently sat at 30 percent for new intakes rather than a 25 to 50 percent range, and a separate 50 percent scholarship exists specifically for GCE A Level and International Baccalaureate applicants, which may be the source of the higher figure in this row.",
  },
  "uwa-global-excellence-scholarship": {
    description: "UWA's automatic merit scholarship for international students. The value is banded: a higher weighted average at entry moves you into a larger tuition reduction, applied across the degree.\n\nNo separate application is needed for the standard bands. Perth also counts as a regional area for skilled migration, so a UWA scholarship pairs with extra points toward the 190 and 491 visas.\n\nUWA's official page states the award as a straight percentage rather than a fixed dollar figure: an ATAR of 85 gives 10 percent off tuition and an ATAR of 90 gives 20 percent for undergraduates, while postgraduate applicants need a WAM of 65 for 10 percent or 75 for 20 percent. It is assessed automatically once your final transcripts are submitted with your application, needs no separate form, and cannot be held together with any other UWA tuition fee reduction or scholarship.",
  },
  "vu-block-model-international-scholarship": {
    description: "Victoria University's main international award reduces tuition by 10 to 30 percent for the full standard length of your course, with the exact figure based on your academic results. A separate flat 10 percent VU International Scholarship covers students who fall outside the merit bands. Both are assessed automatically when you apply for an eligible course.\n\nVU teaches undergraduate units one at a time through its Block Model, which suits students who prefer to focus on a single subject at a time. The scholarship applies to coursework only.\n\nVU reassesses this scholarship every year rather than locking in the percentage at enrolment: you need to complete 96 credit points in the year and hit a WAM of 50 to hold 10 percent, 70 for 20 percent, or 80 for 30 percent, with the reassessment finalised within a week of your official results being released. This annual pattern continues for the full standard length of the course, not just the first year.",
  },
  "western-sydney-university-international-scholarship": {
    description: "Western Sydney University runs several international scholarships, from partial grants that most strong applicants can access to a small number of highly competitive full Vice-Chancellor's Academic Excellence awards.\n\nMost need a separate application after your offer. The university built its reputation on widening access, with strong support services for first-in-family students, though Sydney living costs still apply across its Greater Western Sydney campuses.\n\nOne of Western Sydney University's automatic-entry awards, described on its site as the UG International Merit Based Scholarship, covers 50 percent of tuition per session for up to three years and needs a minimum ATAR of 90. Shortlisted candidates are asked for a written statement on how the scholarship would support their studies and career goals, and a selection panel reviews applications twice a year. Only a limited number are offered each session, and the university tells students to accept as soon as they receive their offer letter.",
  },
};

// 2026-09-13: four DB rows were flagged during the depth-research pass as
// pointing at a scholarship that no longer exists under that name/URL, not
// just thin on content. Live-browser-verified (not just automated fetch)
// against each university's own current scholarships site:
//   - rmit-international-excellence-scholarship: RMIT's external_url 404s.
//     RMIT no longer runs one "International Excellence Scholarship" — it
//     now runs several distinctly named awards. Retargeted at the Future
//     Leaders Scholarship (the best fit for this site's Nepal/India/
//     Bangladesh audience, and one of RMIT's most widely awarded: 3,750 of
//     RMIT's 4,616 international scholarships in 2025).
//   - uq-international-scholarship: external_url 404s. Retargeted at the
//     real "UQ International Excellence Scholarship" page. Also fixes
//     separate_application, which was wrong (true) — the real scholarship
//     is automatic, no separate form.
//   - la-trobe-university-excellence-scholarship: external_url 404s. No
//     scholarship exists under this exact name; La Trobe's real broad
//     merit award for international students is the "La Trobe High
//     Achiever Scholarship" (verified open, current 2026/2027 intakes).
//   - curtin-international-scholarships: external_url loads but there is
//     no scholarship called "Curtin International Scholarships" on it —
//     Curtin's real broad merit award is the "Curtin Global Merit
//     Scholarship". external_url points at Curtin's evergreen scholarships
//     hub rather than a single round's page (Curtin scholarships run in
//     dated rounds and this one's most recent round has closed).
// Slugs are kept unchanged to avoid breaking any existing inbound link to
// these URLs — only the name/amount/eligibility/description/URLs/
// separate_application fields change.
const SCHOLARSHIP_CORRECTIONS_2026_09_13 = {
  "rmit-international-excellence-scholarship": {
    name: "RMIT Future Leaders Scholarship",
    amount: "20% tuition fee reduction for the duration of the program",
    study_level: "Any",
    separate_application: false,
    eligibility:
      "Citizens of India, Sri Lanka, Bangladesh, Bhutan, Nepal, or Pakistan applying to an eligible Bachelor or Master by coursework program at RMIT's Melbourne campus.",
    description:
      "RMIT's dedicated scholarship for students from South Asia, cutting tuition by 20% for the full length of an eligible bachelor's or coursework master's degree, as shown in your offer letter.\n\nThere is no separate application. You are automatically considered based on your admission application alone. It is one of RMIT's most widely awarded scholarships, in 2025 RMIT gave out 3,750 Future Leaders Scholarships, out of 4,616 international scholarships awarded that year in total.",
    external_url:
      "https://www.rmit.edu.au/study-with-us/international-students/apply-to-rmit-international-students/fees-and-scholarships/scholarships/future-leaders-scholarship",
    source_url:
      "https://www.rmit.edu.au/study-with-us/international-students/apply-to-rmit-international-students/fees-and-scholarships/scholarships/future-leaders-scholarship",
  },
  "uq-international-scholarship": {
    name: "UQ International Excellence Scholarship",
    amount: "25% tuition fee reduction per year for the duration of the program",
    study_level: "Any",
    separate_application: false,
    eligibility:
      "International students who have applied to study full time at UQ in an eligible undergraduate or postgraduate coursework program, assessed automatically on academic merit.",
    description:
      "UQ's main entry scholarship for international students, reducing tuition by 25% every year for the whole length of an eligible undergraduate or postgraduate coursework program.\n\nThere is no separate application. Every eligible applicant is automatically assessed when they apply to study, and the reduction is applied to each semester's tuition before the fees due date. UQ separately runs a Faculty International Scholarship and other named awards, so check which one your own offer letter actually references.",
    external_url: "https://scholarships.uq.edu.au/scholarship/uq-international-excellence-scholarship",
    source_url: "https://scholarships.uq.edu.au/scholarship/uq-international-excellence-scholarship",
  },
  "la-trobe-university-excellence-scholarship": {
    name: "La Trobe High Achiever Scholarship",
    amount: "Up to 25% tuition fee reduction for the duration of the course",
    study_level: "Any",
    separate_application: false,
    eligibility:
      "International students, other than Australian or New Zealand citizens, who are new commencing students for a 2026 or 2027 intake in an eligible undergraduate or postgraduate coursework program, full fee paying and not holding a humanitarian or other permanent visa.",
    description:
      "La Trobe's main merit scholarship for international students, offering up to 25% off tuition for the whole length of an eligible undergraduate or postgraduate coursework degree, applied as an upfront discount from your first semester (second semester at the Sydney campus).\n\nThere is no separate application. High-achieving applicants to an eligible course are automatically considered. It currently only covers students starting in a 2026 or 2027 intake, so confirm it still applies before assuming it covers a later start date.",
    external_url: "https://www.latrobe.edu.au/study/scholarships/other/la-trobe-high-achiever-scholarship",
    source_url: "https://www.latrobe.edu.au/study/scholarships/other/la-trobe-high-achiever-scholarship",
  },
  "curtin-international-scholarships": {
    name: "Curtin Global Merit Scholarship",
    amount: "20% tuition fee reduction for the duration of the course",
    study_level: "Any",
    separate_application: false,
    eligibility:
      "International, fee paying, non sponsored students of any nationality except Australian, enrolled in an eligible Curtin undergraduate degree (four years or less) or postgraduate coursework degree (two years or less) at a Western Australian campus, who meet the required Course Weighted Average.",
    description:
      "Curtin's broad merit scholarship for international students, cutting tuition by 20% for the whole length of an eligible undergraduate or postgraduate coursework degree at Curtin's Western Australian campuses.\n\nThere is no separate application. Every eligible applicant is automatically assessed against the required Course Weighted Average when they apply to study, and recipients must keep a Good Standing academic status each study period to continue receiving it. Applications run in specific rounds rather than year round, so confirm the current round's dates on Curtin's own scholarships page before counting on it.",
    external_url: "https://scholarships.curtin.edu.au/",
    source_url: "https://scholarships.curtin.edu.au/Scholarship/?id=7547",
  },
};

// 2026-09-13: field-level corrections surfaced by the depth-research pass
// but not auto-applied at the time (amounts/deadlines/eligibility, not just
// missing prose) — resolved after live-browser/primary-source verification
// of each one specifically. Two (Wollongong, CQU) turned out to be the same
// "row points at a scholarship that no longer matches reality" problem as
// the RMIT/UQ/La Trobe/Curtin fixes above, just less obviously broken since
// their `external_url` still loads.
const SCHOLARSHIP_FIELD_FIXES_2026_09_13 = {
  "murdoch-university-international-scholarships": {
    deadline_date: "2026-09-30",
    eligibility:
      "New international students from eligible countries commencing one of ten named degrees, including Bachelor of Business, Bachelor of Engineering Honours, Bachelor of Psychology, Bachelor of Data Analytics, and Bachelor of Agricultural Science, plus several Master's programs, at Murdoch University's Perth campuses in 2026. Assessed automatically at admission with no separate application.",
  },
  "uwa-global-excellence-scholarship": {
    amount: "10% to 20% tuition, based on ATAR or WAM band",
    eligibility:
      "Commencing international students in most coursework degrees. Undergraduates need an ATAR of 85 for 10% or 90 for 20%; postgraduates need a WAM of 65 for 10% or 75 for 20%. Assessed automatically once final transcripts are submitted, cannot be held with any other UWA tuition reduction.",
  },
  // Both the eligibility text already on this row and Adelaide's own page
  // say this scholarship requires a separate application form;
  // separate_application was wrongly set to false — a genuine existing
  // bug, not a staleness question.
  "adelaide-academic-excellence-scholarship": {
    separate_application: true,
  },
  "uts-international-undergraduate-academic-excellence-scholarship": {
    amount: "30% tuition for the course duration",
    eligibility:
      "Commencing international undergraduate students with a strong academic record entering an eligible UTS bachelor degree, assessed automatically with no separate application. A separate, higher 50% scholarship is reserved specifically for IB or GCE A Level applicants; a parallel postgraduate version also exists.",
  },
  "wollongong-vice-chancellors-international-scholarship": {
    name: "University of Wollongong University Excellence Scholarship",
    amount: "30% tuition for the course duration",
    eligibility:
      "Commencing international students in eligible undergraduate degrees with a Weighted Average Mark of 75 or equivalent, assessed automatically. Excludes Medicine and Surgery, Nursing, Nutrition and Exercise Science, Social Work, and Psychology degrees.",
    external_url: "https://www.uow.edu.au/study/scholarships/international/",
    source_url: "https://www.uow.edu.au/study/scholarships/international/",
    description:
      "UOW's main international award reduces tuition by 30% for the full degree, applied automatically to eligible applicants with a Weighted Average Mark of 75 or equivalent. It excludes Medicine and Surgery, Nursing, the Nutrition and Exercise Science streams, Social Work, and Psychology degrees.\n\nWollongong is an hour south of Sydney on the coast, with much lower living costs and strong engineering and computing programs linked to local industry.\n\nSeparately, UOW's Vice-Chancellor's Leadership Scholarship covers 100 percent of tuition for the full undergraduate degree, with a 50 percent version specifically for Indian and Pakistani applicants, for students who want to check whether they qualify for the more selective award instead.",
  },
  "ecu-international-excellence-scholarship": {
    eligibility:
      "Citizens of India or Pakistan (the 2026 round's eligible countries) who receive an offer to start a bachelor or master by coursework degree at Edith Cowan University in semester one or two of 2026, studying onshore at ECU's Joondalup, Mount Lawley, South West, or City campuses, and can show strong academic results. Assessed automatically by the admissions office, with no essay or interview. Places are limited.",
  },
  "research-training-program-rtp-scholarship": {
    amount: "Government-set stipend of AUD 34,315 to 53,608 a year (2026), rate set by each university, plus a tuition offset",
    description:
      "The RTP is how the Australian Government funds most higher-degree research students. Universities receive a block grant and award it as some combination of three things: a full tuition-fee offset, a living stipend, and allowances for relocation, thesis costs, or health cover.\n\nThe government sets a base full-time stipend rate of about AUD 34,315 a year for 2026, up to a maximum of AUD 53,608, and each university sets its own rate within that range rather than paying one national figure, for example QUT pays 37,010 and ANU pays 39,069. International and domestic students compete in the same pool. The stipend runs for up to three years for a PhD, the fee offset up to four. You apply through your chosen university's graduate research school, not the government, usually alongside or just after your admission application.\n\nPlaces are allocated by each university's own selection panels, which rank applicants on prior academic results and research potential rather than through one national competition, so exact thresholds vary by faculty and institution. The government sets how many funded international places are released each year, and that number rose to 4,200 in 2026 from 3,950 in 2025, alongside a separate domestic allocation. Because funding arrives as a block grant, universities also differ in panel composition, top-up amounts and whether an interview or written proposal review is used, so applicants should confirm the process with their specific graduate research school.",
  },
  "cquniversity-international-student-scholarship": {
    name: "CQUniversity International Merit Scholarship",
    amount: "15% to 25% tuition reduction, available until Term 3 2026",
    eligibility:
      "New international undergraduate or postgraduate coursework students commencing an eligible course at any CQUniversity campus, assessed automatically on prior academic results or English proficiency. Available only until Term 3 2026.",
    description:
      "CQUniversity's tiered International Merit Scholarship cuts tuition by 15, 20, or 25 percent depending on your prior academic record, assessed automatically with no separate form.\n\nCQUniversity is one of Australia's largest regional universities, with campuses across Queensland and in several other states, most of them classified regional for skilled migration.\n\nCQUniversity confirms this scholarship, along with its similarly structured Southeast Asia Excellence Scholarship, will no longer be offered after Term 3 2026. The university says recipients will instead benefit from reduced tuition fees in 2027, but has not yet published what that replacement looks like, so confirm the current offer on CQUniversity's own scholarship page before counting on this exact structure.",
  },
};

const SCHOLARSHIP_DEPTH_ADELAIDE_2026_09_13 = {
  "adelaide-merit-scholarship": {
    description: "A 15% tuition reduction applied automatically for the length of an eligible degree, for international students with solid academic records. It is the most widely awarded of Adelaide's automatic entry scholarships.\n\nAdelaide counts as a regional area for skilled migration, so this fee saving pairs with extra points toward the 491 and 190 visas, and living costs in Adelaide are well below Sydney or Melbourne. At 15 percent, it is the broadest of Adelaide University's automatic entry scholarships, sitting below the 25 percent Emerging Leaders Award and the 50 percent Academic Excellence Scholarship.",
  },
  "adelaide-partner-award": {
    description: "A 10% tuition reduction for international students applying through one of Adelaide University's approved partner institutions or agents in their home country. Confirmed through the partner rather than a direct application.\n\nAdelaide counts as a regional area for skilled migration, so this fee saving pairs with extra points toward the 491 and 190 visas, and living costs in Adelaide are well below Sydney or Melbourne. Applying through an approved partner institution or agent does not change your admission requirements, it is an alternate application channel Adelaide recognises alongside direct applications.",
  },
  "adelaide-emerging-leaders-award": {
    description: "A 25% tuition reduction for the length of an eligible degree, awarded automatically to international students with strong academic results who fall just below the Academic Excellence band. No separate application is needed.\n\nAdelaide counts as a regional area for skilled migration, so this fee saving pairs with extra points toward the 491 and 190 visas, and living costs in Adelaide are well below Sydney or Melbourne. At 25 percent, it sits between Adelaide's 15 percent Merit Scholarship and its 50 percent Academic Excellence Scholarship.",
  },
  "adelaide-global-alumni-scholarship": {
    description: "A 10% tuition reduction for international students who, or whose immediate family members, have previously graduated from Adelaide University or one of its predecessor institutions. Applied automatically when the relationship is confirmed.\n\nAdelaide counts as a regional area for skilled migration, so this fee saving pairs with extra points toward the 491 and 190 visas, and living costs in Adelaide are well below Sydney or Melbourne. Adelaide University was formed in 2026 from the merger of the University of Adelaide and the University of South Australia, so a family member's degree from either predecessor institution counts toward eligibility.",
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

  const FIXES_VERIFIED_ON = "2026-09-13";
  for (const [slug, patch] of Object.entries(SCHOLARSHIP_FIXES)) {
    const cols = Object.keys(patch);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    await client.query(
      `update scholarships set ${setClause}, last_verified_at = $${cols.length + 1}, updated_at = now()
       where slug = $${cols.length + 2}`,
      [...cols.map((c) => patch[c]), FIXES_VERIFIED_ON, slug],
    );
    console.log("fix", slug, patch);
  }

  const CORRECTIONS_VERIFIED_ON = "2026-09-13";
  for (const [slug, patch] of Object.entries(SCHOLARSHIP_CORRECTIONS_2026_09_13)) {
    if (/—/.test(patch.description + patch.eligibility + patch.name)) throw new Error(`em dash in ${slug}`);
    const cols = Object.keys(patch);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    await client.query(
      `update scholarships set ${setClause}, last_verified_at = $${cols.length + 1}, updated_at = now()
       where slug = $${cols.length + 2}`,
      [...cols.map((c) => patch[c]), CORRECTIONS_VERIFIED_ON, slug],
    );
    console.log("correction", slug, "->", patch.name);
  }

  const DEPTH_VERIFIED_ON = "2026-09-13";
  for (const [slug, patch] of Object.entries(SCHOLARSHIP_DEPTH_2026_09_13)) {
    if (/—/.test(patch.description)) throw new Error(`em dash in ${slug}`);
    await client.query(
      `update scholarships set description = $1, last_verified_at = $2, updated_at = now()
       where slug = $3`,
      [patch.description, DEPTH_VERIFIED_ON, slug],
    );
    console.log("depth", slug);
  }

  // Adelaide's four smallest automatic-entry awards had nothing further
  // published on their own official page (confirmed by research), so this
  // adds only facts already true and already used elsewhere on the site
  // (Adelaide's regional-migration status, the other Adelaide awards'
  // published percentages, the 2026 Adelaide University merger) rather than
  // researched specifics unique to each award.
  for (const [slug, patch] of Object.entries(SCHOLARSHIP_DEPTH_ADELAIDE_2026_09_13)) {
    if (/—/.test(patch.description)) throw new Error(`em dash in ${slug}`);
    await client.query(
      `update scholarships set description = $1, last_verified_at = $2, updated_at = now()
       where slug = $3`,
      [patch.description, DEPTH_VERIFIED_ON, slug],
    );
    console.log("depth-adelaide", slug);
  }

  // Runs last on purpose: two of these (Wollongong, CQU) replace a
  // description the earlier SCHOLARSHIP_DEPTH_2026_09_13 pass already
  // wrote to, and this version needs to win.
  const FIELD_FIXES_VERIFIED_ON = "2026-09-13";
  for (const [slug, patch] of Object.entries(SCHOLARSHIP_FIELD_FIXES_2026_09_13)) {
    const toCheck = [patch.description, patch.eligibility, patch.name].filter(Boolean).join(" ");
    if (/—/.test(toCheck)) throw new Error(`em dash in ${slug}`);
    const cols = Object.keys(patch);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    await client.query(
      `update scholarships set ${setClause}, last_verified_at = $${cols.length + 1}, updated_at = now()
       where slug = $${cols.length + 2}`,
      [...cols.map((c) => patch[c]), FIELD_FIXES_VERIFIED_ON, slug],
    );
    console.log("field-fix", slug, Object.keys(patch));
  }

  // Destination Australia stopped accepting new applicants from 1 July 2024
  // (see the removed NATIONAL entry above) — archive the existing row so it
  // drops off the public /scholarships listing and its own page 404s
  // instead of implying it's still open.
  const { rowCount: archivedCount } = await client.query(
    `update scholarships set status = 'archived', last_verified_at = $1, updated_at = now()
     where slug = 'destination-australia-scholarships' and status = 'published'`,
    [FIXES_VERIFIED_ON],
  );
  console.log("archived destination-australia-scholarships:", archivedCount);

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
