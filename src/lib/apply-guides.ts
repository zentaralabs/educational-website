import type { FaqItem } from "@/lib/faq";

/**
 * Config for the /international/{country}/how-to-apply deep pages: the full
 * step-by-step application process for one source country, from shortlisting
 * a course to landing in Australia. This is the procedural companion to the
 * /international/{country} overview page (origin-countries.ts), which covers
 * what is *different* for that nationality but not the walkthrough.
 *
 * Only countries with genuinely differentiated, verified procedural content
 * get a page. Add a key here and the route + sitemap pick it up; the country
 * overview page auto-links to it when a guide exists.
 *
 * House style: zero em dashes.
 */

export type ApplyStep = {
  title: string;
  body: string[];
};

export type DocumentGroup = {
  group: string;
  items: string[];
};

export type ApplyTimelineRow = {
  when: string;
  task: string;
};

export type ApplyGuide = {
  countrySlug: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  steps: ApplyStep[];
  documents: DocumentGroup[];
  /** Working back from a February intake; links to the intake hub in the UI. */
  timeline: ApplyTimelineRow[];
  /** Country-specific reasons applications and visas are refused. */
  pitfalls: string[];
  faq: FaqItem[];
  sources: string[];
  lastVerified: string;
};

const COMMON_LAST_STEP: ApplyStep = {
  title: "After the visa is granted",
  body: [
    "Buy Overseas Student Health Cover for the full length of the visa if you have not already, book your flights, and arrange temporary accommodation for your first week or two rather than signing a lease you have not seen.",
    "Within seven days of arriving you must give your university your Australian residential address. This is student visa condition 8533, done through the student portal, and missing it is a visa breach. Then attend orientation, complete enrolment, apply for a Tax File Number if you plan to work, and open or activate an Australian bank account.",
  ],
};

