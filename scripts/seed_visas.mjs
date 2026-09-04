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

const AUTHOR_ID = "6e1c0e5b-ed26-497c-a09c-e9539c6761e8"; // Roman Lama
// Bulk last_verified_at for the visa_subclasses + invitation_rounds rows.
// Only bump this when the whole set has actually been re-checked against
// official sources (not for a single-field correction like the 500 fee).
const TODAY = "2026-08-28";
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL ?? "https://www.wheretoapply.xyz").replace(/\/$/, "");
const INDEXNOW_KEY = "b1d94f7a2c8e4056a3f61e0d5c927b8f";

// Best-effort IndexNow ping so Bing/Yandex re-crawl the round tracker fast
// after a reseed. Never throws.
async function pingIndexNow(paths) {
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((p) => `${SITE_URL}${p}`),
      }),
    });
    console.log("indexnow", res.status);
  } catch (e) {
    console.log("indexnow failed (ignored):", e.message);
  }
}
const HOMEAFFAIRS = "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing";
const STUDYAUS = "https://www.studyaustralia.gov.au/en/plan-your-move/your-guide-to-visas";

const visas = [
  {
    slug: "student-500",
    code: "500",
    name: "Student visa",
    category: "student",
    stream: null,
    short_description:
      "Lets you study full-time in a registered course in Australia, and work up to 48 hours a fortnight while your course is running.",
    summary:
      "The subclass 500 is the visa nearly every international student in Australia holds. It covers one enrolment in a CRICOS-registered course, lasts for the length of that course plus a short buffer, and lets you bring family members. You must stay enrolled, keep adequate health cover, and satisfy the Genuine Student requirement.",
    is_points_tested: false,
    min_points: null,
    stay_period: "Up to 5 years, matched to your course length",
    leads_to_pr: false,
    pr_pathway:
      "The student visa itself is temporary and gives no direct PR entitlement. The common route is to finish an eligible qualification, move onto a subclass 485 Temporary Graduate visa, gain skilled work experience, and then apply for a 189, 190, or 491. Studying in a regional area can add points and open regional nomination streams.",
    base_application_charge:
      "From AUD 2,500 for the main applicant (up from AUD 2,000 on 1 July 2026), plus a charge for each family member. A lower charge applies to eligible Pacific Island, Timor-Leste, and ASEAN citizens, and to Independent ELICOS and non-award applications; the Visa Pricing Estimator shows the exact concession amount.",
    processing_time: "Most decisions in 1 to 4 months, varies by country and course",
    age_limit: "No upper age limit; applicants under 18 need welfare arrangements",
    english_requirement:
      "Typically IELTS 5.5 overall (or equivalent) for direct entry, lower with a packaged English course; providers set their own higher bars",
    work_experience_requirement: null,
    occupation_list: null,
    eligibility:
      "You are likely eligible if you:\n\n- Hold a Confirmation of Enrolment (CoE) in a CRICOS-registered course\n- Meet the Genuine Student requirement, which replaced the Genuine Temporary Entrant test in March 2024\n- Have enough money for tuition, travel, and living costs (the living-cost figure is set by Home Affairs and is reviewed regularly)\n- Hold Overseas Student Health Cover for the full visa period\n- Meet health and character requirements",
    conditions:
      "Common student visa conditions:\n\n- **8105** limits work to 48 hours per fortnight while your course is in session. Work is unlimited during scheduled breaks, and postgraduate research students are exempt once their course has started.\n- **8202** requires you to stay enrolled, maintain satisfactory attendance, and make satisfactory academic progress.\n- **8501** requires you to keep health insurance for the whole stay.\n- **8516** requires you to keep meeting the circumstances you were granted the visa under.",
    content:
      "## What the subclass 500 covers\n\nOne student visa covers one primary course of study, plus any pre-requisite courses packaged with it. If you change to a course at a lower AQF level than the one you were granted the visa for, you generally need a new visa.\n\n## Working on a student visa\n\nYou can start working once your course begins, not before. The 48-hour fortnightly cap applies while your course is in session. Hours worked in a registered course's mandatory work placement do not count toward the cap.\n\n## Bringing family\n\nYou can include your partner and dependent children. Family members over school age who want to work face the same 48-hour cap, or no cap if you are studying a masters or doctorate.\n\n## How long it lasts\n\nFor courses longer than 10 months finishing in November or December, the visa usually runs to 15 March the next year. Shorter courses get a one to three month buffer after the course end date.\n\n## Common reasons applications fail\n\nThin Genuine Student statements, unexplained gaps in study history, funds that appear only days before applying, and course choices that do not build on previous study are the usual culprits.",
    source_urls: [
      `${STUDYAUS}/student-visa-subclass-500`,
      "https://www.studyaustralia.gov.au/en/plan-your-move/genuine-student-requirement",
    ],
  },
  {
    slug: "temporary-graduate-485",
    code: "485",
    name: "Temporary Graduate visa",
    category: "graduate",
    stream: "Post-Higher Education Work and Post-Vocational Education Work",
    short_description:
      "Post-study work visa for recent graduates of Australian qualifications. Full work rights, no employer sponsor needed.",
    summary:
      "The subclass 485 gives graduates of eligible Australian qualifications a few years of unrestricted work rights so they can build the skilled experience that skilled-migration visas require. It has two streams: Post-Higher Education Work for bachelor degree level and above, and Post-Vocational Education Work for diplomas and trade qualifications.",
    is_points_tested: false,
    min_points: null,
    stay_period:
      "18 months to 3 years depending on qualification level; longer for some passport holders",
    leads_to_pr: false,
    pr_pathway:
      "The 485 is a bridge, not a destination. Use the time on it to reach one year of skilled employment in your nominated occupation, get a positive skills assessment, and lodge an Expression of Interest for a 189, 190, or 491. Regional study and work while on the 485 can add points.",
    base_application_charge:
      "From AUD 5,750 for the primary applicant. The second regional Post-Higher Education Work stream visa is cheaper. A lower charge applies to eligible Pacific Island and Timor-Leste citizens.",
    processing_time: "Commonly 4 to 12 months",
    age_limit:
      "Under 35 at time of application; under 50 for masters by research and PhD graduates, and for Hong Kong and British National (Overseas) passport holders",
    english_requirement:
      "Competent English, usually IELTS 6.0 overall with no band below 5.0, or equivalent; some exemptions apply",
    work_experience_requirement: null,
    occupation_list:
      "Post-Higher Education Work stream no longer requires a nominated occupation on a skills list; Post-Vocational Education Work stream does",
    eligibility:
      "You are likely eligible if you:\n\n- Held a student visa in the last 6 months\n- Completed a CRICOS-registered qualification that meets the Australian study requirement (at least 2 academic years of study in Australia)\n- Are under the age limit for your stream\n- Have competent English\n- Applied for an Australian Federal Police check and hold health insurance",
    conditions:
      "The 485 carries no work-hour limit and no employer restriction. You are expected to keep health cover for the visa period. It cannot usually be applied for onshore more than once for the same stream.",
    content:
      "## How long you can stay\n\n- Bachelor degree, including honours: 2 years\n- Masters by coursework: 2 years\n- Masters by research: 3 years\n- Doctoral degree: 3 years\n- Diploma or trade qualification (Post-Vocational stream): 18 months\n\nGraduates who studied and live in designated regional areas have in past years been offered a further one to two year extension. Indian nationals have separate arrangements under a bilateral agreement.\n\n## Why the experience you get here matters\n\nSkilled visa points and skills assessments both reward post-qualification skilled work. A year of relevant full-time work on a 485 is often the difference between an EOI that gets invited and one that does not.\n\n## Recent tightening\n\nThe age limit dropped from 50 to 35 for most applicants, stay periods were trimmed from the temporary pandemic-era extensions, and English requirements rose. Check the current settings before you plan around this visa.",
    source_urls: [
      `${STUDYAUS}/temporary-graduate-visa-subclass-485`,
      `${HOMEAFFAIRS}/temporary-graduate-485`,
    ],
  },
  {
    slug: "bridging-visa-a-b-c",
    code: "010/020/030",
    name: "Bridging visa (A, B and C)",
    // "Subclass 010/020/030 Visa", the default title lead, is a string with no
    // search volume. "Bridging visa" is the query. See 0028_add_visa_meta_title.sql.
    meta_title: "Bridging Visa Australia (010, 020, 030)",
    category: "bridging",
    stream: "Bridging visa A (010), B (020) and C (030)",
    short_description:
      "The visa that keeps you lawfully in Australia after your current visa ends, while the next application is still being decided.",
    summary:
      "A bridging visa is not something you choose. When you lodge an eligible application for a new visa while you are in Australia, Home Affairs almost always grants one automatically, and it sits dormant until your current visa ceases. For most students the relevant one is the Bridging visa A, which covers the gap between a subclass 500 expiring and a 485 being decided. The two facts that catch people out: it does not let you back into Australia if you leave, and it does not automatically come with work rights.",
    is_points_tested: false,
    min_points: null,
    stay_period:
      "Until your substantive visa application is finally determined, or your review proceedings end",
    leads_to_pr: false,
    pr_pathway:
      "A bridging visa is not a step toward permanent residence and holds no points. It protects your lawful status while a step that does count is being decided, such as a 485 lodged before your student visa ends, or a 189 or 190 lodged before your 485 ends. Time on a bridging visa does not count as time on the substantive visa it bridges to.",
    base_application_charge:
      "Bridging visa A and Bridging visa C are free. Bridging visa B costs AUD 575, except in limited circumstances, and from 1 July 2026 a lower charge applies to eligible Pacific Island and Timor-Leste citizens.",
    processing_time:
      "Home Affairs publishes no processing times for bridging visas. A BVA or BVC is normally granted as part of your substantive visa application rather than assessed separately",
    age_limit: "Any age",
    english_requirement: null,
    work_experience_requirement: null,
    occupation_list: null,
    eligibility:
      "Which one you are granted depends on what you held when you lodged your new application:\n\n- **Bridging visa A (010)** requires that you hold, or have held, a substantive visa, that you applied in Australia for a new substantive visa that has not been finally determined, and that you are in Australia both when you apply and when it is granted. This is the ordinary case for a student moving from a 500 to a 485.\n- **Bridging visa C (030)** applies where you did **not** hold a substantive visa when you lodged the new application. You must also not hold, or have held since your last substantive visa, a Bridging visa E.\n- **Bridging visa B (020)** is the only one you normally apply for deliberately. You must already hold a BVA or BVB, and you must give substantial reasons, with supporting documents, for needing to leave and return.\n\nAll three need you to meet the character requirement, and there is no age limit or English requirement. Since 1 August 2022 they can only be applied for online, through ImmiAccount or the online webform, and you must apply the same way you applied for the substantive visa. If you have applied for judicial review, the webform is the only route.\n\nYou cannot hold a bridging visa while waiting on a citizenship application.",
    conditions:
      "**Work.** Work rights are not automatic and are not the same for everyone. Your grant letter states the conditions that apply, and VEVO shows whether you have work restrictions. If your BVA does not permit work, you can apply for a further BVA that does, but you generally have to demonstrate financial hardship. A BVC granted with your substantive visa application does not permit work at all unless the visa you applied for is on a short list Home Affairs publishes. You cannot be granted a work-permitting BVA if your current BVA restricts work and was granted either for judicial review or in connection with a protection visa application.\n\n**Travel.** A BVA and a BVC do not support return travel. If you leave Australia while one is in effect, it ceases on departure and you cannot come back on it. Only a BVB carries a travel facility, granted for single or multiple journeys and valid until a stated date, and it must be granted before you go.\n\n**While your current visa is still valid**, you keep complying with that visa's conditions. The bridging visa's conditions replace them only once it comes into effect.",
    content:
      "## When a bridging visa actually starts\n\nA bridging visa is granted long before it does anything. It is dormant while your current substantive visa is still valid, and comes into effect only when that visa ceases (or, if your visa has already ceased, at grant).\n\nThis is the single most misread part of the system. A student whose subclass 500 runs to 15 March does not gain the 485's unrestricted work rights the day the BVA lands in their inbox. The 500 is still the visa in force, so the 48 hour fortnightly cap still applies. On 16 March the 500 ceases, the BVA comes into effect, and its conditions take over with no further paperwork.\n\n## Why leaving Australia is the expensive mistake\n\nA BVA or BVC that is in effect ends the moment you depart Australia, and it will not bring you back. If your substantive application is still undecided, you are then offshore with no visa to return on, and an onshore application such as a 485 generally cannot be granted while you are outside the country.\n\nThe fix has to happen before you fly. A Bridging visa B is applied for and granted while you are still in Australia, costs AUD 575, and needs substantial reasons plus documents showing why the trip is necessary. A funeral, a family illness, or a wedding you can evidence is the sort of thing this exists for.\n\n## What ends a bridging visa\n\nA BVA ends immediately if you leave Australia while it is in effect, if the substantive visa you applied for is granted, if another bridging visa is granted for the same application, or if either visa is cancelled.\n\nOtherwise it runs until your application is finally determined: refused, withdrawn, or decided on review. Home Affairs does not publish a single wind-down figure that covers every case, so use VEVO to see the date you must leave by once you have been notified of an outcome.\n\n## How much does a bridging visa cost?\n\nBridging visa A and Bridging visa C are free. Bridging visa B, the one that lets you leave and return, costs AUD 575 except in limited circumstances, and from 1 July 2026 eligible Pacific Island and Timor-Leste citizens pay less. Be wary of any site quoting a fee to activate work rights on a BVA: applying for a further BVA is free too.\n\n## How long does a bridging visa last?\n\nThere is no fixed length. It lasts as long as your substantive visa application takes, then ends a set period after you are notified of the outcome. Home Affairs does not publish a single figure covering every case, so check VEVO for the date you must leave by once a decision is made.\n\n## Do I get work rights on a bridging visa?\n\nNot automatically. Work rights come from the conditions written into your grant letter, and you should check them in VEVO rather than assuming they carry over. If your bridging visa does not let you work, you can apply for a further Bridging visa A that does, but you will usually have to show that you are in financial hardship.\n\n## Can I travel home while my 485 is being processed?\n\nOnly if you are granted a Bridging visa B before you leave. A Bridging visa A ceases as soon as you depart Australia and cannot be used to return, which would leave your 485 undecided and you offshore.\n\n## Does time on a bridging visa count toward permanent residence?\n\nNo. A bridging visa holds your lawful status while something else is decided. It carries no points, and the time on it is not time on the visa it bridges to. It does not stop you accruing skilled work experience, but the visa itself contributes nothing to a points score.\n\n## What about Bridging visa E?\n\nBridging visa E is a different thing, for people who are already unlawful or who are making arrangements to leave Australia. If you have applied on time and held a valid visa, it is not the one you will be dealing with, and holding one in the past can block a Bridging visa C.",
    source_urls: [
      `${HOMEAFFAIRS}/bridging-visa-a-010`,
      `${HOMEAFFAIRS}/bridging-visa-b-020`,
      `${HOMEAFFAIRS}/bridging-visa-c-030`,
      "https://immi.homeaffairs.gov.au/entering-and-leaving-australia/travelling-and-your-visa/travel-on-a-bridging-visa",
    ],
    last_verified_at: "2026-09-04",
  },
  {
    slug: "skilled-independent-189",
    code: "189",
    name: "Skilled Independent visa",
    category: "skilled",
    stream: "Points-tested",
    short_description:
      "Permanent residence for skilled workers who are not sponsored by an employer, state, or family member. Invitation only.",
    summary:
      "The subclass 189 is the most sought-after skilled visa because it is permanent from day one and ties you to no employer, state, or region. You submit an Expression of Interest through SkillSelect, and the Department invites the highest-ranked candidates in periodic rounds. Since the 2025 to 2026 program year these rounds run roughly quarterly rather than monthly.",
    is_points_tested: true,
    min_points: 65,
    stay_period: "Permanent",
    leads_to_pr: true,
    pr_pathway:
      "The 189 is permanent residence. After meeting residence requirements you can apply for Australian citizenship. There is no provisional stage.",
    base_application_charge:
      "From AUD 6,135 for the primary applicant, indexed each 1 July. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time: "Roughly 5 to 12 months after invitation, occupation dependent",
    age_limit: "Under 45 at the date of invitation",
    english_requirement:
      "Competent English (IELTS 6 equivalent) to qualify; Proficient (7) and Superior (8) add points",
    work_experience_requirement:
      "None mandatory, but skilled experience is where most points come from",
    // Corrected 2026-09-04: this previously said MLTSSL was "being replaced
    // progressively by the Core Skills Occupation List", which is wrong. CSOL
    // feeds the 482 and the 186 Direct Entry pathway, both employer-sponsored;
    // it does not apply to the 189 at all. Confirmed directly against
    // immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list.
    // See the new guide: /guides/skilled-occupation-lists-explained.
    occupation_list:
      "MLTSSL only, assessed under the 2013 ANZSCO version. The CSOL does not apply to this visa.",
    eligibility:
      "To be invited you generally need:\n\n- An occupation on the relevant skilled list\n- A positive skills assessment from the assessing authority for that occupation\n- At least 65 points on the points test (the floor to be invited, not a guarantee)\n- Competent English or better\n- To be under 45 when invited\n- Health and character clearance",
    conditions:
      "No ongoing visa conditions beyond the standard requirement to be of good character. You are free to live and work anywhere in Australia.",
    content:
      "## The points test\n\nPoints come from age, English level, skilled employment inside and outside Australia, qualifications, Australian study, study in a regional area, a Professional Year, credentialled community language, a skilled partner, and state or family sponsorship for the 190 and 491. The pass mark to submit is 65, but in practice recent 189 rounds have invited well above that for most occupations.\n\n## How invitation rounds work\n\nYou lodge an Expression of Interest, it sits in a pool ranked by points then by the date you reached that score, and the Department issues invitations in rounds. Trades occupations have recently been invited near the floor while ICT and accounting have needed 90 or more. See the [invitation rounds history](/visas/invitation-rounds) for the pattern.\n\n## If your score is not competitive\n\nMost people lift their score with more skilled experience, a higher English test result, a partner skills assessment, or by pivoting to the 190 or 491 where state nomination adds 5 or 15 points and cut-offs are usually lower.",
    source_urls: [
      `${HOMEAFFAIRS}/skilled-independent-189`,
      "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds",
    ],
  },
  {
    slug: "skilled-nominated-190",
    code: "190",
    name: "Skilled Nominated visa",
    category: "skilled",
    stream: "Points-tested",
    short_description:
      "Permanent residence for skilled workers nominated by an Australian state or territory. Adds 5 points.",
    summary:
      "The subclass 190 is permanent residence for skilled workers nominated by a state or territory government. Nomination adds 5 points and, more importantly, gives you access to state-specific occupation lists that are often broader than the national list. In return you commit to living and working in that state, usually for two years.",
    is_points_tested: true,
    min_points: 65,
    stay_period: "Permanent",
    leads_to_pr: true,
    pr_pathway:
      "The 190 is permanent residence. The commitment to your nominating state is a moral and declared one rather than a hard visa condition, but breaking it early can affect future dealings and any family members' applications.",
    base_application_charge:
      "From AUD 6,140 for the primary applicant, plus a separate state or territory nomination fee in some jurisdictions. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time: "Roughly 5 to 12 months after invitation",
    age_limit: "Under 45 at the date of invitation",
    english_requirement: "Competent English to qualify; higher levels add points",
    work_experience_requirement: "Set by each state's nomination criteria",
    occupation_list: "State and territory lists, drawn from the national skilled lists",
    eligibility:
      "On top of the standard skilled requirements (skills assessment, under 45, competent English, 65 points including the nomination), you must meet the current criteria of the state you apply to. These change through the year and often include a minimum period already living in the state, a job offer, or work in a priority sector.",
    conditions:
      "No hard residence condition on the visa, but you declare an intention to live in the nominating state and states track outcomes.",
    content:
      "## Why the 190 is often easier than the 189\n\nStates set their own lists and thresholds. An occupation that needs 95 points for a 189 invitation might get state nomination at 70 including the 5-point bonus. States also nominate for occupations that are not viable for the 189 at all.\n\n## How state nomination works\n\nYou usually lodge a state-specific Expression of Interest (some states use SkillSelect only, others have their own portal), wait for the state to select you, receive a formal invitation, then have 60 days to apply for the visa. Allocations for the 2025 to 2026 program year total 12,850 places for the 190 nationally.\n\n## The regional alternative\n\nIf you cannot meet any state's 190 criteria, the 491 covers regional areas of the same states with a lower bar and a 15-point bonus, then converts to permanent residence through the 191.",
    source_urls: [
      `${HOMEAFFAIRS}/skilled-nominated-190`,
      "https://www.australianmigrationlawyers.com.au/news-and-updates/skilled-migration-allocations-2025-26",
    ],
  },
  {
    slug: "skilled-work-regional-491",
    code: "491",
    name: "Skilled Work Regional (Provisional) visa",
    category: "skilled",
    stream: "State or territory nominated, and family sponsored",
    short_description:
      "Five-year provisional visa for skilled workers in regional Australia. Adds 15 points and leads to PR through the 191.",
    summary:
      "The subclass 491 is a five-year provisional visa for skilled workers who will live and work in a designated regional area, which is everywhere in Australia except Sydney, Melbourne, and Brisbane. Regional nomination or eligible family sponsorship adds 15 points, the largest single points boost available. After three years of meeting its conditions you move to the permanent 191.",
    is_points_tested: true,
    min_points: 65,
    stay_period: "5 years provisional",
    leads_to_pr: true,
    pr_pathway:
      "Live in a designated regional area for at least 3 years while on the 491, then apply for the subclass 191 permanent visa. You must have lodged tax returns and hold ATO notices of assessment for 3 of the 5 years, but there is no minimum income amount. Time on a 494 also counts toward the 191.",
    base_application_charge:
      "From AUD 6,140 for the primary applicant. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time: "Roughly 6 to 12 months after invitation",
    age_limit: "Under 45 at the date of invitation",
    english_requirement: "Competent English to qualify; higher levels add points",
    work_experience_requirement: "Set by the nominating state or covered by family sponsorship rules",
    occupation_list: "Regional occupation lists, broader than the 189 list",
    eligibility:
      "You need a positive skills assessment, an occupation on the relevant regional list, 65 points including the 15-point regional bonus, competent English, to be under 45 at invitation, and either:\n\n- Nomination by a state or territory government for one of its regional areas, or\n- Sponsorship by an eligible relative who lives in a designated regional area",
    conditions:
      "Condition **8579** requires you to live, work, and study only in a designated regional area. Condition **8578** requires you to tell Home Affairs within 14 days if your address, employer, or other circumstances change. Breaching these can end the visa and block the 191.",
    content:
      "## What counts as regional\n\nEverywhere except the Greater Sydney, Greater Melbourne, and Greater Brisbane metropolitan areas. Perth, Adelaide, the Gold Coast, Canberra, Hobart, Darwin, Newcastle, and Wollongong are all regional for this visa.\n\n## The 15 points\n\nRegional nomination or family sponsorship is worth 15 points, compared with 5 for the 190. That often turns an uncompetitive 189 profile into an easy invitation.\n\n## Getting to permanent residence\n\nThe 191 opened in November 2022. You need three years on the 491 with regional residence, and ATO notices of assessment for three of the five years of the visa. There is no minimum income amount: the AUD 53,900 threshold that applied until recently has been removed, so what counts is that you lodged returns, not how much you earned. You do not need to still be working in your nominated occupation.\n\n## Family-sponsored stream\n\nIf a parent, sibling, or child who is a settled Australian citizen or permanent resident lives in a regional area, they can sponsor you without any state involvement. Invitation rounds for this stream are small, often a few hundred places.",
    source_urls: [
      `${HOMEAFFAIRS}/skilled-work-regional-provisional-491`,
      "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds",
    ],
  },
  {
    slug: "permanent-residence-skilled-regional-191",
    code: "191",
    name: "Permanent Residence (Skilled Regional) visa",
    category: "skilled",
    stream: null,
    short_description:
      "The permanent visa that 491 and 494 holders move to after three years of living and working in regional Australia.",
    summary:
      "The subclass 191 is the permanent residence stage for people who spent three years on a 491 or 494 provisional visa in regional Australia. It is not points-tested and not invitation-based. If you held the provisional visa for three years, lived regionally, and had income above the threshold for three years, you qualify.",
    is_points_tested: false,
    min_points: null,
    stay_period: "Permanent",
    leads_to_pr: true,
    pr_pathway:
      "The 191 is the permanent visa. After meeting residence requirements you can apply for citizenship.",
    base_application_charge:
      "From AUD 630 for the primary applicant. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time: "Commonly 3 to 8 months",
    age_limit: "No age limit at this stage",
    english_requirement: "No new English test required at the 191 stage",
    work_experience_requirement:
      "No occupation requirement; the test is regional residence plus three years of income above the threshold",
    occupation_list: null,
    eligibility:
      "You are eligible if you:\n\n- Have held a subclass 491 or 494 visa (or a combination) for at least 3 years\n- Complied with the conditions of that visa, meaning you lived, worked, and studied only in designated regional areas\n- Lodged tax returns and hold ATO notices of assessment for at least 3 income years out of the 5 years of your eligible visa (there is no minimum income amount)\n- Meet health and character requirements",
    conditions:
      "No ongoing conditions. The 191 is a full permanent visa with the same rights as a 189 or 190.",
    content:
      "## The tax return requirement\n\nYou must show ATO notices of assessment for three income years out of the five years you held the provisional visa. The three years do not have to be consecutive. There is no minimum income amount: the AUD 53,900 threshold that applied when the 191 opened in 2022 has been removed, so what matters is that you lodged returns and the assessments exist, not how much you earned.\n\n## Living regionally\n\nHome Affairs cross-checks addresses, employer records, and Medicare data. Short trips away are fine; relocating to Sydney, Melbourne, or Brisbane while on the 491 is not, and it will surface at the 191 stage.\n\n## Why the 491 to 191 route is worth considering\n\nRegional nomination adds 15 points and regional lists are broader, so applicants who would wait years for a 189 invitation can often get a 491 quickly, then convert to permanent residence with nothing more than evidence of how they lived.",
    source_urls: [
      `${HOMEAFFAIRS}/permanent-residence-skilled-regional-191`,
    ],
  },
  {
    slug: "skills-in-demand-482",
    code: "482",
    name: "Skills in Demand visa",
    category: "employer-sponsored",
    stream: "Specialist Skills, Core Skills, and Essential Skills",
    short_description:
      "Employer-sponsored work visa, up to 4 years, that replaced the Temporary Skill Shortage visa in December 2024.",
    summary:
      "The subclass 482 lets an approved Australian business sponsor a skilled worker for up to four years. It replaced the old Temporary Skill Shortage visa in December 2024 and reduced the work-experience requirement from two years to one. Its three streams are split by salary: Specialist Skills for high earners, Core Skills for occupations on the Core Skills Occupation List, and Essential Skills for lower-paid critical roles (not yet open).",
    is_points_tested: false,
    min_points: null,
    stay_period: "Up to 4 years; 5 years for Hong Kong passport holders",
    leads_to_pr: true,
    pr_pathway:
      "After two years working for your sponsor you can generally be nominated for the permanent subclass 186 Employer Nomination Scheme visa through its Temporary Residence Transition stream. Time on the 482 also counts toward the residence requirement for other pathways.",
    base_application_charge:
      "From AUD 4,015 for the primary applicant in the Core Skills and Specialist Skills streams. A separate second instalment applies for an adult family member without functional English. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time: "Often 1 to 5 months once the sponsor and nomination are approved",
    age_limit: "No age limit for the 482 itself; the 186 transition has one",
    english_requirement:
      "Generally IELTS 5.0 overall with no band below 5.0 for Core Skills; exemptions for some passport holders and salary levels",
    work_experience_requirement:
      "At least 1 year of full-time relevant experience in the last 5 years",
    occupation_list: "Core Skills Occupation List (CSOL), introduced December 2024",
    eligibility:
      "The employer must first become an approved sponsor and lodge a nomination for a genuine position. You then need:\n\n- One year of relevant full-time work experience in the last five years\n- The required English level for your stream\n- A salary at or above the stream threshold and the market rate for the role\n- Registration or licensing if your occupation needs it\n- Health and character clearance",
    conditions:
      "Condition **8607** ties you to working only for your sponsor in the nominated occupation, and gives you a set period (currently 180 consecutive days, up to 365 in total) to find a new sponsor if your employment ends. Condition **8501** requires health cover.",
    content:
      "## The three streams\n\n- **Specialist Skills**: salary at or above AUD 141,210, most occupations eligible, faster processing, no occupation list check.\n- **Core Skills**: occupation on the Core Skills Occupation List, salary at or above the Core Skills Income Threshold of AUD 76,515.\n- **Essential Skills**: planned for lower-paid but critical roles under sector agreements, not open to applicants yet.\n\n## What changed from the old 457 and TSS\n\nThe experience bar dropped from two years to one. All streams now count toward permanent residence, removing the old Short-Term stream dead end. Sponsored workers get longer to find a new sponsor after a job loss.\n\n## Employer costs\n\nSponsors pay the Skilling Australians Fund levy, which is a per-year charge that scales with business size, on top of nomination and visa fees. This is a cost to the business, not the worker.",
    source_urls: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482",
    ],
  },
  {
    slug: "employer-nomination-scheme-186",
    code: "186",
    name: "Employer Nomination Scheme visa",
    category: "employer-sponsored",
    stream: "Temporary Residence Transition and Direct Entry",
    short_description:
      "Permanent residence for skilled workers nominated by their Australian employer.",
    summary:
      "The subclass 186 is permanent residence sponsored by an employer. Most people reach it through the Temporary Residence Transition stream after two years on a 482 with the same employer. The Direct Entry stream is for people with a strong skills assessment and three years of experience who have not held a sponsored visa, and is much less commonly granted.",
    is_points_tested: false,
    min_points: null,
    stay_period: "Permanent",
    leads_to_pr: true,
    pr_pathway: "The 186 is permanent residence and leads to citizenship after the residence requirement is met.",
    base_application_charge:
      "From AUD 6,140 for the primary applicant. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time:
      "Temporary Residence Transition often 6 to 12 months; Direct Entry can be longer",
    age_limit:
      "Under 45 at application, with exemptions for high earners, academics, medical practitioners, and some long-term 457 and 482 holders",
    english_requirement: "Competent English (IELTS 6 equivalent), with exemptions",
    work_experience_requirement:
      "Temporary Residence Transition: 2 years on a 482 or TSS with the sponsor. Direct Entry: 3 years of relevant experience plus a skills assessment",
    occupation_list:
      "Direct Entry uses the Core Skills Occupation List; Temporary Residence Transition does not check a list",
    eligibility:
      "For the common Temporary Residence Transition stream you need:\n\n- Two years of full-time work for your nominating employer on a 482, 457, or TSS visa in the last three years\n- The same nominated occupation as your sponsored visa\n- To be under 45 unless an exemption applies\n- Competent English\n- An employer willing to offer a permanent position at market salary",
    conditions:
      "As a permanent visa the 186 carries an obligation to make a genuine effort to commence work with the nominating employer, but no long-term condition tying you to that employer.",
    content:
      "## Temporary Residence Transition versus Direct Entry\n\nMost 186 grants are Temporary Residence Transition. The employer has already tested the labour market and sponsored you once, so the permanent nomination is more straightforward. Direct Entry has a harder skills assessment and occupation list check, and employers use it mainly for senior hires they cannot get onshore.\n\n## Age exemptions\n\nApplicants earning above the Fair Work high income threshold for three years, certain academics nominated by universities, and medical practitioners in regional areas can be over 45. Some people who held a 457 on 18 April 2017 also keep the old age rules.\n\n## Timing your application\n\nYou can lodge as soon as you hit two years with the sponsor. Employers often start the nomination a few months earlier so the permanent visa is granted close to when the 482 would have needed renewing.",
    source_urls: [
      `${HOMEAFFAIRS}/employer-nomination-scheme-186`,
    ],
  },
  {
    slug: "skilled-employer-sponsored-regional-494",
    code: "494",
    name: "Skilled Employer Sponsored Regional (Provisional) visa",
    category: "employer-sponsored",
    stream: "Employer Sponsored",
    short_description:
      "Five-year provisional visa for skilled workers sponsored by a regional employer. Leads to PR through the 191.",
    summary:
      "The subclass 494 is the employer-sponsored counterpart to the 491. A business in a designated regional area sponsors a skilled worker for five years, the worker must live and work in that region, and after three years they can move to the permanent 191. It requires three years of work experience and a positive skills assessment, more than the 482 asks for.",
    is_points_tested: false,
    min_points: null,
    stay_period: "5 years provisional",
    leads_to_pr: true,
    pr_pathway:
      "Hold the 494 for three years, comply with its regional conditions, and meet the income requirement, then apply for the subclass 191 permanent visa. This is the same permanent stage the 491 feeds into.",
    base_application_charge:
      "From AUD 6,140 for the primary applicant. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time: "Commonly 6 to 12 months",
    age_limit: "Under 45 at application, with limited exemptions",
    english_requirement: "Competent English (IELTS 6 equivalent)",
    work_experience_requirement: "At least 3 years of relevant full-time experience",
    occupation_list: "Regional occupation list for the 494",
    eligibility:
      "You need an approved regional employer sponsor, a nominated occupation on the 494 regional list, a positive skills assessment, three years of relevant experience, competent English, and to be under 45. A Regional Certifying Body must confirm the position and salary are genuine.",
    conditions:
      "Condition **8578** (notify changes within 14 days) and **8579** (live, work, and study only in a designated regional area) apply, the same as the 491. Breaching them jeopardises the 191.",
    content:
      "## 494 versus 491\n\nThe 491 needs no employer but does need state or family nomination and a points score. The 494 needs an employer willing to sponsor and certify the role, but no points test and no SkillSelect invitation. People with a solid job offer in a regional town often find the 494 faster.\n\n## 494 versus 482\n\nBoth are employer-sponsored. The 494 is longer (five years versus four), is explicitly a permanent residence pathway through the 191, and is restricted to regional areas. It asks for three years of experience against the 482's one.\n\n## Getting to the 191\n\nThree years of regional residence and ATO notices of assessment for three of the five years. There is no minimum income amount. Time split across a 491 and a 494 can be combined.",
    source_urls: [
      `${HOMEAFFAIRS}/skilled-employer-sponsored-regional-494`,
    ],
  },
  {
    slug: "partner-visa-820-801",
    code: "820/801",
    name: "Partner visa (onshore)",
    category: "family",
    stream: "Temporary (820) then Permanent (801)",
    short_description:
      "For partners of Australian citizens, permanent residents, and eligible New Zealand citizens who are in Australia. Two stages, one application.",
    summary:
      "The onshore partner visa is a two-stage visa applied for in one go. The subclass 820 is granted first and lets you stay, work, and study in Australia while the permanent subclass 801 is assessed, usually about two years after lodgement. You must be married to or in a genuine de facto relationship with your Australian partner.",
    is_points_tested: false,
    min_points: null,
    stay_period: "820 is temporary until 801 is decided; 801 is permanent",
    leads_to_pr: true,
    pr_pathway:
      "The 801 is permanent residence. It is normally granted about two years after the application date, sooner for long-term relationships or where there are children.",
    base_application_charge:
      "From AUD 11,710 for most applicants, covering both the 820 and 801 stages in one payment. From AUD 1,955 for Prospective Marriage (subclass 300) visa holders. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time:
      "820 stage often 12 to 24 months; 801 stage assessed from roughly 2 years after lodgement",
    age_limit: "Both partners must be at least 18",
    english_requirement:
      "No formal English test, though functional English affects a possible second-instalment charge",
    work_experience_requirement: null,
    occupation_list: null,
    eligibility:
      "You must:\n\n- Be the spouse or de facto partner of an Australian citizen, permanent resident, or eligible New Zealand citizen\n- Be in a genuine and continuing relationship, living together or not apart on a permanent basis\n- For de facto, generally have been together at least 12 months before applying, unless the relationship is registered or there are compelling circumstances\n- Be sponsored by your partner, who must meet sponsorship and character limits (there are caps on how many times and how often a person can sponsor)",
    conditions:
      "The 820 has few conditions and full work rights. You must tell Home Affairs if the relationship ends. Family violence provisions allow the permanent visa to still be granted in some cases where the relationship breaks down after lodgement.",
    content:
      "## Evidence of the relationship\n\nHome Affairs assesses four areas: financial aspects, the nature of the household, social recognition, and the nature of the commitment. Joint bank accounts, a shared lease, joint bills, travel together, statements from friends and family, and a consistent relationship history all matter.\n\n## The two stages\n\nYou lodge both the 820 and 801 together and pay one fee. The 820 is decided first. About two years after you lodged, Home Affairs asks for updated evidence and decides the 801. If your relationship is long-standing at lodgement, the 801 can be granted at the same time as the 820.\n\n## Onshore versus offshore\n\nIf you are in Australia when you apply, you use the 820 and 801. If you are outside Australia, you use the 309 and 100. The relationship test is the same.",
    source_urls: [
      `${HOMEAFFAIRS}/partner-onshore-820-801`,
    ],
  },
  {
    slug: "partner-visa-309-100",
    code: "309/100",
    name: "Partner visa (offshore)",
    category: "family",
    stream: "Provisional (309) then Permanent (100)",
    short_description:
      "The offshore version of the partner visa, for partners who are outside Australia when they apply.",
    summary:
      "The subclass 309 and 100 are the offshore partner visas. You must be outside Australia when the 309 is granted. It works the same way as the onshore 820 and 801: one application, one fee, a provisional visa first, then permanent residence through the 100 about two years after lodgement.",
    is_points_tested: false,
    min_points: null,
    stay_period: "309 is provisional; 100 is permanent",
    leads_to_pr: true,
    pr_pathway:
      "The subclass 100 is permanent residence, generally granted around two years after the application date, earlier for established relationships.",
    base_application_charge:
      "From AUD 11,710, covering both the 309 and 100 stages in one payment. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time: "309 stage commonly 12 to 24 months",
    age_limit: "Both partners must be at least 18",
    english_requirement: "No formal test; functional English affects a possible second charge",
    work_experience_requirement: null,
    occupation_list: null,
    eligibility:
      "The same relationship requirements as the onshore partner visa apply: a genuine and continuing married or de facto relationship with an Australian citizen, permanent resident, or eligible New Zealand citizen who sponsors you. The key difference is that you must be outside Australia when the 309 is decided, though you can be granted a visitor visa and travel while you wait.",
    conditions:
      "The 309 allows you to enter Australia, work, and study. You must notify Home Affairs of relationship changes and, for the 100, be in or outside Australia as directed.",
    content:
      "## Being outside Australia for the grant\n\nYou apply from outside Australia and must be offshore when the 309 is granted. Many applicants travel back and forth on visitor visas during processing. Being onshore on a bridging visa is not compatible with a 309 grant.\n\n## Moving between onshore and offshore\n\nIf your circumstances change and you end up living in Australia during processing, you may need to withdraw and lodge an onshore 820 instead, paying a second fee. Get advice before doing this.\n\n## Timeline\n\nProcessing times for the offshore partner visa have historically run longer than the onshore version, though the gap has narrowed. Plan for one to two years for the provisional stage.",
    source_urls: [
      `${HOMEAFFAIRS}/partner-offshore-309-100`,
    ],
  },
  {
    slug: "visitor-visa-600",
    code: "600",
    name: "Visitor visa",
    category: "visitor",
    stream: "Tourist, Sponsored Family, Business Visitor, and others",
    short_description:
      "Short-term visa for tourism, visiting family, or business meetings. No work allowed.",
    summary:
      "The subclass 600 is the main visitor visa for people who are not eligible for an ETA or eVisitor. It is granted for stays of 3, 6, or 12 months, sometimes as a multi-year multiple-entry visa. You cannot work on it, and study is limited to 3 months.",
    is_points_tested: false,
    min_points: null,
    stay_period: "Usually 3, 6, or 12 months per entry",
    leads_to_pr: false,
    pr_pathway:
      "None. The visitor visa is strictly temporary. Many visitor visas carry condition 8503, which blocks applying for most other visas while in Australia.",
    base_application_charge:
      "From AUD 250 for the Tourist stream applied for outside Australia, or AUD 630 applied for inside Australia. Other streams cost more. A lower charge applies to eligible Pacific Island and Timor-Leste citizens from 1 July 2026.",
    processing_time: "From a few days to several weeks depending on stream and country",
    age_limit: "None",
    english_requirement: "None",
    work_experience_requirement: null,
    occupation_list: null,
    eligibility:
      "You must show that you:\n\n- Genuinely intend to stay temporarily\n- Have enough money for the visit\n- Have an incentive to return home, such as a job, family, or property\n- Meet health and character requirements\n\nThe Sponsored Family stream requires an Australian relative to sponsor you and may require a bond.",
    conditions:
      "Condition **8101** prohibits work. Condition **8201** limits study to 3 months. Condition **8503** (no further stay) is often imposed and prevents applying for another visa onshore. Condition **8558** limits you to no more than 12 months in any 18-month period for long-validity visas.",
    content:
      "## Which visitor visa applies to you\n\nPassport holders from many countries use the free eVisitor (subclass 651) or the low-cost ETA (subclass 601) instead. The 600 is for everyone else, and for visits that need a longer stay or a specific stream.\n\n## Visitor visa versus student visa\n\nPeople often ask whether they can study on a visitor visa, or start on a 600 and switch to a student visa later. A visitor visa allows only short, casual study, and switching onshore is frequently blocked.\n\n| Question | Visitor visa (600) | [Student visa (500)](/visas/student-500) |\n| --- | --- | --- |\n| Main purpose | Tourism, visiting family, business meetings | Full-time enrolment in a CRICOS-registered course |\n| Study allowed | Up to 3 months, under condition 8201 | Unlimited, that is the purpose of the visa |\n| Work allowed | None, under condition 8101 | Up to 48 hours a fortnight while the course is in session |\n| Typical length | 3, 6, or 12 months per entry | Length of the course plus a short buffer |\n| Health cover | Not required, but strongly advised | OSHC mandatory for the whole visa |\n| Cost | From AUD 250 | From AUD 2,500, see the [cost breakdown](/guides/australia-student-visa-cost) |\n| Leads anywhere | No | Can lead to a [485 graduate visa](/visas/temporary-graduate-485) and, in some fields, permanent residence |\n\nA visitor visa is enough for a language course or a single subject of under three months. For anything longer you need a student visa, and you generally cannot move from a 600 to a 500 without leaving Australia, especially if your visitor visa carries condition 8503 (no further stay). Applying for the right visa from the start avoids a wasted trip.\n\n## The 8503 condition\n\nIf your visa says 'no further stay', you generally cannot apply for a student, partner, or skilled visa while in Australia. Waivers are granted only for major, unforeseen changes in circumstances.\n\n## Visiting while a partner visa is processed\n\nOffshore partner visa (309) applicants often hold a 600 to spend time in Australia during processing, as long as the 600 does not carry 8503.",
    source_urls: [
      `${HOMEAFFAIRS}/visitor-600`,
    ],
  },
  {
    slug: "work-holiday-462",
    code: "462",
    name: "Work and Holiday visa",
    category: "working-holiday",
    stream: "First, Second, and Third Work and Holiday",
    short_description:
      "Lets people aged 18 to 30 from an eligible partner country work and travel in Australia for up to a year. China, India, and Vietnam passport holders must first be selected in a ballot.",
    summary:
      "The subclass 462 is a 12-month work and travel visa for young adults from partner countries who have functional English and some tertiary study. It is separate from the subclass 417 Working Holiday visa, which covers a different country list. Since program year 2024 to 2025, first-time applicants from China, India, and Vietnam must register for a random ballot and be selected before they can lodge an application.",
    is_points_tested: false,
    min_points: null,
    stay_period:
      "12 months per visa. A second and third visa are possible after completing specified regional work.",
    leads_to_pr: false,
    pr_pathway:
      "None directly. The 462 is temporary. Some holders later move onto an employer-sponsored or skilled visa, but that is a fresh application on its own merits, not a transition built into the 462.",
    base_application_charge:
      "AUD 840 for a first visa and AUD 1,000 for a second or third, as set from 1 July 2026. China, India, and Vietnam applicants also pay a AUD 25 ballot registration fee. A lower charge applies to eligible Papua New Guinea passport holders.",
    processing_time:
      "Highly variable and currently extended due to demand. Do not book travel until the department tells you in writing that the visa is granted.",
    age_limit: "18 to 30 inclusive when you apply, or when you register for the ballot.",
    english_requirement:
      "Functional English, with evidence such as IELTS, PTE, or an accepted alternative.",
    work_experience_requirement: null,
    occupation_list: null,
    eligibility:
      "For a first Work and Holiday visa you generally must:\n\n- Be 18 to 30 years old (inclusive)\n- Hold a passport from an eligible partner country\n- Not be accompanied by dependent children\n- Have functional English\n- Have completed at least two years of undergraduate university study, or hold a higher qualification\n- Show evidence of funds, generally at least AUD 5,000, plus enough for a departing flight\n- Provide a letter of government support if your country's arrangement requires one\n\nChina, India, and Vietnam passport holders must first register for the ballot and be randomly selected before they can apply. Selection in the ballot is only permission to lodge. You still have to meet every requirement above.",
    conditions:
      "Condition **8547** limits you to no more than 6 months of work with any one employer without permission. Condition **8201** limits study to 4 months. You can enter and leave Australia as often as you like within the visa period. A second visa requires 3 months, and a third visa requires 6 months, of specified work in agriculture, tourism, hospitality, or other eligible sectors in northern or regional Australia.",
    content:
      "## The ballot for China, India, and Vietnam\n\nFirst-time applicants who hold a passport from **China, India, or Vietnam** cannot apply for the 462 directly. They must register for a pre-application ballot in ImmiAccount, pay a **AUD 25 registration fee**, and be randomly selected. The department runs selections through the program year until registrations expire on 30 April.\n\n- You register with your passport and a national identity card. Indian applicants need a **PAN card**, not an Aadhaar card. Vietnamese applicants need a 12-digit national ID.\n- You must be **18 to 30** when you register.\n- Being selected only lets you lodge an application. You still pay the AUD 840 visa charge and have to meet every eligibility requirement.\n- If you are selected, you can only apply from **outside Australia**.\n- The ballot does not change the annual grant cap for your country. It replaces a first-come application race with a random draw.\n\n## The 462 is not the 417\n\nThe subclass 462 Work and Holiday visa and the subclass 417 Working Holiday visa do the same thing, a year of work and travel for people aged 18 to 30, but they cover different countries and have slightly different rules. The 417 covers mostly European countries plus a few others and has no education or ballot requirement. The 462 covers countries including India, China, Vietnam, Indonesia, Thailand, Malaysia, and the United States, and adds the English, education, and government-support conditions. You cannot choose between them; it depends on your passport.\n\n## What you can do on it\n\n- Work for any employer, in most industries, for up to **6 months** with any one employer.\n- Study for up to **4 months**.\n- Leave and re-enter Australia freely within the 12 months.\n\nIt is not a study visa and it is not a skilled visa, and it does not lead to permanent residence on its own.\n\n## Second and third visas\n\nYou can apply for a second 462 after **3 months of specified work**, and a third after a further **6 months**. Specified work covers agriculture, tourism, hospitality, and similar sectors in northern or regional Australia, as defined by the department. A second or third visa costs AUD 1,000.\n\n## If you were weighing up study instead\n\nA Work and Holiday year and a course of study are very different tracks. A 462 is cheaper up front, has no tuition, and lets you work full time, but it ends after a year with no qualification and no direct migration pathway. A [student visa](/visas/student-500) costs far more and caps work at 48 hours a fortnight, but an eligible qualification can lead to a [Temporary Graduate visa](/visas/temporary-graduate-485) and, in some fields, permanent residence. See [why study in Australia](/guides/why-study-in-australia) for that side of the decision.",
    source_urls: [
      `${HOMEAFFAIRS}/work-holiday-462`,
      "https://immi.homeaffairs.gov.au/what-we-do/whm-program/latest-news/new-work-and-holiday-subclass-462-visa-pre-application-process",
      "https://immi.homeaffairs.gov.au/what-we-do/whm-program/status-of-country-caps",
    ],
  },
  {
    slug: "training-visa-407",
    code: "407",
    name: "Training visa",
    category: "employer-sponsored",
    stream: "Occupational training",
    short_description:
      "An approved sponsor brings you to Australia for up to 2 years of workplace-based training. It is training, not a job, and has no path to permanent residence.",
    summary:
      "The subclass 407 covers workplace-based occupational training in one of three forms: training you need for occupational registration or licensing, structured training to improve your skills in a listed occupation, or capacity-building training for people sent by an overseas employer or government. It always needs an approved temporary activities sponsor and an approved nomination. It is temporary, cannot be extended, and has no permanent residence pathway.",
    is_points_tested: false,
    min_points: null,
    stay_period: "Up to 2 years",
    leads_to_pr: false,
    pr_pathway:
      "None. The 407 is training, not a migration pathway. Some holders later move onto an employer-sponsored or skilled visa, but that is a separate application on its own merits. Time spent on a 407 does not count toward the two years with a sponsor that the subclass 186 Temporary Residence Transition stream needs.",
    base_application_charge:
      "From AUD 535 for the primary applicant. A lower charge applies to eligible Pacific Island and Timor-Leste citizens.",
    processing_time:
      "Variable. The sponsorship and nomination have to be approved before the visa is lodged, which adds time on top of the visa processing itself.",
    age_limit: "Usually 18 or older when the visa is decided",
    english_requirement:
      "Functional English. Not required if you hold a valid passport from the United Kingdom, Canada, New Zealand, the United States, or the Republic of Ireland.",
    work_experience_requirement:
      "Only for the improve-skills stream: the equivalent of at least 12 months of full-time experience in the nominated occupation, gained in the 24 months before the nomination is lodged.",
    occupation_list:
      "The improve-skills stream requires an occupation on the list of eligible skilled occupations. The registration and capacity-building streams do not use an occupation list.",
    eligibility:
      "You are likely eligible if you:\n\n- Have an approved temporary activities sponsor and an approved nomination (Australian Commonwealth Government agencies invite rather than nominate)\n- Are being nominated for one of the three types of occupational training\n- Are usually 18 or older\n- Have functional English, or a passport that exempts you\n- Meet the health, character, and health-insurance requirements and are a genuine temporary entrant",
    conditions:
      "The primary visa holder can only take part in the approved training activities and cannot do other paid work. Family members included in the application can work up to 40 hours a fortnight. The visa cannot be extended: to stay longer you must apply for a new visa.",
    content:
      "## The three types of training\n\nYour sponsor nominates you for one of these, and the requirements differ by type.\n\n| Type | What it covers |\n| --- | --- |\n| Registration or licensing | Workplace training you need to get occupational registration, membership, or licensing that is mandatory to work in that occupation, in Australia or your home country |\n| Improve skills in an eligible occupation | A structured program tailored to you, for an occupation on the eligible skilled occupations list, where you already have the equivalent of 12 months full-time experience in that occupation from the last 24 months |\n| Capacity building overseas | An overseas-qualification placement of up to 6 months, government-supported training, or a professional development program run for staff sent by an overseas employer |\n\n## What it is not\n\nThe 407 is not a work visa. You cannot use it to hold an ordinary job, and Home Affairs states plainly that it is not for ongoing work in Australia. If you want to work for an Australian employer, the visa you want is the [Skills in Demand visa (subclass 482)](/visas/skills-in-demand-482). See [407 vs 482](/guides/training-visa-407-vs-skills-in-demand-visa-482) for the full comparison.\n\n## No pathway to staying\n\nThe 407 has no permanent residence stream and cannot be extended. When the training ends you leave, unless you separately qualify for another visa. Time on a 407 does not count toward the [subclass 186](/visas/employer-nomination-scheme-186) Temporary Residence Transition requirement, which is two years with a sponsor on a 482.\n\n## The sponsor and nomination come first\n\nYou cannot lodge a 407 on your own. An organisation must first be approved as a temporary activities sponsor and have a nomination approved for your specific training program. Only then can you apply for the visa. Family members can be included and, if they did not apply with you, can be added later as subsequent entrants.",
    source_urls: [
      `${HOMEAFFAIRS}/training-407`,
      `${HOMEAFFAIRS}/training-407/occupational-training-types`,
      "https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/conditions-list",
    ],
  },
];

