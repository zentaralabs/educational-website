// Second pass: the remaining scholarship rows, each re-checked on 2026-10-08
// against the university's own current page read in a real browser.
//
// Rows that already matched the official page (no change here): the five
// Adelaide awards, CDU Global Merit, Charles Sturt VC (round closed 30 Jun
// 2026), CQU International Merit (ends after Term 3 2026), Federation Merit,
// Flinders, Swinburne, JCU, La Trobe, Melbourne, RMIT, Sydney VC and Sydney
// Scholars India, Torrens, UNE, UniSC, UniSQ, Newcastle, Wollongong, UQ, UTS,
// Australia Awards.
//
// Found wrong or stale, fixed below:
//  - anu: no "Chancellor's International Scholarship" exists. ANU's automatic
//    awards are the International Achievement Award (20%, 25% SE Asia, 50%
//    Pacific) and, for China/Japan/Mongolia/Korea, a first-year-only 20% VC's
//    International Achievement Award.
//  - griffith: the award is the Vice Chancellor's International Scholarship,
//    minimum GPA 6.0 of 7 (not 5.5), application required.
//  - acu: eligible nationals are Bhutan, China, Hong Kong, India, Kenya,
//    Malaysia, Nepal, Nigeria, South Korea and Taiwan, commencing 2027.
//    Sri Lanka, Vietnam, Philippines, Indonesia and Cambodia are NOT listed.
//  - bond: full-tuition awards are domestic-only, so "or full tuition" removed.
//  - deakin VC: 100% or 50%, not always 100%.
//  - tasmania: current award is the Tasmanian International Merit Scholarship,
//    30% (25% is the alumni and family award).
//  - vu: up to 30% for the FIRST year, which can be kept or increased, not a
//    flat 10-30% for the whole standard duration.
//  - wsu: no application is needed; AUD 5,000 or 10,000 a year (2027 starters)
//    plus a 50% Vice-Chancellor's Academic Excellence award. Never "full".
//  - qut: "up to 100% for select awards" is not on QUT's page.
//  - uc: only the 10% and 20% tiers were found on UC's current pages.
//  - macquarie: page says up to AUD 10,000, competitive, limited; the "some
//    full" claim and the automatic-assessment claim are not on the page.
//  - rtp: 2027 stipend rates are now published (35,550 to 55,537).
// Left unverified on purpose: Deakin India (its official page now redirects).
export const VERIFIED_ON = "2026-10-08";