const NEPAL: ApplyGuide = {
  countrySlug: "nepal",
  metaTitle: "How to Apply to an Australian University from Nepal",
  metaDescription:
    "The full step-by-step process for Nepali students: shortlisting a course, the No Objection Certificate, applying directly or through an agent, the subclass 500 visa, and a working timeline for a February intake.",
  intro: [
    "The process is the same one every international student follows, with three things that are specific to Nepal: you need a No Objection Certificate from the Ministry of Education before you can send tuition abroad or lodge the visa, several universities only accept applications from Nepali citizens through an authorised agent, and since January 2026 Nepal has been at the highest student-visa evidence level, so the financial checks are thorough.",
    "This page walks through the whole sequence in order.",
  ],
  steps: [
    {
      title: "Shortlist courses and confirm you are eligible",
      body: [
        "Use the universities directory to filter by state, tuition, English requirement, and intake. Confirm each course is open to international students for your intake and has an active CRICOS code, which the student visa requires.",
        "Check the specific course's academic entry requirement against your qualification, and confirm whether it treats a three-year Nepali bachelor's as sufficient for master's entry or wants a four-year degree or strong marks.",
      ],
    },
    {
      title: "Sit IELTS or PTE",
      body: [
        "Book early. Results can take up to two weeks and you may need to resit. Most master's courses want IELTS 6.5 overall, with 7.0 or 7.5 for nursing and teaching.",
        "Some universities accept a medium-of-instruction letter for admission if your degree was taught in English, but the student visa has its own English rule, so confirm what the university and the visa each require before you rely on a waiver.",
      ],
    },
    {
      title: "Get your academic documents ready",
      body: [
        "You need your NEB Grade 12 (10+2) transcript and character certificate, your bachelor's transcript and provisional or final certificate, and mark sheets for each year. Some universities want these verified by the awarding institution or a credential service.",
        "Order certified copies and certified English translations where the original is in Nepali. Do this before you start applications so a missing document does not hold up an offer.",
      ],
    },
    {
      title: "Apply, directly or through an authorised agent",
      body: [
        "Where direct application is allowed it is free at many universities and you keep control of your own logins and documents. Create the account yourself and do not hand the login or recovery email to anyone.",
        "Several universities, mostly in Western Australia, only accept applications from Nepali citizens through an authorised agent. Check each university's how-to-apply page. If Nepal is listed as agent-only, use an agent that university has authorised, which every university publishes on its site.",
        "Apply to more than one university. Applying three to four months before the intake is normal, and earlier is better where admission is rolling.",
      ],
    },
    {
      title: "Accept your offer and pay the tuition deposit",
      body: [
        "Read the offer conditions, the fees, the start date, and any scholarship before you accept. An offer can be conditional (for example on final results or an English score) or unconditional.",
        "Accepting and paying the deposit, usually one semester of tuition, is what triggers your Confirmation of Enrolment. Keep the payment receipt for the visa file.",
      ],
    },
    {
      title: "Apply for your No Objection Certificate",
      body: [
        "Once you hold an offer, apply for the No Objection Certificate (NOC) online at noc.moest.gov.np. It is issued by Nepal's Ministry of Education, Science and Technology for a small fee, usually within about a week.",
        "Nepali banks will not remit your tuition or living expenses abroad without the NOC, and it is part of the student visa application. Nepal Rastra Bank sets limits on how much foreign currency you can buy for study and revises them periodically, so confirm the current figures with your remitting bank.",
      ],
    },
    {
      title: "Arrange and evidence your finances",
      body: [
        "You must show funds for first-year tuition (or the balance after the deposit), twelve months of living costs (AUD 29,710, set by the Australian Government), and travel of roughly AUD 2,000 to 2,500. Show a margin above the minimum.",
        "The money has to look genuine. A savings history that predates your decision to study abroad is far stronger than a large deposit that lands just before you apply. If you are using an education loan it must be sanctioned and disbursed or ready to disburse, not approved in principle. A parent or close relative can be a sponsor if you document the relationship and their income.",
        "Route your payments through one bank and keep every exchange voucher and remittance form. Later visa steps generally require payments through the same bank with the original NOC attached.",
      ],
    },
    {
      title: "Lodge the subclass 500 student visa",
      body: [
        "Lodge in ImmiAccount yourself, or through a registered migration agent, using your Confirmation of Enrolment. An unregistered education agent cannot legally charge you for visa advice.",
        "The base charge is AUD 2,500 for the main applicant. You answer the Genuine Student questions, which replaced the Genuine Temporary Entrant test in March 2024, and your answers must match your financial evidence exactly. Lodge as early as you can: Nepal is at Evidence Level 3, processing is slower, and offshore refusal rates are elevated.",
      ],
    },
    COMMON_LAST_STEP,
  ],
  documents: [
    {
      group: "Academic",
      items: [
        "NEB Grade 12 (10+2) transcript and character certificate",
        "Bachelor's transcript, mark sheets for each year, and provisional or final certificate",
        "Certified English translations of any Nepali-language documents",
        "Credential verification report if the university asks for one",
      ],
    },
    {
      group: "Identity",
      items: [
        "Passport valid well beyond your intended stay",
        "Passport-size photographs to the visa specification",
      ],
    },
    {
      group: "English",
      items: [
        "IELTS or PTE result, or a medium-of-instruction letter if the university and visa both accept one",
      ],
    },
    {
      group: "Financial",
      items: [
        "Bank statements showing a genuine savings history, ideally three to six months",
        "Source-of-funds evidence: salary slips, property sale deed, or a disbursed loan letter",
        "Sponsor's income and employment proof plus a document proving the relationship",
        "Tuition deposit receipt and OSHC policy document",
      ],
    },
    {
      group: "Nepal-specific",
      items: [
        "No Objection Certificate from the Ministry of Education",
        "Bank remittance vouchers for tuition and OSHC already paid",
      ],
    },
  ],
  timeline: [
    { when: "10 to 12 months before", task: "Shortlist courses, book and sit IELTS or PTE, gather academic documents" },
    { when: "8 to 9 months before", task: "Submit applications, directly or through an authorised agent" },
    { when: "5 to 7 months before", task: "Receive offers, compare, accept, pay the tuition deposit, apply for the NOC" },
    { when: "4 to 6 months before", task: "Receive the Confirmation of Enrolment, buy OSHC, assemble financial evidence" },
    { when: "3 to 5 months before", task: "Lodge the subclass 500 visa in ImmiAccount" },
    { when: "1 to 2 months before", task: "Visa decision, book flights, arrange first-week accommodation" },
  ],
  pitfalls: [
    "Funds that appear in an account only days before applying, with no history behind them.",
    "An education loan that is approved in principle rather than actually disbursed.",
    "Money held in a distant relative's or a family friend's account rather than a parent's.",
    "A course that does not build on your previous study, with no explanation in the Genuine Student answers.",
    "Leaving the NOC to the last minute, which stalls both the tuition transfer and the visa.",
  ],
  faq: [
    {
      q: "Do Nepali students need a No Objection Certificate to study in Australia?",
      a: "Yes. Nepal's Ministry of Education issues the NOC online at noc.moest.gov.np. You need it before a Nepali bank will send your tuition abroad and as part of the student visa application. Apply for it after you receive your university offer.",
    },
    {
      q: "Can I apply to an Australian university from Nepal without an agent?",
      a: "At many universities, yes, and it is often free to apply directly. But several universities, mostly in Western Australia, only accept applications from Nepali citizens through an authorised agent. Check each university's how-to-apply page before you start.",
    },
    {
      q: "How long does the whole process take from Nepal?",
      a: "Plan for about 10 to 12 months from starting your research to landing in Australia. The application itself can be quick, but the English test, document verification, the NOC, assembling genuine financial evidence, and Evidence Level 3 visa processing are what take time.",
    },
    {
      q: "Is a 3-year bachelor's degree from Nepal enough for a master's in Australia?",
      a: "Usually yes. Most Australian universities accept a three-year Nepali bachelor's for postgraduate entry. Some competitive courses and a few universities want a four-year degree or strong marks, so check the specific course.",
    },
    {
      q: "When should I lodge my student visa for a February intake?",
      a: "As soon as you hold the Confirmation of Enrolment, which usually means November to January for a February start. Nepal is at Evidence Level 3, so processing runs longer and an early, fully evidenced application matters.",
    },
  ],
  sources: [
    "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    "https://noc.moest.gov.np/",
    "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
    "https://www.studyaustralia.gov.au/en/plan-your-studies/how-to-apply-to-study-in-australia",
  ],
  lastVerified: "2026-09-03",
};