// --- Invitation rounds (SkillSelect), most recent first.
//
// 2022-23 and 2023-24 figures are from the Department of Home Affairs'
// own published invitation-rounds page (captured 10 July 2024) and its
// 2022-23 FOI release; 2024-25 and 2025-26 figures are cross-checked
// against reputable migration-practice sources because immi.homeaffairs.gov.au
// blocks automated fetch. The "min_points" column is the 65-point pool
// floor for every round to date; occupation_notes carries the real
// occupation-by-occupation spread where an official table exists.
// Projected rows are flagged is_estimated.
const HA_SOURCE =
  "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds";
const rounds = [
  {
    round_date: "2026-06-04",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 10000,
    min_points: 65,
    occupation_notes:
      "Tie-break date of effect around late April 2026. Trades invited near 65; most professional occupations 80 and above; ICT and accounting 95 and higher.",
    program_year: "2025-26",
    notes:
      "Third 189 round of the 2025-26 program year, confirming the roughly quarterly cadence (August, November, then June).",
    is_estimated: false,
    source_url: "https://visaenvoy.com/latest-subclass-189-and-491-invitation-round-analysis/",
  },
  {
    round_date: "2025-11-13",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 10000,
    min_points: 65,
    occupation_notes:
      "Trades from 65; health and education from ~80; engineering ~85; ICT and accounting 90 and above",
    program_year: "2025-26",
    notes:
      "One of the largest 189 rounds of the program year. 189 rounds moved to a roughly quarterly cycle for 2025-26.",
    is_estimated: false,
    source_url:
      "https://www.visaverge.com/news/australia-2025-26-skilled-migration-nov-13-subclass-189-invitation/",
  },
  {
    round_date: "2025-11-13",
    visa_code: "491",
    stream: "Family Sponsored",
    invitations_issued: 300,
    min_points: 65,
    occupation_notes: null,
    program_year: "2025-26",
    notes:
      "Family Sponsored 491 stream only, run alongside the November 189 round. State-nominated 491 places are managed separately by each state.",
    is_estimated: false,
    source_url: "https://visaenvoy.com/latest-subclass-189-and-491-invitation-round-analysis/",
  },
  {
    round_date: "2025-08-21",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 6887,
    min_points: 65,
    occupation_notes:
      "Trades near 65; most professional occupations 75 and above; ICT and accounting ~90",
    program_year: "2025-26",
    notes: "First 189 round of the 2025-26 program year.",
    is_estimated: false,
    source_url:
      "https://emigratelawyers.com.au/blog/subclass-189-and-491-invitation-rounds/",
  },
  {
    round_date: "2025-08-21",
    visa_code: "491",
    stream: "Family Sponsored",
    invitations_issued: 150,
    min_points: 65,
    occupation_notes: null,
    program_year: "2025-26",
    notes: "Family Sponsored 491 stream only. State-nominated 491 places are managed separately by each state through the month.",
    is_estimated: false,
    source_url:
      "https://emigratelawyers.com.au/blog/subclass-189-and-491-invitation-rounds/",
  },
  {
    round_date: "2024-11-07",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 15000,
    min_points: 65,
    occupation_notes:
      "Largest single 189 round on record at the time. Trades and several health occupations invited near 65; ICT and accounting still 90 and above.",
    program_year: "2024-25",
    notes: "Only 189 round published for the 2024-25 program year before the schedule shifted.",
    is_estimated: false,
    source_url: "https://www.easymigrate.com/november-2024-skill-select-round-and-state-nomination-results/",
  },
  {
    round_date: "2024-06-13",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 5292,
    min_points: 65,
    occupation_notes:
      "Official occupation table: trades from 65; nursing, teaching and most health from 85; civil, electrical and mechanical engineering 90; ICT, accounting, developer/software roles 100; Shipwright 105.",
    program_year: "2023-24",
    notes: "Tie-break (date of effect) month of May 2024. Second and final 189 round of the 2023-24 year.",
    is_estimated: false,
    source_url: HA_SOURCE,
  },
  {
    round_date: "2023-12-18",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 8300,
    min_points: 65,
    occupation_notes: null,
    program_year: "2023-24",
    notes: "First 189 round of the 2023-24 year after a long gap since June 2023.",
    is_estimated: false,
    source_url: HA_SOURCE,
  },
  {
    round_date: "2023-12-18",
    visa_code: "491",
    stream: "Family Sponsored",
    invitations_issued: 79,
    min_points: 65,
    occupation_notes: null,
    program_year: "2023-24",
    notes: "Only Family Sponsored 491 round of the 2023-24 year.",
    is_estimated: false,
    source_url: HA_SOURCE,
  },
  {
    round_date: "2022-12-08",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 35000,
    min_points: 65,
    occupation_notes:
      "The largest SkillSelect round ever run, part of clearing the backlog against the expanded 2022-23 permanent Migration Program.",
    program_year: "2022-23",
    notes: "Around 35,120 invitations across the 189 and 491 programs combined.",
    is_estimated: false,
    source_url: "https://themigration.com.au/blog/skillselect-invitation-round",
  },
  {
    round_date: "2022-12-08",
    visa_code: "491",
    stream: "Family Sponsored",
    invitations_issued: 120,
    min_points: 65,
    occupation_notes: null,
    program_year: "2022-23",
    notes: null,
    is_estimated: false,
    source_url: "https://themigration.com.au/blog/skillselect-invitation-round",
  },
  {
    round_date: "2022-10-06",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 11714,
    min_points: 65,
    occupation_notes: null,
    program_year: "2022-23",
    notes: null,
    is_estimated: false,
    source_url: "https://themigration.com.au/blog/skillselect-invitation-round",
  },
  {
    round_date: "2022-10-06",
    visa_code: "491",
    stream: "Family Sponsored",
    invitations_issued: 818,
    min_points: 65,
    occupation_notes: null,
    program_year: "2022-23",
    notes: null,
    is_estimated: false,
    source_url: "https://themigration.com.au/blog/skillselect-invitation-round",
  },
  {
    round_date: "2022-08-22",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 12200,
    min_points: 65,
    occupation_notes: null,
    program_year: "2022-23",
    notes: "First round of the backlog-clearing 2022-23 program year.",
    is_estimated: false,
    source_url: "https://themigration.com.au/blog/skillselect-invitation-round",
  },
  {
    round_date: "2022-08-22",
    visa_code: "491",
    stream: "Family Sponsored",
    invitations_issued: 466,
    min_points: 65,
    occupation_notes: null,
    program_year: "2022-23",
    notes: null,
    is_estimated: false,
    source_url: "https://themigration.com.au/blog/skillselect-invitation-round",
  },
  {
    round_date: "2026-09-30",
    visa_code: "189",
    stream: "Points-tested",
    invitations_issued: 7000,
    min_points: 65,
    occupation_notes:
      "Projection based on the quarterly cadence and the 2026-27 skilled allocation. Home Affairs does not announce round dates or cut-offs in advance.",
    program_year: "2026-27",
    notes:
      "Projected first 189 round of the 2026-27 program year, expected around September 2026. Figures are indicative only.",
    is_estimated: true,
    source_url: "https://themigration.com.au/blog/189-visa-invitation-rounds",
  },
];

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const codeToId = {};
  for (const v of visas) {
    // A row may carry its own `last_verified_at` when it was checked against
    // official sources on a different date from the bulk TODAY sweep. Pulled
    // out of the column list so it is not inserted twice.
    const { last_verified_at: verifiedOn, ...fields } = v;
    const cols = Object.keys(fields);
    const vals = cols.map((c) => fields[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const res = await client.query(
      `insert into visa_subclasses (${cols.join(", ")}, status, author_id, last_verified_at)
       values (${placeholders.join(", ")}, 'published', $${cols.length + 1}, $${cols.length + 2})
       on conflict (slug) do update set
         ${cols.filter((c) => c !== "slug").map((c) => `${c} = excluded.${c}`).join(", ")},
         status = 'published', last_verified_at = excluded.last_verified_at, updated_at = now()
       returning id, code`,
      [...vals, AUTHOR_ID, verifiedOn ?? TODAY],
    );
    codeToId[res.rows[0].code] = res.rows[0].id;
    console.log("visa", res.rows[0].code, res.rows[0].id);
  }

  // Rounds have no natural unique key and are fully seed-managed for now,
  // so clear and re-insert to keep this script idempotent.
  await client.query("delete from invitation_rounds");

  for (const r of rounds) {
    const subclassId = codeToId[r.visa_code] ?? null;
    await client.query(
      `insert into invitation_rounds
        (round_date, visa_code, visa_subclass_id, stream, invitations_issued, min_points,
         occupation_notes, program_year, notes, is_estimated, status, last_verified_at, source_url)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'published',$11,$12)`,
      [
        r.round_date,
        r.visa_code,
        subclassId,
        r.stream,
        r.invitations_issued,
        r.min_points,
        r.occupation_notes,
        r.program_year,
        r.notes,
        r.is_estimated,
        TODAY,
        r.source_url,
      ],
    );
    console.log("round", r.round_date, r.visa_code);
  }

  console.log("done");

  await pingIndexNow([
    "/visas/invitation-rounds",
    "/visas",
    "/sitemap.xml",
    ...visas.map((v) => `/visas/${v.slug}`),
  ]);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
