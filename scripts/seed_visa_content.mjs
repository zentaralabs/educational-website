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

const AUTHOR_ID = "6e1c0e5b-ed26-497c-a09c-e9539c6761e8";
const TODAY = "2026-08-28";
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL ?? "https://www.wheretoapply.xyz").replace(/\/$/, "");
const INDEXNOW_KEY = "b1d94f7a2c8e4056a3f61e0d5c927b8f";

const wc = (s) => s.split(/\s+/).filter(Boolean).length;

// Best-effort IndexNow ping so Bing/Yandex re-crawl new guides and posts
// fast after a reseed. Mirrors scripts/seed_visas.mjs. Never throws.
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

// ---------------------------------------------------------------------------
// Guides (evergreen). country: "AU" scopes to Australia, null is global.
// ---------------------------------------------------------------------------
const guides = [
  {
    slug: "study-to-permanent-residence-pathway-australia",
    title: "The study-to-PR pathway in Australia, step by step",
    category: "country-guide",
    country: "AU",
    excerpt:
      "How a student visa can lead to permanent residence: the 500, the 485 graduate visa, skilled work, and the 189, 190, or 491.",
    content:
      "Plenty of people come to Australia to study and stay for good. There is no visa called \"study to permanent residence\", but there is a well-worn sequence that thousands of people complete every year. Expect it to take four to seven years from the day you land to the day you get permanent residence.\n\n## The sequence at a glance\n\n| Stage | Visa | Typical length | What you are doing |\n| --- | --- | --- | --- |\n| Study | [Subclass 500](/visas/student-500) | 2 to 4 years | Completing a qualification that meets the Australian study requirement |\n| Post-study work | [Subclass 485](/visas/temporary-graduate-485) | 2 to 3 years | Building skilled experience, sitting a higher English test, getting assessed |\n| Skilled visa | [189](/visas/skilled-independent-189), [190](/visas/skilled-nominated-190), or [491](/visas/skilled-work-regional-491) | Months to years in the pool | Lodging an Expression of Interest and waiting for an invitation |\n| Regional to PR | [Subclass 191](/visas/permanent-residence-skilled-regional-191) | 3 years after a 491 | Living and working regionally, meeting the income test |\n\n## Step 1: Study on a subclass 500\n\nTwo things about your course decide whether the rest of the pathway works. It has to be [CRICOS registered](/guides/cricos-and-course-accreditation-explained), and it has to run long enough to meet the Australian study requirement: at least 92 weeks of study, which in practice means two academic years, taught in English while you were physically in Australia. A single one-year masters does not meet it on its own. The course also needs to lead to an occupation on a skilled list that an assessing authority will actually assess.\n\n## Step 2: The 485 Temporary Graduate visa\n\nThe [485](/visas/temporary-graduate-485) gives you two years of open work rights for a bachelor or coursework masters, or three years for a masters by research or PhD. Graduates who studied and lived in a [regional area](/guides/choosing-a-regional-area-to-study-in-australia) have in recent years been offered an extra one to two years. You must be 35 or under at the time you apply, and you must lodge within six months of your student visa ending.\n\nThis is the window that matters. You use it to gain the skilled work experience your skills assessment and your points score both need.\n\n## Step 3: Get a skills assessment\n\nEvery skilled visa needs a positive [skills assessment](/guides/getting-a-skills-assessment-in-australia) from the authority tied to your occupation. Some authorities also require a year of post-qualification work before they will assess you, which is another reason the 485 is not optional.\n\n## Step 4: Build a competitive points score\n\nThrough SkillSelect you claim [points](/guides/how-the-australian-points-test-works) for age, English, qualifications, work experience, Australian study, regional study, a Professional Year, a skilled partner, and state or regional nomination. You need 65 to submit an Expression of Interest, but 65 rarely gets invited. Use the [points calculator](/visas/points-calculator) to see where you stand.\n\n## Step 5: Get invited and apply\n\nFor the [189](/visas/skilled-independent-189) you wait for a federal invitation round. The [invitation rounds page](/visas/invitation-rounds) tracks every round and its cut-off. For the [190](/visas/skilled-nominated-190) or [491](/visas/skilled-work-regional-491) a state or territory nominates you first, which adds 5 or 15 points and opens occupation lists the 189 does not use.\n\n## Worked example: Priya, Master of IT in Adelaide\n\nPriya finishes a two-year Master of Information Technology in Adelaide at 26, then works 18 months as a developer on a 485.\n\n| Factor | Points |\n| --- | --- |\n| Age 27 at invitation | 30 |\n| Superior English (IELTS 8) | 20 |\n| Bachelor plus masters | 15 |\n| Australian study requirement | 5 |\n| Study in a regional area (Adelaide) | 5 |\n| 1 to 2 years skilled work in Australia | 5 |\n| **Total for the 189** | **80** |\n| With South Australia 190 nomination | 85 |\n| With a 491 regional nomination | 95 |\n\nICT occupations have recently needed around 95 points for a [189](/visas/skilled-independent-189) invitation, so in practice Priya applies for state nomination and takes the 190 or 491 route.\n\n## How long does the whole thing take?\n\nTwo years of study, then one to three years on the 485 building experience and score, then anywhere from a few months to a couple of years in the pool depending on your occupation. Five years is a realistic median. The 491 to [191](/visas/permanent-residence-skilled-regional-191) route adds three more years of regional residence before permanent residence, but the 491 itself is often quicker to get.\n\n## Where people get stuck\n\nThe common failure points are choosing a course that does not map to an assessable occupation, running out of time on the 485 before reaching a competitive score, treating the 189 as the only option when the 190 and 491 are more realistic for their occupation, and underestimating how much [regional study and nomination](/guides/choosing-a-regional-area-to-study-in-australia) can lift a borderline profile. Plan the occupation and the assessment before you enrol, not after you graduate.",
    sources: [
      "https://www.studyaustralia.gov.au/en/plan-your-move/your-guide-to-visas",
      "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect",
    ],
  },
  {
    slug: "how-the-australian-points-test-works",
    title: "How the Australian skilled migration points test works",
    category: "country-guide",
    country: "AU",
    excerpt:
      "Where the points come from for the 189, 190, and 491, how many you realistically need, and the levers you can actually pull.",
    content:
      "The points test ranks everyone in the SkillSelect pool. You need 65 points to submit an Expression of Interest for the [189](/visas/skilled-independent-189), [190](/visas/skilled-nominated-190), or [491](/visas/skilled-work-regional-491), but 65 rarely earns an invitation. The department works down from the highest scores until each occupation group is full, so the score that actually gets invited depends on your occupation and the round.\n\n## The full points table\n\n| Factor | Points |\n| --- | --- |\n| Age 18 to 24 | 25 |\n| Age 25 to 32 | 30 |\n| Age 33 to 39 | 25 |\n| Age 40 to 44 | 15 |\n| Age 45 and over | 0 |\n| English: Competent (IELTS 6 each band) | 0 |\n| English: Proficient (IELTS 7 each band) | 10 |\n| English: Superior (IELTS 8 each band) | 20 |\n| Skilled work outside Australia, 3 to 4 of the last 10 years | 5 |\n| Skilled work outside Australia, 5 to 7 years | 10 |\n| Skilled work outside Australia, 8 to 10 years | 15 |\n| Skilled work in Australia, 1 to 2 of the last 10 years | 5 |\n| Skilled work in Australia, 3 to 4 years | 10 |\n| Skilled work in Australia, 5 to 7 years | 15 |\n| Skilled work in Australia, 8 to 10 years | 20 |\n| Doctorate from an Australian or recognised institution | 20 |\n| Bachelor or masters degree | 15 |\n| Diploma or trade qualification | 10 |\n| Australian study requirement met | 5 |\n| Study in a designated regional area | 5 |\n| Specialist education qualification (STEM masters by research or PhD) | 10 |\n| Professional Year in Australia (accounting, IT, engineering) | 5 |\n| Credentialled community language (NAATI) | 5 |\n| Single, or partner is an Australian citizen or permanent resident | 10 |\n| Partner with Competent English | 5 |\n| Partner with a positive skills assessment and Competent English | 10 |\n| State or territory nomination (190) | 5 |\n| Regional nomination or eligible family sponsorship (491) | 15 |\n\nCombined skilled employment points are capped at 20. Study and work in the same period can both be claimed only where they do not overlap in a way the rules prohibit, so check the exact dates.\n\n## Worked example: a single ICT applicant\n\nRaj is 34, has Proficient English, a bachelor degree assessed as closely related by [ACS](/guides/getting-a-skills-assessment-in-australia), and four years of overseas experience after ACS deducts two.\n\n| Factor | Points |\n| --- | --- |\n| Age 33 to 39 | 25 |\n| Proficient English | 10 |\n| Bachelor degree | 15 |\n| 3 to 4 years skilled work overseas | 5 |\n| Single | 10 |\n| **Total** | **65** |\n\nThat clears the submission bar but will not get an ICT invitation. Now Raj sits IELTS again and reaches Superior, and his partner gets a skills assessment:\n\n| Change | New points |\n| --- | --- |\n| Superior English (was Proficient) | +10 |\n| Skilled partner (was single) | 0 net, he swaps 10 for 10 |\n| Add South Australia 190 nomination | +5 |\n| **New total** | **80** |\n\n## How many points do you actually need?\n\n| Occupation group | Recent 189 cut-off | 190 or 491 with nomination |\n| --- | --- | --- |\n| Trades | 65 to 70 | often invited near the floor |\n| Nursing, teaching, most health | 80 to 90 | lower, varies by state |\n| Engineering | 85 to 95 | lower, varies by state |\n| Accounting, ICT, finance | 95 and above | still competitive, but state lists help |\n\nThese move every round. The [invitation rounds page](/visas/invitation-rounds) has the real history.\n\n## The levers worth pulling, in order\n\n1. **English.** Moving from Proficient to Superior is 10 points and is usually the fastest single jump. Competent to Proficient is another 10.\n2. **A skilled partner.** A partner skills assessment plus Competent English is 10 points, or remove the question by showing your partner is an Australian citizen or permanent resident.\n3. **Regional study plus regional nomination.** Worth 20 points combined and opens the [491](/visas/skilled-work-regional-491).\n4. **A Professional Year or NAATI credential.** 5 points each, both take under a year.\n5. **More skilled work.** Real but slow, one five-point band every two to three years.\n\n## Common mistakes\n\nClaiming experience the assessing authority has not recognised as skilled, double-counting a period of study and work, forgetting that age points drop the day you turn 33, 40, and 45, and assuming the 65-point floor is a target rather than a starting line. Run your profile through the [points calculator](/visas/points-calculator) and check each claim against your evidence before you lodge.",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-table",
    ],
  },
  {
    slug: "genuine-student-requirement-how-to-write-your-statement",
    title: "Writing a Genuine Student Statement That Holds Up",
    category: "how-to",
    country: null,
    excerpt:
      "The Genuine Student requirement replaced the GTE test in 2024. What the questions are really asking and how to answer them.",
    content:
      "Australia replaced the Genuine Temporary Entrant (GTE) test with the Genuine Student (GS) requirement in March 2024. The [subclass 500](/visas/student-500) still hinges on convincing a case officer that your main reason for coming is to study, and the GS responses are where that case is made or lost.\n\n## What changed from GTE to GS\n\nThe GTE asked you to prove you intended to stay only temporarily. The GS drops the word temporary and instead asks whether you are a genuine student, which acknowledges that many students later apply for skilled or graduate visas. That is a real shift in tone, but the evidence a case officer weighs is much the same: your circumstances, your course choice, your finances, and your immigration history.\n\n## The questions the form asks\n\nInside ImmiAccount the GS section is a set of specific prompts, each with a minimum response length (currently 150 words) and a character limit. The prompts cover:\n\n| Prompt | What it is really testing |\n| --- | --- |\n| Your current circumstances | Ties to your home country: family, employment, assets, study |\n| Why this course and this provider | That you researched the choice and it fits your background |\n| How the course benefits you | A concrete link between the course and your future work |\n| Your understanding of a student visa | That you know the work limits, the study requirement, and the conditions |\n| Any other relevant information | Your chance to explain anything that looks odd |\n\n## Answer the question that was asked\n\nCase officers read hundreds of these a week. Generic paragraphs about Australia's world-class education and multicultural society do nothing. Specifics do.\n\n**Weak:** \"This course will give me valuable skills and improve my career prospects in my home country.\"\n\n**Strong:** \"The Master of Data Science at this university includes units in machine learning operations and cloud data engineering, which are exactly the skills advertised in senior analyst roles at the three banks I have applied to at home. My current employer has told me in writing that this qualification would move me from a reporting role into their data science team.\"\n\nName the units. Name the role. Name the employer or the sector. Attach the letter.\n\n## Address the obvious doubts head on\n\n| Situation | What to do |\n| --- | --- |\n| A gap between your last study and now | State what you did in that time and why it does not undermine your plan |\n| The course is a sideways or downward step from your last qualification | Explain the specific reason: a career change, a specialisation, a professional requirement |\n| Family already in Australia | Acknowledge it and explain why you will still return or move to an appropriate visa |\n| A previous visa refusal, anywhere | Explain what happened and what has changed |\n\nSilence on an obvious issue reads as evasion. A short honest explanation almost always reads better than a gap the officer has to guess at.\n\n## Keep the finances consistent\n\nYour GS responses should match your [financial evidence](/guides/proving-funds-for-an-australian-student-visa) exactly. If you say a parent is funding you, their income, their relationship to you, and the money trail all need to support that. A lump sum that lands in an account days before you apply, with no history behind it, invites questions no matter how well the rest of the statement reads.\n\n## Length and tone\n\nWrite in your own voice. A statement full of phrasing identical to a sibling's or a friend's application, or one that reads like a template with the nouns swapped, is a known red flag and officers are trained to spot it. Meet the minimum word count, then stop. Two or three focused paragraphs per prompt beat ten padded ones.\n\n## A quick checklist before you submit\n\n- Every prompt answered in your own words, above the minimum length\n- At least one concrete, checkable detail per answer (a unit name, a job title, an employer)\n- Every claim backed by an attached document\n- Financial story matches the bank statements and sponsor evidence\n- Any gap, downgrade, family link, or past refusal explained, not hidden\n- Read aloud once to catch anything that sounds like it was written by someone else",
    sources: [
      "https://www.studyaustralia.gov.au/en/plan-your-move/genuine-student-requirement",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    ],
  },
  {
    slug: "getting-a-skills-assessment-in-australia",
    title: "How to get a skills assessment for skilled migration",
    category: "country-guide",
    country: "AU",
    excerpt:
      "Every skilled visa needs one. Which authority assesses your occupation, what they check, and how long it takes.",
    content:
      "A positive skills assessment is a hard requirement for the [189](/visas/skilled-independent-189), [190](/visas/skilled-nominated-190), [491](/visas/skilled-work-regional-491), and the Direct Entry stream of the [186](/visas/employer-nomination-scheme-186). It confirms that your qualifications, and for most occupations your work experience, meet the Australian standard for the specific occupation you nominate.\n\n## Find your assessing authority\n\nEvery occupation on the skilled lists is tied to one authority. You cannot choose; the occupation decides.\n\n| Authority | Covers | Notable rule |\n| --- | --- | --- |\n| ACS | ICT occupations | Deducts 2 to 6 years of experience depending on how related your degree is |\n| Engineers Australia | Engineering | Competency Demonstration Report if your degree is not accredited under an accord |\n| CPA Australia, CA ANZ, IPA | Accounting, finance | English test often required at assessment stage, not just visa stage |\n| VETASSESS | ~350 professional and trade occupations | Requires a set period of employment at the right skill level |\n| ANMAC | Nursing and midwifery | Registration with AHPRA is a separate step |\n| AHPRA and the relevant national board | Doctors, allied health | Long lead times, start early |\n| Trades Recognition Australia | Trades | Usually a practical or technical assessment, and often an offshore skills assessment before the visa |\n\n## What they check\n\nMost authorities assess two things: whether your qualification is comparable to an Australian one at the expected [AQF level](/guides/cricos-and-course-accreditation-explained), and whether it is closely related to the nominated occupation. Many also assess your employment, and several deduct a block of your early career as not yet at skilled level.\n\n## Worked example: the experience deduction\n\nMei has an ICT Major bachelor degree and six years as a software engineer, all overseas. She expects 10 points for 5 to 7 years of skilled work.\n\n| Step | Result |\n| --- | --- |\n| ACS finds her degree closely related (ICT Major) | Deducts 2 years |\n| 6 years minus 2 | 4 years counted as skilled |\n| [Points](/guides/how-the-australian-points-test-works) for 3 to 4 years overseas | 5, not the 10 she expected |\n\nIf her degree were only closely related at a lower level, ACS could deduct 4 or 6 years, wiping the experience points entirely. Knowing the likely deduction before you lodge lets you plan around it, usually by working an extra year or two on a [485](/visas/temporary-graduate-485).\n\n## What a strong employment reference contains\n\n- Company letterhead, signed and dated, with the signatory's name and position\n- Your exact job title and the dates you held it\n- Whether the role was full time or part time, and the hours per week\n- Your salary or a payslip attached\n- A paragraph of real duties, detailed enough to match the occupation description, not a one-line job summary\n\nGet these written before the people who can sign them leave the company or become hard to reach.\n\n## Timing and cost\n\n| Assessment type | Typical time | Rough fee |\n| --- | --- | --- |\n| ICT (ACS) | 8 to 12 weeks | around AUD 550 |\n| Engineering (Engineers Australia, fast track) | 4 to 12 weeks | AUD 700 to 3,500 depending on pathway |\n| Accounting (CPA or CA ANZ) | 4 to 8 weeks | around AUD 550 to 650 |\n| VETASSESS professional | 10 to 14 weeks | around AUD 1,000 |\n| Trades (TRA) | several months | AUD 3,000 or more with the practical |\n\nMost assessments are valid for three years. Do not get assessed years before you are ready to lodge an Expression of Interest, or it can expire mid-process.\n\n## Common reasons for a negative outcome\n\nA degree that is comparable but not closely related to the occupation, thin employment references, claiming an occupation that does not match your actual duties, and missing documents. If your degree is borderline, some authorities let you sit an extra assessment or submit a project report rather than accept a straight refusal, so ask before you assume the answer is no.",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/skills-assessment",
    ],
  },
  {
    slug: "choosing-a-regional-area-to-study-in-australia",
    title: "Studying in regional Australia: what counts and what you gain",
    category: "country-guide",
    country: "AU",
    excerpt:
      "Regional study is worth points and opens the 491. Here is which cities count as regional and what the trade-offs are.",
    content:
      "For skilled migration, \"regional Australia\" means everywhere except Greater Sydney, Greater Melbourne, and Greater Brisbane. That is a wide net that includes several state capitals.\n\n## The two categories of regional area\n\nHome Affairs splits regional Australia into two groups, and the distinction affects graduate visa length and processing priority.\n\n| Category | Areas | What it gives you |\n| --- | --- | --- |\n| Category 2: Cities and major regional centres | Perth, Adelaide, Gold Coast, Sunshine Coast, Canberra, Newcastle and Lake Macquarie, Wollongong and the Illawarra, Geelong, Hobart | A 1-year extension on the [485](/visas/temporary-graduate-485), regional [points](/guides/how-the-australian-points-test-works), 491 access |\n| Category 3: Rest of regional Australia | Every other regional city and town, for example Toowoomba, Cairns, Townsville, Ballarat, Bendigo, Launceston, Darwin, Wagga Wagga | A 2-year 485 extension, priority visa processing, larger state nomination allocations |\n\nAll of these count as regional. The difference is that the smaller and more remote the area, the stronger the incentives the government attaches to it.\n\n## What you gain by studying regionally\n\n- **5 points** for study in a regional area, on top of the 5 for meeting the [Australian study requirement](/guides/cricos-and-course-accreditation-explained).\n- Access to the [491](/visas/skilled-work-regional-491), which carries a 15-point nomination bonus, broader occupation lists, and lower cut-offs than the [189](/visas/skilled-independent-189).\n- State and territory nomination criteria that are usually easier to meet outside the big three cities, and which reserve places for local graduates.\n- The extra 485 year or two shown in the table above.\n- Lower living costs. Adelaide and Perth run well below Sydney and Melbourne. See the [cost of living pages](/cost-of-living) for a breakdown.\n\n## Worked example: the regional points swing\n\nTwo students take the same Master of IT. One studies in Melbourne, one in Adelaide, both get a 190 nomination from their state.\n\n| Factor | Melbourne | Adelaide |\n| --- | --- | --- |\n| Australian study requirement | 5 | 5 |\n| Regional study | 0 | 5 |\n| Base score before nomination | 70 | 75 |\n| With 190 nomination | 75 | 80 |\n| If Adelaide student takes a 491 instead | | 90 |\n\nThe Adelaide student is 5 points ahead on the same profile, or 15 ahead if they use the 491.\n\n## What you trade\n\nSmaller job markets in the Category 3 towns, fewer large-employer graduate programs, and smaller communities from your home country. Perth, Adelaide, and Canberra have none of these problems, with universities, airports, hospitals, and established migrant communities. A town of 30,000 is a different proposition and worth visiting before you commit.\n\n## A sensible approach\n\nMany people study in Adelaide, Perth, or Canberra to get the regional points with a normal city job market, work there on the 485, and then decide whether to chase a [491](/visas/skilled-work-regional-491) that converts to permanent residence through the [191](/visas/permanent-residence-skilled-regional-191), or aim straight for a [190](/visas/skilled-nominated-190). Where you studied earns the points; it does not lock you into staying in that exact town forever, though the 491 and 191 do require you to keep living and working regionally until you convert to permanent residence.",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491",
      "https://www.studyaustralia.gov.au/en/plan-your-move/regional-australia",
    ],
  },
  {
    slug: "oshc-health-cover-for-international-students",
    title: "OSHC: health cover for international students in Australia",
    category: "country-guide",
    country: "AU",
    excerpt:
      "What Overseas Student Health Cover pays for, what it does not, and how to avoid a gap that breaches your visa.",
    content:
      "Overseas Student Health Cover (OSHC) is a mandatory condition of the [subclass 500](/visas/student-500). You must hold it for the entire length of your visa, from the day you arrive to the day the visa ends, not just for the length of your course. Budget roughly AUD 500 to 700 a year for a single policy, more for a couple or family.\n\n## What OSHC covers\n\n| Covered | Partly covered | Not covered by a standard policy |\n| --- | --- | --- |\n| GP visits | Prescription medicines (capped per item and per year) | Dental |\n| Public hospital treatment as a public patient | Some emergency ambulance | Optical |\n| Scheduled surgery in a public hospital | | Physiotherapy and other allied health |\n| Limited private hospital cover | | Elective cosmetic procedures |\n| Ambulance in most states | | Anything before a waiting period ends |\n\nProviders include Bupa, Medibank, Allianz Care, nib, ahm, and CBHS. Your university usually has a preferred provider that it can arrange with your enrolment, but you are free to buy your own policy and switch later.\n\n## Waiting periods to know about\n\n- **Pre-existing conditions:** up to 12 months before the policy will pay for treatment related to a condition you had when you took out the cover.\n- **Pregnancy:** a 12-month wait on most policies. If you are planning a family during your studies, factor this in early.\n- **Major dental and optical:** only on higher tiers, and usually with their own waiting periods.\n\n## The visa trap: never let it lapse\n\nCondition 8501 requires continuous cover. If there is a gap, even a few days between one policy ending and the next starting, you have breached a visa condition, and that can be raised against you when you apply for a [485](/visas/temporary-graduate-485) or any later visa.\n\nTwo rules keep you safe:\n\n1. Buy cover that ends **after** your expected visa end date, not on your course end date. Visas usually run a month or two past the course.\n2. If you [extend your visa](/guides/proving-funds-for-an-australian-student-visa), extend or re-buy your OSHC first, so the new policy is already in place when the new visa is granted.\n\n## Family members on your visa\n\nIf you add a partner or children to your student visa, they must be on an OSHC policy too. Cover is priced as single, couple, single-parent family, or family, and the jump from single to family is significant, often two to three times the single premium. Include it in your [financial capacity evidence](/guides/proving-funds-for-an-australian-student-visa).\n\n## Getting money back\n\nIf you leave Australia before your policy ends, finish your course early, or move onto a visa that gives you Medicare access (for example some partner or skilled visas), you can usually claim a pro-rata refund for the unused months. Keep the policy documents and apply to the provider directly.\n\n## Choosing a policy\n\nThe cheapest compliant policy meets the visa condition, and for a healthy single student that is often enough. Consider a mid tier if you wear glasses, expect dental work, or want shorter waiting periods. Compare the single-policy annual premium, the pharmaceutical cap, and whether ambulance is included in your state before you pick.",
    sources: [
      "https://www.studyaustralia.gov.au/en/plan-your-move/health-and-safety/oshc",
      "https://privatehealth.gov.au/health_insurance/overseas/overseas_student_health_cover.htm",
    ],
  },
  {
    slug: "what-to-do-if-your-student-visa-is-refused",
    title: "Your student visa was refused. What now?",
    category: "how-to",
    country: null,
    excerpt:
      "Refusal is not always the end. Your options depend on where you were when you applied and why it was refused.",
    content:
      "A [student visa](/visas/student-500) refusal is stressful, but it is a decision you can usually respond to. What you can do depends heavily on whether you were inside or outside Australia when you lodged the application.\n\n## First, read the decision record\n\nThe refusal letter names the exact clause that was not met. The response is different for each.\n\n| Refusal reason | Typical fix |\n| --- | --- |\n| Genuine Student requirement not met | Rewrite the [GS responses](/guides/genuine-student-requirement-how-to-write-your-statement) to address the officer's stated doubts point by point |\n| Financial capacity not shown | Build a documented savings history and clear sponsor evidence, not a lump sum |\n| English level below the course or visa requirement | Sit the test again, or add a packaged English course to the enrolment |\n| Health (failed the medical) | Health waiver where available, or a treatment plan |\n| Character (PIC 4001) or fraud (PIC 4020) | Get professional advice before doing anything else |\n\nDo not guess at the reason. The whole response strategy depends on getting this right.\n\n## If you applied from outside Australia\n\nThere is usually no merits review for an offshore student visa refusal. Your realistic option is to apply again, this time directly addressing the specific problem the officer identified. A second application that repeats the first will fail the same way.\n\nIf the refusal cited **PIC 4020**, which covers false or misleading information, be careful. That can carry a three-year exclusion period during which most Australian visas will be refused. Do not reapply without advice from a registered migration agent.\n\n## If you applied from inside Australia\n\nYou typically have a strict, short window to apply to the **Administrative Review Tribunal (ART)**, which replaced the AAT in October 2024. For most onshore student visa refusals this is around 28 days from the date you are taken to have received the decision, and missing it almost always ends your options. The application fee is roughly AUD 3,000, partly refundable if you win.\n\nWhile the review is pending you are normally on a bridging visa and can stay in Australia, though your work and study rights depend on which bridging visa you hold.\n\n## The section 48 bar\n\nIf your visa was refused while you were onshore and you are still onshore, section 48 of the Migration Act stops you from lodging most new visa applications from within Australia. Student visas are among those you generally cannot lodge onshore after a refusal. This is the single biggest reason to act on the review deadline rather than assume you can simply reapply. There are limited exceptions, so confirm your position with an adviser.\n\n## Fixing the underlying issue while the clock runs\n\n- **Finances:** open the paper trail now. A savings history takes months to build, so start even before you know your next step.\n- **Genuine Student:** draft the stronger responses now, with specific course units, a named target role, and supporting letters.\n- **English:** book the next available test date.\n- **Enrolment:** ask your provider to hold or reissue your Confirmation of Enrolment so you have a current one when you are ready.\n\n## Get advice early\n\nA registered migration agent (check the MARA register) or your university's international student advisers can usually tell you within a meeting whether a review or a fresh application is the right route, and whether section 48 applies to you. For onshore refusals the deadline is the thing that matters most, so make that call in the first few days, not the last few.",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.art.gov.au/",
    ],
  },
  {
    slug: "proving-funds-for-an-australian-student-visa",
    title: "Proving you can afford to study in Australia",
    category: "country-guide",
    country: "AU",
    excerpt:
      "The financial capacity requirement, the current living-cost figure, and what evidence actually satisfies a case officer.",
    content:
      "The [subclass 500](/visas/student-500) requires you to show you can cover 12 months of living costs, first-year tuition, and travel, without relying on work in Australia. Meeting the number is only half of it; the funds also have to look genuine and be genuinely available to you.\n\n## The numbers\n\nHome Affairs publishes a 12-month living-cost figure that is reviewed periodically and has risen several times. As of 2026 the figures are:\n\n| Person | 12-month amount |\n| --- | --- |\n| Primary applicant | AUD 29,710 |\n| Partner or spouse | AUD 10,394 |\n| Each dependent child | AUD 4,449 |\n| Annual school costs, per school-age child | around AUD 13,502 |\n\nOn top of the living-cost figure you show **first-year tuition** (or the amount still owing after any deposit already paid) and **travel**, roughly AUD 2,000 to 2,500 depending on where you are coming from. Always check the current living-cost figure on the Home Affairs site before you rely on it.\n\n## Worked example: single student, Master of IT in Adelaide\n\n| Item | Amount |\n| --- | --- |\n| Living costs, 12 months | AUD 29,710 |\n| First-year tuition | AUD 45,000 |\n| Travel | AUD 2,200 |\n| **Minimum to evidence** | **AUD 76,910** |\n| Recommended, with a buffer | AUD 85,000 or more |\n\nIf tuition of AUD 20,000 has already been paid and you can show the receipt, the figure you still need to evidence drops accordingly.\n\n## Acceptable evidence\n\n- Bank statements showing a **genuine savings history**, ideally three to six months of activity, not a single recent balance\n- An education loan from a recognised financial institution that has been **actually approved and disbursed or ready to disburse**, not approved in principle\n- Evidence of a parent's or sponsor's income, employment, and their documented relationship to you\n- Scholarship or sponsorship letters that state exactly what is covered and for how long\n- Fixed deposits, with the certificate and the source of the original funds\n\n## The genuine access test\n\nCase officers increasingly look at whether the money is really available to **you**, not just sitting in a relative's account. Funds held by a distant relative, or a large sum that appears days before you apply with no history behind it, or a loan secured against an asset that cannot easily be liquidated, all invite questions. Every significant amount needs a plausible origin story that the paperwork supports.\n\n## What raises flags\n\n| Flag | Why it looks bad |\n| --- | --- |\n| A lump sum deposited just before applying | Suggests borrowed funds that will be repaid, not genuine savings |\n| Money held by an uncle, cousin, or family friend | Not clearly available to you |\n| Loan \"sanctioned\" or \"approved in principle\" | Not the same as funds you can actually draw |\n| Exactly the minimum, no margin | Reads as clearing a hurdle rather than being able to afford the year |\n\n## Show more than the minimum\n\nA margin above the requirement, and a savings pattern that predates your decision to apply, is the single strongest signal that the funds are real. It also matches a strong [Genuine Student statement](/guides/genuine-student-requirement-how-to-write-your-statement), which should describe the same money the same way. For a realistic picture of what a year actually costs, see the [cost of living pages](/cost-of-living) and the guide to the [real cost of studying in Australia](/guides/real-cost-of-studying-in-australia).",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/en/plan-your-move/cost-of-studying-and-living-in-australia",
    ],
  },
  {
    slug: "cricos-and-course-accreditation-explained",
    title: "CRICOS, AQF, and why course accreditation matters for your visa",
    category: "country-guide",
    country: "AU",
    excerpt:
      "A student visa needs a CRICOS-registered course. Here is what that means and how it connects to later skilled migration.",
    content:
      "Two systems decide whether a course can support your [student visa](/visas/student-500) and your later plans: CRICOS registration and the AQF level. Getting both right before you accept an offer saves an expensive mistake.\n\n## CRICOS\n\nThe Commonwealth Register of Institutions and Courses for Overseas Students lists every course that a provider is legally allowed to deliver to international students, each with its own CRICOS course code. If a course is not on CRICOS, you cannot get a [subclass 500](/visas/student-500) for it, no matter how good the provider is.\n\nBefore you accept an offer, search the CRICOS register for the course code on your offer letter and confirm three things: the code is active, the provider is the one making you the offer, and the location matches where you will actually study. Providers can lose registration for a course, and a code that was valid last year may not be valid now.\n\n## AQF\n\nThe Australian Qualifications Framework sets the level of every qualification in the country.\n\n| AQF level | Qualification | Skilled migration points |\n| --- | --- | --- |\n| 5 | Diploma | 10 (as a diploma or trade qualification) |\n| 6 | Advanced Diploma, Associate Degree | 10 |\n| 7 | Bachelor Degree | 15 |\n| 8 | Bachelor Honours, Graduate Certificate, Graduate Diploma | 15 |\n| 9 | Masters Degree | 15 |\n| 10 | Doctoral Degree | 20 |\n\nAQF level matters for your visa in another way too: moving to a course at a **lower** AQF level than the one your current visa was granted for usually means you need a new student visa, not just a new Confirmation of Enrolment.\n\n## The link to skilled migration\n\n- The **Australian study requirement** (worth 5 [points](/guides/how-the-australian-points-test-works), and a gateway to the [485](/visas/temporary-graduate-485)) must be met with CRICOS-registered courses at diploma level or above, totalling at least 92 weeks, studied in Australia.\n- **Qualification points** follow the AQF level in the table above.\n- A **STEM masters by research or PhD** can add a further 10 points as a specialist education qualification.\n- Your [skills assessment](/guides/getting-a-skills-assessment-in-australia) will check that your qualification sits at the level the occupation expects and is closely related to it.\n\n## The \"registered but leads nowhere\" trap\n\nA course can be fully CRICOS registered and properly accredited and still be a dead end for migration if the field of study does not map to any occupation on a skilled list, or maps only to an occupation with no realistic invitation prospects. Students discover this after graduating, when the assessing authority has no pathway for them.\n\n## ELICOS and packaged courses\n\nStandalone English language courses (ELICOS) are CRICOS registered but do not count toward the Australian study requirement. If your offer packages an English course before a degree, only the degree portion counts, so check the combined length still clears 92 weeks of substantive study.\n\n## Before you accept an offer, confirm:\n\n- The CRICOS code is active and matches the provider and campus\n- The AQF level is what you expect for the qualification name\n- The course is long enough, on its own, to meet the 92-week study requirement\n- The field of study maps to an occupation you could later have assessed and invited\n- Whether the course offers a [Commonwealth Supported Place](/guides/commonwealth-supported-places-explained), if you might become eligible for domestic fees later",
    sources: [
      "https://cricos.education.gov.au/",
      "https://www.aqf.edu.au/",
    ],
  },
  {
    slug: "working-while-you-study-in-australia",
    title: "Working while you study in Australia: the 48-hour rule",
    category: "country-guide",
    country: "AU",
    excerpt:
      "Student visa work rights, the fortnightly cap, tax file numbers, and what counts against the limit.",
    content:
      "[Student visa](/visas/student-500) holders can work, within a cap. The current limit is 48 hours per fortnight while your course is running, set after the pandemic-era removal of the cap ended and a slightly higher permanent figure came in from 1 July 2023.\n\n## The 48-hour fortnight rule\n\nCondition 8105 limits you to 48 hours of work in any fortnight while your course is in session. Two details trip people up:\n\n- A **fortnight** is a fixed, rolling 14-day period that the department defines, starting on a Monday. It is not \"any 14 consecutive days you choose\", and it is not a calendar month averaged out. You cannot work 20 hours one fortnight and 76 the next.\n- During **scheduled course breaks** (semester holidays, the summer break) there is no limit at all. You can work full time.\n\n## What counts and what does not\n\n| Counts toward the 48 hours | Does not count |\n| --- | --- |\n| Paid employment, casual or ongoing | Course breaks (unlimited) |\n| Paid internships and paid placements | Unpaid work that is a formal part of your course |\n| Work in a family business, if paid | Genuine volunteer work for a non-profit, unpaid |\n| Online or remote work for any employer | Masters by research and PhD students, once the course has started |\n\n## Getting set up to work\n\n1. **Tax File Number (TFN).** Apply free through the ATO website once you arrive, using your passport and visa. Without a TFN your employer must withhold tax at the top rate.\n2. **Minimum wage.** The national minimum is around AUD 25 an hour before tax as of 2025 to 2026, and it rises every 1 July. Many awards pay more, and casuals get a loading of around 25 percent on top.\n3. **Superannuation.** Your employer pays super on top of your wage (currently 12 percent). You can claim most of it back as a Departing Australia Superannuation Payment when you leave the country permanently.\n4. **The tax-free threshold.** As a resident for tax purposes you pay no income tax on the first AUD 18,200 you earn in a year. Most students working part time within the cap fall near or below this and get much of their withheld tax back at tax time.\n\n## Why the cap is enforced, and what a breach costs\n\nExceeding 48 hours a fortnight is a breach of a visa condition. It can lead to visa cancellation, and even if it does not, it will surface when you apply for a [485](/visas/temporary-graduate-485) or a skilled visa, because your tax and superannuation records show exactly how many hours you worked and when. A history of over-cap work is a genuine risk to the graduate visa that the whole [study-to-PR pathway](/guides/study-to-permanent-residence-pathway-australia) depends on.\n\nEmployers who roster international students over the limit are also breaking the law, but in practice the visa consequence lands on the student, not the business. If an employer pressures you to work more, that is a reason to find a different job, not to breach the condition.\n\n## After you graduate\n\nOnce you move to a [485 Temporary Graduate visa](/visas/temporary-graduate-485) the cap is gone entirely. You have full work rights for the two to three years of that visa, which is the point of it: it is the window to build the skilled experience your points score and [skills assessment](/guides/getting-a-skills-assessment-in-australia) both need.",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/work-conditions-for-student-visa-holders",
    ],
  },
];

