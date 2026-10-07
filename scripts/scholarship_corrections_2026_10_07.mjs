// Corrections to six Perth/Sydney/Melbourne scholarship rows, each re-checked
// on 2026-10-07 by reading the university's own current scholarship page in a
// real browser (not search snippets). Where a claim could not be confirmed on
// the official page it was removed rather than kept.
//
// What the checks found, by row:
//  - monash: official page says UNDERGRADUATE only, 20 awards a year, retained
//    with a distinction average. The old text said undergraduate and
//    postgraduate and "not capped at a handful of recipients" (wrong), and
//    named the wrong medical exclusion. "Cannot be combined" was unverified.
//  - murdoch: the 2026 Futures round (25%, closed 30 Sep 2026) is over. The
//    live 2027 pages are International Futures (20%, ten named courses) and
//    International Welcome (15%, citizens of listed countries), both open
//    1 Aug 2026 to 1 Sep 2027. "Assessed automatically" and "deducted
//    automatically each period" are not stated on either page, so removed.
//    The Murdoch page does not say how to apply, so separate_application is
//    deliberately left as it was.
//  - ecu: the International Excellence round (India/Pakistan, 20%) closed
//    8 Aug 2026. ECU's current 2027 award is the ECU Success Scholarship
//    (15% rising to 20% then 25%), no separate application, any nationality.
//  - unsw: the International Student Award is assessed from the admissions
//    application on academic merit and commitment to study, for eligible
//    countries only. The old "assessed automatically ... asked for a
//    statement" wording is not on the official pages.
//  - uwa: facts match the official page; only source/external URL (404) fixed.
//  - curtin: the cited record (id=7547) is a closed round for July 2025 to
//    March 2026 starters. Source repointed to Curtin's evergreen international
//    scholarships page, which still lists Global Merit at 20%, and which also
//    lists two awards the old row did not mention.
export const VERIFIED_ON = "2026-10-07";

