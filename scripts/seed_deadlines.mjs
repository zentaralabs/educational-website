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

const TODAY = "2026-08-29";

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

// ---------------------------------------------------------------------------
// Verified per-university international closing dates. Each row was checked on
// 2026-08-29 against the university's own "how to apply / key dates" page
// (URL in `source`). Where a university genuinely runs rolling assessment or
// grouped offer rounds instead of one cut-off, that is captured with
// `is_rolling: true` and said plainly in the note rather than invented as a
// hard date. A slug present here fully replaces the generic INTAKES rows.
//   slug -> [{ type, level, date, note, source, is_rolling? }]
// ---------------------------------------------------------------------------
const PER_UNI = {
  "university-of-sydney": [
    {
      type: "Semester 1",
      level: "Undergraduate",
      date: "2026-12-01",
      note: "Closing date for international undergraduate applications for the Semester 1 2027 (February) intake, published by the University of Sydney. Individual courses can close earlier once places fill, and the Doctor of Medicine and Doctor of Dental Medicine set their own dates. Apply six to eight weeks before this to leave time for a student visa.",
      source: "https://www.sydney.edu.au/study/applying/application-dates.html",
    },
    {
      type: "Semester 1",
      level: "Graduate",
      date: "2026-12-18",
      note: "Closing date for international postgraduate coursework applications for the Semester 1 2027 intake, published by the University of Sydney. Some courses close earlier, faculties can set their own dates, and separate scholarship deadlines apply.",
      source: "https://www.sydney.edu.au/study/applying/application-dates.html",
    },
    {
      type: "Semester 2",
      level: "Undergraduate",
      date: "2027-05-29",
      note: "Closing date for international undergraduate applications for the Semester 2 2027 (August) intake, published by the University of Sydney. Not every course has a mid-year intake, and courses can close earlier once full.",
      source: "https://www.sydney.edu.au/study/applying/application-dates.html",
    },
    {
      type: "Semester 2",
      level: "Graduate",
      date: "2027-05-29",
      note: "Closing date for international postgraduate coursework applications for the Semester 2 2027 intake, published by the University of Sydney. Check your course page: not every course runs mid-year.",
      source: "https://www.sydney.edu.au/study/applying/application-dates.html",
    },
  ],
  "australian-national-university": [
    {
      type: "Semester 1",
      level: "Undergraduate",
      date: "2026-12-15",
      note: "Closing date for international applications for Semester 1 2027, published by ANU. ANU does not accept late international applications: missing the date defers you to the next intake. Crawford School of Public Policy programs close on 31 October 2026, and programs with additional selection criteria can close earlier.",
      source: "https://study.anu.edu.au/apply/international-applications",
    },
    {
      type: "Semester 1",
      level: "Graduate",
      date: "2026-12-15",
      note: "Closing date for international postgraduate applications for Semester 1 2027, published by ANU. Crawford School of Public Policy programs close on 31 October 2026. ANU does not accept late international applications.",
      source: "https://study.anu.edu.au/apply/international-applications",
    },
    {
      type: "Semester 2",
      level: "Undergraduate",
      date: "2027-05-15",
      note: "Closing date for international applications for Semester 2 2027, published by ANU. Not every program runs a mid-year intake. ANU does not accept late international applications.",
      source: "https://study.anu.edu.au/apply/international-applications",
    },
    {
      type: "Semester 2",
      level: "Graduate",
      date: "2027-05-15",
      note: "Closing date for international postgraduate applications for Semester 2 2027, published by ANU. Crawford School of Public Policy programs close on 15 April 2027. ANU does not accept late international applications.",
      source: "https://study.anu.edu.au/apply/international-applications",
    },
  ],
  "university-of-melbourne": [
    {
      type: "Semester 1",
      level: "Undergraduate",
      date: "2026-11-30",
      note: "Closing date for direct international undergraduate applications for the start-year (Semester 1) 2027 intake, published by the University of Melbourne. Degrees with supplementary tasks such as Fine Arts and Music close before September. Applicants with an Australian Year 12 or an IB completed in Australia or New Zealand apply through VTAC, which closes in late September.",
      source:
        "https://study.unimelb.edu.au/how-to-apply/undergraduate-study/international-applications/entry-requirements/important-dates",
    },
    {
      type: "Semester 2",
      level: "Undergraduate",
      date: "2027-05-31",
      note: "Closing date for direct international undergraduate applications for the mid-year (Semester 2) 2027 intake, published by the University of Melbourne. Only a limited set of courses is available mid-year.",
      source:
        "https://study.unimelb.edu.au/how-to-apply/undergraduate-study/international-applications/entry-requirements/important-dates",
    },
    {
      type: "Semester 1",
      level: "Graduate",
      date: "2026-10-31",
      is_rolling: true,
      note: "Melbourne assesses most graduate coursework applications as they arrive and closes courses once they are full, so there is no single closing date. For a Semester 1 2027 (February or March) start, apply as early as you can; competitive courses fill months ahead. Each course page lists its own dates.",
      source:
        "https://study.unimelb.edu.au/how-to-apply/graduate-coursework-study/international-applications",
    },
    {
      type: "Semester 2",
      level: "Graduate",
      date: "2027-04-15",
      is_rolling: true,
      note: "Melbourne assesses most graduate coursework applications on a rolling basis and closes courses once full. For a July 2027 start, apply as early as you can; not every course runs a mid-year intake. Each course page lists its own dates.",
      source:
        "https://study.unimelb.edu.au/how-to-apply/graduate-coursework-study/international-applications",
    },
  ],
  "unsw-sydney": [
    {
      type: "Term 1",
      level: "Undergraduate",
      date: "2026-11-30",
      is_rolling: true,
      note: "UNSW runs three terms a year (Term 1 starts in February) and makes international offers in grouped rounds for in-demand programs rather than on one cut-off. Exact 2027 international dates are published from around late September 2026. Apply two to three months before the term start to leave time for a student visa.",
      source: "https://www.unsw.edu.au/study/how-to-apply/application-deadline-dates",
    },
    {
      type: "Term 1",
      level: "Graduate",
      date: "2026-11-30",
      is_rolling: true,
      note: "UNSW postgraduate coursework runs to a three-term calendar (Term 1 starts in February), with grouped offer rounds for popular programs and separate deadlines for some faculties (AGSM MBA, Psychology, Master of Teaching, Juris Doctor). Confirm the date for your program; apply early for visa time.",
      source: "https://www.unsw.edu.au/study/how-to-apply/application-deadline-dates",
    },
    {
      type: "Term 3",
      level: "Undergraduate",
      date: "2027-07-31",
      is_rolling: true,
      note: "Term 3 at UNSW starts in September. Not all programs have a Term 2 or Term 3 intake. International offers are made in grouped rounds for in-demand programs; confirm the date for your program and apply early for visa time.",
      source: "https://www.unsw.edu.au/study/how-to-apply/application-deadline-dates",
    },
  ],
  "university-of-queensland": [
    {
      type: "Semester 1",
      level: "Undergraduate",
      date: "2026-11-30",
      is_rolling: true,
      note: "UQ does not set one international closing date. It depends on the program and on the visa assessment level of your country of citizenship, and some programs (Medicine, Dental Science, and other health courses with UCAT) close earlier. For a Semester 1 2027 (late February) start, apply around three months ahead and check the closing date on your program page.",
      source:
        "https://support.future-students.uq.edu.au/app/answers/detail/a_id/460",
    },
    {
      type: "Semester 1",
      level: "Graduate",
      date: "2026-11-30",
      is_rolling: true,
      note: "UQ postgraduate coursework has no single international closing date; it varies by program and by the visa assessment level of your country. Check the 'How to apply' tab on your program page, and apply early to leave time for a student visa.",
      source:
        "https://support.future-students.uq.edu.au/app/answers/detail/a_id/460",
    },
    {
      type: "Semester 2",
      level: "Undergraduate",
      date: "2027-05-31",
      is_rolling: true,
      note: "For a Semester 2 2027 (late July) start at UQ, apply around three months ahead. Not every program has a mid-year intake, and closing dates vary by program and country. Check your program page.",
      source:
        "https://support.future-students.uq.edu.au/app/answers/detail/a_id/460",
    },
    {
      type: "Semester 2",
      level: "Graduate",
      date: "2027-05-31",
      is_rolling: true,
      note: "UQ postgraduate coursework mid-year closing dates vary by program and by country visa assessment level. Check the 'How to apply' tab on your program page; not every program runs in Semester 2.",
      source:
        "https://support.future-students.uq.edu.au/app/answers/detail/a_id/460",
    },
  ],
  "university-of-western-australia": [
    {
      type: "Semester 1",
      level: "Undergraduate",
      date: "2026-12-28",
      note: "UWA closing date for international applications for Semester 1 2027, for citizens of higher visa-scrutiny countries (India, Nepal, Pakistan, Vietnam, the Philippines, Sri Lanka, Bangladesh and others on UWA's list). Applicants from all other countries have until 11 January 2027. Some courses close earlier; dates can change.",
      source: "https://www.uwa.edu.au/study/how-to-apply/international-applicants",
    },
    {
      type: "Semester 1",
      level: "Graduate",
      date: "2026-12-28",
      note: "UWA closing date for international postgraduate coursework applications for Semester 1 2027, for citizens of higher visa-scrutiny countries; applicants from all other countries have until 11 January 2027. Some courses (for example the MBA and health programs) set their own dates.",
      source: "https://www.uwa.edu.au/study/how-to-apply/international-applicants",
    },
    {
      type: "Semester 2",
      level: "Undergraduate",
      date: "2027-05-24",
      note: "UWA closing date for international applications for Semester 2 2027, for citizens of higher visa-scrutiny countries; applicants from all other countries have until 7 June 2027. Not every course has a mid-year intake, and some close earlier.",
      source: "https://www.uwa.edu.au/study/how-to-apply/international-applicants",
    },
    {
      type: "Semester 2",
      level: "Graduate",
      date: "2027-05-24",
      note: "UWA closing date for international postgraduate coursework applications for Semester 2 2027, for citizens of higher visa-scrutiny countries; applicants from all other countries have until 7 June 2027. Confirm the date on your course page.",
      source: "https://www.uwa.edu.au/study/how-to-apply/international-applicants",
    },
  ],
  "adelaide-university": [
    {
      type: "Semester 1",
      level: "Undergraduate",
      date: "2027-01-15",
      is_rolling: true,
      note: "Adelaide University does not set a fixed international deadline. It asks you to apply at least six weeks before the intake starts (roughly mid-January for a Semester 1 2027 start); later applications are assessed case by case and may roll to the next intake. Some programs have early closing dates. As a newly merged university (from 2026), confirm current dates and fees directly.",
      source: "https://international.adelaide.edu.au/admissions/apply",
    },
    {
      type: "Semester 1",
      level: "Graduate",
      date: "2027-01-15",
      is_rolling: true,
      note: "Adelaide University asks international postgraduate coursework applicants to apply at least six weeks before the Semester 1 start; there is no fixed deadline and some programs close early. As a newly merged university, confirm current dates and fees directly.",
      source: "https://international.adelaide.edu.au/admissions/apply",
    },
    {
      type: "Semester 2",
      level: "Undergraduate",
      date: "2027-06-15",
      is_rolling: true,
      note: "Adelaide University asks international applicants to apply at least six weeks before the Semester 2 (July) start; there is no fixed deadline, later applications are assessed case by case, and not every program runs mid-year.",
      source: "https://international.adelaide.edu.au/admissions/apply",
    },
    {
      type: "Semester 2",
      level: "Graduate",
      date: "2027-06-15",
      is_rolling: true,
      note: "Adelaide University asks international postgraduate coursework applicants to apply at least six weeks before the Semester 2 start; there is no fixed deadline and some programs close early. Confirm current dates directly.",
      source: "https://international.adelaide.edu.au/admissions/apply",
    },
  ],
  "university-of-technology-sydney": [
    {
      type: "Semester 1",
      level: "Undergraduate",
      date: "2026-11-30",
      note: "UTS closing date for international undergraduate applications for the Autumn (February/March) 2027 session, for applicants based outside Australia (applicants in Australia have until 15 January 2027). Some courses set their own dates and are not offered every session.",
      source: "https://www.uts.edu.au/for-students/admissions-entry/application-dates",
    },
    {
      type: "Semester 1",
      level: "Graduate",
      date: "2026-11-30",
      note: "UTS closing date for international postgraduate applications for the Autumn 2027 session, for applicants based outside Australia (15 January 2027 if you are in Australia). Some health and psychology programs close on 31 October 2026.",
      source: "https://www.uts.edu.au/for-students/admissions-entry/application-dates",
    },
    {
      type: "Semester 2",
      level: "Undergraduate",
      date: "2027-04-30",
      note: "UTS closing date for international undergraduate applications for the Spring (July) 2027 session, for applicants based outside Australia (31 May 2027 if you are in Australia). Not every course has a mid-year intake.",
      source: "https://www.uts.edu.au/for-students/admissions-entry/application-dates",
    },
    {
      type: "Semester 2",
      level: "Graduate",
      date: "2027-04-30",
      note: "UTS closing date for international postgraduate applications for the Spring 2027 session, for applicants based outside Australia (31 May 2027 if you are in Australia). Check your course page: not every course runs mid-year.",
      source: "https://www.uts.edu.au/for-students/admissions-entry/application-dates",
    },
  ],
};

