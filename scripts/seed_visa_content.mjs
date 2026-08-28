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
      "Plenty of people come to Australia to study and end up staying. There is no single \"study to PR\" visa, but there is a well-worn sequence. Here is what it looks like.\n\n## 1. Study on a subclass 500\n\nYou need at least two academic years of study in Australia (the Australian study requirement) for the later steps to work. A single one-year masters usually is not enough on its own. Two years of study also has to be in a course that leads to an occupation you can get assessed.\n\n## 2. Move to a subclass 485 Temporary Graduate visa\n\nThe [485](/visas/temporary-graduate-485) gives you two to three years of open work rights depending on your qualification. This is the window where you build skilled experience and sit a higher English test if you need the points.\n\n## 3. Get a skills assessment\n\nEvery skilled visa needs a positive skills assessment from the authority that covers your occupation. Some assessments also require a year of post-qualification work, which is another reason the 485 matters.\n\n## 4. Lodge an Expression of Interest\n\nThrough SkillSelect you claim points for age, English, qualifications, experience, Australian study, regional study, a Professional Year, and more. You need 65 to submit, but competitive scores are higher for most occupations.\n\n## 5. Get invited and apply\n\nFor the [189](/visas/skilled-independent-189) you wait for a federal invitation round. For the [190](/visas/skilled-nominated-190) or [491](/visas/skilled-work-regional-491) a state nominates you first, which adds 5 or 15 points. The 491 is provisional and converts to permanent residence through the 191 after three years in a regional area.\n\n## Where people get stuck\n\nThe common failure points are choosing a course that does not map to an assessable occupation, running out of time on the 485 before hitting a competitive score, and underestimating how much regional study and work can lift a borderline profile.",
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
      "The points test decides who gets invited for a skilled visa. You need 65 points to submit an Expression of Interest, but 65 rarely gets an invitation on its own.\n\n## What earns points\n\n- **Age**: most points at 25 to 32 (30 points), dropping to zero at 45.\n- **English**: 0 for Competent, 10 for Proficient (IELTS 7), 20 for Superior (IELTS 8).\n- **Skilled employment**: up to 20 points, counted separately for work in and outside Australia over the last 10 years.\n- **Qualifications**: 10 for a diploma, 15 for a bachelor or masters, 20 for a doctorate.\n- **Australian study**: 5 points for meeting the two-year study requirement.\n- **Regional study**: another 5 points for studying in a designated regional area.\n- **Professional Year**: 5 points for a completed year in accounting, IT, or engineering.\n- **Community language**: 5 points for NAATI credentialing.\n- **Partner**: 10 for a skilled partner, 5 for a partner with Competent English, 10 if you are single.\n- **Nomination**: 5 points for state nomination (190), 15 for regional nomination or family sponsorship (491).\n\n## How many you actually need\n\nTrades are often invited near 65 to 70. Engineering has recently needed 80 to 90. Accounting and IT have needed 90 or more for the 189. The 190 and 491 are usually lower because of the nomination bonus and separate state lists.\n\n## The levers worth pulling\n\nA higher English score is the fastest single jump for most people (10 or 20 points). A skilled partner assessment adds 10. Regional study plus regional nomination is 20 points combined. More skilled experience helps but accrues slowly, one five-point band every few years.",
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
      "Australia replaced the Genuine Temporary Entrant test with the Genuine Student requirement in March 2024. The visa still hinges on convincing a case officer that you are coming to study, and the written statement is where that case is made or lost.\n\n## What the form asks\n\nThe application walks through a set of prompts covering your ties to your home country, your current circumstances, why you chose this course and this provider, your understanding of the conditions of a student visa, and any immigration history.\n\n## Answer the question that was asked\n\nCase officers read hundreds of these. Generic paragraphs about Australia's world-class education do nothing. Specifics do: name the units in the course that matter to your goals, name the role you want afterward, name the employer or sector back home that values this qualification.\n\n## Address the obvious doubts head on\n\nIf you have a study gap, explain it. If your chosen course is a step sideways or down from your last qualification, explain why. If you have family in Australia, say so and explain why you will still leave. Silence on an obvious issue reads as evasion.\n\n## Keep the finances consistent\n\nYour statement should match your evidence. If you say a parent is funding you, their income and the money trail need to support that. Funds that appear in a lump sum days before you apply invite questions.\n\n## Length and tone\n\nWrite in your own voice. A statement that reads like it was drafted by an agent, all identical phrasing across a family's applications, is a known red flag. Two to four focused pages beats ten padded ones.",
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
      "A positive skills assessment is a hard requirement for the 189, 190, 491, and the Direct Entry stream of the 186. It confirms your qualifications and, for many occupations, your experience match the Australian standard for your nominated occupation.\n\n## Find your assessing authority\n\nEach occupation on the skilled lists is tied to one authority. Common ones:\n\n- **ACS** for ICT occupations\n- **Engineers Australia** for engineering\n- **CPA Australia, CA ANZ, or IPA** for accounting\n- **VETASSESS** for a large range of professional and trade occupations\n- **AHPRA and the relevant board** for health professions\n- **TRA** for trades, usually with a practical assessment\n\n## What they check\n\nMost assess whether your degree is comparable to an Australian qualification and whether it is closely related to the occupation. Several also deduct a block of your early work experience as \"not skilled\", which affects your points. ACS, for example, commonly deducts two to four years.\n\n## Timing\n\nStraightforward assessments take four to ten weeks. Trades assessments with a practical component take longer. Your assessment is generally valid for three years.\n\n## Common problems\n\nA degree that is comparable but not closely related to the occupation is the usual sticking point, along with employment references that do not spell out duties in enough detail. Get reference letters that describe tasks, hours, and dates precisely before anyone you worked with becomes hard to reach.",
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
      "For skilled migration, \"regional\" means everywhere in Australia except Greater Sydney, Greater Melbourne, and Greater Brisbane. That is a wide net.\n\n## Cities that count as regional\n\nPerth, Adelaide, the Gold Coast, the Sunshine Coast, Canberra, Hobart, Darwin, Newcastle, Wollongong, Geelong, and every smaller city and town. Perth and Adelaide are full state capitals with universities, airports, and hospitals, and they are regional for this purpose.\n\n## What you gain\n\n- **5 points** for studying at a regional campus, on top of the 5 for the general Australian study requirement.\n- Access to the [491](/visas/skilled-work-regional-491), which carries a 15-point nomination bonus and broader occupation lists.\n- State nomination criteria that are often easier to meet outside the big three cities.\n- A further 485 extension has been offered in past years to regional graduates.\n\n## What you trade\n\nSmaller job markets in some towns, fewer big-employer graduate programs, and less established communities from your home country. Perth and Adelaide have none of these problems; a town of 30,000 might.\n\n## A reasonable approach\n\nMany people study in Adelaide or Perth to get the regional points and a normal city job market, then decide later whether to chase a 491 in a smaller area or aim straight for a 190. You are not locked in by where you study.",
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
      "Overseas Student Health Cover is a visa condition for the subclass 500. You must hold it for the entire length of your visa, not just your course.\n\n## What it covers\n\nOSHC broadly mirrors Medicare: visits to a doctor, public hospital treatment, ambulance, and a limited set of prescription medicines. Providers include Bupa, Medibank, Allianz Care, nib, and a few others. Your university often has a preferred provider, but you can choose your own.\n\n## What it does not cover well\n\nDental, optical, physiotherapy, and similar extras are minimal or excluded unless you buy a higher tier. Pre-existing conditions can have waiting periods, and pregnancy usually has a 12-month wait.\n\n## The visa trap: gaps\n\nYour OSHC must run from your arrival to the end of your visa. If you extend your visa, extend your cover first. A lapse, even a short one, is a breach of condition 8501 and can affect future applications. Buy cover that ends after your expected visa end date, not exactly on your course end date.\n\n## Family members\n\nIf you add a partner or children to your visa, they need to be on your OSHC policy too. Single, couple, and family policies are priced differently.\n\n## Getting money back\n\nIf you leave Australia early or move to a visa that gives you Medicare access, you can usually claim a partial refund for the unused period.",
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
      "A student visa refusal is stressful, but it is a decision you can often respond to. What you can do depends heavily on whether you applied from inside or outside the country.\n\n## Read the decision record carefully\n\nThe refusal letter states exactly which criterion was not met. Genuine Student concerns, insufficient funds, an English shortfall, and health or character issues all lead to different responses. Do not guess at the reason.\n\n## If you applied from outside the country\n\nThere is usually no merits review. You can generally apply again, addressing the specific problem the officer identified. A second application that ignores the first refusal's reasoning will fail the same way. If the refusal was on character or fraud grounds, get professional advice before reapplying, because that can trigger a re-entry ban.\n\n## If you applied from inside the country\n\nYou typically have a short window, often 28 days, to apply to the Administrative Review Tribunal. Deadlines are strict and missing one usually ends your options. While review is pending you are normally on a bridging visa and can stay.\n\n## Fixing the underlying issue\n\n- **Funds**: build a clear, documented savings history rather than a recent lump sum.\n- **Genuine Student**: rewrite the statement to address the officer's stated doubts directly.\n- **English**: sit the test again or add a packaged English course.\n\n## Get advice early\n\nA registered migration agent or a university's international student advisers can tell you quickly whether a fresh application or a review is the better route. The clock matters most for onshore refusals.",
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
      "The subclass 500 requires you to show you can cover course fees, travel, and living costs for the first year without relying on work in Australia.\n\n## The numbers\n\nHome Affairs publishes a 12-month living-cost figure for the main applicant, with additional amounts for a partner and each child. It is reviewed periodically and has risen several times, so check the current figure rather than an old one. On top of that you show first-year tuition and about AUD 2,000 to 2,500 for travel.\n\n## Acceptable evidence\n\n- Bank statements showing a genuine savings history, not just a recent balance\n- Education loans from a recognised financial institution, already approved\n- Evidence of a parent's or sponsor's income and their relationship to you\n- Scholarship or sponsorship letters stating exactly what is covered\n\n## What raises flags\n\nA large deposit that appears days before you apply, funds held by a distant relative with no explanation, and loan documents that are approved in principle rather than actually granted. Money needs a plausible origin story.\n\n## Show more than the minimum\n\nMeeting the figure exactly, with no buffer, invites scrutiny. A margin above the requirement signals that the funds are real and that you have thought about the cost of living rather than treating the number as a hurdle to clear.",
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
      "Two acronyms decide whether a course can support your visa and your later plans: CRICOS and AQF.\n\n## CRICOS\n\nThe Commonwealth Register of Institutions and Courses for Overseas Students lists every course a provider is allowed to deliver to international students. If a course is not on CRICOS, you cannot get a subclass 500 for it. You can search the register directly to confirm a course code before you accept an offer.\n\n## AQF\n\nThe Australian Qualifications Framework sets the level of every qualification, from Certificate I up to Doctoral Degree at level 10. A bachelor degree is level 7, a masters is level 9. This matters for your visa because moving to a course at a lower AQF level than the one you hold a visa for usually means you need a new visa.\n\n## The link to skilled migration\n\nThe two-year Australian study requirement must be met with CRICOS-registered courses at diploma level or above. Points for qualifications are tied to AQF level: 15 for a bachelor or masters, 20 for a doctorate. A skills assessment will also check that your qualification sits at the expected level for the occupation.\n\n## Before you accept an offer\n\nConfirm the CRICOS code, check the AQF level, and check that the field of study maps to an occupation you could later have assessed. A course that is registered and accredited but leads nowhere on the skilled lists is a common and expensive mistake.",
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
      "Student visa holders can work, within limits. The rules changed after the pandemic-era removal of the cap ended.\n\n## The cap\n\nCondition 8105 limits you to 48 hours of work every fortnight while your course is in session. A fortnight is a fixed two-week period, not any rolling 14 days. During scheduled course breaks there is no limit.\n\n## Exemptions\n\n- Postgraduate research students (masters by research and PhD) have no cap once the course has started.\n- Hours in a registered course's mandatory work placement do not count.\n- Volunteering for a non-profit, for no pay, generally does not count.\n\n## Practicalities\n\nYou need a Tax File Number to work and to avoid being taxed at the top rate. Apply online once you arrive using your passport and visa. Superannuation is paid on top of your wage by the employer; you can claim most of it when you leave Australia permanently.\n\n## Why the cap is enforced\n\nExceeding 48 hours a fortnight is a visa breach. It can lead to cancellation and it will surface if you later apply for a graduate or skilled visa, because tax and superannuation records show your hours. Employers who roster international students over the limit are also breaking the law, but the visa consequence lands on you.",
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