// ---------------------------------------------------------------------------
// Blog posts (dated, sourced). analysis: true adds the what-we-are-watching tag.
// ---------------------------------------------------------------------------
const posts = [
  {
    slug: "189-invitation-rounds-move-to-quarterly-2025-26",
    title: "The 189 invitation rounds are now quarterly, not monthly",
    published_at: "2025-08-22",
    tags: ["visas", "australia", "skilled-migration"],
    excerpt:
      "For the 2025-26 program year the Department shifted subclass 189 invitation rounds to a roughly quarterly cycle, with larger batches each time.",
    content:
      "For years, SkillSelect invitation rounds for the [subclass 189](/visas/skilled-independent-189) ran monthly, often with only a few hundred invitations and unpredictable cut-offs. That changed for the 2025-26 program year, when the Department of Home Affairs moved 189 rounds to a roughly quarterly cadence.\n\nThe first round of the year, on 21 August 2025, issued 6,887 invitations for the 189 and 150 for the Family Sponsored [491](/visas/skilled-work-regional-491) stream. A larger round followed on 13 November 2025.\n\n## How ranking works\n\nYour Expression of Interest sits in a pool ranked first by total points, then by your \"date of effect\", the date you reached that points score. In a round, the Department works down from the highest scores until the places for each occupation group are filled. That is why the cut-off is occupation-specific rather than a single national number.\n\n## What quarterly cadence changes\n\n- **Longer gaps between chances.** Miss a round by a point or two and the next is months away, not weeks.\n- **More weight on being ready.** It is worth lifting your score before a round rather than lodging an EOI and hoping the cut-off drops to meet you.\n- **A clearer planning horizon.** The dates are more predictable even though they are not announced in advance.\n\n## Cut-offs are still occupation-specific\n\nThe August and November rounds invited trades near the 65-point floor while ICT and accounting needed 90 or more. State nomination through the [190](/visas/skilled-nominated-190) and 491 remains the more accessible route for high-competition occupations. We track every round on the [invitation rounds page](/visas/invitation-rounds).\n\n## What to do between rounds\n\nKeep your Expression of Interest current. If your points change, for example a new English result or a work-experience anniversary, your date of effect resets to when you reached the new score, which moves you up or down the queue. Lodging a parallel state nomination EOI for the [190](/visas/skilled-nominated-190) or [491](/visas/skilled-work-regional-491) costs nothing and gives you a second path if the federal cut-off for your occupation stays high.",
    sources: [
      "https://emigratelawyers.com.au/blog/subclass-189-and-491-invitation-rounds/",
      "https://www.visaverge.com/news/australia-2025-26-skilled-migration-nov-13-subclass-189-invitation/",
    ],
  },
  {
    slug: "skillselect-round-4-june-2026-subclass-189",
    title: "The 4 June 2026 SkillSelect round: 10,000 invitations for the 189",
    published_at: "2026-06-04",
    tags: ["visas", "australia", "skilled-migration"],
    excerpt:
      "The third and final subclass 189 round of the 2025-26 program year issued 10,000 invitations on 4 June 2026, holding the quarterly pattern. Trades cleared near 65 points; ICT and accounting still needed the high 90s.",
    content:
      "The Department of Home Affairs ran its third [subclass 189](/visas/skilled-independent-189) invitation round of the 2025-26 program year on 4 June 2026, issuing 10,000 invitations. The Family Sponsored [491](/visas/skilled-work-regional-491) stream received none in this round.\n\nThat makes three 189 rounds this year: 6,887 in August, 10,000 in November, and 10,000 now. The roughly quarterly cadence the Department [moved to for 2025-26](/blog/189-invitation-rounds-move-to-quarterly-2025-26) held all the way through.\n\n## The numbers\n\n- **Invitations issued:** 10,000 (subclass 189, points-tested stream)\n- **Family Sponsored 491:** 0\n- **Points floor:** 65, the pool pass mark\n- **Tie-break:** expressions of interest with a date of effect up to around late April 2026 were reached, for the least competitive occupations\n\nAs in every recent round, 65 points was enough only where competition is lightest, mostly trades. Nursing, teaching, and most health occupations were invited from the low 80s. Accounting, ICT, and software roles again needed scores near 95 to 100, because those occupation groups attract far more high-scoring candidates than their annual ceilings allow.\n\n## What it means if you are in the pool\n\nIf your score was above the cut-off for your occupation and you still were not invited, look at your date of effect. A round works down from the highest scores, then within a score invites the earliest date of effect first. A recent date of effect can leave you just behind the line even at a competitive score.\n\nIf your occupation sits in the 95-plus band and your score is in the 70s or 80s, a federal 189 round is unlikely to reach you. [State nomination](/visas/skilled-nominated-190) through the 190 or 491 adds 5 or 15 points and runs off each state's own occupation list, and cut-offs there are usually lower. Lodging a state EOI in parallel costs nothing.\n\n## The next round\n\nThe Department does not announce dates in advance. On the quarterly pattern, the first round of the 2026-27 program year would land around September 2026, after the July allocation reset. Treat any earlier date as a guess until it shows on the official SkillSelect page.\n\nWe log every round, with invitation counts and occupation-level cut-offs, on the [invitation rounds page](/visas/invitation-rounds). Work out where you sit with the [points calculator](/visas/points-calculator).",
    sources: [
      "https://visaenvoy.com/latest-subclass-189-and-491-invitation-round-analysis/",
      "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds",
    ],
  },
  {
    slug: "skills-in-demand-visa-replaces-tss",
    title: "The Skills in Demand visa has replaced the TSS 482",
    published_at: "2024-12-09",
    tags: ["visas", "australia", "employer-sponsored"],
    excerpt:
      "From 7 December 2024 the employer-sponsored 482 became the Skills in Demand visa: one year of experience instead of two, and every stream now counts toward PR.",
    content:
      "On 7 December 2024 the Temporary Skill Shortage visa was rebuilt as the [Skills in Demand visa](/visas/skills-in-demand-482), keeping the subclass number 482 but changing how it works.\n\n## The main changes\n\n- **Work experience** dropped from two years to one year of relevant full-time experience in the last five.\n- **Three streams** replaced the old short-term and medium-term split:\n  - **Core Skills** for occupations on the Core Skills Occupation List, paying at or above the Core Skills Income Threshold. That threshold launched at AUD 73,150 and is indexed every 1 July (around AUD 79,000 by mid-2026).\n  - **Specialist Skills** for higher earners, with no occupation list but a salary floor that launched at AUD 135,000 and is now around AUD 147,000, also indexed.\n  - **Essential Skills** for lower-paid critical roles, announced but not yet in operation.\n- **Every stream is now a PR pathway.** The old Short-Term stream was a dead end for permanent residence; that is gone.\n- **Time to permanent residence** through the [186](/visas/employer-nomination-scheme-186) Temporary Residence Transition stream dropped from three years to two years with an employer.\n- **Mobility after a job loss** improved: up to 180 consecutive days, and 365 days in total across the visa, to find a new sponsor.\n\n## If you already hold a TSS 482\n\nExisting visas continue on their original conditions. The new rules matter at renewal and when you move toward the 186.\n\n## Why it matters for graduates\n\nThe one-year experience requirement makes the 482 reachable much sooner after a [485](/visas/temporary-graduate-485). For someone whose occupation is uncompetitive on the [points test](/guides/how-the-australian-points-test-works), a Core Skills 482 followed by the 186 after two years is now a cleaner route than it was, provided the salary clears the threshold.\n\n## What did not change\n\nThe employer still has to be an approved sponsor, still pays the Skilling Australians Fund levy for each year of the nomination, and the role still has to be a genuine full-time position paying at or above the market rate for that job. The visa is easier to qualify for on experience, not easier to get without an employer willing to sponsor you.",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482",
    ],
  },
  {
    slug: "485-graduate-visa-age-limit-drops-to-35",
    title: "The 485 graduate visa age limit has dropped to 35",
    published_at: "2024-07-01",
    tags: ["visas", "australia", "graduate"],
    excerpt:
      "The Temporary Graduate visa age cut-off fell from 50 to 35 for most applicants, with exceptions for research graduates and some passport holders.",
    content:
      "The [subclass 485 Temporary Graduate visa](/visas/temporary-graduate-485) had its maximum age reduced from 50 to 35 for most applicants, alongside a trimming of the pandemic-era stay extensions.\n\n## Who is exempt from the age-35 cap\n\n- Masters by research and PhD graduates.\n- Hong Kong and British National (Overseas) passport holders, who can also stay for five years rather than two or three.\n\nEveryone else, including coursework masters and bachelor graduates, must be 35 or under at the time of application.\n\n## The stay periods also changed\n\n- Bachelor and coursework masters graduates: two years (down from the temporary post-pandemic three).\n- Masters by research and PhD graduates: three years.\n- Graduates of an eligible qualification who studied and lived in a regional area have in recent years received an extra one to two years on top, depending on the area's classification.\n\n## What the six-month window means\n\nThe 485 must be lodged within six months of the date your last student visa ceased, and you generally need to be in Australia when you apply. You also need to already hold the other pieces: an eligible English test result, an AFP police check, and health insurance. Gathering those after your student visa ends, against a six-month clock, is where people run out of time.\n\n## If you are close to 35\n\nApply as soon as you meet the Australian study requirement, not at the end of your final semester. If you are already over 35 with a coursework qualification, the employer-sponsored [482](/visas/skills-in-demand-482) has no age bar at the temporary stage, though the permanent [186](/visas/employer-nomination-scheme-186) does at 45.\n\nAge also drives your [skilled points test](/guides/how-the-australian-points-test-works) score, which drops at 33, 40, and 45. A graduate who turns 34 during a two-year 485 has a narrow window to reach an invitation before the age points fall again.",
    sources: [
      "https://www.studyaustralia.gov.au/en/plan-your-move/your-guide-to-visas/temporary-graduate-visa-subclass-485",
      "https://www.australianmigrationlawyers.com.au/news-and-updates/temporary-graduate-visa-485-guide-2025",
    ],
  },
  {
    slug: "2025-26-state-nomination-allocations-190-491",
    title: "2025-26 state nomination allocations: 20,350 places for the 190 and 491",
    published_at: "2025-07-15",
    tags: ["visas", "australia", "skilled-migration"],
    excerpt:
      "The Department confirmed 12,850 places for the subclass 190 and 7,500 for the 491 across all states and territories for the 2025-26 program year.",
    content:
      "_This covers the 2025-26 program year. Allocations are reset each July; check the latest program-year figures before planning._\n\nThe Department of Home Affairs confirmed the state and territory nomination allocations for 2025-26: 12,850 places for the [subclass 190](/visas/skilled-nominated-190) and 7,500 for the [491](/visas/skilled-work-regional-491), a national total of 20,350.\n\n## How places are split\n\nEach state and territory gets its own allocation. NSW received 3,600 places (2,100 for the 190 and 1,500 for the 491). The ACT received 1,600 (800 and 800). Smaller states and territories get proportionally fewer.\n\nAn allocation is a ceiling on **nominations the state can make**, not invitations you are guaranteed. States receive far more Expressions of Interest than they have places, so they rank and select, and several close their programs within weeks of opening once the allocation is committed.\n\n## What this means in practice\n\nState nomination is a race against a fixed pool. When a state opens, occupations in demand there can be nominated at scores well below what a [189](/visas/skilled-independent-189) round would require, because the 5 or 15 nomination points and the state's own occupation list both work in your favour. Once the allocation is spent, that route closes until the next program year.\n\nIf your occupation is competitive somewhere, monitor that state's page, prepare your documents in advance, and submit as soon as it opens rather than waiting to polish your profile.\n\n## The 190 or the 491\n\nWithin state nomination you are often choosing between the two. The [190](/visas/skilled-nominated-190) is permanent immediately. The [491](/visas/skilled-work-regional-491) is provisional for five years and converts to the [191](/visas/permanent-residence-skilled-regional-191) after three years of living and working in a regional area and meeting an income requirement. States usually nominate for the 491 at lower point scores and with broader occupation lists, so applicants short on points often take the 491 as the realistic route rather than holding out for a 190.",
    sources: [
      "https://www.australianmigrationlawyers.com.au/news-and-updates/skilled-migration-allocations-2025-26",
      "https://www.nsw.gov.au/visas-and-migration",
    ],
  },
  // "what-we-are-watching-next-189-round" (published 2026-02-02) was archived
  // on 2026-08-28: it forecast a "1 March 2026" round that is now months past.
  // Removed from this seed so a re-run does not resurrect it. If you want a
  // retrospective on how that round landed, add it back as a new entry.
  {
    slug: "what-we-are-watching-points-test-review",
    title: "What we're watching: pressure to overhaul the points test",
    published_at: "2026-03-18",
    tags: ["what-we-are-watching", "visas", "australia", "skilled-migration"],
    excerpt:
      "The Migration Strategy flagged the points test as outdated. What a redesign might reward, and why we are not expecting it soon.",
    content:
      "This is analysis, not reporting. No changes to the points test have been legislated at the time of writing.\n\n## The background\n\nThe government's Migration Strategy described the current points test as not doing enough to select migrants likely to succeed in the labour market. A review was commissioned. Independent economists have argued for years that points for a partner's skills, for a Professional Year, and for study alone are weak predictors of outcomes, while points for a concrete job offer and higher earnings are strong ones.\n\n## What a redesign might reward\n\nIf the review's direction holds, we would expect a future points test to lean harder on:\n\n- A genuine job offer or current skilled employment at a good salary\n- Specialisation and demonstrated earnings potential\n- English at the higher bands\n\nand to reduce or remove points that are easy to accumulate without a labour-market signal.\n\n## Why we are not expecting it in this program year\n\nChanging the points test needs legislative and regulatory change, consultation, and system build time in SkillSelect. That is a multi-year process. Our working assumption is no structural change before the 2027-28 program year at the earliest.\n\n## What to do with that\n\nIf you are close to invitation now, apply under the current rules. If you are two or more years away, do not over-invest in points categories (a Professional Year, for instance) that a redesign might devalue. Confidence: low on specifics, higher on the direction of travel.",
    sources: [
      "https://immi.homeaffairs.gov.au/programs-subsite/migration-strategy/Documents/migration-strategy.pdf",
    ],
  },
];