// Universities that assess international applications on a rolling basis
// rather than to one fixed calendar date (the norm outside the Group of
// Eight). Checked 2026-08-29 against each university's own how-to-apply /
// key-dates page. `note` is the university's own stated guidance. These
// produce is_rolling rows at each standard intake, anchored to the generic
// INTAKES date purely so the calendar can sort them.
const ROLLING_SOURCE = {
  "macquarie-university": "https://www.mq.edu.au/study/admissions-and-entry/apply/international",
  "university-of-newcastle": "https://www.newcastle.edu.au/study/international/how-to-apply",
  "curtin-university": "https://www.curtin.edu.au/study/applying/application-deadlines/",
  "university-of-wollongong": "https://www.uow.edu.au/study/admission-info/closing-dates/",
  "queensland-university-of-technology": "https://www.qut.edu.au/about/key-dates-and-academic-calendar/international-key-dates",
  "rmit-university": "https://www.rmit.edu.au/study-with-us/international-students/apply-to-rmit-international-students/application-dates",
  "deakin-university": "https://www.deakin.edu.au/international-students/how-to-apply",
  "griffith-university": "https://www.griffith.edu.au/apply/international",
  "western-sydney-university": "https://www.westernsydney.edu.au/international/applying/how-to-apply",
  "university-of-tasmania": "https://www.utas.edu.au/international/applying/how-to-apply/degrees-by-coursework/application-closing-dates",
  "flinders-university": "https://www.flinders.edu.au/international/apply",
  "australian-catholic-university": "https://www.acu.edu.au/study-at-acu/how-to-apply/international-students",
  "swinburne-university-of-technology": "https://www.swinburne.edu.au/courses/applying/how-to-apply-international/",
  "edith-cowan-university": "https://www.ecu.edu.au/future-students/applying/important-dates",
  "james-cook-university": "https://www.jcu.edu.au/applying-to-jcu/international/coursework/international-application-due-dates",
  "charles-darwin-university": "https://www.cdu.edu.au/international/how-apply",
  "cquniversity-australia": "https://www.cqu.edu.au/study/international/enquire-apply-accept/key-dates",
  "university-of-canberra": "https://www.canberra.edu.au/future-students/apply-to-uc/international-student-applications",
  "southern-cross-university": "https://www.scu.edu.au/study/international-study/how-to-apply-international-future-students/key-application-dates/",
  "university-of-the-sunshine-coast": "https://usc.edu.au/learn/how-do-i-apply/application-dates",
  "university-of-southern-queensland": "https://www.unisq.edu.au/study/key-dates",
  "university-of-new-england": "https://www.une.edu.au/international/apply/important-dates",
  "charles-sturt-university": "https://study.csu.edu.au/international/how-to-apply/application-process",
  "federation-university-australia": "https://www.federation.edu.au/apply/how-to-apply/international/standard-cut-off-dates/",
  "victoria-university": "https://www.vu.edu.au/study-at-vu/apply-to-vu/international-applicants",
  "murdoch-university": "https://www.murdoch.edu.au/study/international-students",
  "la-trobe-university": "https://www.latrobe.edu.au/international/apply",
};
const ROLLING = {
  "macquarie-university":
    "Macquarie assesses international applications as they arrive rather than to a set date, and some courses fill early. Apply well before your session start and leave time for a student visa.",
  "university-of-newcastle":
    "The University of Newcastle recommends submitting your international application at least 12 weeks before your semester or trimester start. Late applications may be held for the next available intake, and some programs (psychology, the Joint Medical Program) have their own dates.",
  "curtin-university":
    "Curtin closes international applications 10 weeks before the start date for applicants from higher visa-scrutiny countries and 4 weeks before for everyone else (2 weeks if you already hold a subclass 500 visa in Australia). Quota courses in health close earlier, and an offer is not guaranteed close to the deadline.",
  "university-of-wollongong":
    "UOW sets application dates per course (the 'Key Dates' button on each course page) and generally keeps considering late applications while places remain. Applications in by the listed date get an outcome before the session starts.",
  "queensland-university-of-technology":
    "QUT sets a final international application date for each teaching period and country of citizenship, usually six to eight weeks before the start. After that date QUT does not accept applications for that intake, so apply as early as possible.",
  "rmit-university":
    "RMIT sets international application dates per course. Apply at least four to eight weeks before the start (earlier for programs with limited places) to leave time for a student visa.",
  "deakin-university":
    "Deakin runs three trimesters, starting in March, July and November, and sets closing dates by intake and by country to allow visa-processing time. Apply early and check your course page.",
  "griffith-university":
    "Griffith runs three trimesters, starting in March, July and November, and takes applications year-round. Some programs have their own deadlines, and research degrees close about eight weeks before the intake.",
  "western-sydney-university":
    "Western Sydney's guidance is to apply by 15 November for the Autumn (February/March) start and by 15 May for the Spring (July) start. Applications open at different times by program, and some use UAC International.",
  "university-of-tasmania":
    "The University of Tasmania accepts applications at any time for most courses. From overseas, apply at least three months before the semester start (one month if you are already onshore). Some courses, such as Medicine, run fixed application rounds.",
  "flinders-university":
    "Flinders recommends applying no later than 12 weeks before your intended start date, to allow for the pre-visa assessment and any scholarship deadlines. Limited-intake courses have their own deadlines.",
  "australian-catholic-university":
    "ACU recommends submitting a full international application at least 12 weeks before your start date. Applications for some campuses also run through QTAC, UAC or VTAC.",
  "swinburne-university-of-technology":
    "Swinburne sets international application closing dates per intake, with separate offshore and onshore dates, and advises applying at least three months ahead for visa processing.",
  "edith-cowan-university":
    "ECU international application deadlines vary by course; apply as early as you can. Applicants from a number of higher visa-scrutiny countries must apply through an ECU authorised agent rather than directly.",
  "james-cook-university":
    "JCU sets international application due dates by country and region, and capped courses (Physiotherapy closes 30 September, plus Dentistry and Veterinary Science) have firm earlier dates. Apply as early as possible.",
  "charles-darwin-university":
    "CDU has several international application closing dates each semester; apply as early as you can, as earlier applications get an offer sooner. Most CDU international students apply through an authorised agent.",
  "cquniversity-australia":
    "CQUniversity recommends applying at least three months before your preferred term to leave time for an offer, a Confirmation of Enrolment and a student visa.",
  "university-of-canberra":
    "The University of Canberra asks international applicants to apply through its portal at least two months before the semester start. Late applications are considered case by case and may be deferred to a later intake.",
  "southern-cross-university":
    "Southern Cross recommends your international application is in at least two to three months before you start. SCU runs multiple terms a year; applicants from the African continent and some other countries must apply through an education agent.",
  "university-of-the-sunshine-coast":
    "UniSC sets an application closing date for each study period; applications received after it are not accepted except in exceptional circumstances, and some programs close early without notice.",
  "university-of-southern-queensland":
    "UniSQ sets application closing dates per program (see its Key Dates page); apply early for assessment and visa time. Applicants from Africa, the Middle East and the subcontinent must apply through a UniSQ representative.",
  "university-of-new-england":
    "UNE runs trimesters; it asks international applicants to apply by the end of November for Trimester 1 (February) and the end of May for Trimester 2 (June). Late applications are considered where possible.",
  "charles-sturt-university":
    "Charles Sturt publishes standard international cut-off dates per session (around mid-January for a Session 1 start), with earlier dates for some courses such as onshore Nursing. Check the date for your course.",
  "federation-university-australia":
    "Federation University uses standard international cut-off dates for most courses, with earlier deadlines for some courses and for genuine-student documents, acceptance and payment. Search your course to confirm.",
  "victoria-university":
    "Victoria University shows an application-close date on each course page and runs frequent intakes under its Block Model. Applicants from some countries must apply through an education agent.",
  "murdoch-university":
    "Murdoch runs semester and trimester intakes and assesses international applications as they arrive. Applicants from a number of countries must apply through an authorised agent; apply early for visa time.",
  "la-trobe-university":
    "La Trobe assesses international applications on a rolling basis across its March, July and November intakes. Apply two to three months ahead and check your course page for any earlier date.",
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

function noteFor(intake, name, rollingNote) {
  // Every non-Go8 Australian university we checked assesses international
  // applications on a rolling basis rather than to one fixed date, so the
  // note leads with that. `rollingNote` is the university's own guidance
  // where we have it; otherwise a generic-but-accurate line is used.
  const base =
    `${name} assesses international applications on a rolling basis rather than to one fixed deadline. ` +
    `The date shown is a recommended time to apply for the ${intake.when} intake, roughly three to four months ` +
    `before it starts. Applications are usually still accepted after it while places remain and there is ` +
    `time for a student visa. `;
  const detail =
    rollingNote ||
    (intake.level === "Graduate"
      ? `Postgraduate coursework and professional programs (medicine, law, some design and business) often close earlier, so check the date for your specific course.`
      : intake.level === "Foundation/Pathway"
        ? `Pathway and foundation programs often run extra intakes through the year; confirm the next start with ${name}.`
        : `Competitive courses such as medicine and programs needing a portfolio or audition close earlier. Confirm the date for your course with ${name}.`);
  return base + detail;
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
    "Term 1",
    "Term 2",
    "Term 3",
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
    // Verified per-university rows take precedence over the generic INTAKES.
    const perUni = PER_UNI[u.slug];
    if (perUni) {
      for (const row of perUni) {
        await client.query(
          `insert into deadlines
            (university_id, degree_level_id, deadline_type_id, deadline_date,
             notes, is_rolling, date_kind, status, last_verified_at, source_url)
           values ($1,$2,$3,$4,$5,$6,$7,'published',$8,$9)`,
          [
            u.id,
            dlevel[row.level],
            typeId[row.type],
            row.date,
            row.note,
            Boolean(row.is_rolling),
            // A rolling row's date is an anchor for sorting, not a published
            // cut-off, so only the firm rows here count as closing dates.
            row.is_rolling ? "recommended" : "closing_date",
            TODAY,
            row.source ?? u.website_url,
          ],
        );
        inserted++;
      }
      continue;
    }

    let keys = OVERRIDES[u.slug];
    if (!keys) {
      keys = [];
      const has = (l) => u.levels.includes(l);
      if (has("Undergraduate") || !has("Graduate")) keys.push("s1_ug", "s2_ug");
      if (has("Graduate")) keys.push("s1_pg", "s2_pg");
      if (has("Foundation/Pathway")) keys.push("s1_fp", "s2_fp");
    }

    // Every non-Go8 university we checked assesses international applications
    // on a rolling basis, so these rows carry a recommended apply-by date
    // rather than a published cut-off: date_kind = 'recommended' makes the UI
    // show it to the month and skip the OPEN/UPCOMING stamp. `rollingNote` is
    // the university's own guidance where we verified it. NIDA is the one
    // real exception (single audition-based cohort with a hard cut-off).
    const rollingNote = ROLLING[u.slug];

    for (const key of keys) {
      const intake = INTAKES[key];
      const isNida = u.slug === "nida";
      await client.query(
        `insert into deadlines
          (university_id, degree_level_id, deadline_type_id, deadline_date,
           notes, is_rolling, date_kind, status, last_verified_at, source_url)
         values ($1,$2,$3,$4,$5,$6,$7,'published',$8,$9)`,
        [
          u.id,
          dlevel[intake.level],
          typeId[intake.type],
          intake.date,
          isNida
            ? `Application and audition cut-off for the ${intake.when} intake at NIDA. NIDA runs one audition-based intake a year, so this is a firm date, not a guide.`
            : noteFor(intake, u.name, rollingNote),
          // NIDA's note calls its date firm, so it must not render as rolling
          // guidance the way it used to; it is a published cut-off.
          false,
          isNida ? "closing_date" : "recommended",
          TODAY,
          ROLLING_SOURCE[u.slug] ?? u.website_url,
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
