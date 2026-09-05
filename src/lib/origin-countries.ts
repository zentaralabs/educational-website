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
  /** ISO 3166-1 alpha-2 code, for the flag emoji. */
  code: string;
  /** Country name, e.g. "India". */
  name: string;
  /** Adjective for citizens, e.g. "Indian". */
  demonym: string;
  /**
   * ISO 4217 code for the reader's own currency, used to show the AUD figures
   * in the units they will actually budget in (see `@/lib/fx`). Optional: a
   * country with no rate on file simply shows AUD only.
   */
  currency?: string;
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
    code: "IN",
    name: "India",
    demonym: "Indian",
    currency: "INR",
    intro: [
      "Indian students can study at any Australian university, and India is one of the two largest sources of international students in Australia. A first year usually costs between AUD 40,000 and AUD 75,000 all in, you apply either directly to the university or through an authorised agent, and the visa is the subclass 500 student visa.",
      "What is different for Indian applicants: in January 2026 the Australian Government raised India to the highest student-visa evidence level, several universities only accept applications from Indian citizens through an approved agent, and some set earlier deadlines. None of this changes what you are eligible for. It changes how you prepare.",
    ],
    applying: [
      "Apply through the university's own international application portal, or through an agent that the university has authorised. Several universities, particularly in Western Australia, only accept applications from Indian citizens through an authorised agent. Edith Cowan University, for example, lists India among the countries that must apply via an agent. Check each university's how-to-apply page before you start.",
      "Deadlines can fall earlier for Indian applicants. The University of Western Australia closes international applications for citizens of higher visa-scrutiny countries, India among them, several weeks before the date for other countries. Curtin closes applications 10 weeks before the course start for those countries, against 4 weeks for others. Apply three to four months ahead.",
      "Most universities assess applications on a rolling basis and run February and July intakes. Use the universities directory to filter by state, tuition, English requirement, and intake, and check the deadline calendar for the recommended dates.",
      "India's education-consultancy sector is large and only partly regulated, and that is where most of the fraud risk sits, not with the Australian universities themselves. In 2024, a Chandigarh-based agency, World Visa Advisors, was found to have submitted forged Confirmation of Enrolment letters and fake Department of Education certificates for hundreds of families; one Chandigarh police station alone logged nearly 400 complaints, reported losses in the first half of 2024 ran past AUD 4.5 million, and the agency's operators were arrested in July 2024 after its office was found abandoned. Before you pay anyone, confirm the agent is on your target university's own published list of authorised agents.",
      "The Australian High Commission in India warns against a specific set of tactics: an agent who guarantees a visa outcome, one who asks you to hand over your passport or other identity documents, one who tells you that you can switch from a visitor visa to a student visa after you arrive (you cannot, and attempting it damages your immigration record), and one who charges well above the published Department of Home Affairs visa fee to 'fast-track' your application. An agent working in Australia should hold a Migration Agent Registration Number (MARN) you can check yourself on the OMARA website, and should be willing to let you see your own application through your own ImmiAccount login rather than only through theirs.",
    ],
    visaNote: [
      "In January 2026 the Australian Government moved India to student-visa Evidence Level 3, the highest tier, alongside Nepal, Bangladesh, and Bhutan. Home Affairs calculates a country's evidence level from a weighted index of visa cancellations, refusals, and overstay rates, and the rate of refusals for a fraud reason carries the single largest weight (40 percent) in that index; a score above 2.7 places a country at Level 3. Sector reporting at the time linked the move to a rise in forged bank guarantees and fraudulent academic documents detected during the November to December 2025 lodgement peak, following a Home Affairs alert the previous month about a broader rise in document fraud, including recycled passport numbers and inflated bank letters, concentrated in South Asia. You now need to provide, upfront, several months of genuine bank statements, a documented source of funds, and authenticated transcripts, and processing is slower. Check the current level when you apply, since these are reviewed.",
      "Home Affairs does not publish one India-specific grant or refusal rate; the rate it does publish varies by quarter and by whether the decision is made in Australia or offshore, so treat any single flat percentage quoted on a consultancy website with caution. In its own figures, the grant rate for Indian applicants in the October to December 2025 quarter was 60.5 percent for decisions made in Australia and 59.5 percent for decisions made outside Australia, both down sharply from the roughly 80 percent offshore rate seen as recently as July to September 2025. Trade press citing Home Affairs data reported a comparable figure for February 2026, around 40 percent of Indian applications refused, described as the highest in more than two decades of tracking. On volume, in the 2025-26 program year to 31 December 2025, India was Australia's second largest source of student visa lodgements (34,512, up 18.2 percent on the same period the year before) and second largest by visas granted (23,665, up 5.3 percent, 13.3 percent of all grants that period), behind only China in both counts. India was, however, the largest source of Temporary Graduate (subclass 485) visa grants (26,116) and the largest single nationality among student visa holders already in Australia (88,306) as at 31 December 2025.",
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
      {
        q: "How do I know if an Indian education agent for Australia is legitimate?",
        a: "Check that the agent appears on your target university's own published list of authorised agents, and, if they operate in Australia, that they hold a Migration Agent Registration Number you can verify on the OMARA website. Be wary of anyone who guarantees a visa outcome, asks you to hand over your passport, or tells you that you can switch from a visitor visa to a student visa once you arrive; the Australian High Commission in India specifically warns against all three. A well-documented 2024 case, a Chandigarh consultancy that used forged enrolment letters and fake government certificates before its operators were arrested, shows the risk sits with unregulated consultants, not with Australian universities.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
      "https://thepienews.com/sector-unmoved-after-australia-revises-student-risk-ratings-again/",
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://india.highcommission.gov.au/ndli/scam-safe.html",
      "https://www.abc.net.au/news/2024-09-17/indian-students-duped-by-australian-visa-fraud/104309404",
      "https://monitor.icef.com/2026/04/australia-student-visa-refusal-rates-reach-record-high-amid-weakening-demand-from-china/",
    ],
    lastVerified: "2026-09-05",
  },

  nepal: {
    slug: "nepal",
    code: "NP",
    name: "Nepal",
    demonym: "Nepali",
    currency: "NPR",
    intro: [
      "Nepal is one of the largest sources of international students in Australia relative to its population. You can study at any Australian university. A first year costs roughly AUD 40,000 to 70,000 all in, and the visa is the subclass 500.",
      "Two things are specific to Nepal. You need a No Objection Certificate from the Ministry of Education before you can send tuition abroad or lodge the visa. And in January 2026 the Australian Government raised Nepal to the highest student-visa evidence level, so the financial and document checks are now more thorough.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Several universities only accept applications from Nepali citizens through an agent, so check each university's how-to-apply page. Where direct application is allowed, it is free at many universities.",
      "You need a No Objection Certificate (NOC) from Nepal's Ministry of Education, Science and Technology. It is issued online at noc.moest.gov.np for a small fee, usually within a week, and Nepali banks require it before they will remit your tuition. Apply for it once you have your offer letter. It is a direct application you lodge yourself; no agent needs to charge an extra fee to process or speed it up.",
      "Deadlines are earlier at universities that apply their higher-scrutiny country dates to Nepal (Western Australia especially). Apply three to four months before your intake. Most universities run February and July intakes and assess on a rolling basis.",
      "Nepal's education-consultancy sector is only loosely licensed, and that is where most of the scam risk sits, not with the Australian universities themselves. Of the roughly 5,000 consultancies operating in the Kathmandu Valley, only about 900 hold a current operating permit from the Ministry of Education, Science and Technology; the rest work without one. In May 2026 the Kathmandu Valley Crime Investigation Office raided 95 consultancies across Kathmandu, Lalitpur, and Bhaktapur and detained 69 operators, seizing fake government seals used to forge documents. Before you pay anyone, confirm the agent is on your target university's own published list of authorised agents, and that the consultancy itself holds a current MoEST permit.",
      "The Australian Embassy in Nepal warns against a specific set of tactics: an agent who guarantees you a visa outcome for a fee, one who asks you to hand over your passport, or one who tells you that you can switch from a visitor visa to a student visa after you arrive (you cannot, and attempting it damages your immigration record). An agent working in Australia should be registered with the Office of Migration Agents Registration Authority (OMARA) and able to give you a Migration Agent Registration Number you can check yourself on the OMARA website.",
    ],
    visaNote: [
      "In January 2026 the Australian Government moved Nepal to student-visa Evidence Level 3, the highest tier, alongside India, Bangladesh, and Bhutan. Home Affairs calculates a country's evidence level from a weighted index of visa cancellations, refusals, and overstay rates, and the rate of refusals for a fraud reason carries the single largest weight (40 percent) in that index; a score above 2.7 places a country at Level 3. Sector reporting at the time linked the move to a rise in forged bank guarantees and fraudulent academic documents detected during the November to December 2025 lodgement peak. You now need to provide, upfront, several months of genuine bank statements, a documented source of funds, and authenticated transcripts, and processing is slower. Check the current level when you apply, since these are reviewed.",
      "Home Affairs does not publish a Nepal-specific grant or refusal rate, so treat the exact percentages you see quoted on education-consultancy websites with caution; figures in circulation range from roughly 25 percent to 85 percent because they measure different things (lodged versus decided applications, onshore versus offshore, and an unfiltered pool versus a 'decision-ready' subset). What Home Affairs does publish is volume: in the 2025-26 program year to 31 December 2025, Nepal was Australia's third largest source of student visa lodgements (23,072, up 54.6 percent on the same period the year before) and the third largest by visas granted (18,744, up 40.5 percent), behind only China and India in both counts.",
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
      {
        q: "How do I know if a Nepali education agent is legitimate?",
        a: "Check that the agent appears on your target university's own published list of authorised agents, and, if they operate in Australia, that they hold a Migration Agent Registration Number you can verify on the OMARA website. Be wary of anyone who guarantees a visa outcome, asks you to hand over your passport, or says you can switch from a visitor visa to a student visa after you arrive; the Australian Embassy in Nepal specifically warns against all three. A 2026 police crackdown found that most raided Kathmandu Valley consultancies were operating without a current Ministry of Education permit, so also confirm the consultancy itself is properly registered.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://noc.moest.gov.np/",
      "https://thepienews.com/sector-unmoved-after-australia-revises-student-risk-ratings-again/",
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://nepal.embassy.gov.au/kmdu/Stay_safe_from_visa_scams.html",
      "https://kathmandupost.com/national/2026/05/16/arrests-device-seizures-in-crackdown-on-consultancies-over-shady-student-migration-process",
      "https://english.onlinekhabar.com/over-4100-education-consultancies-operating-without-registration-across-nepal.html",
    ],
    lastVerified: "2026-09-05",
  },

  pakistan: {
    slug: "pakistan",
    code: "PK",
    name: "Pakistan",
    demonym: "Pakistani",
    currency: "PKR",
    intro: [
      "Pakistani students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Pakistan sits at the highest student-visa evidence level, so the financial and academic-document checks are thorough.",
      "The parts specific to Pakistan are document attestation and how you apply. University degrees need Higher Education Commission (HEC) attestation and school certificates need Inter Board Committee of Chairmen (IBCC) attestation, and several universities only accept applications from Pakistani citizens through an authorised agent.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Several universities, and most in Western Australia, only accept applications from Pakistani citizens through an approved agent. Check each university's how-to-apply page before you start.",
      "Get your documents attested early. HEC attests university degrees and transcripts; IBCC attests Matric and Intermediate certificates, and HEC will not attest a degree until the underlying school boards are IBCC-attested. HEC moved to an online e-attestation system in 2026, which is faster than the old in-person process but still takes planning.",
      "Deadlines can be earlier for Pakistani applicants at universities that apply higher-scrutiny country dates. Apply three to four months ahead. Most universities run February and July intakes and assess on a rolling basis.",
      "Pakistan's own regulators have flagged real fraud in the study-abroad pipeline, separate from anything at the Australian end. In August 2026 the Higher Education Commission (HEC) publicly warned students against people posing as \"attestation agents\": HEC's degree-attestation process is entirely online and done directly by the applicant, so anyone offering to handle or speed it up for a fee is not an authorised HEC service. The Federal Investigation Agency (FIA) has separately prosecuted consultancies that used forged HEC letterhead to sell fake scholarships and university admissions, charging the operators under the Pakistan Penal Code for cheating and forgery. Before you pay anyone, check HEC's own website for attestation status rather than a middleman, and confirm any agent claiming Australian registration on the OMARA website.",
      "The Australian High Commission in Islamabad runs a dedicated \"Visa Scams, Stay Safe\" page, with a fact sheet and FAQ in English and Urdu, warning that an agent who tells you to submit false or misleading information is breaking the law, and that the High Commission does not call applicants to request visa fees or personal financial details. Rely on the Department of Home Affairs website and ImmiAccount directly, not information passed through an agent or social media.",
    ],
    visaNote: [
      "Pakistan is at student-visa Evidence Level 3, the highest tier under Home Affairs' Simplified Student Visa Framework. Home Affairs calculates a country's level from a weighted index of visa cancellations, refusals, and overstay rates, and the rate of refusals for a fraud reason carries the single largest weight (40 percent) in that index; a score above 2.7 places a country at Level 3. Unlike India, Nepal, Bangladesh, and Bhutan, which were moved up to Level 3 in an out-of-cycle review on 8 January 2026, Pakistan was not part of that round. Trade reporting already had Pakistan at Level 3 as far back as October 2025, alongside Fiji, the Philippines, and Colombia, while India was briefly down at the lower Level 2 in the same period. Home Affairs does not publish a specific date or trigger for when Pakistan first reached Level 3, so treat its placement as longstanding rather than a recent change, and check the current level when you apply, since these are reviewed periodically.",
      "Home Affairs does not publish a Pakistan-specific grant or refusal rate, so treat the percentages quoted on education-consultancy websites with caution; they typically mix lodged and decided applications from different, non-matched cohorts. What Home Affairs does publish is volume: in the 2025-26 program year to 31 December 2025, Pakistan was Australia's sixth largest source of student visa lodgements (6,226, up 48.8 percent on the same period the year before, 3.0 percent of the total) and the twelfth largest by visas granted (3,525, up 50.3 percent, 2.0 percent of the total).",
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
      {
        q: "How do I know if a Pakistani education agent is legitimate?",
        a: "HEC's degree-attestation process is done directly online by the applicant, and HEC has publicly warned against people posing as \"attestation agents\" and offering to handle it for a fee. Check that any admissions agent appears on your target university's own published list of authorised agents, and, if they operate in Australia, verify their Migration Agent Registration Number on the OMARA website. Read the Australian High Commission Islamabad's \"Visa Scams, Stay Safe\" page before you pay anyone: it warns that submitting false or misleading information through an agent is illegal, and that Australian government bodies do not call applicants to request visa fees.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.hec.gov.pk/english/services/students/DAS/Pages/default.aspx",
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://thepienews.com/australia-eases-risk-ratings-amid-calls-to-scrap-system/",
      "https://propakistani.pk/2026/08/28/hec-warns-students-against-fake-attestation-agents/",
      "https://propakistani.pk/2026/07/25/fia-arrests-fake-hec-scholarship-agent-for-scamming-students/",
      "https://pakistan.embassy.gov.au/ISLM/Visa_Scams.html",
    ],
    lastVerified: "2026-09-05",
  },

  china: {
    slug: "china",
    code: "CN",
    name: "China",
    demonym: "Chinese",
    currency: "CNY",
    intro: [
      "China is Australia's largest single source of international students by both applications and visa grants, but the market is shrinking. In the 2025-26 program year to 31 December 2025, Home Affairs recorded 37,500 Chinese student visa lodgements, down 24.0 percent on the same period a year earlier, and 38,275 grants, down 23.5 percent. Chinese applicants also have one of the lowest refusal rates of any source country, around 3.5 percent according to trade-press analysis of Home Affairs data, against more than 30 percent for several South Asian markets in the same period. You can study at any university. A first year costs roughly AUD 45,000 to 80,000 all in, and the visa is the subclass 500.",
      "The parts specific to China are credential verification and the undergraduate entry route. Australian universities usually want a verification report for your Chinese qualifications, and for school leavers the gaokao is now the main way into an Australian bachelor's degree. China also moved from the lowest student-visa risk tier to the middle tier in a September 2025 review, which is covered in more detail below.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Chinese citizens. Agents are common because they handle the CoE, deposit, and visa lodgement together.",
      "Expect to provide a verification report for your academic records from the China Higher Education Student Information and Career Center (CHESICC or CHSI), and for school leavers a verification of your gaokao score. A few universities restrict specific feeder institutions or apply extra checks after past document-fraud cases, so read the entry requirements for your exact background.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead to leave time for the visa. Use the universities directory and the deadline calendar.",
      "China's agent industry for Australian education is large, mature, and concentrated among big, established firms rather than the long chains of small sub-agents seen in some South Asian markets. Trade-press research identified 11 agents, including IDP Education, New Oriental, EIC, and Beijing Aoji, each with direct partnerships with 30 or more Australian universities, alongside a longer tail of around 88 smaller agencies each working with two to five universities. That is a flatter structure than markets where a single master agent runs a network of sub-agents; the same research found one university worked with only 24 partner organisations in China against 213 in India. Roughly seven in ten Chinese students who apply to Australia use an agent, similar to other major source countries, but there is little credible English-language reporting of the unlicensed-consultancy, forged-document, or fake-offer-letter fraud documented elsewhere on this site for Bangladesh, Nepal, and Pakistan. Confirm any agent against your target university's own published list before you pay anyone.",
      "The scam pattern that is well documented for Chinese students in Australia is not agent fraud, it is impersonation and extortion. Australia's National Anti-Scam Centre, part of the Australian Competition and Consumer Commission, has repeatedly warned that criminals posing as Chinese police or officials call international students, accuse them of a crime back home, and pressure them into staging a fake 'virtual kidnapping', using photos or video to extort a ransom from their family in China. In the most recent figures the ACCC has published, it recorded 1,244 reports and AUD 8.7 million in losses to this scam between January and August 2023 alone, with one victim paying more than AUD 400,000. South China Morning Post has reported the same pattern for several years. If anyone calls claiming to be Chinese police or a Chinese consular official and threatens you over the phone, hang up, contact your university's international student support office, and report it to Scamwatch. A genuine investigation is never conducted entirely by phone.",
      "A related but separate integrity issue is contract cheating. From 2019, Australian reporting documented ghostwriting services marketed specifically to Chinese students through WeChat, charging roughly AUD 200 per 1,000 words for a pass-level assignment. Providing or advertising such a service is now a criminal offence in Australia, carrying up to two years' imprisonment. The national regulator, TEQSA, continues to disrupt cheating websites and issued a fresh sector alert in February 2026, though its recent enforcement, including a 2026 fine against the platform Chegg, has not been specific to any one nationality.",
    ],
    visaNote: [
      "Home Affairs calculates a country's evidence level from a weighted index of visa cancellations (25 percent), refusals for a fraud reason (40 percent, the single largest weight), other refusals (10 percent), the rate of student visa holders becoming unlawful non-citizens (15 percent), and the rate of Subsequent Protection Visa applications (10 percent). A score below 1.0 sits at Level 1, a score between 1.0 and 2.7 sits at Level 2, and a score above 2.7 sits at Level 3. Home Affairs does not publish a country-by-country list of levels or confirm changes directly. Trade press (The PIE News) reported that China moved from Level 1 to Level 2 in the department's periodic review that took effect for applications lodged on or after 30 September 2025, and linked the move, with some hedging of its own, to a reported rise in asylum and protection-visa applications from Chinese nationals, particularly students. Home Affairs has not published its own confirmation of that specific reason, so treat it as reported rather than confirmed. Either way, China sits well below the Evidence Level 3 South Asian markets such as India, Nepal, Pakistan, and Bangladesh, and its measured refusal rate remains among the lowest of any major source country. Check the current level when you apply, since these are reviewed periodically.",
      "Home Affairs' most recent quarterly program report (to 31 December 2025) shows China as Australia's largest source of student visa lodgements in the 2025-26 program year to that date (37,500, down 24.0 percent on the same period the year before, 18.3 percent of the total) and largest by visas granted (38,275, down 23.5 percent, 21.5 percent of the total). Despite that decline in new applications, China was still the second largest source of student visa holders in Australia as at 31 December 2025 (62,771 people, down 6.5 percent on a year earlier), behind India (88,306), which grew its lodgements even as China's fell. Grant rates for Chinese applicants were 84.6 percent for decisions made onshore and 94.9 percent offshore in the October to December 2025 quarter, both among the highest of any source country in that report, though the onshore figure was down from 90.5 percent a year earlier.",
      "Where Chinese applications run into trouble it is usually over the genuineness of funds held in a parent's account, incomplete verification of academic records, or a study plan that does not fit the applicant's background. A clear source of funds and a complete CHESICC verification remove most of the risk.",
      "China's post-study work pathway looks different from the South Asian markets covered elsewhere on this site. In the same reporting period, Chinese nationals lodged 7,249 Temporary Graduate (subclass 485) visa applications, which is 9.7 percent of all TGV lodgements even though China supplied 18.3 percent of all new student visa lodgements. That is a far smaller share than India, which lodged 37.0 percent of all TGV applications on 16.8 percent of student-visa lodgements, or the Philippines and Pakistan, whose TGV shares also run well ahead of their student-visa shares. Home Affairs does not publish the reasons behind that gap, but the pattern is consistent with the sector's long-standing view that a larger share of Chinese graduates return home for work than graduates from South Asia. Treat the 485 visa as one option among several rather than the default next step if you are coming from China.",
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
        a: "Yes. China sits at Evidence Level 2, the middle tier, while India, Nepal, Pakistan, and Bangladesh sit at Evidence Level 3, the highest. China moved down from Level 1 to Level 2 in a September 2025 review, reported by trade press to be linked to a rise in asylum-related visa applications from Chinese nationals, though Home Affairs has not confirmed that specific reason. Levels are reviewed periodically, so check the current position when you apply.",
      },
      {
        q: "Do Chinese students need IELTS for Australia?",
        a: "Almost always. Australian universities and the student visa expect a recognised English test (IELTS, PTE, or TOEFL) for Chinese applicants. Medium-of-instruction waivers are rarely accepted from Chinese institutions.",
      },
      {
        q: "Are there scams targeting Chinese students applying to Australia?",
        a: "The best-documented scam is not agent fraud, it is impersonation. Criminals posing as Chinese police or officials call Chinese students in Australia, accuse them of a crime, and pressure them into staging a fake kidnapping to extort a ransom from their family. Australia's National Anti-Scam Centre recorded 1,244 reports and AUD 8.7 million in losses to this scam in the first eight months of 2023 alone. Hang up on any such call and report it to Scamwatch. Separately, China's Australia-facing education agent industry is large and dominated by established firms with direct university partnerships, and there is little credible reporting of the small-consultancy document fraud seen in some South Asian markets.",
      },
      {
        q: "Can I get PR in Australia after studying from China?",
        a: "It is possible but pursued less often than by graduates from South Asia. Chinese nationals lodged only about 10 percent of all Temporary Graduate (subclass 485) visa applications in the most recent reporting period, despite supplying nearly a fifth of all new student visas, a much smaller share than India's. Many Chinese graduates return home for work rather than move onto a points-tested skilled visa. If you do want to stay, the pathway is the same 485 visa followed by a points-tested visa, and your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.chsi.com.cn/en/",
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://thepienews.com/australia-eases-risk-ratings-amid-calls-to-scrap-system/",
      "https://monitor.icef.com/2026/04/australia-student-visa-refusal-rates-reach-record-high-amid-weakening-demand-from-china/",
      "https://thepienews.com/11-agents-in-china-working-with-30-australian-unis/",
      "https://www.abc.net.au/news/2019-12-01/chinese-students-paid-to-ghost-write-for-australia-uni-students/11725330",
      "https://www.accc.gov.au/media-release/national-anti-scam-centre-warns-of-spike-in-scams-threatening-chinese-students",
      "https://www.scamwatch.gov.au/types-of-scams/threat-scams/chinese-authority-scams",
      "https://www.teqsa.gov.au/guides-resources/resources/sector-updates-and-alerts/sector-alert-commercial-academic-cheating-service-activities-campus",
    ],
    lastVerified: "2026-09-05",
  },

  vietnam: {
    slug: "vietnam",
    code: "VN",
    name: "Vietnam",
    demonym: "Vietnamese",
    currency: "VND",
    intro: [
      "Vietnam is one of Australia's top five source countries for international education, and Vietnamese citizens can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Vietnam sits at student-visa Evidence Level 2, which is more favourable than the Evidence Level 3 markets such as India, Nepal, Bangladesh, and Pakistan.",
      "There is not much that is unusual for Vietnamese applicants. The main points are credential recognition of a four-year Vietnamese bachelor's, English evidence, and choosing between applying directly or through an agent, since Vietnam has a large and highly commercialised study-abroad consulting industry.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is accepted at most universities for Vietnamese citizens, including at universities in Western Australia such as Curtin, which is the state where several other South and Southeast Asian markets face agent-only rules. Agents are still widely used in Vietnam for the offer, deposit, and visa steps, not because universities require it.",
      "Have certified copies of your transcripts and completion certificates ready, with certified English translations. Some universities want documents verified through the awarding institution.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory to shortlist and the deadline calendar for the recommended dates.",
      "Vietnam's Ministry of Education and Training has put the number of study-abroad consulting firms operating in the country at more than 2,500, and most Vietnamese families use one because of the language barrier and the amount of paperwork involved, not because a university requires it. The Australian Embassy in Hanoi and the Consulate-General in Ho Chi Minh City both run standing visa-scam warning pages, most recently reissued around International Fraud Awareness Week in November 2025, describing social media posts that falsely promise an Australian visa for sums as high as VND 1.5 billion. Those warnings are about general migration fraud rather than education-agent fraud specifically; treat any agent who guarantees a visa outcome, asks you to pay before lodging, or wants to communicate only through Zalo, WhatsApp, or Facebook Messenger as a red flag, and track your own application through ImmiAccount.",
    ],
    visaNote: [
      "Home Affairs calculates a country's evidence level from a weighted index of visa cancellations (25 percent), refusals for a fraud reason (40 percent, the single largest weight), other refusals (10 percent), the rate of student visa holders becoming unlawful non-citizens (15 percent), and the rate of Subsequent Protection Visa applications (10 percent). A score below 1.0 sits at Level 1, a score between 1.0 and 2.7 sits at Level 2, and a score above 2.7 sits at Level 3. Vietnam sits within that Level 2 band, alongside China. Home Affairs does not publish a specific date for when Vietnam was set at Level 2, so treat its placement as an established, longstanding rating rather than a recent change, and check the current level when you apply since these are reviewed periodically.",
      "Home Affairs' most recent quarterly program report (to 31 December 2025) shows Vietnam as Australia's ninth largest source of student visa lodgements in the 2025-26 program year to that date (5,647 applications, down 5.6 percent on the same period the year before, 2.7 percent of the total) and ninth largest by visas granted (4,487, down 30.8 percent, 2.5 percent of the total). Vietnam was also the fifth largest source of student visa holders in Australia as at 31 December 2025, with 22,322 people, though that was down 7.5 percent on a year earlier as the broader student visa population contracted. Grant rates for Vietnamese applicants were 80.7 percent for decisions made onshore and 85.8 percent offshore in the October to December 2025 quarter, both slightly higher than a year earlier (75.8 percent and 80.1 percent respectively), and above the equivalent rates for several Evidence Level 3 countries in the same report.",
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
        a: "Vietnam is at Evidence Level 2, which is medium risk. Home Affairs sets levels from a weighted index where fraud-related refusals carry the largest weight (40 percent), and a score between 1.0 and 2.7 places a country at Level 2. Home Affairs does not publish a date for when Vietnam was set at Level 2, so treat it as an established rating. Grant rates for Vietnamese applicants were above 80 percent in the most recent quarter reported, but you still need to show funds and meet the Genuine Student requirement. Levels are reviewed, so check when you apply.",
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
        a: "No, most universities accept direct applications from Vietnamese citizens, including in Western Australia, where several other source countries face agent-only rules. Agents remain common in Vietnam because of the language barrier and paperwork involved, not because universities require them. Check the university's how-to-apply page.",
      },
      {
        q: "Are there visa scams targeting Vietnamese students applying to Australia?",
        a: "The Australian Embassy in Hanoi and the Consulate-General in Ho Chi Minh City both warn about visa scams, most recently around International Fraud Awareness Week in November 2025, describing social media posts that falsely promise a visa for large sums of money. These are general migration-fraud warnings rather than reports specific to student visas or education agents. Track your own application through ImmiAccount, and treat anyone who guarantees a visa outcome as a red flag.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://hcmc.vietnam.embassy.gov.au/hchi/HomeAffairs14Nov25.html",
      "https://vietnam.embassy.gov.au/hnoi/MR251114.html",
      "https://www.trade.gov/market-intelligence/vietnam-education-agents",
    ],
    lastVerified: "2026-09-05",
  },

  bangladesh: {
    slug: "bangladesh",
    code: "BD",
    name: "Bangladesh",
    demonym: "Bangladeshi",
    currency: "BDT",
    intro: [
      "Bangladeshi students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. In January 2026 the Australian Government raised Bangladesh to the highest student-visa evidence level, so the financial and document checks are now thorough.",
      "The parts specific to Bangladesh are the higher visa scrutiny, how universities treat a three-year pass degree, and the fact that several universities only accept applications from Bangladeshi citizens through an authorised agent.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Several universities, and most in Western Australia, only accept applications from Bangladeshi citizens through an approved agent. Check each university's how-to-apply page.",
      "Have certified academic transcripts and certificates ready. Universities may ask for verification through the education board or the awarding university. Deadlines can be earlier for Bangladeshi applicants at universities that apply higher-scrutiny country dates, so apply three to four months ahead.",
      "Most universities run February and July intakes and assess on a rolling basis. Use the universities directory and the deadline calendar.",
      "Bangladesh has no dedicated licensing authority for education and migration consultancies; most operate on a generic municipal trade licence, and a 2026 feature in The Business Standard on the sector argued this legal vacuum is the reason forged bank statements and fake admission offers keep surfacing. That gap is where most of the fraud risk sits, not with the Australian universities themselves. In July 2026, police in Dhaka arrested the operator of five linked visa and education consultancies, Just Thought Education Consultant among them, hours before he was due to board a flight to Australia; he is accused of taking roughly Tk 15.5 crore from about 350 students and families. Before you pay anyone, confirm the agent is on your target university's own published list of authorised agents.",
      "The Australian High Commission in Dhaka lists specific warning signs: an agent who guarantees a visa outcome, one who asks for payment into a private or personal bank account rather than an official channel, one who charges extra to 'speed up' your biometrics appointment, or one who tells you to give false information on your application. It also warns that a genuine agent will never block your own access to ImmiAccount, the government's own application system, and to check for mismatches between what an agent tells you and what your ImmiAccount actually shows. In August 2026, Australia joined twelve other countries, including Canada, the UK, and Germany, in a joint statement to Bangladeshi visa applicants warning against falsified documents, unlicensed agents, and payments to unauthorised intermediaries; none of the missions said they work with agents at all. Separately, Australia's Department of Home Affairs opened a dedicated office in Dhaka in late 2025 as part of a multi-country 'Fighting Visa Fraud' campaign with Canada, New Zealand, and the UK.",
    ],
    visaNote: [
      "In January 2026 the Australian Government moved Bangladesh to student-visa Evidence Level 3, the highest tier, alongside India, Nepal, and Bhutan. Home Affairs calculates a country's evidence level from a weighted index of visa cancellations, refusals, and overstay rates, and the rate of refusals for a fraud reason carries the single largest weight (40 percent) in that index; a score above 2.7 places a country at Level 3. A Home Affairs spokesperson confirmed the change took effect on 8 January 2026 to 'assist with the effective management of emerging integrity issues.' Trade and news reporting on the move linked it to a rise in forged financial and academic documents detected during the November to December 2025 lodgement peak, and to students who could not get into the US, UK, or Canada increasingly applying to Australia instead. You now need to provide, upfront, several months of genuine bank statements, a documented source of funds, and authenticated transcripts, and processing runs longer. Check the current level when you apply, since these are reviewed.",
      "Home Affairs does not publish one Bangladesh-specific grant or refusal rate; the rate it does publish varies by quarter and by whether the decision is made in Australia or offshore. In its own figures, the grant rate for Bangladeshi applicants in the October to December 2025 quarter was 89.0 percent for decisions made in Australia, up from 85.8 percent the previous quarter, and 81.6 percent for decisions made offshore, down sharply from 97.8 percent the previous quarter. On volume, in the 2025-26 program year to 31 December 2025, Bangladesh was Australia's fourth largest source of student visa lodgements (10,502, up 86.7 percent on the same period the year before, 5.1 percent of the total) and fourth largest by visas granted (8,454, up 46.2 percent, 4.7 percent of the total), behind China, India, and Nepal in both counts. Bangladesh was also the fourth largest single nationality among student visa holders in Australia (26,604) as at 31 December 2025.",
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
      {
        q: "How do I know if a Bangladeshi education agent for Australia is legitimate?",
        a: "Check that the agent appears on your target university's own published list of authorised agents. Bangladesh has no licensing authority for education consultancies, so a trade licence alone proves nothing. Be wary of anyone who guarantees a visa outcome, asks you to pay into a personal bank account, charges extra to 'speed up' biometrics, or blocks your own access to ImmiAccount; the Australian High Commission in Dhaka specifically warns against all of these. A well-documented 2026 case, a Dhaka operator running five consultancies who was arrested boarding a flight to Australia after allegedly taking money from around 350 families, shows the risk sits with unregulated consultants, not with Australian universities.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://bangladesh.embassy.gov.au/daca/scam-safe.html",
      "https://www.thedailystar.net/news/australia-tightens-visa-scrutiny-bangladeshi-students-citing-integrity-issues-4079141",
      "https://www.thedailystar.net/news/bangladesh/diplomacy/news/13-countries-warn-bangladeshis-seeking-visas-against-fake-documents-unauthorised-agents-4146736",
      "https://www.tbsnews.net/bangladesh/crime/overseas-education-scam-just-thought-consultancy-owner-arrested-while-trying-leave",
      "https://www.tbsnews.net/features/pursuit/why-bangladesh-must-regulate-its-education-consultancy-sector-1509841",
      "https://www.bssnews.net/news/333986",
    ],
    lastVerified: "2026-09-05",
  },

  "sri-lanka": {
    slug: "sri-lanka",
    code: "LK",
    name: "Sri Lanka",
    demonym: "Sri Lankan",
    currency: "LKR",
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
      "Sri Lanka is at student-visa Evidence Level 2, having moved up from Level 1 in late 2025. Home Affairs sets evidence levels from a weighted index across five factors: visa cancellations (25% weighting), refusals for a fraud reason (40%), other refusals (10%), the rate of visa holders becoming unlawful non-citizens (15%), and subsequent protection-visa applications (10%). An index below 1.0 sits at Level 1, an index between 1.0 and 2.7 sits at Level 2, and anything above 2.7 sits at Level 3. Sri Lanka's index crossed above 1.0 in late 2025, moving it to Level 2, but it is nowhere near the 2.7 threshold that puts Nepal, India, Pakistan, and Bangladesh at Level 3. In practice this means more upfront financial and English evidence than Sri Lanka faced before, but a lighter document check than the Level 3 countries.",
      "Home Affairs' own student visa program report puts Sri Lankan volumes in context. In the six months to 31 December 2025, Sri Lankan citizens lodged 4,397 student visa applications (2.1% of the national total, down 2.0% on the same period a year earlier) and were granted 4,076 (2.3% of the total, down 21.8%), as overall applicant numbers cooled. The onshore grant rate for Sri Lankan applicants rose across the year, from 73.4% in the quarter to December 2024 to 85.6% in the quarter to December 2025; the offshore grant rate eased over the same run of quarters, from 94.1% to 87.3%. Sri Lankan media later reported a sharper jump in refusals into 2026, citing Home Affairs and Australian Bureau of Statistics figures showing about 38% of Sri Lankan student visa applications refused in February 2026, a level still well below Nepal (65%), Bangladesh (51%), and India (40%) in the same reporting.",
      "Where Sri Lankan applications run into trouble it is usually over source of funds, exchange-control paperwork for moving money out of the country, or a study plan that does not fit the applicant's background. A documented savings history addresses most of it. Sri Lanka's exchange controls have also pushed some families toward informal undiyal or hawala money-transfer networks to move tuition and living-cost money out of the country. The Central Bank of Sri Lanka treats these transfers as a money-laundering offence, and Sri Lankan academics writing in The Island have specifically named students funded from home as easy targets for bogus brokers, since the transfers are unregulated and unrecoverable if a broker disappears with the money. Send fees and living costs through a bank or the university's own payment gateway, not an informal broker.",
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
        a: "Sri Lanka is at Evidence Level 2, having moved up from Level 1 in late 2025. Home Affairs scores each country on a weighted index of cancellations, fraud-related refusals, other refusals, unlawful non-citizen rates, and protection-visa claims; a score between 1.0 and 2.7 is Level 2, below 1.0 is Level 1, and above 2.7 is Level 3. Sri Lanka's score moved just above 1.0, well short of the Level 3 threshold that applies to Nepal, India, Pakistan, and Bangladesh. Levels are reviewed, so check the current position when you apply.",
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
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://www.dailymirror.lk/breaking-news/Rejection-of-Sri-Lankan-student-visa-applications-to-Australia-surge-to-38/108-339491",
      "https://island.lk/undial-and-hawala-is-the-risk-worth-taking/",
    ],
    lastVerified: "2026-09-05",
  },

  indonesia: {
    slug: "indonesia",
    code: "ID",
    name: "Indonesia",
    demonym: "Indonesian",
    currency: "IDR",
    intro: [
      "Indonesian students can study at any Australian university, and Indonesia is one of Australia's closest large source countries. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Indonesia moved to student-visa Evidence Level 2 in early 2026 after a spell at Level 1, so financial evidence and an English test result are now expected in most applications.",
      "Not much is unusual for Indonesian applicants. The main points are how universities treat the SMA certificate and the S1 degree, English evidence, and whether your funding is personal savings or a scholarship such as LPDP.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Indonesian citizens, and agents are widely used for the offer, deposit, and visa steps.",
      "Have legalised copies of your ijazah and transcript ready, with certified English translations. Universities may ask for verification through the awarding institution.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory to shortlist and the deadline calendar for the recommended dates.",
    ],
    visaNote: [
      "Indonesia is at student-visa Evidence Level 2, having moved up from Level 1 in early 2026. Home Affairs sets evidence levels from a weighted index across five factors: visa cancellations (25% weighting), refusals for a fraud reason (40%), other refusals (10%), the rate of visa holders becoming unlawful non-citizens (15%), and subsequent protection-visa applications (10%). An index below 1.0 sits at Level 1, an index between 1.0 and 2.7 sits at Level 2, and anything above 2.7 sits at Level 3. Home Affairs' own evidence-levels page sets out this methodology but does not publish a change log or an announcement date for Indonesia's move, and migration-agent reporting in Indonesia that dates the shift to around March 2026 is not independently confirmed by a primary government or news source, so treat early 2026 as the best-supported date range rather than a confirmed one. Either way, Indonesia's index is well short of the 2.7 threshold that put Nepal, India, Pakistan, and Bangladesh at Level 3 in a January 2026 review. Be ready to show, upfront, funds for tuition, travel, and 12 months of living costs, a valid English test result, and a Genuine Student statement that case officers will read closely.",
      "Home Affairs' own student visa program report puts Indonesian volumes in context. In the six months to 31 December 2025, Indonesian citizens lodged 6,006 student visa applications (2.9% of the national total, up 4.8% on the same period a year earlier) and were granted 5,697 (3.2% of the total, up 2.2%), making Indonesia the seventh largest source of lodgements and sixth largest by grants. Applications from students already in Australia rose faster than those from offshore: onshore lodgements climbed 30.3% to 2,117, while offshore lodgements eased 5.3% to 3,889. The onshore grant rate for Indonesian applicants was 71.4% in the quarter to December 2025, up from 68.0% the previous quarter and 62.0% a year earlier, but still below the 75.4% all-countries onshore average. The offshore grant rate eased to 88.6%, down from 91.5% the previous quarter, though still above the 83.8% all-countries offshore average. Indonesia was also the tenth largest source of Temporary Graduate (subclass 485) visa lodgements (1,441, up 37.4%) and had 15,593 student visa holders in Australia as at 31 December 2025 (up 5.2%), the ninth largest cohort of any citizenship country.",
      "Where Indonesian applications run into trouble it is usually over source of funds, sponsorship letters without matching bank evidence, or a study plan that does not follow from previous study or work. A documented savings history, or a clear scholarship award letter, addresses most of it.",
      "Indonesia does not have anything like the organised education-agent fraud problems documented in Nepal, Bangladesh, or the Philippines, and there is no documented pattern of fraud specifically targeting applicants for the LPDP scholarship; the one LPDP controversy reported in 2026 involved a scholar sanctioned for breaching a post-study service obligation, not fraud against applicants. The Australian Embassy in Jakarta still runs a \"Stay safe from visa scams\" page, in English and Indonesian, that lists the warning signs common to Indonesian visa fraud generally: contact through social media or WhatsApp, a guaranteed visa outcome, a demand to hand over your passport, a fee well above the official Department of Home Affairs charge, and the specific false claim that you can work on a Visitor visa or switch it to a Student visa once you are in Australia. It advises using only official government sources and never letting anyone else submit an application on your behalf without checking every detail yourself. The clearest documented Indonesian scam wave in 2025 sat in a different visa stream: ABC News Indonesian reported in November 2025 that touts were charging young Indonesians Rp20 million to Rp60 million (roughly AUD 2,000 to 6,000) for a supposedly guaranteed Work and Holiday visa support letter, a document that is actually free and allocated by lottery, and that more than 3,000 formal complaints had been filed over it. That is not the student visa route, but it is the same guaranteed-outcome-for-a-fee pattern the Embassy's page warns against, and no legitimate education or migration agent can guarantee your Genuine Student assessment.",
    ],
    credentials: [
      "For undergraduate entry, universities take the SMA or MA certificate, often with a foundation year or a completed first year of an Indonesian S1 degree for direct entry. The four-year S1 (sarjana) is accepted for direct entry to Australian master's programs.",
      "Universities publish Indonesia-specific entry tables. Confirm the IPK on the 4-point scale that your course requires.",
      "English is shown with IELTS, PTE, or TOEFL. Most universities want 6.5 overall for a master's, and the student visa has its own lower floor. Confirm both.",
    ],
    popularFields: [
      "Business, management, and accounting",
      "Engineering",
      "Information technology",
      "Environmental science and sustainability",
      "Public policy and development",
    ],
    faq: [
      {
        q: "What is Indonesia's assessment level for the Australian student visa?",
        a: "Indonesia is at Evidence Level 2, having moved up from Level 1 in early 2026. Financial evidence and an English test result are now expected in most applications, and Genuine Student statements are read closely. Levels are reviewed, so check the current position when you apply.",
      },
      {
        q: "Is an Indonesian S1 degree accepted in Australia?",
        a: "Yes, a four-year S1 (sarjana) is accepted for direct entry to most Australian master's programs. Universities publish Indonesia-specific entry tables mapping your IPK on the 4-point scale to their requirement. Competitive courses want a higher IPK.",
      },
      {
        q: "How much does it cost to study in Australia from Indonesia?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Can I use an LPDP scholarship to study in Australia?",
        a: "Yes. LPDP is one of the main funding routes for Indonesian postgraduate students in Australia. You still apply to the university and for the student visa yourself, and the award letter serves as your evidence of funds. Check that your course and university are on the LPDP list.",
      },
      {
        q: "Can I get PR in Australia after studying from Indonesia?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
      {
        q: "Are there visa scams targeting Indonesian applicants for Australia?",
        a: "Yes, though nothing at the scale documented in some other source countries. The Australian Embassy in Jakarta runs a dedicated warning page: never pay someone who guarantees a visa outcome, never hand over your passport, and be wary of anyone claiming you can work on a Visitor visa or switch it to a Student visa once in Australia. The Department of Home Affairs is the only official visa provider. There is no documented pattern of fraud specifically targeting Indonesia's LPDP scholarship applicants; the largest documented scam wave in 2025 involved touts charging for a fake Work and Holiday visa support letter, a different visa stream.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://indonesia.embassy.gov.au/jakt/Visa_scams.html",
      "https://www.abc.net.au/indonesian/2025-11-26/pengajuan-sduwhv-di-indonesia-diramaikan-calo-dan-penipu/106051552",
    ],
    lastVerified: "2026-09-05",
  },

  philippines: {
    slug: "philippines",
    code: "PH",
    name: "Philippines",
    demonym: "Filipino",
    currency: "PHP",
    intro: [
      "Filipino students can study at any Australian university, and the Philippines is a fast-growing source of students, especially in nursing and health. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. The Philippines is at student-visa Evidence Level 3, the highest tier, so the financial and document checks are thorough.",
      "The parts specific to the Philippines are the higher visa scrutiny, how universities read a Philippine bachelor's degree now that the country has 12 years of schooling, English evidence, and the separate registration step if you plan to work as a nurse.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Filipino citizens, and agents are widely used for the offer, deposit, and visa steps.",
      "Have certified true copies of your transcript of records and diploma ready, and expect universities to verify them through the Philippine institution or CHED. Apply three to four months ahead, since Evidence Level 3 processing runs longer.",
      "Most universities run February and July intakes and assess on a rolling basis. Use the universities directory to shortlist and the deadline calendar for the recommended dates.",
      "The Philippines runs one of the world's most institutionalised systems for policing overseas recruitment, though it was built for labour migration, not education specifically. The Department of Migrant Workers (DMW, the renamed POEA) took down 170,140 Facebook and TikTok pages for illegal recruitment between 2022 and November 2025, with 85,538 of those in 2025 alone, according to Philstar.com reporting from December 2025. Most of that activity is fake work-abroad job postings rather than study offers, but the DMW's own guidance applies equally to education agents: do not pay before you have a signed contract, do not deal with anyone who tells you to skip the official DMW or CHED process, and check for a government-issued ID and a verifiable licence. CHED has separately had to publicly disown Facebook pages impersonating it to push fake scholarship offers, so verify any scholarship or admission claim through CHED's own website rather than a social media post.",
      "The Australian Embassy in Manila runs a dedicated \"Stay safe from visa scams\" page for Filipino applicants. It states that the Department of Home Affairs is the only official Australian visa provider, warns that a genuine agent will never ask you to pay in cryptocurrency or hand over your passport, and flags the specific claim that you can work on a Visitor visa or switch it to a Student visa once you are in Australia, which is not legal. It tells applicants to verify a migration agent's Migration Agent Registration Number through OMARA, to check their own visa details directly in ImmiAccount rather than relying on what an agent tells them, and to report suspected scams to Border Watch or the Department of Home Affairs Global Call Centre.",
    ],
    visaNote: [
      "The Philippines is at student-visa Evidence Level 3, the highest tier under Home Affairs' Simplified Student Visa Framework. Home Affairs calculates a country's level from a weighted index of visa cancellations, refusals, and overstay rates, and the rate of refusals for a fraud reason carries the single largest weight (40 percent) in that index; a score above 2.7 places a country at Level 3. Trade reporting on Home Affairs' most recent evidence-level update, effective for applications lodged from 30 September 2025 and based on visa outcomes from 1 July 2024 to 30 June 2025, placed the Philippines at Level 3 alongside Fiji, Pakistan, and Colombia. Unlike India, Nepal, Bangladesh, and Bhutan, which were moved up to Level 3 in a separate out-of-cycle review on 8 January 2026, the Philippines was not part of that round. Home Affairs does not publish a specific date or trigger for when the Philippines first reached Level 3, so treat its placement as longstanding rather than a recent change, and check the current level when you apply, since these are reviewed periodically.",
      "Home Affairs does not publish one Philippines-specific grant or refusal rate; the rate it does publish varies by quarter and by whether the decision is made in Australia or offshore. In the October to December 2025 quarter, the grant rate for Philippine applicants was 69.9 percent for decisions made in Australia, up from 64.9 percent the previous quarter but below the 75.4 percent all-countries average, and 68.2 percent for decisions made offshore, down slightly from 67.3 percent the previous quarter and well below the 83.8 percent all-countries offshore average. On volume, in the 2025-26 program year to 31 December 2025, the Philippines was Australia's fifth largest source of student visa lodgements (6,993, up 27.6 percent on the same period the year before, 3.4 percent of the total) and seventh largest by visas granted (5,063, down 1.2 percent, 2.8 percent of the total). The Philippines was also the fifth largest source of Temporary Graduate (subclass 485) visa lodgements (4,915, up 137.7 percent) and fourth largest by TGV grants (5,191, up 66.0 percent).",
      "Where Filipino applications run into trouble it is usually over funds that appear shortly before applying, sponsor income that is hard to document, or a course that does not follow on from previous study or work. A genuine savings history that predates your decision to study abroad is the strongest signal.",
    ],
    credentials: [
      "The Philippines now has 12 years of schooling under K-12, so a Philippine Grade 12 result is used for undergraduate entry, often with a foundation year. A four-year Philippine bachelor's degree is generally accepted for direct entry to Australian master's programs; older four-year degrees built on 10 years of schooling can be treated as needing a bridging qualification, so confirm with the university.",
      "Universities publish Philippines-specific entry tables. Confirm the GPA or weighted average your course requires and how it reads your grading scale.",
      "Most Philippine degrees are taught in English, and many universities accept that for admission. The student visa has its own English rule, and health courses set a higher bar, so confirm both. IELTS and PTE are the usual tests.",
    ],
    popularFields: [
      "Nursing and health sciences",
      "Information technology",
      "Accounting and business",
      "Engineering",
      "Education and teaching",
    ],
    faq: [
      {
        q: "What is the Philippines' assessment level for the Australian student visa?",
        a: "The Philippines is at Evidence Level 3, the highest tier. You must supply several months of bank statements, a documented source of funds, and authenticated academic records upfront, and processing is slower. Levels are reviewed, so check the current position when you apply.",
      },
      {
        q: "Is a 4-year Philippine bachelor's degree accepted in Australia?",
        a: "Usually yes, for direct entry to Australian master's programs. Universities publish Philippines-specific entry tables mapping your GPA to their requirement. Older degrees built on 10 years of schooling can need a bridging qualification, so confirm with the university.",
      },
      {
        q: "How much does it cost to study in Australia from the Philippines?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Can I work as a nurse in Australia after studying from the Philippines?",
        a: "Studying nursing and being registered to practise are two steps. After a recognised Australian nursing qualification you apply to the Nursing and Midwifery Board through AHPRA; Philippine-trained nurses who have not studied in Australia usually go through the Board's outcomes-based assessment instead. Nursing courses also require a higher English score, commonly IELTS 7.0.",
      },
      {
        q: "Can I get PR in Australia after studying from the Philippines?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
      {
        q: "How do I know if a Philippine education or visa agent is legitimate?",
        a: "Check that any admissions agent appears on your target university's own published list of authorised agents, and, if they operate in Australia, verify their Migration Agent Registration Number on the OMARA website. Read the Australian Embassy Manila's \"Stay safe from visa scams\" page before you pay anyone: it warns that the Department of Home Affairs is the only official visa provider, that a genuine agent never asks for cryptocurrency or your passport, and that claims you can switch from a Visitor visa to a Student visa once in Australia are false. For work-abroad-style consultancies, the Department of Migrant Workers (DMW) publishes which recruiters are currently licensed.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
      "https://www.ahpra.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://thepienews.com/australia-eases-risk-ratings-amid-calls-to-scrap-system/",
      "https://philippines.embassy.gov.au/mnla/Stay_safe_from_visa_scams.html",
      "https://www.philstar.com/headlines/2025/12/20/2495462/online-illegal-recruitment-modus-rises-dmws-4th-full-year",
      "https://dmw.gov.ph/archives/poea/air/whatisair.html",
    ],
    lastVerified: "2026-09-05",
  },

  thailand: {
    slug: "thailand",
    code: "TH",
    name: "Thailand",
    demonym: "Thai",
    currency: "THB",
    intro: [
      "Thai students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Thailand has long been treated by universities and agents as a lower-scrutiny market for the student visa, and Home Affairs does not publish a public evidence level by country, so treat any specific level quoted for Thailand online with caution and check the Document Checklist Tool for the current requirement. What is verifiable in Home Affairs' own data is that Thailand is now a small and shrinking source country: it did not rank among the top 15 nationalities by student visa lodgements or grants in the 2025-26 program year to 31 December 2025, and the number of Thai student visa holders in Australia fell 27.6 percent over the year to 10,674.",
      "Not much is unusual for Thai applicants. The main points are how universities read the Mathayom 6 certificate and a Thai bachelor's degree, English evidence, and choosing between applying directly or through an agent.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is common for Thai citizens at most universities, and agents are also widely used for the offer, deposit, and visa steps.",
      "Have certified transcripts and your degree certificate ready, with certified English translations. Some universities want documents verified through the awarding institution or the Ministry of Higher Education.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory to shortlist and the deadline calendar for the recommended dates.",
      "There is little public reporting of an Australia-specific student-visa agent fraud problem in Thailand, unlike some other source countries. The Australian Embassy in Bangkok's most substantive recent statement on the subject is a general fraud-awareness notice issued on 17 November 2025 for International Fraud Awareness Week, in which Australian Ambassador to Thailand Dr Angela Macdonald noted that more than 110,000 Thais travelled to Australia the previous year and reminded applicants to use official sources and be wary of anyone promising a guaranteed visa outcome or asking for payment through social media. Treat that as routine, proportionate advice rather than a sign of a specific problem with Thai applicants.",
    ],
    visaNote: [
      "Home Affairs calculates a country's evidence level from a weighted index of visa cancellations (25 percent), refusals for a fraud reason (40 percent, the single largest weight), other refusals (10 percent), the rate of student visa holders becoming unlawful non-citizens (15 percent), and the rate of Subsequent Protection Visa applications (10 percent). A score below 1.0 sits at Level 1, a score between 1.0 and 2.7 sits at Level 2, and a score above 2.7 sits at Level 3. Home Affairs does not publish which band each country sits in, and third-party guides that quote a specific level for Thailand are not consistent with each other, so do not rely on any of them. Check the Document Checklist Tool on the Home Affairs website for your provider, since the actual documentary requirement depends on the country and institution combination.",
      "Home Affairs' most recent quarterly program report (to 31 December 2025) shows Thailand's onshore (in Australia) grant rate at 60.6 percent in the October to December 2025 quarter, down from 74.3 percent the previous quarter and 78.0 percent in the same quarter a year earlier. Applications lodged in Australia by Thai citizens fell 31.7 percent year on year to 1,728, and grants fell 17.5 percent to 1,513, over the 2025-26 program year to that date. Thailand did not appear among the top 15 citizenship countries for combined onshore and offshore lodgements or grants in that period, and its student visa holder population in Australia fell 27.6 percent over the year to 10,674 as at 31 December 2025, the 13th largest nationality on issue. You should still be ready to show funds for tuition, travel, and 12 months of living costs, and to satisfy the Genuine Student requirement.",
      "Where Thai applications run into trouble it is usually over a thin Genuine Student statement, a course that does not connect to previous study or work, or funds that appear only just before applying. A clear study plan and a documented savings history address most of it.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Mathayom 6 (M6) certificate, often with a foundation year, or accept a completed first year of a Thai bachelor's for direct entry. A four-year Thai bachelor's degree is accepted for direct entry to Australian master's programs.",
      "Universities publish Thailand-specific entry tables. Confirm the GPA on the 4-point scale that your course requires.",
      "English is shown with IELTS, PTE, or TOEFL. Most universities want 6.5 overall for a master's, and the student visa has its own lower floor. Confirm both.",
    ],
    popularFields: [
      "Hospitality, tourism, and events",
      "Business and management",
      "Engineering",
      "Information technology",
      "Design and creative industries",
    ],
    faq: [
      {
        q: "What is Thailand's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish a public list of evidence levels by country, so treat any specific level quoted for Thailand online with caution. What is verifiable is the visa data itself: Thailand's onshore grant rate fell from 78.0 percent in the October to December 2024 quarter to 60.6 percent in the same quarter of 2025, and the number of Thai student visa holders in Australia fell 27.6 percent over that year to 10,674, the 13th largest nationality on issue. You still need to show funds and meet the Genuine Student requirement, so check the Document Checklist Tool on the Home Affairs website for your provider.",
      },
      {
        q: "Are there visa scams targeting Thai students applying to Australia?",
        a: "There is little public reporting of an Australia-specific student-visa agent fraud problem in Thailand. The Australian Embassy in Bangkok's most recent statement on the subject was a general fraud-awareness notice for International Fraud Awareness Week in November 2025, reminding applicants to use official sources and treat anyone promising a guaranteed visa outcome as a red flag. That is standard advice repeated for most source countries, not evidence of a specific problem with Thai applicants.",
      },
      {
        q: "Is a Thai bachelor's degree accepted in Australia?",
        a: "Yes, a four-year Thai bachelor's is accepted for direct entry to most Australian master's programs. Universities publish Thailand-specific entry tables mapping your 4-point GPA to their requirement. Competitive courses want a higher GPA.",
      },
      {
        q: "How much does it cost to study in Australia from Thailand?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Can I get PR in Australia after studying from Thailand?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
      {
        q: "Do Thai students need to apply through an agent?",
        a: "No, most universities accept direct applications from Thai citizens. Agents are common for handling the offer, deposit, and visa lodgement, but not required everywhere. Check the university's how-to-apply page.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
      "https://immi.homeaffairs.gov.au/what-we-do/education-program/what-we-do/evidence-levels",
      "https://www.homeaffairs.gov.au/research-and-stats/files/student-temporary-grad-program-report-dec-2025.pdf",
      "https://thailand.embassy.gov.au/bkok/PR2025_visa_fraud.html",
    ],
    lastVerified: "2026-09-05",
  },

  cambodia: {
    slug: "cambodia",
    code: "KH",
    name: "Cambodia",
    demonym: "Cambodian",
    currency: "KHR",
    intro: [
      "Cambodian students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Cambodia is a small source of students in Australia, and scholarships fund a large share of those who go.",
      "The parts specific to Cambodia are how universities read the Bac II and a Cambodian bachelor's degree, English evidence, and documenting a source of funds that satisfies the Genuine Student requirement.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Cambodian citizens, and agents help with the offer, deposit, and visa steps.",
      "Have certified copies of your Bac II certificate, transcripts, and degree documents ready, with certified English translations. Universities may want them verified through the awarding institution or the Ministry of Education.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Home Affairs does not publish a public evidence level for Cambodia, so use the Document Checklist Tool for your country and chosen provider to see what is required. Expect to show funds for tuition, travel, and 12 months of living costs, a valid English test result, and a Genuine Student statement.",
      "Applications most often run into trouble over source of funds, sponsor income that is hard to document, and a study plan that does not follow from previous study or work. If a scholarship is funding you, the award letter is your strongest evidence.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Bac II (Baccalaureate), usually with a foundation year. A four-year Cambodian bachelor's degree is generally accepted for direct entry to Australian master's programs, though some universities assess it case by case.",
      "Ask each university how it reads your qualification and what GPA or grade average your course requires.",
      "English is shown with IELTS, PTE, or TOEFL. Most universities want 6.5 overall for a master's, and the student visa has its own lower floor. Confirm both.",
    ],
    popularFields: [
      "Development studies and public policy",
      "Business and management",
      "Information technology",
      "Agriculture and environmental science",
      "Education",
    ],
    faq: [
      {
        q: "What is Cambodia's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country, and the requirement depends on your chosen provider as well. Use the Document Checklist Tool on the Home Affairs website when you apply. In practice you should be ready to show funds and a strong Genuine Student statement.",
      },
      {
        q: "Is a Cambodian bachelor's degree accepted in Australia?",
        a: "Usually yes, for master's entry, though some universities assess Cambodian degrees case by case. Ask the admissions team how it reads your qualification and what grade average it needs.",
      },
      {
        q: "How much does it cost to study in Australia from Cambodia?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Can a scholarship fund study in Australia from Cambodia?",
        a: "Yes, and scholarships fund a large share of Cambodian students in Australia, including the Australia Awards. You still apply to the university and for the student visa yourself, and the award letter serves as your evidence of funds.",
      },
      {
        q: "Can I get PR in Australia after studying from Cambodia?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  malaysia: {
    slug: "malaysia",
    code: "MY",
    name: "Malaysia",
    demonym: "Malaysian",
    currency: "MYR",
    intro: [
      "Malaysian students can study at any Australian university, and Malaysia is one of Australia's longest-standing student markets. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Malaysia sits at student-visa Evidence Level 1, the lowest tier, so many applicants are not asked for financial evidence or an English test upfront.",
      "The parts specific to Malaysia are the twinning and foundation routes that let you start in Malaysia and finish in Australia, how universities read SPM, STPM, and matriculation results, and the fact that Australian campuses in Malaysia offer the same degrees closer to home.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is the norm for Malaysian citizens, and English-language documents rarely need translation.",
      "Several Australian universities run campuses or partner programs in Malaysia, for example Monash, Curtin, and Swinburne, and many local colleges offer 2+1 or 3+0 arrangements. You can also transfer credit from a Malaysian diploma or foundation program.",
      "Most universities run February and July intakes and assess on a rolling basis. Use the universities directory to shortlist and the deadline calendar for the recommended dates.",
    ],
    visaNote: [
      "Malaysia is at student-visa Evidence Level 1, the lowest tier. Many Malaysian applicants are not required to submit financial evidence or an English test result with the application, though Home Affairs can still ask for them. You must meet the Genuine Student requirement and hold a Confirmation of Enrolment.",
      "A low evidence level is not a guaranteed grant. Applications still fail on a weak Genuine Student statement or a course that does not fit the applicant's background, so keep the study plan clear.",
    ],
    credentials: [
      "For undergraduate entry, universities take STPM, A-Levels, the Australian Matriculation (AUSMAT), SAM, a recognised foundation program, or a Malaysian diploma with credit. SPM alone is usually not enough for direct degree entry.",
      "A three-year or four-year Malaysian bachelor's degree is accepted for direct entry to Australian master's programs. Universities publish Malaysia-specific entry tables mapping your CGPA to their requirement.",
      "Many Malaysian applicants are exempt from an English test based on their prior study in English. Confirm the exemption with the university and check whether the student visa also accepts it.",
    ],
    popularFields: [
      "Business, accounting, and actuarial science",
      "Engineering",
      "Information technology and computer science",
      "Medicine and health sciences",
      "Law",
    ],
    faq: [
      {
        q: "What is Malaysia's assessment level for the Australian student visa?",
        a: "Malaysia is at Evidence Level 1, the lowest. Many applicants are not asked for financial evidence or an English test upfront, though Home Affairs can still request them. You must still meet the Genuine Student requirement. Levels are reviewed, so check when you apply.",
      },
      {
        q: "Can I start a degree in Malaysia and finish in Australia?",
        a: "Yes. Twinning and 2+1 or 3+0 programs are common, and Monash, Curtin, and Swinburne run campuses in Malaysia offering the same degrees. You can also transfer credit from a Malaysian diploma or foundation program into an Australian bachelor's.",
      },
      {
        q: "Is a Malaysian bachelor's degree accepted in Australia?",
        a: "Yes, for direct entry to Australian master's programs. Universities publish Malaysia-specific entry tables mapping your CGPA to their requirement. Both three-year and four-year degrees are generally accepted.",
      },
      {
        q: "How much does it cost to study in Australia from Malaysia?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Can I get PR in Australia after studying from Malaysia?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  bhutan: {
    slug: "bhutan",
    code: "BT",
    name: "Bhutan",
    demonym: "Bhutanese",
    currency: "BTN",
    intro: [
      "Bhutanese students can study at any Australian university, and Australia has become the leading overseas destination for students from Bhutan. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. In January 2026 the Australian Government raised Bhutan to student-visa Evidence Level 3, the highest tier, alongside India, Nepal, and Bangladesh.",
      "The parts specific to Bhutan are the higher visa scrutiny, the Royal Monetary Authority approval needed to move money out of the country, and how universities read the Bhutan Higher Secondary Education Certificate and a Bhutanese bachelor's degree.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Bhutanese citizens, and agents are widely used for the offer, deposit, and visa steps.",
      "Have certified copies of your class 12 marksheet and any degree transcripts ready. English is the medium of instruction in Bhutan, so documents are usually already in English.",
      "Plan the foreign-exchange side early. Moving tuition and living funds out of Bhutan needs Royal Monetary Authority approval, and the paperwork takes time. Apply three to four months ahead, since Evidence Level 3 processing runs longer.",
    ],
    visaNote: [
      "In January 2026 Bhutan moved to student-visa Evidence Level 3, the highest tier. You now need to provide, upfront, several months of genuine bank statements, a documented source of funds, and authenticated academic records, and processing runs longer. Check the current level when you apply.",
      "Applications commonly fail on funds that appear shortly before applying, a source of funds that is not clearly documented, and a study plan that does not follow on from previous study. A genuine savings history and Royal Monetary Authority paperwork that matches your stated funds are the strongest signals.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Bhutan Higher Secondary Education Certificate (class 12). A three-year or four-year Bhutanese bachelor's degree, often from a Royal University of Bhutan college, is assessed for master's entry, with a four-year degree mapping more cleanly.",
      "Ask each university how it reads your qualification and what grade average your course requires.",
      "English is the medium of instruction in Bhutan. Universities may waive an English test on that basis, but the student visa has its own English rule, so confirm both.",
    ],
    popularFields: [
      "Nursing and health sciences",
      "Information technology",
      "Engineering",
      "Business and accounting",
      "Education",
    ],
    faq: [
      {
        q: "What is Bhutan's assessment level for the Australian student visa?",
        a: "As of January 2026 Bhutan is at Evidence Level 3, the highest, alongside India, Nepal, and Bangladesh. You must supply several months of bank statements, a documented source of funds, and authenticated academic records upfront, and processing is slower. Levels are reviewed, so check when you apply.",
      },
      {
        q: "How do I move money from Bhutan to pay for study in Australia?",
        a: "Transfers out of Bhutan for tuition and living costs need Royal Monetary Authority approval. Start the paperwork early, keep it consistent with the funds you show Home Affairs, and budget several weeks for it.",
      },
      {
        q: "How much does it cost to study in Australia from Bhutan?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Is a Bhutanese bachelor's degree accepted in Australia?",
        a: "It is assessed for master's entry. A four-year degree maps more cleanly than a three-year one, which some universities treat as needing a bridging qualification. Ask the admissions team how it reads your qualification.",
      },
      {
        q: "Can I get PR in Australia after studying from Bhutan?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  myanmar: {
    slug: "myanmar",
    code: "MM",
    name: "Myanmar",
    demonym: "Myanmar",
    currency: "MMK",
    intro: [
      "Students from Myanmar can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Since the 2021 military takeover, banking restrictions and document access have made applications from Myanmar harder to put together, and visa scrutiny is high.",
      "The parts specific to Myanmar are proving a source of funds through a banking system under sanctions and capital controls, getting academic documents certified, and a Genuine Student statement that case officers will read closely.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Agents are widely used, and many applicants are already outside Myanmar, in Thailand or Singapore, when they apply.",
      "Have certified copies of your matriculation result and any degree transcripts ready, with certified English translations. Verification through the awarding institution can be slow, so start early.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply three to four months ahead. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Home Affairs does not publish an evidence level for Myanmar, and in practice applications face close scrutiny. Use the Document Checklist Tool for your chosen provider. Be ready to show a clearly documented source of funds, a valid English test result, and a detailed Genuine Student statement.",
      "The hardest part is usually financial evidence. International sanctions and Myanmar's capital controls make ordinary bank transfers difficult, so many applicants rely on funds already held abroad, family overseas, or a scholarship. Whatever the source, it needs a clean paper trail.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Myanmar matriculation examination, usually with a foundation year. A Myanmar bachelor's degree is often three years and may be treated as needing a bridging qualification for direct master's entry; a four-year or honours degree maps more cleanly.",
      "Ask each university how it reads your qualification and whether it counts your degree as three or four years.",
      "English is shown with IELTS, PTE, or TOEFL. Most universities want 6.5 overall for a master's, and the student visa has its own lower floor. Confirm both.",
    ],
    popularFields: [
      "Information technology",
      "Business and management",
      "Public health",
      "Engineering",
      "Development studies",
    ],
    faq: [
      {
        q: "What is Myanmar's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country, and applications from Myanmar face close scrutiny in practice. Use the Document Checklist Tool when you apply, and prepare a clearly documented source of funds and a detailed Genuine Student statement.",
      },
      {
        q: "How do I prove funds from Myanmar?",
        a: "It is the main hurdle. Sanctions and capital controls make normal transfers hard, so many applicants use funds already held abroad, an overseas family member, or a scholarship. Home Affairs wants a clean, documented trail whichever route you use.",
      },
      {
        q: "How much does it cost to study in Australia from Myanmar?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Is a Myanmar bachelor's degree accepted in Australia?",
        a: "It depends on length. A three-year degree is often treated as needing a bridging qualification for direct master's entry; a four-year or honours degree maps more cleanly. Ask the admissions team.",
      },
      {
        q: "Can I get PR in Australia after studying from Myanmar?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  mongolia: {
    slug: "mongolia",
    code: "MN",
    name: "Mongolia",
    demonym: "Mongolian",
    currency: "MNT",
    intro: [
      "Mongolian students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Mongolia is a small but growing source of students, with a strong link to Australia through the mining and resources sector.",
      "Not much is unusual for Mongolian applicants. The main points are how universities read the secondary school certificate and a Mongolian bachelor's degree, English evidence, and documenting a source of funds.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Mongolian citizens, and agents help with the offer, deposit, and visa steps.",
      "Have certified copies of your school leaving certificate and degree transcripts ready, with certified English translations. Universities may want documents verified through the awarding institution.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Home Affairs does not publish a public evidence level for Mongolia, so use the Document Checklist Tool for your country and chosen provider. Expect to show funds for tuition, travel, and 12 months of living costs, a valid English test result, and a Genuine Student statement.",
      "Applications most often run into trouble over source of funds and a study plan that does not connect to previous study or work. A documented savings history, or a company or government sponsorship letter backed by matching evidence, addresses most of it.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Mongolian Certificate of Complete Secondary Education, usually with a foundation year. A four-year Mongolian bachelor's degree is accepted for direct entry to Australian master's programs.",
      "Universities assess Mongolian qualifications individually. Confirm the GPA your course requires and how it reads your grading scale.",
      "English is shown with IELTS, PTE, or TOEFL. Most universities want 6.5 overall for a master's, and the student visa has its own lower floor. Confirm both.",
    ],
    popularFields: [
      "Mining, geology, and resources engineering",
      "Business and management",
      "Information technology",
      "Environmental science",
      "Public policy",
    ],
    faq: [
      {
        q: "What is Mongolia's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country, and the requirement also depends on your provider. Use the Document Checklist Tool when you apply. Be ready to show funds and a clear Genuine Student statement.",
      },
      {
        q: "Is a Mongolian bachelor's degree accepted in Australia?",
        a: "Yes, a four-year Mongolian bachelor's is generally accepted for direct entry to Australian master's programs. Universities assess Mongolian qualifications individually, so confirm the GPA your course needs.",
      },
      {
        q: "How much does it cost to study in Australia from Mongolia?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Is there a mining and resources pathway for Mongolian students?",
        a: "Yes. Australian universities are strong in mining engineering, geology, and resources, and this is a common field for Mongolian students given the sector at home. Some study is company-sponsored.",
      },
      {
        q: "Can I get PR in Australia after studying from Mongolia?",
        a: "It is a common pathway, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  colombia: {
    slug: "colombia",
    code: "CO",
    name: "Colombia",
    demonym: "Colombian",
    currency: "COP",
    intro: [
      "Colombian students can study at any Australian university, and Colombia is now one of Australia's largest sources of international students. A first year of a bachelor's or master's costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Most Colombians, though, come for English-language or vocational courses rather than a degree, and the visa steps differ a little for those.",
      "The parts specific to Colombia are the strong pull toward English and vocational study combined with part-time work, how universities read the Bachiller and a Colombian professional degree, and a Genuine Student statement that has to explain the study choice convincingly.",
    ],
    applying: [
      "For a university degree, apply through the university's international portal or an authorised agent, with certified Spanish-to-English translations of your Bachiller certificate and any degree documents.",
      "For English (ELICOS) or vocational (VET) courses, you usually apply through the college or an agent. These sit on the same subclass 500 visa but have lighter English and academic entry requirements.",
      "Most universities run February and July intakes and assess on a rolling basis. English and vocational colleges have monthly or bi-monthly start dates. Use the universities directory and the deadline calendar for degree study.",
    ],
    visaNote: [
      "Home Affairs does not publish a public evidence level for Colombia. Use the Document Checklist Tool for your chosen provider and course type. You should be ready to show funds for tuition, travel, and 12 months of living costs, an English test result, and a Genuine Student statement.",
      "Because many Colombian applications are for lower-cost English or vocational courses with work rights, case officers look hard at whether study or work is the real purpose. A study plan that connects the course to your career, and funds that are not solely dependent on working in Australia, are what carry the application.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Bachiller certificate, often with a foundation year, or a completed first year of a Colombian university program for direct entry.",
      "A Colombian professional degree (titulo profesional), usually four to five years, is accepted for direct entry to Australian master's programs. Universities publish entry tables mapping your average to their requirement.",
      "English is shown with IELTS, PTE, or TOEFL. Degree courses want around 6.5 overall for a master's; English and vocational courses accept lower. The student visa has its own floor.",
    ],
    popularFields: [
      "English language study (ELICOS)",
      "Business and management",
      "Hospitality and tourism",
      "Information technology",
      "Engineering",
    ],
    faq: [
      {
        q: "What is Colombia's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country, and the requirement depends on your course and provider. Use the Document Checklist Tool when you apply. Applications for lower-cost English and vocational courses tend to get more scrutiny on whether study is the real purpose.",
      },
      {
        q: "Can I study English or a vocational course in Australia from Colombia?",
        a: "Yes, both run on the subclass 500 student visa, with lighter entry requirements than a degree and the same work rights. You still need to meet the Genuine Student requirement and show funds.",
      },
      {
        q: "How much does it cost to study in Australia from Colombia?",
        a: "For a bachelor's or master's, budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. English and vocational courses cost much less, often AUD 15,000 to 25,000 a year in tuition.",
      },
      {
        q: "Is a Colombian professional degree accepted in Australia?",
        a: "Yes, a four to five year titulo profesional is accepted for direct entry to most Australian master's programs. Universities publish entry tables mapping your average to their requirement.",
      },
      {
        q: "Can I get PR in Australia after studying from Colombia?",
        a: "It is possible but not automatic, and it is harder from an English or vocational course than from a degree. After graduating, students move to a Temporary Graduate visa (subclass 485) where eligible, gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  brazil: {
    slug: "brazil",
    code: "BR",
    name: "Brazil",
    demonym: "Brazilian",
    currency: "BRL",
    intro: [
      "Brazilian students can study at any Australian university, and Brazil is one of Australia's largest sources of international students. A first year of a bachelor's or master's costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. As with Colombia, most Brazilians come for English-language or vocational courses rather than a degree.",
      "The parts specific to Brazil are the pull toward English and vocational study with part-time work, how universities read the Ensino Medio certificate and a Brazilian bachelor's degree, and a Genuine Student statement that explains the study choice.",
    ],
    applying: [
      "For a university degree, apply through the university's international portal or an authorised agent, with certified Portuguese-to-English translations of your Ensino Medio certificate and any degree documents. A sworn translation (traducao juramentada) is the norm.",
      "For English (ELICOS) or vocational (VET) courses, you usually apply through the college or an agent. These run on the same subclass 500 visa with lighter entry requirements.",
      "Most universities run February and July intakes and assess on a rolling basis. English and vocational colleges start more often. Use the universities directory and the deadline calendar for degree study.",
    ],
    visaNote: [
      "Home Affairs does not publish a public evidence level for Brazil. Use the Document Checklist Tool for your chosen provider and course type. Be ready to show funds for tuition, travel, and 12 months of living costs, an English test result, and a Genuine Student statement.",
      "Because many Brazilian applications are for English or vocational courses with work rights, case officers look closely at whether study or work is the real aim. A study plan that ties the course to your career, and funds not wholly dependent on working in Australia, carry the application.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Ensino Medio certificate, often with a foundation year, or a completed first year of a Brazilian university course for direct entry. ENEM results may also be considered.",
      "A Brazilian bacharelado, usually four to five years, is accepted for direct entry to Australian master's programs. Universities publish entry tables mapping your GPA, on a 10-point or 4-point scale, to their requirement.",
      "English is shown with IELTS, PTE, or TOEFL. Degree courses want around 6.5 overall for a master's; English and vocational courses accept lower. The student visa has its own floor.",
    ],
    popularFields: [
      "English language study (ELICOS)",
      "Business and management",
      "Hospitality and tourism",
      "Engineering",
      "Information technology",
    ],
    faq: [
      {
        q: "What is Brazil's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country, and the requirement depends on your course and provider. Use the Document Checklist Tool when you apply. English and vocational course applications get more scrutiny on whether study is the real purpose.",
      },
      {
        q: "Can I study English or a vocational course in Australia from Brazil?",
        a: "Yes, both run on the subclass 500 student visa, with lighter entry requirements than a degree and the same work rights. You still need to meet the Genuine Student requirement and show funds.",
      },
      {
        q: "How much does it cost to study in Australia from Brazil?",
        a: "For a bachelor's or master's, budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. English and vocational courses cost much less, often AUD 15,000 to 25,000 a year in tuition.",
      },
      {
        q: "Is a Brazilian bacharelado accepted in Australia?",
        a: "Yes, a four to five year bacharelado is accepted for direct entry to most Australian master's programs. Universities publish entry tables mapping your GPA to their requirement.",
      },
      {
        q: "Can I get PR in Australia after studying from Brazil?",
        a: "It is possible but not automatic, and it is harder from an English or vocational course than from a degree. After graduating, students move to a Temporary Graduate visa (subclass 485) where eligible, gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  kenya: {
    slug: "kenya",
    code: "KE",
    name: "Kenya",
    demonym: "Kenyan",
    currency: "KES",
    intro: [
      "Kenyan students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Kenya is a growing African source market for Australia, and financial evidence is the part of the application that needs the most work.",
      "The parts specific to Kenya are the close look at source of funds, how universities read the KCSE and a Kenyan bachelor's degree, and a Genuine Student statement that connects the course to your plans.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Kenyan citizens; agents are used for the offer, deposit, and visa steps.",
      "Have certified copies of your KCSE certificate and degree transcripts ready. English is the medium of instruction in Kenya, so documents are usually already in English. Universities may want results verified through KNEC or the awarding university.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply three to four months ahead. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Home Affairs does not publish an evidence level for Kenya, and in practice applications from sub-Saharan Africa face close financial scrutiny. Use the Document Checklist Tool for your chosen provider. Be ready to show funds for tuition, travel, and 12 months of living costs, and to satisfy the Genuine Student requirement.",
      "Applications most often fail on funds that appear shortly before applying, a source of funds that is not clearly documented, or a sponsor whose income does not match the amount shown. Three to six months of genuine bank history, and a documented explanation of where the money came from, are what carry the file. An approved education loan can be used as evidence.",
    ],
    credentials: [
      "For undergraduate entry, universities take the KCSE, often with a foundation year, or A-Levels. A four-year Kenyan bachelor's degree is accepted for direct entry to Australian master's programs.",
      "Universities publish Kenya-specific entry tables. Confirm the class of degree or GPA your course requires.",
      "English is the medium of instruction in Kenya, and many universities waive an English test on that basis. The student visa has its own English rule, so confirm both.",
    ],
    popularFields: [
      "Public health and health sciences",
      "Information technology",
      "Business, accounting, and finance",
      "Nursing",
      "Development and environmental studies",
    ],
    faq: [
      {
        q: "What is Kenya's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country. Use the Document Checklist Tool when you apply. In practice, applications from Kenya face close scrutiny of financial evidence, so a genuine, well-documented source of funds matters most.",
      },
      {
        q: "How much bank history do I need for the visa from Kenya?",
        a: "Aim for three to six months of genuine bank statements showing the funds held over time, plus a clear explanation of where the money came from. A large deposit just before applying is a common reason for refusal. An approved education loan can be submitted instead.",
      },
      {
        q: "How much does it cost to study in Australia from Kenya?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Is a Kenyan bachelor's degree accepted in Australia?",
        a: "Yes, a four-year Kenyan bachelor's is accepted for direct entry to most Australian master's programs. Universities publish Kenya-specific entry tables mapping your class of degree or GPA to their requirement.",
      },
      {
        q: "Can I get PR in Australia after studying from Kenya?",
        a: "It is a common goal, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  nigeria: {
    slug: "nigeria",
    code: "NG",
    name: "Nigeria",
    demonym: "Nigerian",
    currency: "NGN",
    intro: [
      "Nigerian students can study at any Australian university. A first year costs roughly AUD 40,000 to 75,000 all in, and the visa is the subclass 500. Nigeria is one of Australia's fastest-growing African source markets, and the student visa has a higher refusal rate for Nigerian applicants than the global average, almost always over financial evidence.",
      "The parts specific to Nigeria are the close look at source of funds and sponsors, how universities read WASSCE and a Nigerian bachelor's degree, and a Genuine Student statement that stands up to scrutiny.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Nigerian citizens; agents are widely used for the offer, deposit, and visa steps.",
      "Have certified copies of your WASSCE or NECO result and degree transcripts ready. English is the medium of instruction in Nigeria, so documents are usually already in English. Universities often verify WAEC results online and may want your degree verified through the awarding university.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply three to four months ahead. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Home Affairs does not publish an evidence level for Nigeria, and in practice applications face close financial scrutiny, with a refusal rate above the global average. Use the Document Checklist Tool for your chosen provider. Be ready to show funds for tuition, travel, and 12 months of living costs, and to meet the Genuine Student requirement.",
      "Applications most often fail on funds that appear shortly before applying, a sponsor whose income or business cannot be documented, or a study plan that does not fit the applicant's background. Several months of genuine bank history, tax records or audited business accounts for a sponsor, and a clear account of the source of funds are what carry the file.",
    ],
    credentials: [
      "For undergraduate entry, universities take WASSCE or NECO, usually with a foundation year, or A-Levels or a completed first year of a Nigerian degree for direct entry.",
      "A Nigerian bachelor's degree, usually four to five years, is accepted for direct entry to Australian master's programs. Universities publish Nigeria-specific entry tables mapping your CGPA on the 5-point scale and class of degree to their requirement. The one-year NYSC is not required for admission.",
      "English is the medium of instruction in Nigeria, and many universities waive an English test on that basis. The student visa has its own English rule, so confirm both.",
    ],
    popularFields: [
      "Information technology and computer science",
      "Public health",
      "Business, accounting, and finance",
      "Engineering",
      "Nursing and health sciences",
    ],
    faq: [
      {
        q: "What is Nigeria's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country. Use the Document Checklist Tool when you apply. Applications from Nigeria face close scrutiny of financial evidence and a refusal rate above the global average, so a genuine, fully documented source of funds is the priority.",
      },
      {
        q: "Why are Australian student visas from Nigeria refused?",
        a: "Almost always financial evidence: funds that appear just before applying, a sponsor whose income cannot be documented, or an unclear source of funds. A study plan that does not fit the applicant's background is the other common reason. Several months of genuine bank history and documented sponsor income address most of it.",
      },
      {
        q: "How much does it cost to study in Australia from Nigeria?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Regional universities and smaller cities are cheaper.",
      },
      {
        q: "Is a Nigerian bachelor's degree accepted in Australia?",
        a: "Yes, a four or five year Nigerian bachelor's is accepted for direct entry to most Australian master's programs. Universities publish Nigeria-specific entry tables mapping your CGPA on the 5-point scale and class of degree to their requirement. NYSC is not needed for admission.",
      },
      {
        q: "Can I get PR in Australia after studying from Nigeria?",
        a: "It is a common goal, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-30",
  },

  "south-korea": {
    slug: "south-korea",
    code: "KR",
    name: "South Korea",
    demonym: "South Korean",
    currency: "KRW",
    intro: [
      "South Korean students can study at any Australian university. A first year costs roughly AUD 40,000 to 80,000 all in, and the visa is the subclass 500. South Korea has long sent students to Australia, split between English-language and vocational courses and full degrees, and it is treated as a lower-risk country for the student visa.",
      "Not much is unusual for South Korean applicants. The main points are how universities read a Korean high school diploma and a Korean bachelor's degree, English evidence, and the choice between applying directly or through an agent.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for South Korean citizens. Study-abroad agencies are widely used and manage the offer, deposit, and visa steps, though they are not required.",
      "For undergraduate entry, a Korean high school diploma on its own usually routes through a foundation year, while a strong College Scholastic Ability Test result or a completed first year of a Korean university can give direct entry. Have certified copies of your records with certified English translations, and expect some universities to want them verified through the awarding institution or by apostille.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory to shortlist and the deadline calendar for the recommended dates.",
    ],
    visaNote: [
      "South Korea is generally treated as a lower-risk country, so the upfront financial and English evidence is among the lighter requirements, particularly at a Group of Eight university. The exact requirement is set by a provider-and-country matrix that is reviewed periodically, so confirm the current position with the Document Checklist Tool when you apply.",
      "You still need to meet the Genuine Student requirement and show genuine access to funds for tuition, travel, and 12 months of living costs. Where Korean applications run into trouble it is usually a study plan that does not connect to previous study or work, or a course that reads as a route to staying rather than to a qualification. A clear, specific study plan addresses most of it.",
    ],
    credentials: [
      "For undergraduate entry, most universities take a Korean high school diploma with a foundation year, or a high College Scholastic Ability Test score, or one completed year of a Korean bachelor's degree for direct entry.",
      "A four-year Korean bachelor's degree maps directly to Australian master's entry. Universities publish Korea-specific entry tables keyed to your GPA on the 4.5 or 4.3 scale, so the average you need can differ by institution and course.",
      "English is shown with IELTS, PTE, or TOEFL. Medium-of-instruction letters are rarely accepted from Korean institutions, so plan to sit a test. The university sets its own score and the student visa has its own lower rule. Confirm both.",
    ],
    popularFields: [
      "Business, management, and marketing",
      "Information technology",
      "Hospitality and tourism",
      "Design and media",
      "Nursing and health",
    ],
    faq: [
      {
        q: "What is South Korea's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country, and the requirement also depends on your provider. In practice South Korea is treated as lower risk, which means lighter upfront documentation. Use the Document Checklist Tool when you apply.",
      },
      {
        q: "Is a Korean bachelor's degree accepted in Australia?",
        a: "Yes, a four-year Korean bachelor's is accepted for direct entry to most Australian master's programs. Universities publish Korea-specific entry tables mapping your GPA on the 4.5 or 4.3 scale to their requirement. Competitive courses want a higher GPA.",
      },
      {
        q: "How much does it cost to study in Australia from South Korea?",
        a: "Budget AUD 40,000 to 80,000 for the first year: roughly AUD 30,000 to 55,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Sydney, Melbourne, and the Group of Eight sit at the top of the range.",
      },
      {
        q: "Do South Korean students need to apply through an agent?",
        a: "No. Most universities accept direct applications from Korean citizens. Study-abroad agencies are common because they handle the offer, deposit, and visa lodgement, but they are not required. Check the university's how-to-apply page.",
      },
      {
        q: "Can I get PR in Australia after studying from South Korea?",
        a: "It is possible, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-09-03",
  },

  japan: {
    slug: "japan",
    code: "JP",
    name: "Japan",
    demonym: "Japanese",
    currency: "JPY",
    intro: [
      "Japanese students can study at any Australian university. A first year of a degree costs roughly AUD 40,000 to 80,000 all in, and the visa is the subclass 500. Most Japanese students in Australia are on English-language courses or one or two semester exchanges rather than full degrees, and Japan is treated as a low-risk country for the student visa, so the evidence requirements are among the lightest.",
      "Not much is unusual for Japanese applicants. The main points are how universities read a Japanese high school diploma and a Japanese bachelor's degree, English evidence, and, for shorter stays, whether a study visa or a working holiday visa fits better.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Japanese citizens. Study-abroad agencies are widely used in Japan and handle the offer, deposit, and visa steps, though they are not required.",
      "For undergraduate entry, a Japanese Upper Secondary School Certificate of Graduation with strong grades is accepted directly for some courses, while others want a foundation year or one completed year of a Japanese university. Have certified copies of your records with certified English translations.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. If you are going for a semester or a year, ask your home university about an exchange agreement first, as that route is cheaper. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Japan is treated as a low-risk country, so the upfront financial and English evidence is among the lightest, particularly at a Group of Eight university. The requirement is set by a provider-and-country matrix that is reviewed periodically, so confirm the current position with the Document Checklist Tool when you apply.",
      "You still need to meet the Genuine Student requirement and show genuine access to funds for tuition, travel, and 12 months of living costs. For a stay of under a year for an English course, many young Japanese use the Australia-Japan working holiday visa instead, which allows study of up to about four months and full work rights.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Japanese Upper Secondary School Certificate of Graduation, with strong grades accepted directly for some courses and a foundation year for others. One completed year of a Japanese bachelor's degree is a direct-entry route.",
      "A four-year Japanese bachelor's degree maps directly to Australian master's entry. Universities assess your GPA on the awarding institution's scale; a B average is a common minimum, higher for competitive courses.",
      "English is shown with IELTS, PTE, or TOEFL. Medium-of-instruction letters are rarely accepted from Japanese institutions, so plan to sit a test. The university sets its own score and the student visa has its own lower rule. Confirm both.",
    ],
    popularFields: [
      "English language and TESOL",
      "Business and management",
      "Hospitality and tourism",
      "Design and media",
      "Environmental science",
    ],
    faq: [
      {
        q: "Do Japanese students need a lot of financial evidence for the Australian student visa?",
        a: "Usually not. Japan is treated as a low-risk country, so upfront financial documentation is among the lightest, especially at a Group of Eight university. You still need to show genuine access to funds and meet the Genuine Student requirement. Use the Document Checklist Tool when you apply.",
      },
      {
        q: "Is a Japanese bachelor's degree accepted in Australia?",
        a: "Yes, a four-year Japanese bachelor's is accepted for direct entry to most Australian master's programs. Universities assess your GPA on your institution's scale, with a B average a common minimum and more for competitive courses.",
      },
      {
        q: "How much does it cost to study in Australia from Japan?",
        a: "Budget AUD 40,000 to 80,000 for the first year of a degree: roughly AUD 30,000 to 55,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. An English-language course is charged by the week and works out much lower for a short stay.",
      },
      {
        q: "Should I use a student visa or a working holiday visa for Australia?",
        a: "For a full degree or a course longer than about four months, you need the subclass 500 student visa. For a shorter English course combined with travel and work, the Australia-Japan working holiday visa is usually the better fit, since it allows limited study and full work rights.",
      },
      {
        q: "Can I get PR in Australia after studying from Japan?",
        a: "It is possible, not automatic, and fewer Japanese graduates pursue it than students from some other countries. After graduating, you can move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-09-03",
  },

  taiwan: {
    slug: "taiwan",
    code: "TW",
    name: "Taiwan",
    demonym: "Taiwanese",
    currency: "TWD",
    intro: [
      "Taiwanese students can study at any Australian university. A first year of a degree costs roughly AUD 40,000 to 80,000 all in, and the visa is the subclass 500. Taiwan is a steady, mid-sized source of students, split between full degrees, English-language courses, and working holidays, and it is treated as a low-risk country for the student visa.",
      "Not much is unusual for Taiwanese applicants. The main points are how universities read a Taiwanese senior high school diploma and a Taiwanese bachelor's degree, English evidence, and, for shorter stays, whether a study visa or a working holiday visa fits better.",
    ],
    applying: [
      "Apply through the university's international portal or an authorised agent. Direct application is available at most universities for Taiwanese citizens. Agencies are common and handle the offer, deposit, and visa steps, though they are not required.",
      "For undergraduate entry, a Taiwanese senior high school diploma usually routes through a foundation year, while strong results, sometimes with the General Scholastic Ability Test, or a completed first year of a Taiwanese university, can give direct entry. Have certified copies of your records with certified English translations.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Taiwan is treated as a low-risk country, so the upfront financial and English evidence is among the lighter requirements. The requirement is set by a provider-and-country matrix that is reviewed periodically, so confirm the current position with the Document Checklist Tool when you apply.",
      "You still need to meet the Genuine Student requirement and show genuine access to funds for tuition, travel, and 12 months of living costs. For a short English course, many young Taiwanese use the Australia-Taiwan working holiday visa instead, which allows limited study and full work rights.",
    ],
    credentials: [
      "For undergraduate entry, universities take the Taiwanese Senior High School Diploma, usually with a foundation year, or strong results plus the General Scholastic Ability Test, or one completed year of a Taiwanese bachelor's degree, for direct entry.",
      "A four-year Taiwanese bachelor's degree maps directly to Australian master's entry. Universities assess your GPA on the awarding institution's scale, with a common minimum around 70 to 75 percent, higher for competitive courses.",
      "English is shown with IELTS, PTE, or TOEFL. Medium-of-instruction letters are rarely accepted from Taiwanese institutions, so plan to sit a test. The university sets its own score and the student visa has its own lower rule. Confirm both.",
    ],
    popularFields: [
      "Business, accounting, and finance",
      "Information technology",
      "Design and media",
      "Hospitality and tourism",
      "TESOL and education",
    ],
    faq: [
      {
        q: "What is Taiwan's assessment level for the Australian student visa?",
        a: "Home Affairs does not publish evidence levels by country, and the requirement also depends on your provider. In practice Taiwan is treated as lower risk, which means lighter upfront documentation. Use the Document Checklist Tool when you apply.",
      },
      {
        q: "Is a Taiwanese bachelor's degree accepted in Australia?",
        a: "Yes, a four-year Taiwanese bachelor's is accepted for direct entry to most Australian master's programs. Universities assess your GPA on your institution's scale, with around 70 to 75 percent a common minimum and more for competitive courses.",
      },
      {
        q: "How much does it cost to study in Australia from Taiwan?",
        a: "Budget AUD 40,000 to 80,000 for the first year of a degree: roughly AUD 30,000 to 55,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. An English-language course is charged by the week and is lower for a short stay.",
      },
      {
        q: "Should I use a student visa or a working holiday visa for Australia?",
        a: "For a full degree or a course longer than about four months, you need the subclass 500 student visa. For a shorter English course combined with travel and work, the Australia-Taiwan working holiday visa is usually the better fit, since it allows limited study and full work rights.",
      },
      {
        q: "Can I get PR in Australia after studying from Taiwan?",
        a: "It is possible, not automatic. After graduating, most students move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Your occupation and points decide the outcome.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-09-03",
  },

  "hong-kong": {
    slug: "hong-kong",
    code: "HK",
    name: "Hong Kong",
    demonym: "Hong Kong",
    currency: "HKD",
    intro: [
      "Students from Hong Kong can study at any Australian university, and Hong Kong is a long-standing, sizeable source of students, most of them in full bachelor's and master's degrees. A first year costs roughly AUD 40,000 to 80,000 all in, and the visa is the subclass 500. Hong Kong is treated as a low-risk country for the student visa.",
      "Not much is unusual for applicants from Hong Kong. The main points are how universities read the Hong Kong Diploma of Secondary Education, which most take directly, and a Hong Kong bachelor's degree, plus English evidence.",
    ],
    applying: [
      "Apply through the university's international portal, through a school counsellor, or through an agent. Direct application is common for students from Hong Kong, and many apply to several countries at once. Agents are available but less relied on than in some markets.",
      "The Hong Kong Diploma of Secondary Education is accepted for direct entry to an Australian bachelor's degree by every university, each with its own subject and score requirements, so school leavers do not need a foundation year. Have certified copies of your Diploma results and, for postgraduate study, your degree transcript ready.",
      "Most universities run February and July intakes and assess on a rolling basis. Apply two to three months ahead, or earlier if you are also waiting on Diploma results. Use the universities directory and the deadline calendar.",
    ],
    visaNote: [
      "Hong Kong is treated as a low-risk country, so the upfront financial and English evidence is among the lightest. The requirement is set by a provider-and-country matrix that is reviewed periodically, so confirm the current position with the Document Checklist Tool when you apply.",
      "You still need to meet the Genuine Student requirement and show genuine access to funds for tuition, travel, and 12 months of living costs. Hong Kong applications are rarely refused, and where they are it is usually a study plan that does not connect to previous study.",
    ],
    credentials: [
      "For undergraduate entry, the Hong Kong Diploma of Secondary Education is accepted directly by all Australian universities, each publishing the scores it wants, sometimes with subject prerequisites. GCE A-Levels and the International Baccalaureate are also accepted directly.",
      "A Hong Kong bachelor's degree, now usually four years, maps directly to Australian master's entry. Universities publish Hong Kong-specific entry tables keyed to your classification or GPA, so the mark you need can differ by institution and course.",
      "English is shown with the Hong Kong Diploma English paper, which many universities accept at Level 4 or above in place of a test, or with IELTS, PTE, or TOEFL. A medium-of-instruction letter is often accepted for degrees taught in English. The student visa has its own English rule, so confirm both.",
    ],
    popularFields: [
      "Business, accounting, and finance",
      "Law",
      "Health and biomedical science",
      "Architecture and built environment",
      "Media, design, and communications",
    ],
    faq: [
      {
        q: "Is the HKDSE accepted for direct entry to Australian universities?",
        a: "Yes. Every Australian university accepts the Hong Kong Diploma of Secondary Education for direct entry to a bachelor's degree, each with its own score requirement and sometimes subject prerequisites. There is no need for a foundation year.",
      },
      {
        q: "Does a Hong Kong Diploma English result replace IELTS?",
        a: "Often, for university admission. Many Australian universities accept the Diploma English paper at Level 4 or above in place of IELTS or PTE. The student visa has its own English requirement, so check whether your result also meets that or whether you need a separate test.",
      },
      {
        q: "How much does it cost to study in Australia from Hong Kong?",
        a: "Budget AUD 40,000 to 80,000 for the first year: roughly AUD 30,000 to 55,000 tuition, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Sydney, Melbourne, and the Group of Eight sit at the top of the range.",
      },
      {
        q: "Is a Hong Kong bachelor's degree accepted for a master's in Australia?",
        a: "Yes, directly. A Hong Kong bachelor's degree, now usually four years, is accepted for entry to Australian master's programs. Universities publish Hong Kong-specific tables mapping your classification or GPA to their requirement.",
      },
      {
        q: "Can I get PR in Australia after studying from Hong Kong?",
        a: "It is possible, not automatic. After graduating, you can move to a Temporary Graduate visa (subclass 485), gain skilled work experience, and then apply for a points-tested visa. Australia has also offered Hong Kong passport holders extended post-study and residence arrangements since 2020, and the detail has changed over time, so check the current settings with Home Affairs.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-09-03",
  },
};

export function getOriginCountry(slug: string): OriginCountry | undefined {
  return ORIGIN_COUNTRIES[slug];
}

export const ORIGIN_COUNTRY_SLUGS = Object.keys(ORIGIN_COUNTRIES);