// ---------------------------------------------------------------------------

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows: countryRows } = await client.query(
    "select id, code from countries",
  );
  const countryId = Object.fromEntries(countryRows.map((r) => [r.code, r.id]));

  for (const g of guides) {
    await client.query(
      `insert into guides
        (slug, title, category, country_id, content, excerpt, word_count,
         author_id, status, last_verified_at, source_urls,
         qa_facts_verified, qa_sentence_variation_checked, qa_firsthand_detail_added)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'published',$9,$10,true,true,true)
       on conflict (slug) do update set
         title = excluded.title, category = excluded.category,
         country_id = excluded.country_id, content = excluded.content,
         excerpt = excluded.excerpt, word_count = excluded.word_count,
         status = 'published', last_verified_at = excluded.last_verified_at,
         source_urls = excluded.source_urls, updated_at = now()`,
      [
        g.slug,
        g.title,
        g.category,
        g.country ? countryId[g.country] : null,
        g.content,
        g.excerpt,
        wc(g.content),
        AUTHOR_ID,
        TODAY,
        g.sources,
      ],
    );
    console.log("guide", g.slug, wc(g.content), "words");
  }

  for (const p of posts) {
    await client.query(
      `insert into blog_posts
        (slug, title, content, excerpt, tags, word_count, author_id,
         status, published_at, last_verified_at, source_urls)
       values ($1,$2,$3,$4,$5,$6,$7,'published',$8,$9,$10)
       on conflict (slug) do update set
         title = excluded.title, content = excluded.content,
         excerpt = excluded.excerpt, tags = excluded.tags,
         word_count = excluded.word_count, status = 'published',
         published_at = excluded.published_at,
         last_verified_at = excluded.last_verified_at,
         source_urls = excluded.source_urls, updated_at = now()`,
      [
        p.slug,
        p.title,
        p.content,
        p.excerpt,
        p.tags,
        wc(p.content),
        AUTHOR_ID,
        p.published_at,
        TODAY,
        p.sources,
      ],
    );
    console.log("post", p.slug);
  }

  // Em-dash guard: this project forbids em-dashes in published content.
  const { rows: bad } = await client.query(
    `select 'guide' as t, slug from guides where status='published' and (title like '%—%' or content like '%—%' or excerpt like '%—%')
     union all
     select 'post', slug from blog_posts where status='published' and (title like '%—%' or content like '%—%' or excerpt like '%—%')`,
  );
  console.log(bad.length === 0 ? "em-dash check: clean" : "EM-DASH FOUND:", bad);

  console.log("done");

  await pingIndexNow([
    "/blog",
    "/guides",
    "/sitemap.xml",
    ...posts.map((p) => `/blog/${p.slug}`),
    ...guides.map((g) => `/guides/${g.slug}`),
  ]);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
