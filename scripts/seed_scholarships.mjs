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