const INDIA: ApplyGuide = {
  countrySlug: "india",
  metaTitle: "How to Apply to an Australian University from India",
  metaDescription:
    "The full step-by-step process for Indian students: shortlisting a course, applying directly or through an agent, moving money under the LRS, the subclass 500 visa, and a working timeline for a February intake.",
  intro: [
    "The sequence is the standard international-student one. What is specific to India: since January 2026 India has been at the highest student-visa evidence level, several universities only accept applications from Indian citizens through an authorised agent, a few set earlier deadlines for higher-scrutiny countries, and moving money abroad runs through the Liberalised Remittance Scheme with tax collected at source.",
    "This page is the walkthrough in order.",
  ],
  steps: [
    {
      title: "Shortlist courses and confirm you are eligible",
      body: [
        "Filter the universities directory by state, tuition, English requirement, and intake. Confirm the course is open to international students for your intake and has an active CRICOS code.",
        "Check the course's academic requirement against your qualification. A three-year Indian bachelor's is accepted for most Australian master's programs, with a minority of competitive courses wanting a four-year degree or first-class marks.",
      ],
    },
    {
      title: "Sit IELTS, PTE or TOEFL",
      body: [
        "Book early. Most master's courses want IELTS 6.5 overall, higher for nursing and teaching.",
        "Many universities accept a medium-of-instruction letter instead of a test for admission if your degree was taught in English. The student visa has a separate English rule, so confirm both before relying on a waiver.",
      ],
    },
    {
      title: "Get your academic documents ready",
      body: [
        "You need your Class X and XII mark sheets, your bachelor's consolidated mark sheet and provisional or degree certificate, and a transcript. Some universities want the degree verified through the awarding university or a credential service.",
        "Order certified copies early. How your percentage converts to an Australian grade depends on your university or board, and universities publish India-specific entry tables.",
      ],
    },
    {
      title: "Apply, directly or through an authorised agent",
      body: [
        "Applying directly is free at many universities and keeps your logins and documents in your own hands. Create the account yourself.",
        "Several universities, mostly in Western Australia, only accept applications from Indian citizens through an authorised agent. Edith Cowan University, for example, lists India among agent-only countries. Check each university's how-to-apply page.",
        "Deadlines can fall earlier for Indian applicants. The University of Western Australia closes applications for higher visa-scrutiny countries several weeks before other countries, and Curtin closes 10 weeks before course start against 4 weeks for others. Apply three to four months ahead.",
      ],
    },
    {
      title: "Accept your offer and pay the tuition deposit",
      body: [
        "Read the conditions, fees, start date, and any scholarship before you accept.",
        "Paying the deposit, usually one semester of tuition, triggers your Confirmation of Enrolment. Keep the receipt.",
      ],
    },
    {
      title: "Arrange and evidence your finances",
      body: [
        "Show funds for first-year tuition (or the balance after the deposit), twelve months of living costs (AUD 29,710), and travel of roughly AUD 2,000 to 2,500, with a margin above the minimum.",
        "A savings history that predates your decision to study abroad is the strongest evidence. An education loan must be sanctioned and disbursed or ready to disburse, not approved in principle. A parent or close relative can sponsor you with documented income and a proof of relationship.",
      ],
    },
    {
      title: "Move the money under the LRS",
      body: [
        "The Reserve Bank of India's Liberalised Remittance Scheme lets a resident individual send up to USD 250,000 per financial year, and a parent can remit under a separate limit.",
        "Tax collected at source applies to money sent abroad for education. As of the 2025-26 financial year, remittances funded by an education loan from a specified institution attract no TCS, and remittances from your own funds attract 5 percent on the amount above 10 lakh rupees in a year. TCS is credited against your income tax, not a permanent cost, but it ties up cash, and these rules change often, so confirm the current position with your bank.",
        "Pay tuition through the provider your university nominates, usually Convera, Flywire or PayMyTuition, which give a matchable reference and a receipt built for a visa file. Keep every transfer receipt.",
      ],
    },
    {
      title: "Lodge the subclass 500 student visa",
      body: [
        "Lodge in ImmiAccount yourself, or through a registered migration agent, using your Confirmation of Enrolment. The base charge is AUD 2,500 for the main applicant.",
        "Answer the Genuine Student questions, which replaced the Genuine Temporary Entrant test in March 2024, and keep them consistent with your financial evidence. Lodge early: India is at Evidence Level 3, processing is slower, and offshore refusal rates are elevated.",
      ],
    },
    COMMON_LAST_STEP,
  ],
  documents: [
    {
      group: "Academic",
      items: [
        "Class X and Class XII mark sheets",
        "Bachelor's consolidated mark sheet, transcript, and provisional or degree certificate",
        "Degree verification report if the university asks for one",
      ],
    },
    {
      group: "Identity",
      items: [
        "Passport valid well beyond your intended stay",
        "Passport-size photographs to the visa specification",
      ],
    },
    {
      group: "English",
      items: [
        "IELTS, PTE or TOEFL result, or a medium-of-instruction letter if the university and visa both accept one",
      ],
    },
    {
      group: "Financial",
      items: [
        "Bank statements showing a genuine savings history, ideally three to six months",
        "Source-of-funds evidence: salary slips, property sale deed, fixed deposit certificates, or a disbursed loan sanction letter",
        "Sponsor's income and employment proof plus a document proving the relationship",
        "Tuition deposit receipt and OSHC policy document",
        "LRS remittance and Form A2 records for money already sent",
      ],
    },
  ],
  timeline: [
    { when: "10 to 12 months before", task: "Shortlist courses, book and sit IELTS or PTE, gather mark sheets and transcripts" },
    { when: "8 to 9 months before", task: "Submit applications, directly or through an authorised agent (earlier for WA universities)" },
    { when: "5 to 7 months before", task: "Receive offers, accept, pay the tuition deposit" },
    { when: "4 to 6 months before", task: "Receive the Confirmation of Enrolment, buy OSHC, assemble financial evidence, start LRS transfers" },
    { when: "3 to 5 months before", task: "Lodge the subclass 500 visa in ImmiAccount" },
    { when: "1 to 2 months before", task: "Visa decision, book flights, arrange first-week accommodation" },
  ],
  pitfalls: [
    "Money that appears in an account only days before applying, with no savings history.",
    "An education loan sanctioned in principle rather than disbursed.",
    "Unexplained gaps in study or work, with no account of them in the Genuine Student answers.",
    "A course that does not build on your existing qualification.",
    "Missing an early Western Australia deadline because you assumed the standard date applied.",
  ],
  faq: [
    {
      q: "Can I apply to an Australian university from India without an agent?",
      a: "At many universities, yes, and it is often free. But several universities, mostly in Western Australia, only accept applications from Indian citizens through an authorised agent. Check each university's how-to-apply page.",
    },
    {
      q: "How does tax collected at source work on money sent for study in Australia?",
      a: "As of the 2025-26 financial year, remittances funded by an education loan from a specified institution attract no TCS. Remittances from your own funds attract 5 percent on the amount above 10 lakh rupees in a financial year. TCS is credited against your income tax rather than lost, but it ties up cash, and the rules change often, so confirm with your bank.",
    },
    {
      q: "How long does the whole process take from India?",
      a: "Plan for about 10 to 12 months from research to arrival. The English test, document preparation, assembling a genuine savings history, LRS transfers, and Evidence Level 3 visa processing are the parts that take time.",
    },
    {
      q: "Is a 3-year bachelor's degree from India enough for a master's in Australia?",
      a: "Yes for most Australian master's programs. A minority of competitive courses want a four-year degree, honours, or first-class marks, so check the entry requirements for your specific course.",
    },
    {
      q: "When should I lodge my student visa for a February intake?",
      a: "As soon as you hold the Confirmation of Enrolment, usually November to January for a February start. India is at Evidence Level 3, so processing runs longer and an early, fully evidenced application matters.",
    },
  ],
  sources: [
    "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
    "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=115",
    "https://www.studyaustralia.gov.au/en/plan-your-studies/how-to-apply-to-study-in-australia",
  ],
  lastVerified: "2026-09-03",
};

