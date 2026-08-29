/**
 * Config for the /international/[country] pages: "Study in Australia from X"
 * for the largest source countries. Same config-in-code pattern as
 * collections.ts / subjects.ts / cities.ts. Zero em dashes (house style).
 *
 * These pages cover what is *different* for applicants from that country
 * (agent rules, deadlines, credential recognition, visa scrutiny), not the
 * generic "how to apply" material, which lives in /guides and /visas.
 */

export type OriginCountry = {
  slug: string;
  /** Country name, e.g. "India". */
  name: string;
  /** Adjective for citizens, e.g. "Indian". */
  demonym: string;
  /** Answer-first intro, 2 short paragraphs. */
  intro: string[];
  /** Country-specific points about applying to a university. */
  applying: string[];
  /** Country-specific note on the student visa (evidence level, common
   * refusal reasons for this nationality). */
  visaNote: string[];
  /** Country-specific note on qualifications and English. */
  credentials: string[];
  /** Fields most chosen by students from this country. */
  popularFields: string[];
  faq: { q: string; a: string }[];
  /** Official pages the facts were checked against. */
  sources: string[];
  /** ISO date the country-specific facts were last verified. */
  lastVerified: string;
};

export const ORIGIN_COUNTRIES: Record<string, OriginCountry> = {
  india: {
    slug: "india",
    name: "India",
    demonym: "Indian",
    intro: [
      "Indian students can study at any Australian university, and India is one of the two largest sources of international students in Australia. A first year usually costs between AUD 40,000 and AUD 75,000 all in, you apply either directly to the university or through an authorised agent, and the visa is the subclass 500 student visa.",
      "What is different for Indian applicants: in January 2026 the Australian Government raised India to the highest student-visa evidence level, several universities only accept applications from Indian citizens through an approved agent, and some set earlier deadlines. None of this changes what you are eligible for. It changes how you prepare.",
    ],
    applying: [
      "Apply through the university's own international application portal, or through an agent that the university has authorised. Several universities, particularly in Western Australia, only accept applications from Indian citizens through an authorised agent. Edith Cowan University, for example, lists India among the countries that must apply via an agent. Check each university's how-to-apply page before you start.",
      "Deadlines can fall earlier for Indian applicants. The University of Western Australia closes international applications for citizens of higher visa-scrutiny countries, India among them, several weeks before the date for other countries. Curtin closes applications 10 weeks before the course start for those countries, against 4 weeks for others. Apply three to four months ahead.",
      "Most universities assess applications on a rolling basis and run February and July intakes. Use the universities directory to filter by state, tuition, English requirement, and intake, and check the deadline calendar for the recommended dates.",
    ],
    visaNote: [
      "In January 2026 the Australian Government raised India to student-visa Evidence Level 3, the highest tier, after a rise in forged bank documents and fake degree certificates. In practice that means more upfront evidence: several months of bank statements rather than a single balance, a clear source-of-funds trail, and authenticated academic transcripts. Processing also runs longer. Check the current level when you apply, as these are reviewed.",
      "The common reasons Indian applications are refused: money that appears in an account only days before applying, unexplained gaps in study or work, and a course that does not build on what you have already studied. A savings history that predates your decision to apply is the strongest single signal that the funds are genuine.",
    ],
    credentials: [
      "A three-year Indian bachelor's degree is accepted for direct entry to most Australian master's programs. Some competitive programs, and a few universities, prefer a four-year degree or first-class marks, so read the specific program's entry requirements.",
      "How your percentage converts to an Australian grade depends on which university or board awarded your degree. Universities publish India-specific entry tables. A 60 percent aggregate is a common minimum, with 65 to 75 percent for competitive courses.",
      "For English, you can use IELTS, PTE, or TOEFL, and many universities also accept a medium-of-instruction letter confirming your degree was taught and assessed in English. The university sets its own score. The student visa has its own English rule, and whether an English-taught degree is enough for the visa depends on your circumstances, so confirm both separately.",
    ],
    popularFields: [
      "Information technology and computer science",
      "Engineering",
      "Business and management",
      "Nursing and health",
      "Accounting",
    ],
    faq: [
      {
        q: "Can I study in Australia from India with a 3-year bachelor's degree?",
        a: "Yes, for most Australian master's programs. Australian universities generally treat a three-year Indian bachelor's as equivalent for postgraduate entry. A minority of competitive programs want a four-year degree, honours, or high marks, so check the entry requirements for your specific course.",
      },
      {
        q: "How much does it cost to study in Australia from India?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition depending on the university and field, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Group of Eight universities and the Sydney and Melbourne cost of living sit at the top of that range.",
      },
      {
        q: "Do Indian students need to apply through an agent?",
        a: "Some universities require it. Several universities, mostly in Western Australia, only accept applications from Indian citizens through an authorised agent rather than directly. Others accept both. Check the university's how-to-apply page: if India is listed under agent-only countries, you cannot apply direct.",
      },
      {
        q: "What is the student visa fee for Indian students?",
        a: "AUD 2,500 for the subclass 500 student visa. It is the same for every nationality. On top of that you need to show funds for tuition, travel, and 12 months of living costs (AUD 29,710, set by the Australian Government).",
      },
      {
        q: "Do Indian students need IELTS for Australia?",
        a: "Not always. Many universities accept a medium-of-instruction letter instead of a test for admission if your degree was taught in English. The student visa has a separate English requirement, which a recognised test or an English-taught qualification can satisfy. Confirm what your university and your visa each need.",
      },
      {
        q: "Can I get PR in Australia after studying from India?",
        a: "It is a common pathway, not an automatic outcome. After graduating, most students qualify for a Temporary Graduate visa (subclass 485) with two to three years of full work rights, then compete for a points-tested skilled visa (189, 190, or 491) with skilled work experience. Whether it works out depends on your occupation, points, and the invitation rounds.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
      "https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=1196",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-29",
  },

  nepal: {
    slug: "nepal",
    name: "Nepal",
    demonym: "Nepali",
    intro: [
      "Nepal is one of the largest sources of international students in Australia relative to its population. You can study at any Australian university. A first year costs roughly AUD 40,000 to 70,000 all in, and the visa is the subclass 500.",
      "Two things are specific to Nepal. You need a No Objection Certificate from the Ministry of Education before you can send tuition abroad or lodge the visa. And in January 2026 the Australian Government raised Nepal to the highest student-visa evidence level, so the financial and document checks are now more thorough.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Several universities only accept applications from Nepali citizens through an agent, so check each university's how-to-apply page. Where direct application is allowed, it is free at many universities.",
      "You need a No Objection Certificate (NOC) from Nepal's Ministry of Education, Science and Technology. It is issued online at noc.moest.gov.np for a small fee, usually within a week, and Nepali banks require it before they will remit your tuition. Apply for it once you have your offer letter.",
      "Deadlines are earlier at universities that apply their higher-scrutiny country dates to Nepal (Western Australia especially). Apply three to four months before your intake. Most universities run February and July intakes and assess on a rolling basis.",
    ],
    visaNote: [
      "In January 2026 the Australian Government moved Nepal to student-visa Evidence Level 3, the highest tier, alongside India, Bangladesh, and Bhutan. Case officers cited forged bank guarantees and fake academic documents. You now need to provide, upfront, several months of genuine bank statements, a documented source of funds, and authenticated transcripts. Processing is slower. Check the current level when you apply.",
      "The usual reasons Nepali applications are refused are funds that appear shortly before applying with no history, loans that are approved in principle rather than disbursed, and a course that does not follow on from previous study. Show a savings pattern that predates your decision to study abroad.",
    ],
    credentials: [
      "For undergraduate entry, universities take the NEB Grade 12 (10+2) result or A-Levels. A three-year Nepali bachelor's is generally accepted for master's entry, though some universities and competitive courses want a four-year degree or strong marks.",
      "You may need an equivalence or verification of your qualifications. Universities publish Nepal-specific entry tables; confirm the aggregate percentage or GPA your course wants.",
      "English is usually shown with IELTS or PTE. Some universities accept English-medium study, but the student visa has its own English rule, so confirm what the university and the visa each require.",
    ],
    popularFields: [
      "Nursing and health",
      "Information technology",
      "Business and management",
      "Engineering",
      "Hospitality and tourism",
    ],
    faq: [
      {
        q: "Do Nepali students need a No Objection Certificate to study in Australia?",
        a: "Yes. Nepal's Ministry of Education issues the NOC online, and you need it before a Nepali bank will send your tuition abroad and as part of the student visa application. Apply for it after you receive your university offer.",
      },
      {
        q: "What is Nepal's assessment level for the Australian student visa?",
        a: "As of January 2026 Nepal is at Evidence Level 3, the highest. This means more documentation upfront: several months of bank statements, a clear source of funds, and authenticated academic records, and generally longer processing. Levels are reviewed, so check the current position when you apply.",
      },
      {
        q: "How much does it cost to study in Australia from Nepal?",
        a: "Budget AUD 40,000 to 70,000 for the first year: roughly AUD 28,000 to 45,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional and newer universities and cities like Adelaide and Perth are at the lower end.",
      },
      {
        q: "Can I get PR in Australia after studying from Nepal?",
        a: "It is a common goal, not automatic. After graduating you can usually move to a Temporary Graduate visa (subclass 485) for two to three years of work rights, then compete for a points-tested skilled visa. Whether it works depends on your occupation, points, and the invitation rounds.",
      },
      {
        q: "Do Nepali students need to apply through an agent?",
        a: "Some universities require it. Several, mostly in Western Australia, only accept applications from Nepali citizens through an authorised agent. Others take direct applications. Check the university's how-to-apply page.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://noc.moest.gov.np/",
      "https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=1196",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-29",
  },

  pakistan: {
    slug: "pakistan",
    name: "Pakistan",
    demonym: "Pakistani",
    intro: [
      "Pakistani students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Pakistan sits at the highest student-visa evidence level, so the financial and academic-document checks are thorough.",
      "The parts specific to Pakistan are document attestation and how you apply. University degrees need Higher Education Commission (HEC) attestation and school certificates need Inter Board Committee of Chairmen (IBCC) attestation, and several universities only accept applications from Pakistani citizens through an authorised agent.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Several universities, and most in Western Australia, only accept applications from Pakistani citizens through an approved agent. Check each university's how-to-apply page before you start.",
      "Get your documents attested early. HEC attests university degrees and transcripts; IBCC attests Matric and Intermediate certificates, and HEC will not attest a degree until the underlying school boards are IBCC-attested. HEC moved to an online e-attestation system in 2026, which is faster than the old in-person process but still takes planning.",
      "Deadlines can be earlier for Pakistani applicants at universities that apply higher-scrutiny country dates. Apply three to four months ahead. Most universities run February and July intakes and assess on a rolling basis.",
    ],
    visaNote: [
      "Pakistan is at student-visa Evidence Level 3, the highest tier. You need to provide, upfront, several months of genuine bank statements, a clear source-of-funds trail, and attested academic transcripts before a decision is made. Processing runs longer than for lower-risk countries.",
      "Applications commonly fail on funds that appear just before lodging, loans approved in principle rather than disbursed, money held by a distant relative rather than a parent, and a course that does not build on previous study. A genuine savings history and a documented sponsor relationship are what case officers look for.",
    ],
    credentials: [
      "For undergraduate entry, universities use the HSSC (Intermediate) result or A-Levels. A four-year Pakistani bachelor's (BS or the older BA or BSc plus a master's) maps cleanly to Australian master's entry. A standalone two-year bachelor's is often treated as incomplete for direct master's entry, so you may need a bridging qualification or a graduate certificate first.",
      "Universities publish Pakistan-specific entry tables. Confirm the percentage or CGPA your course requires and whether it counts your degree as three or four years of study.",
      "Many Pakistani applicants study in English medium. Universities may accept that for admission, but the student visa has a separate English rule, so confirm both. IELTS and PTE are the usual tests.",
    ],
    popularFields: [
      "Information technology and computer science",
      "Engineering",
      "Business and accounting",
      "Public health",
      "Data science",
    ],
    faq: [
      {
        q: "Do Pakistani students need HEC attestation for Australian universities?",
        a: "Most Australian universities and the credential assessment they rely on expect HEC-attested degrees and transcripts, with IBCC attestation for school certificates first. Start the attestation process as soon as you have your final results, since it takes time.",
      },
      {
        q: "Is a 2-year bachelor's degree from Pakistan accepted in Australia?",
        a: "Often not for direct master's entry. A two-year bachelor's is usually treated as equivalent to part of an Australian bachelor's. A four-year BS, or a two-year bachelor's plus a master's, is the reliable route. Some universities offer a graduate certificate as a bridge.",
      },
      {
        q: "What is Pakistan's assessment level for the Australian student visa?",
        a: "Pakistan is at Evidence Level 3, the highest. You must supply several months of bank statements, a documented source of funds, and attested academic records upfront, and processing is slower than for lower-risk countries.",
      },
      {
        q: "How much does it cost to study in Australia from Pakistan?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Group of Eight universities and Sydney or Melbourne sit at the top of that range.",
      },
      {
        q: "Can I get PR in Australia after studying from Pakistan?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide whether it works.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.hec.gov.pk/english/services/students/DAS/Pages/default.aspx",
      "https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=1196",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-29",
  },

  china: {
    slug: "china",
    name: "China",
    demonym: "Chinese",
    intro: [
      "China is the largest single source of international students in Australia. You can study at any university. A first year costs roughly AUD 45,000 to 80,000 all in, and the visa is the subclass 500. China generally sits at a lower student-visa evidence level than the South Asian markets, especially for the older research universities.",
      "The parts specific to China are credential verification and the undergraduate entry route. Australian universities usually want a verification report for your Chinese qualifications, and for school leavers the gaokao is now the main way into an Australian bachelor's degree.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Chinese citizens. Agents are common because they handle the CoE, deposit, and visa lodgement together.",
      "Expect to provide a verification report for your academic records from the China Higher Education Student Information and Career Center (CHESICC or CHSI), and for school leavers a verification of your gaokao score. A few universities restrict specific feeder institutions or apply extra checks after past document-fraud cases, so read the entry requirements for your exact background.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead to leave time for the visa. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Chinese applicants generally face lighter upfront evidence requirements than applicants from Evidence Level 3 countries, particularly when applying to a lower-risk provider such as a Group of Eight university. You may still be asked for financial and English evidence. The assessment is set by a provider-and-country matrix that is reviewed periodically, so confirm the current position when you apply.",
      "Where Chinese applications run into trouble it is usually over the genuineness of funds held in a parent's account, incomplete verification of academic records, or a study plan that does not fit the applicant's background. A clear source of funds and a complete CHESICC verification remove most of the risk.",
    ],
    credentials: [
      "For undergraduate entry, most Australian universities now accept the gaokao directly, each with its own score threshold, usually a percentage of the provincial first-tier line. A completed Chinese senior high school qualification without the gaokao usually routes through a foundation year.",
      "A four-year Chinese bachelor's degree maps directly to Australian master's entry. Universities publish China-specific entry tables keyed to the tier of your university (985, 211, or other), so the average you need can differ by institution.",
      "English is shown with IELTS, PTE, or TOEFL. Medium-of-instruction letters are rarely accepted from Chinese institutions, so plan to sit a test. The university sets its score and the visa has its own rule.",
    ],
    popularFields: [
      "Business, accounting, and finance",
      "Information technology and computer science",
      "Engineering",
      "Data science",
      "Media and communications",
    ],
    faq: [
      {
        q: "Do Australian universities accept the gaokao?",
        a: "Most do, for direct undergraduate entry, each with its own score requirement. It is now the main route for Chinese school leavers into an Australian bachelor's degree. Check the specific university and course for the threshold and any subject prerequisites.",
      },
      {
        q: "Do Chinese students need a CHESICC verification report?",
        a: "Usually yes. Australian universities and the credential checks behind admission typically ask for a verification report for your degree, transcript, or gaokao score from CHESICC (CHSI). Order it early, as it takes time.",
      },
      {
        q: "How much does it cost to study in Australia from China?",
        a: "Budget AUD 45,000 to 80,000 for the first year. Chinese students concentrate in Sydney and Melbourne and at the Group of Eight, which sit at the top of the tuition and living-cost range. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Is China's assessment level lower than India's for the student visa?",
        a: "Generally yes. China is usually treated as lower risk than the Evidence Level 3 South Asian countries, especially at a Group of Eight university, which means less financial and English evidence upfront. The exact requirement depends on the provider and is reviewed regularly.",
      },
      {
        q: "Do Chinese students need IELTS for Australia?",
        a: "Almost always. Australian universities and the student visa expect a recognised English test (IELTS, PTE, or TOEFL) for Chinese applicants. Medium-of-instruction waivers are rarely accepted from Chinese institutions.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.chsi.com.cn/en/",
      "https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=1196",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-29",
  },

  vietnam: {
    slug: "vietnam",
    name: "Vietnam",
    demonym: "Vietnamese",
    intro: [
      "Vietnam is a large and growing source of international students in Australia. You can study at any university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Vietnam sits at student-visa Evidence Level 2, which is more favourable than the Evidence Level 3 markets.",
      "There is not much that is unusual for Vietnamese applicants. The main points are credential recognition of a four-year Vietnamese bachelor's, English evidence, and choosing between applying directly or through an agent.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Vietnamese citizens, and agents are widely used for the offer, deposit, and visa steps.",
      "Have certified copies of your transcripts and completion certificates ready, with certified English translations. Some universities want documents verified through the awarding institution.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory to shortlist and the deadline calendar for the recommended dates.",
    ],
    visaNote: [
      "Vietnam is at student-visa Evidence Level 2, so the upfront financial and English evidence requirements are lighter than for Evidence Level 3 countries, particularly at lower-risk providers. You should still be ready to show funds for tuition, travel, and 12 months of living costs, and to satisfy the Genuine Student requirement.",
      "Where Vietnamese applications run into trouble it is usually over source of funds, a gap between the study plan and the applicant's background, or thin Genuine Student statements. A documented savings history and a study plan that follows on from previous study address most of it.",
    ],
    credentials: [
      "A four-year Vietnamese bachelor's degree is accepted for direct entry to Australian master's programs. For undergraduate entry, universities take the Vietnamese upper secondary school leaving certificate, often with a foundation year, or accept a completed first year of a Vietnamese bachelor's for direct entry.",
      "Universities publish Vietnam-specific entry tables. Confirm the GPA on the 10-point scale that your course requires.",
      "English is shown with IELTS, PTE, or TOEFL. Most universities want 6.5 overall for a master's, and the visa has a lower floor. Confirm both.",
    ],
    popularFields: [
      "Business, accounting, and finance",
      "Information technology",
      "Engineering",
      "Hospitality and tourism",
      "Media and communications",
    ],
    faq: [
      {
        q: "Is a 4-year Vietnamese bachelor's degree accepted in Australia?",
        a: "Yes, for direct entry to most Australian master's programs. Universities publish Vietnam-specific entry tables mapping your 10-point GPA to their requirement. Competitive courses want a higher GPA.",
      },
      {
        q: "What is Vietnam's assessment level for the Australian student visa?",
        a: "Vietnam is at Evidence Level 2, which is medium risk. The upfront documentation is lighter than for the Evidence Level 3 countries, though you still need to show funds and meet the Genuine Student requirement. Levels are reviewed, so check when you apply.",
      },
      {
        q: "How much does it cost to study in Australia from Vietnam?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Can I get PR in Australia after studying from Vietnam?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
      {
        q: "Do Vietnamese students need to apply through an agent?",
        a: "No, most universities accept direct applications from Vietnamese citizens. Agents are common because they manage the offer, deposit, and visa lodgement, but they are not required everywhere. Check the university's how-to-apply page.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=1196",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-29",
  },

  bangladesh: {
    slug: "bangladesh",
    name: "Bangladesh",
    demonym: "Bangladeshi",
    intro: [
      "Bangladeshi students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. In January 2026 the Australian Government raised Bangladesh to the highest student-visa evidence level, so the financial and document checks are now thorough.",
      "The parts specific to Bangladesh are the higher visa scrutiny, how universities treat a three-year pass degree, and the fact that several universities only accept applications from Bangladeshi citizens through an authorised agent.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Several universities, and most in Western Australia, only accept applications from Bangladeshi citizens through an approved agent. Check each university's how-to-apply page.",
      "Have certified academic transcripts and certificates ready. Universities may ask for verification through the education board or the awarding university. Deadlines can be earlier for Bangladeshi applicants at universities that apply higher-scrutiny country dates, so apply three to four months ahead.",
      "Most universities run February and July intakes and assess on a rolling basis. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "In January 2026 the Australian Government moved Bangladesh to student-visa Evidence Level 3, the highest tier, alongside India, Nepal, and Bhutan. Case officers cited a rise in forged financial and academic documents. You now need to provide, upfront, several months of genuine bank statements, a documented source of funds, and authenticated transcripts, and processing runs longer. Check the current level when you apply.",
      "Applications commonly fail on funds that appear shortly before applying, loans approved in principle rather than disbursed, and a course that does not follow on from previous study. A genuine savings history that predates your decision to study abroad is the strongest signal.",
    ],
    credentials: [
      "For undergraduate entry, universities use the HSC result or A-Levels. A four-year bachelor's (honours) maps cleanly to Australian master's entry. A three-year pass degree is often treated as incomplete for direct master's entry, so you may need a master's preliminary, a graduate certificate, or a four-year qualification.",
      "Universities publish Bangladesh-specific entry tables. Confirm the CGPA or division your course requires and how it counts the length of your degree.",
      "Many Bangladeshi applicants study in English medium. Universities may accept that for admission, but the student visa has its own English rule, so confirm both. IELTS and PTE are the usual tests.",
    ],
    popularFields: [
      "Information technology and computer science",
      "Engineering",
      "Business and accounting",
      "Public health",
      "Development studies",
    ],
    faq: [
      {
        q: "Is a 3-year bachelor's degree from Bangladesh accepted in Australia?",
        a: "Often not for direct master's entry. A three-year pass degree is usually treated as equivalent to part of an Australian bachelor's. A four-year honours degree is the reliable route, or a bridging qualification such as a graduate certificate.",
      },
      {
        q: "What is Bangladesh's assessment level for the Australian student visa?",
        a: "As of January 2026 Bangladesh is at Evidence Level 3, the highest. You must supply several months of bank statements, a documented source of funds, and authenticated academic records upfront, and processing is slower. Levels are reviewed, so check when you apply.",
      },
      {
        q: "How much does it cost to study in Australia from Bangladesh?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are at the lower end.",
      },
      {
        q: "Do Bangladeshi students need to apply through an agent?",
        a: "Some universities require it. Several, mostly in Western Australia, only accept applications from Bangladeshi citizens through an authorised agent. Others accept direct applications. Check the university's how-to-apply page.",
      },
      {
        q: "Can I get PR in Australia after studying from Bangladesh?",
        a: "It is a common goal, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=1196",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-29",
  },

  "sri-lanka": {
    slug: "sri-lanka",
    name: "Sri Lanka",
    demonym: "Sri Lankan",
    intro: [
      "Sri Lankan students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Sri Lanka moved from the lowest student-visa evidence level to Evidence Level 2 in late 2025, so the financial and English documentation expected is now higher than before.",
      "Not much is unusual for Sri Lankan applicants. The main points are how universities read the local A-Level and Z-score, English evidence, and applying directly or through an agent.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Sri Lankan citizens, and agents are widely used for the offer, deposit, and visa steps.",
      "Have certified transcripts and certificates ready, with translations where needed. Universities may want your results verified through the Department of Examinations or the awarding university.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory to shortlist and the deadline calendar for the recommended dates.",
    ],
    visaNote: [
      "Sri Lanka is at student-visa Evidence Level 2 after moving up from Level 1 in late 2025. The upfront financial and English evidence is more than it used to be but still lighter than for the Evidence Level 3 countries. Be ready to show funds for tuition, travel, and 12 months of living costs, and to meet the Genuine Student requirement.",
      "Where Sri Lankan applications run into trouble it is usually over source of funds, exchange-control paperwork for moving money out of the country, or a study plan that does not fit the applicant's background. A documented savings history addresses most of it.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Sri Lankan A-Level (or the London A-Level) and, for local A-Levels, sometimes the Z-score. A local bachelor's, usually three or four years, is accepted for master's entry, with competitive courses wanting a higher class or GPA.",
      "Universities publish Sri Lanka-specific entry tables. Confirm the grades or GPA your course requires and whether it counts your degree as three or four years.",
      "Many Sri Lankan applicants have studied in English. Universities may accept that for admission, but the student visa has its own English rule, so confirm both. IELTS and PTE are the usual tests.",
    ],
    popularFields: [
      "Information technology and computer science",
      "Business, accounting, and finance",
      "Engineering",
      "Nursing and health",
      "Project management",
    ],
    faq: [
      {
        q: "What is Sri Lanka's assessment level for the Australian student visa?",
        a: "Sri Lanka is at Evidence Level 2, having moved up from Level 1 in late 2025. That means more financial and English documentation than before, though less than the Evidence Level 3 countries. Levels are reviewed, so check the current position when you apply.",
      },
      {
        q: "Is a Sri Lankan bachelor's degree accepted in Australia?",
        a: "Yes, for master's entry at most Australian universities. Universities publish Sri Lanka-specific entry tables mapping your class or GPA to their requirement. A three-year degree is generally accepted; some competitive courses prefer four years or first or upper second class.",
      },
      {
        q: "How much does it cost to study in Australia from Sri Lanka?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Can I get PR in Australia after studying from Sri Lanka?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
      {
        q: "Do Sri Lankan students need to apply through an agent?",
        a: "No, most universities accept direct applications from Sri Lankan citizens. Agents are common for handling the offer, deposit, and visa lodgement, but not required everywhere. Check the university's how-to-apply page.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=1196",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-29",
  },
};

export function getOriginCountry(slug: string): OriginCountry | undefined {
  return ORIGIN_COUNTRIES[slug];
}

export const ORIGIN_COUNTRY_SLUGS = Object.keys(ORIGIN_COUNTRIES);