export const SCHOLARSHIP_CORRECTIONS_2026_10_07 = {
  "monash-international-merit-scholarship": {
    amount: "AUD 15,000 per year for the degree (2026 awards onward), 20 awarded each year",
    study_level: "Undergraduate",
    separate_application: false,
    eligibility:
      "International students holding a full, unconditional Monash offer for a full-time undergraduate degree at a Monash campus in Australia, selected on academic achievement. Not open to current Monash students, students completing an Australian Year 12, Bachelor of Medical Science and Doctor of Medicine entrants, Monash pathway programs such as Monash College or the Foundation Year, or transfers from another Monash campus or another Australian university.",
    description:
      "Monash's flagship merit award for international undergraduates, paid at AUD 15,000 a year (AUD 10,000 for awards made before 2026) until you complete the minimum credit points for your degree. Monash lists a total value of up to AUD 75,000.\n\nIt is highly selective. Monash offers only 20 of these a year and selects on academic achievement, so treat it as a possible bonus rather than something to budget around. No application is required: if you receive a full, unconditional undergraduate offer you are automatically considered.\n\nTo keep it, you must maintain a distinction average (70 percent or above) each semester and agree to provide a student profile for Monash's marketing and recruitment material. It is open to undergraduates only, and recipients are invited to apply for a place in Monash Minds, a first-year leadership program. If your Monash offer is conditional, or you enter through a Monash pathway program such as Monash College or the Foundation Year, you are not eligible.",
  },
  "murdoch-university-international-scholarships": {
    amount: "15% or 20% tuition reduction (2027 awards)",
    study_level: "Any",
    deadline_date: "2027-09-01",
    eligibility:
      "International, full-fee-paying students starting at one of Murdoch's Western Australian campuses in 2027 who are not Australian citizens or permanent residents, hold no other Murdoch scholarship, and have no Australian Government scholarship or foreign-government or industry sponsorship covering tuition. The 20% International Futures Scholarship covers ten named courses: Bachelor of Business, Bachelor of Psychology, Bachelor of Biomedical Science, Bachelor of Data Analytics, Bachelor of Health Science/Master of Clinical Chiropractic, Master of Health Administration, Policy and Leadership, Master of Criminology, Master of Communication, Master of Forensic Science and Master of Engineering Practice. The 15% International Welcome Scholarship is for citizens of a published list of countries (including India, Nepal, Bangladesh, Pakistan, China, Sri Lanka and Vietnam) on most coursework bachelor, graduate certificate, graduate diploma and master's degrees.",
    description:
      "For 2027 starters Murdoch lists two tuition-reduction awards, each applied for the duration of the degree and each open from 1 August 2026 to 1 September 2027.\n\nThe International Futures Scholarship takes 20 percent off tuition but only on ten named courses, so check your course against the list on Murdoch's page. The International Welcome Scholarship takes 15 percent off for citizens of a published list of countries and covers most coursework degrees, excluding the Bachelor of Science in Veterinary Biology, the Doctor of Veterinary Medicine, the Bachelor of Nursing and the Master of Clinical Psychology. Both are open only to international full-fee-paying students starting at a Western Australian campus, and you cannot hold either alongside another Murdoch scholarship.\n\nMurdoch changes these awards every year. The 2026 International Futures Scholarship, for example, was 25 percent on a different list of courses and closed on 30 September 2026, and earlier 2027 and 2028 versions of both awards on Murdoch's site are marked discontinued. Murdoch's page does not describe how to apply, so confirm the process with Murdoch before counting on either award. Murdoch is in Perth, Western Australia, which has lower living costs than Sydney or Melbourne.",
    external_url: "https://www.murdoch.edu.au/study/scholarships/scholarships-listing",
    source_url: "https://www.murdoch.edu.au/study/scholarship/international-futures-scholarship---2027-new",
  },
  "ecu-international-excellence-scholarship": {
    name: "ECU Success Scholarship",
    amount: "15% tuition reduction, rising to 20% then 25% as you complete credit points",
    study_level: "Any",
    separate_application: false,
    deadline_date: "2027-12-31",
    eligibility:
      "International, full-fee-paying, non-sponsored students (not Australian citizens, permanent residents, humanitarian visa holders or New Zealand citizens) starting an eligible ECU bachelor or master by coursework degree in 2027, studying on campus at Joondalup, City or South West, or in a packaged pathway course with an ECU registered pathway partner. Not available to students with a government scholarship, industry sponsorship or another ECU scholarship unless ECU approves. Some courses are excluded, including nursing, computer science and information technology bachelors, WAAPA courses, and one-year honours degrees. No nationality restriction is listed.",
    description:
      "ECU's current 2027 international award reduces tuition in stages. Every recipient starts at 15 percent. It rises to 20 percent after you complete 120 credit points at ECU on a three or four-year bachelor degree (60 on a two-year master), and to 25 percent after 240 credit points on a three-year bachelor, 360 on a four-year bachelor, or 180 on a two-year master. Only credit points completed at ECU count, so credit transfer does not move you up a stage, and repeated units do not count.\n\nNo separate application is required: you apply for an eligible ECU course. ECU awards it at its sole discretion and the reduction applies only to tuition fees for an eligible course, delivered on campus in Western Australia. It opens on 1 July 2026 and closes on 31 December 2027.\n\nECU's earlier International Excellence Scholarship gave a flat 20 percent to high achievers from selected countries. That award covered India, Pakistan, Nepal and Kenya in 2025, but only India and Pakistan in 2026, and closed on 8 August 2026. ECU also lists regional international scholarships for 2027 (North Asia, ASEAN, Africa, Europe and the Americas) that are not covered here. Check ECU's scholarship list for the one that applies to your citizenship, since you can hold only one ECU scholarship at a time.",
    external_url: "https://www.ecu.edu.au/scholarships/details/2027-ecu-success-scholarship",
    source_url: "https://www.ecu.edu.au/scholarships/details/2027-ecu-success-scholarship",
  },
  "unsw-international-scholarships": {
    amount: "20% tuition contribution (International Student Award); larger competitive awards need an application",
    study_level: "Any",
    eligibility:
      "Commencing international undergraduate, postgraduate coursework and UNSW College diploma students who are citizens of an eligible country and start in 2026 or 2027. UNSW assesses the International Student Award from your admissions application, looking at academic merit and aptitude and commitment to study. The competitive International Scientia Coursework Scholarship is a separate application.",
    description:
      "UNSW's headline international award is the International Student Award, a 20 percent contribution toward tuition for every year of your program, for students from eligible countries who start in 2026 or 2027. UNSW's page says it is assessed from your UNSW admissions application on academic merit and your aptitude and commitment to study, and it can be combined with other UNSW scholarships. Confirm your country is on UNSW's eligible list, which this page does not reproduce.\n\nUNSW also lists larger competitive awards, including the International Scientia Coursework Scholarship, the Australia's Global University Award and the UNSW College Award, which need a separate application. UNSW's Term 1 2027 scholarship applications close on 30 October 2026.\n\nThe International Student Award is limited to students commencing in 2026 or 2027, so it is tied to a specific commencement window rather than being open ended. UNSW is moving to a new Flex-Semester academic calendar from 2028.",
    external_url: "https://www.scholarships.unsw.edu.au/international-student-award",
    source_url: "https://www.scholarships.unsw.edu.au/international-student-award",
  },
  "uwa-global-excellence-scholarship": {
    external_url:
      "https://www.uwa.edu.au/study/scholarships-and-fees/scholarships/international-scholarships/global-excellence-scholarship",
    source_url:
      "https://www.uwa.edu.au/study/scholarships-and-fees/scholarships/international-scholarships/global-excellence-scholarship",
  },
  "curtin-international-scholarships": {
    external_url: "https://www.curtin.edu.au/study/scholarships/international-scholarships/",
    source_url: "https://www.curtin.edu.au/study/scholarships/international-scholarships/",
    description:
      "Curtin's broad merit scholarship for international students, cutting tuition by 20% for the whole length of an eligible undergraduate degree of four years or less or a postgraduate coursework degree of two years or less at Curtin's Western Australian campuses.\n\nThere is no separate application. Every eligible applicant is automatically assessed against the required Course Weighted Average when they apply to study, and recipients must keep a Good Standing academic status each study period to continue receiving it. Curtin runs this award in dated rounds and the scholarship can be revoked if you already hold another scholarship or sponsorship, so confirm the current round's dates and terms on Curtin's own scholarships page before counting on it.\n\nCurtin's international scholarships page also lists a John Curtin Global Excellence Scholarship worth 40 percent off tuition and a Global Future Leaders Scholarship worth a one-off A$10,000 tuition credit. This page does not cover their eligibility, so check Curtin's own pages for the terms of each.",
  },
};