const PAKISTAN: ApplyGuide = {
  countrySlug: "pakistan",
  metaTitle: "How to Apply to an Australian University from Pakistan",
  metaDescription:
    "The full step-by-step process for Pakistani students: HEC and IBCC attestation, applying directly or through an agent, the subclass 500 visa, and a working timeline for a February intake.",
  intro: [
    "The sequence is the standard one. What is specific to Pakistan: university degrees need Higher Education Commission attestation and school certificates need Inter Board Committee of Chairmen attestation, several universities only accept applications from Pakistani citizens through an authorised agent, and Pakistan is at the highest student-visa evidence level, so the financial and document checks are thorough.",
    "This page is the walkthrough in order.",
  ],
  steps: [
    {
      title: "Shortlist courses and confirm you are eligible",
      body: [
        "Filter the universities directory by state, tuition, English requirement, and intake. Confirm the course is open to international students and has an active CRICOS code.",
        "Check the academic requirement. A four-year Pakistani bachelor's (BS, or the older BA or BSc plus a master's) maps cleanly to Australian master's entry. A standalone two-year bachelor's is often treated as incomplete for direct master's entry, so you may need a graduate certificate as a bridge.",
      ],
    },
    {
      title: "Sit IELTS or PTE",
      body: [
        "Book early. Most master's courses want IELTS 6.5 overall, higher for nursing and teaching.",
        "Many Pakistani applicants studied in English medium. A university may accept that for admission, but the student visa has a separate English rule, so confirm both.",
      ],
    },
    {
      title: "Start HEC and IBCC attestation early",
      body: [
        "IBCC attests your Matric and Intermediate (HSSC) certificates. HEC attests your degree and transcripts, and HEC will not attest a degree until the underlying school boards are IBCC-attested, so do IBCC first.",
        "HEC moved to an online e-attestation system in 2026, which is faster than the old in-person process but still needs planning. Begin as soon as you have your final results, because attestation is the step most likely to delay an offer.",
      ],
    },
    {
      title: "Apply, directly or through an authorised agent",
      body: [
        "Applying directly is free at many universities and keeps your logins and documents in your own hands.",
        "Several universities, and most in Western Australia, only accept applications from Pakistani citizens through an approved agent. Check each university's how-to-apply page. If Pakistan is listed as agent-only, use an agent that university has authorised.",
        "Deadlines can be earlier at universities that apply higher-scrutiny country dates. Apply three to four months ahead.",
      ],
    },
    {
      title: "Accept your offer and pay the tuition deposit",
      body: [
        "Read the conditions, fees, start date, and any scholarship before you accept.",
        "Paying the deposit, usually one semester of tuition, triggers your Confirmation of Enrolment. Keep the receipt.",
      ],
    },
    {
      title: "Arrange and evidence your finances",
      body: [
        "Show funds for first-year tuition (or the balance after the deposit), twelve months of living costs (AUD 29,710), and travel of roughly AUD 2,000 to 2,500, with a margin above the minimum.",
        "A genuine savings history is the strongest evidence. An education loan must be disbursed or ready to disburse. A parent or close relative can sponsor you with documented income and a proof of relationship. Money held by a distant relative is treated as not genuinely available to you.",
        "Outward remittance for education runs through your bank under State Bank of Pakistan rules. Pay tuition through the provider your university nominates and keep every transfer receipt and bank form.",
      ],
    },
    {
      title: "Lodge the subclass 500 student visa",
      body: [
        "Lodge in ImmiAccount yourself, or through a registered migration agent, using your Confirmation of Enrolment. The base charge is AUD 2,500 for the main applicant.",
        "Answer the Genuine Student questions, which replaced the Genuine Temporary Entrant test in March 2024, and keep them consistent with your financial evidence. Lodge early: Pakistan is at Evidence Level 3, processing is slower, and offshore refusal rates are elevated.",
      ],
    },
    COMMON_LAST_STEP,
  ],
  documents: [
    {
      group: "Academic",
      items: [
        "Matric and Intermediate (HSSC) certificates, IBCC-attested",
        "Bachelor's degree and transcript, HEC-attested",
        "Provisional certificate and year-by-year mark sheets",
      ],
    },
    {
      group: "Identity",
      items: [
        "Passport valid well beyond your intended stay",
        "CNIC or B-Form",
        "Passport-size photographs to the visa specification",
      ],
    },
    {
      group: "English",
      items: [
        "IELTS or PTE result, or a medium-of-instruction letter if the university and visa both accept one",
      ],
    },
    {
      group: "Financial",
      items: [
        "Bank statements showing a genuine savings history, ideally three to six months",
        "Source-of-funds evidence: salary slips, property sale deed, or a disbursed loan letter",
        "Sponsor's income and employment proof plus a document proving the relationship",
        "Tuition deposit receipt and OSHC policy document",
        "Bank remittance forms for money already sent",
      ],
    },
  ],
  timeline: [
    { when: "11 to 13 months before", task: "Shortlist courses, book and sit IELTS or PTE, start IBCC then HEC attestation" },
    { when: "8 to 9 months before", task: "Submit applications, directly or through an authorised agent" },
    { when: "5 to 7 months before", task: "Receive offers, accept, pay the tuition deposit" },
    { when: "4 to 6 months before", task: "Receive the Confirmation of Enrolment, buy OSHC, assemble financial evidence" },
    { when: "3 to 5 months before", task: "Lodge the subclass 500 visa in ImmiAccount" },
    { when: "1 to 2 months before", task: "Visa decision, book flights, arrange first-week accommodation" },
  ],
  pitfalls: [
    "Leaving HEC and IBCC attestation until after you have an offer, which delays everything downstream.",
    "Assuming a two-year bachelor's is enough for direct master's entry.",
    "Funds that appear just before lodging, with no savings history.",
    "An education loan approved in principle rather than disbursed.",
    "Money held by a distant relative rather than a parent, treated as not genuinely available.",
  ],
  faq: [
    {
      q: "Do Pakistani students need HEC attestation for Australian universities?",
      a: "Most Australian universities and the credential checks behind admission expect HEC-attested degrees and transcripts, with IBCC attestation of your school certificates first. HEC will not attest a degree until the school boards are IBCC-attested, so do IBCC first and start as soon as you have your results.",
    },
    {
      q: "Is a 2-year bachelor's degree from Pakistan accepted in Australia?",
      a: "Often not for direct master's entry. A four-year BS, or a two-year bachelor's plus a master's, is the reliable route. Some universities offer a graduate certificate as a bridge into a master's.",
    },
    {
      q: "Can I apply to an Australian university from Pakistan without an agent?",
      a: "At many universities, yes. But several, and most in Western Australia, only accept applications from Pakistani citizens through an approved agent. Check each university's how-to-apply page.",
    },
    {
      q: "How long does the whole process take from Pakistan?",
      a: "Plan for about 11 to 13 months from research to arrival, mainly because HEC and IBCC attestation and Evidence Level 3 visa processing both take time on top of the application itself.",
    },
    {
      q: "When should I lodge my student visa for a February intake?",
      a: "As soon as you hold the Confirmation of Enrolment, usually November to January for a February start. Pakistan is at Evidence Level 3, so processing runs longer and an early, fully evidenced application matters.",
    },
  ],
  sources: [
    "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
    "https://eportal.hec.gov.pk/",
    "https://www.studyaustralia.gov.au/en/plan-your-studies/how-to-apply-to-study-in-australia",
  ],
  lastVerified: "2026-09-03",
};

export const APPLY_GUIDES: Record<string, ApplyGuide> = {
  nepal: NEPAL,
  india: INDIA,
  pakistan: PAKISTAN,
};

export const APPLY_GUIDE_SLUGS = Object.keys(APPLY_GUIDES);

export function getApplyGuide(countrySlug: string): ApplyGuide | undefined {
  return APPLY_GUIDES[countrySlug];
}