export const SCHOLARSHIP_CORRECTIONS_2026_10_08 = {
  "anu-chancellors-international-scholarship": {
    name: "ANU International Achievement Award",
    amount: "20% tuition reduction (25% for South East Asia, 50% for the Pacific)",
    study_level: "Any",
    separate_application: false,
    eligibility:
      "International students who are new commencing or progressing to a higher level of study at ANU, with a Selection Rank of 85 or equivalent for undergraduate programs or a GPA of 5.5 or equivalent for postgraduate coursework, and who hold residential status in a country other than China (including Taiwan, Hong Kong and Macau), Japan, Mongolia, South Korea and North Korea. Not available with an external sponsorship that covers tuition, and the award is offered once per level of study. Residents of China, Japan, Mongolia and Korea are instead considered for the ANU Vice-Chancellor's International Achievement Award, a 20% reduction for one year.",
    description:
      "ANU's main automatic award for international students is the International Achievement Award. It takes 20 percent off tuition for undergraduate and postgraduate coursework students, 25 percent for the South East Asia award and 50 percent for the Pacific award. Applicants from India, Nepal, Bangladesh, Pakistan and Sri Lanka fall in the standard 20 percent group.\n\nThere is no application. ANU considers every eligible overseas student who has applied for admission, including those who have already accepted an offer. The minimum academic bar is a Selection Rank of 85 for undergraduates and a GPA of 5.5 for postgraduates, or the minimum program entry requirement for citizens of Pacific countries.\n\nStudents who hold residential status in China (including Taiwan, Hong Kong and Macau), Japan, Mongolia or Korea are not eligible for this award. They are considered for the ANU Vice-Chancellor's International Achievement Award instead, which is a 20 percent reduction paid for one year only. Both awards exclude the Doctor of Medicine and Surgery and the Master of Digital Transformation and Entrepreneurship, and each can be offered only once at each level of study.",
    external_url: "https://study.anu.edu.au/scholarships/find-scholarship/anu-international-achievement-award",
    source_url: "https://study.anu.edu.au/scholarships/find-scholarship/anu-international-achievement-award",
  },
  "griffith-remarkable-scholarship": {
    name: "Griffith Vice Chancellor's International Scholarship",
    amount: "50% tuition for the program duration",
    study_level: "Any",
    separate_application: true,
    deadline_date: "2026-11-28",
    eligibility:
      "New commencing international students (not Australian or New Zealand citizens) with an offer to study a Griffith undergraduate or postgraduate coursework program full-time in 2026 or 2027, a minimum GPA of 6.0 on a 7-point scale or equivalent, and who meet all academic and English entry requirements. You apply for the scholarship after receiving your offer, with academic records and a personal statement, and a university panel reviews it.",
    description:
      "Griffith's top award for international coursework students takes 50 percent off tuition for the whole degree, subject to ongoing eligibility. Griffith gives it to a number of exceptional students each year rather than to everyone who qualifies.\n\nYou apply to study first. Once you hold a letter of offer you apply for the scholarship by the closing date for your commencing trimester, including academic records and a personal statement, and a university panel reviews the applications. You must accept both your program offer and the scholarship by the deadline in your scholarship letter, or the scholarship is withdrawn.\n\nGriffith's published closing dates are 15 August 2026 for Trimester 3 2026, 28 November 2026 for Trimester 1 2027 (outcome by 11 December), 2 January 2027 for students completing Australian Year 12, and 10 April 2027 for Trimester 2 2027. A minimum GPA of 6.0 out of 7 is required. Griffith also lists a separate International Academic Merit Scholarship worth 20 percent off tuition. Griffith's campuses span Brisbane and the Gold Coast.",
    external_url: "https://www.griffith.edu.au/international/scholarships-finance/scholarships/vice-chancellors-international-scholarship",
    source_url: "https://www.griffith.edu.au/international/scholarships-finance/scholarships/vice-chancellors-international-scholarship",
  },
  "acu-executive-deans-international-scholarship": {
    study_level: "Any",
    separate_application: false,
    eligibility:
      "International students commencing an eligible ACU program in 2027 who are nationals of Bhutan, China, Hong Kong, India, Kenya, Malaysia, Nepal, Nigeria, South Korea or Taiwan, hold a qualification that meets ACU's academic entry requirements, and study on an Australian campus (not online). Not available to study abroad or exchange students, and it cannot be held with the ACU Global Horizons, Flourishing Lives or Health Sciences Towards Brisbane 2032 scholarships.",
    description:
      "ACU's main merit award for international students reduces annual tuition by 10, 15 or 20 percent, depending on your faculty, for the minimum duration of an eligible course. Arts, Law and Business, and Computer Science courses get 20 percent, Education and most Health Science courses get 15 percent, and the Bachelor of Nursing gets 10 percent. Some health courses, including occupational therapy, physiotherapy and speech pathology, are excluded.\n\nACU's page says no application is required. It is open only to nationals of ten countries, which include India and Nepal but not Sri Lanka, Vietnam, the Philippines or Indonesia, and it applies to students starting in 2027.\n\nYou cannot receive it together with the ACU Global Horizons International Scholarship, the Flourishing Lives International Scholarship or the Health Sciences Towards Brisbane 2032 Scholarship, so check which award leaves you better off. Confirm the full conditions on ACU's scholarship page before counting on it.",
    external_url: "https://acu.smapply.io/res/p/EDIS/",
    source_url: "https://acu.smapply.io/res/p/EDIS/",
  },
  "bond-university-international-scholarships": {
    amount: "25% or 50% tuition",
    eligibility:
      "International students (not Australian or New Zealand citizens or permanent residents) applying to Bond. The 25% International Stand Out Scholarship needs an ATAR equivalent of 90 or an IB score of 32, or for postgraduate study a strong prior result, and is open to citizens of a published country list that includes India, Nepal, Bangladesh, Pakistan, Sri Lanka and Vietnam. The 50% International Undergraduate Excellence Scholarship needs an ATAR equivalent of 95 or an IB score of 38 and excludes the Bond Medical Program.",
    description:
      "Bond, a private university, offers international scholarships of 25 or 50 percent off tuition. Because Bond runs three semesters a year and lets students finish a bachelor degree in two years, a scholarship compounds with the time saved. Bond's full-tuition Vice Chancellor's Elite Scholarship is for domestic students only, so international applicants should not count on a full-fee award.\n\nThe 25 percent award (International Stand Out Scholarship) needs an ATAR equivalent of 90 or an IB score of 32 and covers single or approved combined undergraduate and postgraduate degrees. The 50 percent award (International Undergraduate Excellence Scholarship) sets a higher bar of ATAR 95 or IB 38 and excludes the Bond Medical Program. Bond says applications for its programs are always open and that your academic eligibility is assessed when your program application is reviewed, so confirm with Bond whether a separate scholarship form is needed for the award you want.\n\nBond charges international and domestic students the same fee and has no subsidised places, so scholarship support matters more here than at a public university.",
    external_url: "https://bond.edu.au/entry-to-bond/scholarships",
    source_url: "https://bond.edu.au/scholarship/international-undergraduate-excellence-scholarship",
  },
  "deakin-vice-chancellors-international-scholarship": {
    amount: "100% or 50% tuition, depending on outcome",
    eligibility:
      "New international students enrolling in a Deakin coursework degree (not the Doctor of Medicine) who meet entry and English requirements and have at least an 85% average in previous studies, or 80% in the first four semesters of an undergraduate degree. Meeting the minimum does not guarantee selection. You apply separately with a form, a 300-word personal statement and two references.",
    description:
      "Deakin's top international award covers 100 percent or 50 percent of tuition for the normal length of the program, depending on the scholarship outcome. It also requires participation in the Vice-Chancellor's Professional Excellence Program. Deakin's other international scholarships include a 25 percent award, a 20 percent merit award and a 10 percent alumni discount.\n\nThis one needs a separate application. You complete the International Scholarship Program application form and email it to Deakin International Admissions at least one month before your program starts, with a 300-word personal statement, two references on community involvement or leadership, and your program application with transcripts. You may be invited to an interview. Scholarships are assessed on a rolling basis ahead of each trimester.\n\nYou need an average of at least 85 percent in previous studies, but Deakin says higher results may be needed because the competition is strong. If you are not competitive for it, Deakin's other international scholarships are assessed automatically from your academic record when you apply.",
    external_url: "https://www.deakin.edu.au/study/fees-and-scholarships/scholarships/find-a-scholarship/deakin-vice-chancellors-international-scholarship",
    source_url: "https://www.deakin.edu.au/study/fees-and-scholarships/scholarships/find-a-scholarship/deakin-vice-chancellors-international-scholarship",
  },
  "tasmanian-international-scholarship": {
    name: "Tasmanian International Merit Scholarship",
    amount: "30% tuition for the course duration",
    study_level: "Any",
    separate_application: false,
    eligibility:
      "Commencing international students enrolled full-time in an eligible undergraduate or postgraduate coursework degree at the University of Tasmania, assessed on academic merit using your highest qualification of at least one year. Not available with another University of Tasmania scholarship or external sponsorship, and not available to continuing students.",
    description:
      "The University of Tasmania's Tasmanian International Merit Scholarship gives eligible commencing international students a 30 percent reduction in registered tuition fees for the duration of the course. It is assessed automatically when you submit your International Student Application, and your offer letter tells you if you have been awarded it.\n\nSelection uses your highest-level qualification of at least one year of study, so there is no separate form. Tasmania's other international awards are the Tasmanian Aurora Excellence Scholarship (50 percent), the Tasmanian Access Scholarship (20 percent) and the International Alumni and Family Scholarship (25 percent). Some courses are excluded, so check the terms and conditions.\n\nThe University of Tasmania is the only university in Tasmania, with strong marine and Antarctic science, and the whole state is classified regional for skilled migration. It does not reassess current students based on their progress, so this award is for commencing students only.",
    external_url: "https://www.utas.edu.au/study/scholarships-fees-and-costs/international-scholarships/tasmanian-international-merit-scholarship",
    source_url: "https://www.utas.edu.au/study/scholarships-fees-and-costs/international-scholarships/tasmanian-international-merit-scholarship",
  },
  "vu-block-model-international-scholarship": {
    amount: "10%, 20% or 30% off first-year tuition, which can be kept or increased",
    eligibility:
      "New international students starting a foundation, higher education diploma, undergraduate, postgraduate coursework or Study Abroad course at Victoria University's Melbourne campuses in 2026 or 2027, who meet the course entry requirements. English, VET and research courses and sponsored students are excluded. Assessed automatically after you apply, with the percentage set by your previous academic results.",
    description:
      "Victoria University's main international award takes 10, 20 or 30 percent off tuition for your first year (your first two semesters), based on your previous academic results. VU says the scholarship is guaranteed if you meet the entry requirements for an eligible course, but 30 percent awards are limited, so apply early.\n\nYou are assessed automatically after submitting your course application. If you study well, you have the chance to keep or increase the scholarship for the full standard duration of the course, so the first-year percentage is not locked in. VU's Block Model teaches one or two subjects at a time in small classes.\n\nThe scholarship applies to coursework only and starters in 2026 and 2027. VU also lists a STEM Accommodation Scholarship worth up to a year of free accommodation for select offshore applicants in science, engineering and information technology, and a 20 percent Global Research Scholarship for research degrees.",
    external_url: "https://www.vu.edu.au/study-at-vu/fees-scholarships/scholarships/international-scholarships/vu-block-model-international-scholarship",
    source_url: "https://www.vu.edu.au/study-at-vu/fees-scholarships/scholarships/international-scholarships/vu-block-model-international-scholarship",
  },
  "western-sydney-university-international-scholarship": {
    amount: "AUD 5,000 or 10,000 a year (undergraduate, 2027 starters), or 50% tuition for the Vice-Chancellor's Academic Excellence award",
    study_level: "Any",
    separate_application: false,
    eligibility:
      "New international students commencing a coursework program in 2027 who are not Australian or New Zealand citizens or permanent residents, with an offer of admission, and who do not enter via the International College or The College pathways. The undergraduate Vice-Chancellor's Academic Excellence award needs an ATAR of 90 or equivalent, and the postgraduate award a GPA of 5.95 out of 7. Sydney City campus programs are excluded from the standard international scholarships.",
    description:
      "Western Sydney University considers every new international coursework applicant automatically, with no separate scholarship application. Its standard undergraduate International Scholarship is a contribution toward tuition of AUD 5,000 or AUD 10,000 a year for students starting in 2027 (AUD 3,000 or 6,000 for 2026 starters), paid for up to three years, depending on your results in previous studies.\n\nThe larger Vice-Chancellor's Academic Excellence awards cover 50 percent of tuition per session for the duration of the degree, up to three years for undergraduates and up to two years for postgraduates. They need a minimum ATAR of 90 for undergraduates or a GPA of 5.95 out of 7 for postgraduates. A panel shortlists candidates twice a year and shortlisted applicants are asked for a statement on how the scholarship would support their studies and career.\n\nYou must start in the session and year shown on your offer, because the awards cannot be deferred. Some courses are excluded, including the Bachelor of Nursing and the Bachelor of Clinical Science (Medicine)/Doctor of Medicine. The university built its reputation on widening access, though Sydney living costs apply across its campuses.",
    external_url: "https://www.westernsydney.edu.au/international/applying/fees-and-costs/scholarships/international-scholarships-undergraduate",
    source_url: "https://www.westernsydney.edu.au/international/applying/fees-and-costs/scholarships/academic-excellence-undergraduate-scholarships",
  },
  "qut-international-merit-scholarship": {
    amount: "25% tuition reduction for the full program, subject to minimum academic standards",
    eligibility:
      "Commencing international students with strong academic records entering eligible QUT coursework degrees in selected faculties. QUT also lists a 20% International Talent Scholarship for selected faculties and countries.",
    description:
      "QUT's International Merit Scholarship covers 25 percent of tuition fees for the full duration of the program, provided you meet the minimum academic standards, and it applies in selected faculties only. QUT also lists a 20 percent International Talent Scholarship for selected faculties and countries. Most QUT degrees build industry placements in, so the practical value goes beyond the fee saving.\n\nYou do not need to apply for the merit scholarship. QUT assesses your qualifications when you apply to study and lets you know if you meet the criteria, with the scholarship offer arriving alongside your admission offer. Brisbane's living costs are lower than Sydney's or Melbourne's while still being a state capital.\n\nQUT guarantees the 25 percent reduction for your first two semesters, then extends it each following semester only if you maintain a minimum GPA of 5.5 on QUT's 7.0 scale. Check your faculty against the eligibility list on QUT's scholarship page before counting on it.",
    external_url: "https://www.qut.edu.au/study/international/scholarship-opportunities",
    source_url: "https://www.qut.edu.au/study/international/scholarship-opportunities",
  },
  "uc-international-merit-scholarships": {
    amount: "10% or 20% tuition reduction for the length of the course",
    eligibility:
      "New international students commencing a CRICOS-registered undergraduate or postgraduate coursework program at the University of Canberra's Australian campuses. The 10% award needs a GPA of 5 out of 7 (70% for bachelor's, 65% for master's) and the 20% High Achievers award needs a GPA of 5.5 out of 7 (80% for bachelor's, 75% for master's). Open to all countries. Honours (one-year), graduate certificates and diplomas, and several health programs are excluded.",
    description:
      "The University of Canberra assesses every new international applicant for its merit scholarships automatically, with no further application. The UC Merit Scholarship gives 10 percent off total tuition and the UC High Achievers Scholarship gives 20 percent, each for the length of the course and open to students from all countries.\n\nThe thresholds are a GPA of 5 out of 7 for the 10 percent award and 5.5 out of 7 for the 20 percent award, which UC translates to 70 or 80 percent for bachelor's degrees and 65 or 75 percent for master's degrees. Scholarships are granted first come, first served until filled, so accept your offer as soon as you can. Several health programs, one-year Honours and graduate certificates or diplomas are excluded.\n\nUC's older materials mention a 25 percent Course Merit award for selected countries, but it does not appear on UC's current scholarship pages, so check with UC before counting on it. Canberra is a compact planned city with easy access to public-sector employers.",
    external_url: "https://www.canberra.edu.au/scholarship/uc-merit",
    source_url: "https://www.canberra.edu.au/scholarship/uc-merit",
  },
  "macquarie-vice-chancellors-international-scholarship": {
    amount: "Up to AUD 10,000 towards tuition",
    eligibility:
      "International students with a full offer to study a Macquarie undergraduate or postgraduate coursework degree and a qualifying GPA, awarded on academic merit. Macquarie says places are limited and recommends accepting your offer and scholarship early.",
    description:
      "Macquarie's Vice-Chancellor's International Scholarship recognises academic excellence and provides up to AUD 10,000 applied toward your tuition fee. Macquarie describes it as highly competitive and based on academic merit, with limited places, and it is open to undergraduate and postgraduate applicants who hold a full offer and meet a GPA requirement.\n\nMacquarie's scholarship page does not make clear whether you apply separately or are assessed automatically, so confirm the process with Macquarie's international scholarships team before counting on it. Macquarie also lists region-specific variants of this award.\n\nMacquarie sits next to a large corporate and technology precinct in Sydney's north, with its own metro station, so graduate employment and internships are a practical part of the value.",
    external_url: "https://students.mq.edu.au/study/course/overseas/staging/details/vice-chancellors-international-scholarship",
    source_url: "https://students.mq.edu.au/study/course/overseas/staging/details/vice-chancellors-international-scholarship",
  },
  "research-training-program-rtp-scholarship": {
    amount: "Government-set stipend of AUD 35,550 to 55,537 a year (2027), rate set by each university, plus a tuition offset",
    description:
      "The RTP is how the Australian Government funds most higher-degree research students. Universities receive a block grant and award it as some combination of three things: a full tuition-fee offset, a living stipend, and allowances for relocation, thesis costs, or health cover.\n\nThe government publishes a base and a maximum full-time stipend rate each year. For 2026 they were AUD 34,315 and AUD 53,608, and for 2027 they are AUD 35,550 and AUD 55,537. Each university sets its own rate rather than paying one national figure. International and domestic students compete in the same pool. You apply through your chosen university's graduate research school, not the government, usually alongside or just after your admission application.\n\nPlaces are allocated by each university's own selection panels, which rank applicants on prior academic results and research potential rather than through one national competition, so exact thresholds vary by faculty and institution. Applicants should confirm the process, including whether an interview or written proposal review is used, with their specific graduate research school.",
  },
};
