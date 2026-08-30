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
const TODAY = "2026-08-31";
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
    slug: "temporary-graduate-visa-485-guide",
    title: "The subclass 485 Temporary Graduate visa, explained",
    category: "country-guide",
    country: "AU",
    excerpt:
      "What the 485 gives you after an Australian degree: the two streams, how many years you get, the age limit, English, cost, and how it leads to permanent residence.",
    content:
      "The Temporary Graduate visa (subclass 485) is the visa most international students move onto straight after they finish their course. It gives you full work rights for two to three years with no employer sponsor, and it is the window where most people build the skilled experience and points they need for permanent residence. The [subclass 485 reference page](/visas/temporary-graduate-485) has the summary. This guide covers how the rules play out in practice.\n\n## The two streams\n\nHome Affairs restructured the 485 in 2024. The former Post-Study Work and Graduate Work streams are gone. There are now two main streams, plus a second visa for regional graduates.\n\n| Stream | Who it is for | Stay |\n| --- | --- | --- |\n| Post-Higher Education Work | Graduates with a bachelor degree or higher | 2 to 3 years by qualification |\n| Post-Vocational Education Work | Graduates with an associate degree, diploma or trade qualification tied to an occupation Australia needs | Up to 18 months |\n| Second Post-Higher Education Work | 485 holders who studied and lived in a regional area | Extra 1 to 2 years |\n\nThe Post-Vocational Education Work stream has an extra condition the degree stream does not: your qualification must be relevant to an occupation on the skilled occupation list, and you must have applied for a [skills assessment](/guides/getting-a-skills-assessment-in-australia) in that occupation before you lodge.\n\n## How many years you get\n\nFor the Post-Higher Education Work stream, the length is set by your qualification. It is not negotiable and you cannot trade a longer course for a longer visa.\n\n| Qualification | Stay |\n| --- | --- |\n| Bachelor degree, including honours | 2 years |\n| Masters (coursework or extended) | 2 years |\n| Masters (research) | 3 years |\n| Doctoral degree (PhD) | 3 years |\n| Graduate Diploma | 2 years by default |\n\nIndian nationals get more under the Australia India Economic Cooperation and Trade Agreement: three years for a masters at any level, three years for a bachelor with first class honours in a STEM or ICT field, and four years for a PhD. Hong Kong and British National Overseas passport holders can stay up to five years.\n\n## The regional bonus: a second 485\n\nIf the campus that awarded your qualifying degree was in a designated regional area, and you then live only in a regional area for at least two years while on your first 485, you can apply for a Second Post-Higher Education Work stream visa:\n\n| Where you studied and lived | Extra time |\n| --- | --- |\n| Category 2: Perth, Adelaide, Gold Coast, Canberra, Newcastle, Wollongong, Geelong, Hobart and similar | 1 more year (2 years for a Category 2 area in Tasmania) |\n| Category 3: all other regional areas | 2 more years |\n\nThat can turn a two-year bachelor 485 into three or four years in total. It stacks with the [regional study points](/guides/choosing-a-regional-area-to-study-in-australia) and with [491 regional nomination](/visas/skilled-work-regional-491). Studying at a [regional university](/best/regional-australian-universities-for-skilled-migration) from the start is the way to keep this option open.\n\n## Eligibility checklist\n\n- **Age:** 35 or under on the day you apply. You can be under 50 instead if you are using a masters by research or a PhD to meet the study requirement, or you hold a Hong Kong or BNO passport.\n- **Visa history:** you must have held a [student visa](/visas/student-500) in the last 6 months, and be in Australia when you apply.\n- **The study requirement:** at least two academic years, meaning 92 weeks of CRICOS-registered study, resulting in an eligible qualification, completed in Australia over no less than 16 calendar months, taught in English. English language and enabling courses do not count. See [CRICOS and course accreditation](/guides/cricos-and-course-accreditation-explained).\n- **Timing:** you must apply within 6 months of your course completion date. That is the date you were first told in writing that you had met every academic requirement, not the date of your graduation ceremony.\n- **English:** IELTS 6.5 overall with at least 5.5 in each band, or PTE Academic 55, or TOEFL iBT 81, from a test sat in the 12 months before you apply. Citizens holding a valid passport from the UK, USA, Canada, New Zealand or the Republic of Ireland do not need a test. See [IELTS vs PTE](/guides/ielts-vs-pte-for-australian-university-admission).\n- **Health cover and character:** evidence of health insurance for everyone on the application, and proof you have applied for an Australian Federal Police check.\n\n## What it costs\n\nThe visa application charge is AUD 5,750 for the main applicant, with a further charge for each family member you include. The second regional 485 is cheaper, around AUD 2,265. On top of that, budget for health checks, police certificates, [health cover](/guides/oshc-health-cover-for-international-students) and a fresh English test if you need one. Check the current charge on the Home Affairs site before you lodge, as it has risen sharply in the last two years.\n\n## Work rights\n\nFull and unrestricted. Any employer, any hours, any occupation, including running your own business. Unlike the [student visa work cap](/guides/working-while-you-study-in-australia), there is no limit. You do have to find your own job. The visa does not come with one, and the department expects you to be looking.\n\n## How the 485 leads to permanent residence\n\nThe 485 is step two of the [study to permanent residence pathway](/guides/study-to-permanent-residence-pathway-australia). During it you:\n\n1. Get a positive [skills assessment](/guides/getting-a-skills-assessment-in-australia) for your nominated occupation. Some authorities want a year of post-qualification work first, which is one reason the 485 matters.\n2. Build skilled work experience that counts for [points](/guides/how-the-australian-points-test-works).\n3. Sit a higher English test if you want the 10 or 20 points for Proficient or Superior English.\n4. Lodge an Expression of Interest for the [189](/visas/skilled-independent-189), [190](/visas/skilled-nominated-190) or [491](/visas/skilled-work-regional-491) and wait for an invitation. The [invitation rounds page](/visas/invitation-rounds) tracks the cut-offs.\n\nWhether this works depends on your occupation. Check [which courses lead to permanent residence](/guides/which-australian-courses-lead-to-permanent-residence) before you treat the 485 as a PR step, not after you have graduated.\n\n## Can I apply for the 485 from outside Australia?\n\nNo. For the Post-Higher Education Work and Post-Vocational Education Work streams you must be in Australia when you lodge, though not in immigration clearance at an airport. You can be inside or outside Australia when the decision is made, and you can travel while it is being processed.\n\n## Does time spent overseas on a 485 extend the visa?\n\nNo. The 485 has a fixed end date. Time you spend outside Australia is not added back on. If you leave for a long stretch, you lose that part of your work window.\n\n## What happens if my 485 expires and I have not been invited?\n\nYou cannot extend it. Your realistic options are a second regional 485 if you qualify, an employer-sponsored visa such as the Skills in Demand visa (subclass 482), a state-nominated 190 or 491, or a further student visa for a higher qualification. Plan the occupation and the points maths in the first year of the 485, not in its final months.",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485/post-higher-education-work",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485/meeting-the-temporary-graduate-visa-subclass-485-study-requirement",
    ],
  },
  {
    slug: "applying-to-australian-universities-without-an-agent",
    title: "How to apply to an Australian university without an agent",
    category: "country-guide",
    country: "AU",
    excerpt:
      "You can apply directly to almost every Australian university yourself, usually for free. The process step by step, when an agent actually helps, and how agent commissions work.",
    content:
      "Most students can apply to an Australian university directly, through the university's own website, without an agent. It is usually free or costs a small application fee, you keep control of your logins and documents, and you deal with the admissions team rather than a middleman. This guide covers the direct process, the few cases where a university requires an agent, and what agents actually do.\n\n## Applying directly, step by step\n\n1. **Shortlist courses.** Use the [universities directory](/universities) to filter by state, tuition, and English requirement, the [comparison tool](/compare/universities) to put options side by side, and the [deadline calendar](/deadlines) for the apply-by dates. Most universities run February and July intakes and assess applications as they arrive.\n2. **Check the entry requirements for the specific course.** Each course lists an academic requirement and an English score. Confirm your qualification meets it and that you can reach the English score, or read [studying without IELTS](/guides/studying-in-australia-without-ielts) for the alternatives.\n3. **Confirm the course is CRICOS registered.** A [student visa](/visas/student-500) needs a course with an active CRICOS code. See [CRICOS and course accreditation](/guides/cricos-and-course-accreditation-explained).\n4. **Gather your documents.** Academic transcripts and completion certificates, your passport, English results or a medium-of-instruction letter, a CV if the course asks for one, and a [statement of purpose](/guides/how-to-write-a-personal-statement) where required.\n5. **Apply through the university's international application portal.** Every Australian university has one. Create the account yourself. Do not let anyone else hold the login or the recovery email.\n6. **Pay the application fee if there is one.** Many universities charge nothing to apply. Those that do charge roughly AUD 50 to 150. The [no application fee list](/best/australian-universities-with-no-application-fee) shows which ones are free.\n7. **Review the offer.** An offer is conditional or unconditional. Read the conditions, the fees, the start date, and any scholarship attached before you accept.\n8. **Accept and pay the tuition deposit.** Usually one semester of tuition, sometimes more where the university applies a higher-risk assessment. This triggers your Confirmation of Enrolment (CoE).\n9. **Lodge the student visa yourself** in ImmiAccount, using the CoE. This step is always done by you or a registered migration agent, never an unregistered education agent.\n\n## When a university requires an agent\n\nSome universities require applicants of certain nationalities to apply through an approved agent rather than directly. RMIT, for example, tells applicants that people from some countries must apply through an authorised RMIT agent and pay an application fee. Which countries are affected varies by university and changes over time, and there is no single national list. Before you start, open the university's own how-to-apply page for international students and look for a countries or regions section. If your country is listed as agent-only, use an agent the university has authorised, which every university publishes on its site. If your country is not listed, apply direct.\n\n## What an agent does, and how they are paid\n\nA good agent shortlists courses, checks your eligibility, helps assemble the application, and can move faster because they work with the same admissions teams every day. That is real value if you are applying to several universities at once or are unsure your profile is competitive.\n\nAgents are paid a commission by the university, normally a percentage of your first year of tuition. Study Australia says this cost is usually built into your tuition fees. So the service is not free, it is priced into what you pay, and the agent has a financial reason to steer you toward the universities that pay the most commission. That is not a reason to avoid agents. It is a reason to treat an agent's shortlist as one input, not the answer, and to cross-check it against the [universities directory](/universities) and [comparison tool](/compare/universities) yourself.\n\nFrom 31 March 2026, under changes to the National Code that sits under the ESOS Act, Australian providers can no longer pay agent commissions for onshore transfers. That targets agents who move students between colleges for a fee after they have arrived in Australia.\n\n## Red flags\n\nWalk away from any agent who:\n\n- Guarantees admission, a scholarship, a visa, or permanent residence. None of these can be guaranteed, and Study Australia is explicit that agents cannot guarantee a visa outcome or a migration result.\n- Offers you gifts, cash, vouchers, or rewards to sign up.\n- Pushes you toward one specific university without explaining why it fits you.\n- Asks you to overstate your finances, use money that is not really yours, or change dates on documents. That is fraud, and it is your name on the application. See [proving your funds](/guides/proving-funds-for-an-australian-student-visa) and the [Genuine Student statement](/guides/genuine-student-requirement-how-to-write-your-statement).\n- Wants to keep your portal login, your email password, or the only copy of your documents.\n- Charges a fee that is far above or far below the market, or is vague about what it covers.\n\nIf you do use an agent, check them against the university's authorised list, and for anyone giving visa advice, the public Register of Migration Agents. The Qualified Education Agent Counsellor (QEAC) credential is another signal.\n\n## Can I switch to applying directly if I started with an agent?\n\nUsually yes, as long as you have not accepted an offer. Ask the agent in writing to withdraw any application they lodged, then reapply through the university's portal with your own account. Once a CoE is issued it is tied to how the application was made, so sort this out early. If the agent will not release you or holds your documents, contact the university's international admissions team directly.\n\n## Do I need an agent for the student visa?\n\nNo. You lodge the student visa (subclass 500) yourself in ImmiAccount. Only a registered migration agent or an Australian legal practitioner can charge you for immigration assistance. An education agent who is not registered cannot legally advise you on the visa, and you do not need one to apply.\n\n## Is it cheaper to apply directly or through an agent?\n\nFor you, the application itself costs about the same either way. The university charges the same tuition and the same application fee whether you apply direct or through an agent, and a reputable agent does not charge you a separate fee in the Australian-regulated channel. The difference is control and independence, not price. Applying direct means you choose the shortlist, you hold the logins, and no commission structure is shaping the advice you get.",
    sources: [
      "https://www.studyaustralia.gov.au/en/tools-and-resources/tips-and-advice-for-students/how-to-choose-the-right-education-agent-for-you",
      "https://www.rmit.edu.au/study-with-us/international-students/apply-to-rmit-international-students/application-methods",
      "https://www.studyaustralia.gov.au/en/Agent-Hub/agent-news-index/new-rules-on-agent-commissions-for-onshore-student-transfers",
    ],
  },
  {
    slug: "february-vs-july-intake-in-australia",
    title: "February or July intake in Australia: how to choose",
    category: "country-guide",
    country: "AU",
    excerpt:
      "February is the bigger intake, with the widest course choice and most scholarship rounds. July works for most popular courses. How to pick, and when the choice is made for you.",
    content:
      "Australian universities have two main entry points. Semester 1 teaching starts in late February or early March, with orientation in the last week of February. Semester 2 starts in late July. At the University of Melbourne and at Monash, for example, 2026 Semester 1 teaching began on 2 March and Semester 2 on 27 July.\n\nFebruary is the larger intake. It has the widest choice of courses, the most scholarship rounds, and the fullest first-year timetable. July is smaller but runs almost every popular course and is a normal, well-supported way to start.\n\n## February and July at a glance\n\n| | February (Semester 1) | July (Semester 2) |\n| --- | --- | --- |\n| Course choice | Widest. Every course that runs, runs now | Most courses, but some are February-only |\n| Scholarships | Most rounds align here | Fewer rounds, smaller pools |\n| Cohort | Larger, more electives offered | Smaller in some courses |\n| Competition | Higher volume of applicants | Slightly lower |\n| Arrival | Australian summer, straight into the main academic year | Australian winter, mid-cycle |\n| Finish date | End of year, aligns with the main graduate hiring cycle | Mid-year |\n\n## When the choice is made for you\n\nSome courses only take February starters. This is common for:\n\n- Many nursing and other health programs, where clinical placement blocks run from the start of the year\n- Teaching degrees with a fixed practicum calendar\n- Some engineering and cohort-based programs where units must be taken in a set order\n\nIf you start one of these off-cycle, the second-semester units you need may not be offered in your first July, which can stretch the degree by a semester. Check whether your specific course and specialisation runs in the intake you want. Use the [universities directory](/universities) and the [comparison tool](/compare/universities) to check, and the [deadline calendar](/deadlines) for the dates.\n\n## A third or fourth intake\n\nA few universities run more than two starts a year, which helps if you have just missed a deadline or want to keep a [study gap](/guides/study-gaps-and-the-australian-student-visa) short:\n\n- **Bond University** runs three semesters, in January, May and September, so a bachelor degree finishes in two years.\n- **Murdoch University**, **Southern Cross University**, **Victoria University** and the **University of Southern Queensland** run a third teaching period around November, alongside February and July.\n- **UNSW Sydney** uses a trimester calendar with three main teaching periods. Check its academic calendar for the current start months.\n\n## How to decide\n\nWork backwards from two dates: when your current qualification finishes, and when you can realistically have a visa in hand.\n\n1. **When does your current course finish?** You need the completion document, not just the final exam. Finish in November or December and February is the natural target. Finish in March or April and July avoids a long wait.\n2. **How long is the gap?** A short gap needs no explanation. A gap of a year or more does, and a case officer will want a clear reason for it. See [study gaps and the student visa](/guides/study-gaps-and-the-australian-student-visa).\n3. **Apply three to four months ahead.** You need an offer, then a Confirmation of Enrolment, then a [student visa](/visas/student-500), and processing can take anywhere from a few weeks to a few months. For a February start, apply by October or November. For July, apply by March or April.\n4. **Line up the money early.** Your [financial evidence](/guides/proving-funds-for-an-australian-student-visa) should show a savings history well before you apply, not a lump sum that lands the week before.\n5. **Check scholarship deadlines.** Most [scholarship](/scholarships) rounds are built around the February intake. If a specific award matters to you, its deadline may decide your intake.\n\n## Worked example\n\nYou finish a three-year bachelor degree in your home country in June, with the transcript and completion letter issued in July.\n\n- **July the same year** is too tight. You would be applying in July for a course starting in July.\n- **February the following year** gives you roughly five to seven months to apply, get the offer and CoE, sit or resit an English test if needed, and lodge the visa. The gap from June to February is about eight months, short enough to need only a one-line explanation.\n- **July the following year** is the fallback if a February-only problem comes up, such as a delayed transcript or a visa lodged late.\n\nFebruary is usually the stronger default. Choose July when your qualification finishes early in the year, when waiting for February would open a gap you would rather avoid, or when the July intake simply fits your circumstances and your course runs then.\n\n## Does starting in July put me behind?\n\nNot for most courses. You take the same units in a different order and graduate a semester later than a February cohort. The exception is tightly sequenced programs, mostly in health and engineering, where a unit you need in your second semester is only taught in Semester 1. Check the course structure for your degree before you assume July is fine.\n\n## Is February harder to get into than July?\n\nFebruary has more applicants because it is the bigger intake, but it also has more places. For most courses the entry requirements are identical in both intakes. Highly competitive courses with capped places can fill earlier for February, so applying early matters more than which semester you pick.",
    sources: [
      "https://www.unimelb.edu.au/dates",
      "https://www.monash.edu/students/admin/dates/summary-dates",
      "https://bond.edu.au/study-at-bond/how-to-apply/key-dates",
    ],
  },
  {
    slug: "getting-your-qualifications-recognised-in-australia",
    title: "Getting your qualifications recognised for study in Australia",
    category: "country-guide",
    country: "AU",
    excerpt:
      "Three different bodies judge your degree: the university for admission, a skills authority for the skilled visa, and a registration board for licensed jobs. They use different rules.",
    content:
      "\"Will my degree be recognised in Australia\" has three separate answers, because three different bodies assess it for three different purposes. Working out which one you are asking about saves a lot of confusion.\n\n| Layer | Who decides | What they check | When it matters |\n| --- | --- | --- | --- |\n| Admission | The university you apply to | Whether your qualification is comparable for entry, and what your marks convert to | Before you enrol |\n| Skilled migration | A skills assessing authority | Whether your qualification is comparable to the right AQF level and closely related to your occupation | For the [skilled visas](/visas/points-calculator) |\n| Professional practice | A registration board | Whether you can be licensed to practise in Australia | Before you can work as a nurse, doctor, teacher, and other licensed roles |\n\n## Layer 1: Admission\n\nEach Australian university assesses your qualification itself. It does not outsource this to WES or another credential evaluation service the way many United States universities do. You send your transcripts and degree certificate, and the admissions team compares them against the university's own country-specific entry table.\n\nThose tables are public. UTS, for example, publishes downloadable direct-entry score tables for undergraduate and postgraduate applicants, broken down by country and qualification. Every university has an equivalent. Find your country on your target university's international entry requirements page and read the row for your qualification. The [universities directory](/universities) and the [subject pages](/study) link through to each one.\n\n### Does a three-year bachelor work for a masters?\n\nFor most Australian coursework masters, yes. A standard three-year bachelor from a recognised university in India, Nepal, Bangladesh and similar systems is generally accepted as comparable for postgraduate entry. The exceptions are a minority of competitive programs, and a few universities, that want a four-year degree, an honours year, or first-class marks, and some professional masters that expect a bachelor in the same field. Check the specific program's entry requirements, not the university's general statement.\n\n### How marks convert\n\nThere is no single national formula. The conversion depends on which board or university awarded your degree and which Australian university is reading it, because grading scales differ widely across Indian, Nepali and other systems. As a rough guide only, a common minimum for general masters entry sits around 60 percent or a second class first division, with competitive courses in business, engineering and data asking for 65 to 75 percent. Treat those as indicative. The figure that binds is on the program page.\n\n### English-taught degrees\n\nIf your degree was taught and assessed in English, many universities accept a medium-of-instruction letter from your institution instead of an IELTS or PTE result for admission. The [student visa has its own English rule](/guides/studying-in-australia-without-ielts), assessed separately, so confirm both.\n\n## Layer 2: Skilled migration\n\nThis is a different assessment against a different standard. For a skilled visa you need a positive [skills assessment](/guides/getting-a-skills-assessment-in-australia) from the authority tied to your occupation: VETASSESS for most professional and managerial occupations, Engineers Australia for engineering, ACS for ICT, CPA Australia or CA ANZ for accounting, ANMAC for nursing, and so on.\n\nThey assess two things:\n\n1. **Qualification level.** Your degree is compared against the [Australian Qualifications Framework](/guides/cricos-and-course-accreditation-explained). A bachelor is AQF Level 7, a masters is Level 9. VETASSESS is explicit that highly relevant work experience cannot make up for a qualification below the level the occupation requires.\n2. **Field.** Your qualification has to be closely related to the nominated occupation, not just any degree.\n\nMany authorities also require a set period of post-qualification employment, often a year, before they will give a positive result. This is one reason the [485 graduate visa](/guides/temporary-graduate-visa-485-guide) window matters.\n\n## Layer 3: Professional registration\n\nSome jobs cannot be done without a licence, and the licence is separate from both your degree and your skills assessment.\n\n- **Health professions:** nurses, doctors, physiotherapists, pharmacists and others register through AHPRA and the relevant national board. Internationally qualified applicants go through a separate assessment, and for some professions an exam or a period of supervised practice.\n- **Teaching:** registration is state based, through bodies such as the Victorian Institute of Teaching or the NSW Education Standards Authority.\n- **Law, some engineering roles, and parts of accounting:** each has its own body.\n\nIf your target occupation is licensed, check the registration requirements before you choose a course, because a degree that is fine for admission and migration can still leave you unable to practise without extra steps.\n\n## Credit for study you have already done\n\nIf you have completed part of a degree, or a full diploma, an Australian university may grant credit or recognition of prior learning toward a related course, which shortens it. This is assessed course by course. The guide on [transferring universities without losing credits](/guides/transferring-universities-without-losing-credits) covers how to document it. One caution: credit that shortens your course below the [minimum study duration](/guides/cricos-and-course-accreditation-explained) can reduce or remove your eligibility for a later graduate visa, so weigh that before you accept a large credit package.\n\n## Documents to have ready\n\n- Official academic transcripts for every year, in English or with a certified translation\n- Your degree certificate, or provisional certificate if the final one has not been issued\n- A grading scale or transcript key from your institution, if it is not printed on the transcript\n- A medium-of-instruction letter if your degree was taught in English\n- For migration later: detailed employment references on company letterhead\n\n## Does Australia require WES like the United States?\n\nGenerally no. Australian universities assess international transcripts in-house against their own country tables, so a WES or ECE report is usually not needed for admission. A small number of pathway providers or specific programs may ask for a certified credential evaluation, and skills assessing authorities for migration run their own separate assessment, but the standard university application does not involve WES.",
    sources: [
      "https://www.uts.edu.au/for-students/admissions-entry/how-to-apply/international-applicants/academic-entry-requirements",
      "https://www.vetassess.com.au/skills-assessment-for-migration/skills-assessment-for-professional-occupations",
      "https://www.aqf.edu.au/",
    ],
  },
  {
    slug: "moving-money-to-australia-for-the-student-visa",
    title: "Moving money to Australia and showing genuine funds",
    category: "country-guide",
    country: "AU",
    excerpt:
      "The student visa checks whether your money looks genuine and is really yours. How to build the balance, which sources a case officer accepts, and how to transfer it.",
    content:
      "The [proving funds guide](/guides/proving-funds-for-an-australian-student-visa) covers how much you need to show for the [student visa](/visas/student-500). This one is about the part people get wrong: making the money look genuine, and moving it without creating problems.\n\n## The rule that matters most\n\nA case officer is not just checking a balance. They are checking whether the money is genuinely available to you and did not appear only to pass the test. The strongest evidence is a savings history that started before you decided to study abroad. The weakest is a large deposit that lands days before you lodge, with nothing behind it.\n\nSo the timing rule is simple: build the balance months ahead, not the week before. Three to six months of visible history is far more convincing than the right number on the right day.\n\n## Sources of funds, strong to weak\n\n| Source | How to make it hold up |\n| --- | --- |\n| Your own savings | Statements showing the balance building over months, not a single recent figure |\n| Education loan | Actually sanctioned and disbursed, or ready to disburse, by a recognised bank or financial institution. A loan approved in principle is not evidence |\n| Parent or close-relative income and savings | Their statements and income proof, plus a document proving the relationship |\n| Sale of property or land | The sale deed, the buyer's payment, and the money arriving on a traceable path |\n| Fixed deposits | The certificate, plus where the original money came from |\n\nWeak or risky:\n\n- Money sitting in a distant relative's or a family friend's account. It is not clearly yours.\n- A large deposit with no explanation of where it came from.\n- A loan secured against an asset that cannot quickly be turned into cash.\n- Exactly the minimum, with no margin.\n\nEvery significant sum needs an origin story the paperwork supports.\n\n## Australia has no blocked account\n\nUnlike Germany's blocked account or Canada's Guaranteed Investment Certificate, Australia does not make you park money in a designated account or deposit it with the government. You show the funds through evidence. Nobody freezes them. That also means there is no official account to transfer into before you apply, and anyone telling you to send money to a student account to get a visa is running a scam.\n\n## What to pay before you lodge\n\n- The tuition deposit, usually one semester, paid to the university, which triggers your Confirmation of Enrolment. Keep the receipt.\n- [OSHC health cover](/guides/oshc-health-cover-for-international-students) for the full length of the visa. Keep the policy document.\n\nBoth reduce the tuition and living-cost money you still need to evidence, because you can show them as already paid. Use the [cost calculator](/cost-calculator) and the [real cost guide](/guides/real-cost-of-studying-in-australia) to size the total.\n\n## Actually moving the money\n\nPay tuition through the channel your university nominates. Most use a specialist provider such as Convera, Flywire, or PayMyTuition rather than a plain bank wire. These give a better rate than a card, a reference number the university can match to your account, and a receipt built for a visa file. Your offer letter or student portal names the provider.\n\nKeep every transfer receipt, bank voucher, and remittance form. You need them for the visa application and again for later visa steps.\n\n### From India\n\nThe Reserve Bank of India's Liberalised Remittance Scheme lets a resident individual send up to USD 250,000 per financial year. A year of tuition and living costs in Australia sits well within that, and a parent can remit under their own separate limit.\n\nTax collected at source (TCS) applies to money sent abroad for education. As of the 2025-26 financial year, remittances funded by an education loan from a specified financial institution attract no TCS, and remittances from your own funds attract 5 percent on the amount above 10 lakh rupees in a financial year. TCS is not a cost as such, it is credited against your income tax, but it ties up cash for months. These rules have changed repeatedly, so confirm the current position with your bank before you remit.\n\n### From Nepal\n\nYou need a No Objection Certificate from the Ministry of Education, applied for online at noc.moest.gov.np. Nepali banks cannot remit tuition or living expenses abroad without it. Nepal Rastra Bank caps how much foreign currency you can buy for study and revises the caps from time to time, so confirm the current fee and living-expense limits with your remitting bank rather than an older figure. Route your payments through one bank and keep every exchange voucher, because later payments generally have to go through the same bank with the original NOC attached.\n\n## Worked example timeline\n\nTargeting a February intake, applying the previous September.\n\n| When | Money step |\n| --- | --- |\n| 12 months out | Start moving savings into one account in your name and leave them there |\n| 6 months out | Loan sanctioned and documented if you are using one, or property sale completed if that is your source |\n| 4 months out | Offer received. Pay the tuition deposit and buy OSHC. Keep the receipts |\n| 3 months out | Gather six months of statements, sponsor income proof, relationship documents, and the loan disbursement letter |\n| At lodgement | Financial evidence matches your [Genuine Student answers](/guides/genuine-student-requirement-how-to-write-your-statement) exactly |\n\n## Does the money have to be in my name?\n\nNot entirely. Parents and close relatives can be sponsors, and their savings and income count if you document the relationship and their consent. What matters is that the funds are genuinely available to you. Money held by a cousin, an uncle, or a family friend is treated as not clearly available and is a common reason for refusal.\n\n## Can I use money that arrived recently if it is genuine?\n\nYou can, but you have to prove it. A recent large deposit is not automatically fatal. If it came from a documented property sale, a matured fixed deposit, or a disbursed loan, show that trail in full. What sinks applications is a recent deposit with no explanation, because a case officer cannot tell genuine funds from money borrowed to pass the assessment.",
    sources: [
      "https://www.rbi.org.in/scripts/FAQView.aspx?Id=115",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://noc.moest.gov.np/",
    ],
  },
  {
    slug: "first-month-in-australia-international-student-checklist",
    title: "Your first month in Australia: a setup checklist",
    category: "country-guide",
    country: "AU",
    excerpt:
      "The admin that has to happen in the first few weeks: tax file number, bank account, SIM, health cover, address notification, transport, and knowing your work rights.",
    content:
      "The first few weeks in Australia are mostly paperwork. Get these done in order and the rest of the semester runs smoothly. Most of it is free.\n\n## At the airport\n\n- Fill in the Incoming Passenger Card handed out on the plane. Declare all food, plant material, wooden items and medicines. Australia's biosecurity rules are strict and undeclared food can mean a fine. If in doubt, declare it and let an officer decide.\n- Keep your passport, your Confirmation of Enrolment, and your [OSHC](/guides/oshc-health-cover-for-international-students) policy details in your hand luggage, not the hold.\n\n## Week 1: the essentials\n\n### Tax file number\n\nApply for a Tax File Number (TFN) online through the Australian Taxation Office once you have an Australian address. It is free. You need to be in Australia, hold a visa with work rights, and give an Australian postal address. The ATO posts the TFN letter to that address within about 28 days.\n\nYou do not need the TFN to start work, but you must give it to your employer within 28 days of starting or they withhold tax at the top rate, currently 47 percent, instead of the normal rate.\n\n### Bank account\n\nYou can usually open an account with one of the big four banks, Commonwealth Bank, Westpac, ANZ or NAB, online before you arrive, then walk into a branch with your passport to activate it. Bring proof of address once you have one. Digital banks and credit unions are alternatives, often with lower fees. Ask about student accounts with no monthly fee.\n\n### Mobile SIM\n\nBuy a prepaid SIM at the airport or a supermarket to get started, then switch to a longer plan once you have a bank account and address. Telstra has the widest regional coverage, Optus and Vodafone are cheaper in the cities, and several smaller providers resell the same networks for less.\n\n### Tell your university your address\n\nStudent visa condition 8533 requires you to give your education provider your residential address within 7 days of arriving, and to tell them within 7 days if you move. This is done through the student portal, not with immigration directly. Missing it is a visa breach.\n\n## Weeks 1 to 2: enrolment and health\n\n### Enrol and get your student ID\n\nComplete course enrolment, pick your timetable, activate your student card and go to orientation. Your card is also your library and building access and, in some states, links to a transport card.\n\n### Health cover: OSHC and Medicare\n\nMost international students are not eligible for Medicare and rely on OSHC for the whole visa. See the [OSHC guide](/guides/oshc-health-cover-for-international-students) for what it covers and the trap of letting it lapse.\n\nStudents from a country with a Reciprocal Health Care Agreement can also enrol in Medicare. On a student visa this currently applies to the United Kingdom, Sweden, the Netherlands, Belgium, Slovenia, Italy and New Zealand. Students from Norway, Finland, Malta and the Republic of Ireland are not covered on a student visa. Enrolling in Medicare does not by itself remove the OSHC condition on your visa, so keep your OSHC unless Home Affairs has confirmed you are exempt, which applies only to a few nationalities whose national schemes are recognised.\n\nTo use OSHC: register with your insurer's app, then either see a bulk-billing GP who bills the insurer directly, or pay upfront and claim the rebate back. Your insurer's website lists clinics that direct-bill.\n\n## Weeks 2 to 4: settling in\n\n### Accommodation\n\n| Option | Typical setup |\n| --- | --- |\n| University or private student accommodation | Bills included, furnished, no long lease, higher weekly cost |\n| Share house | Cheapest per person, you need a bond and references, inspect before paying |\n| Homestay | Room plus some meals with a local family, arranged through the university, good for the first few months |\n\nA rental bond is usually four weeks' rent, lodged with a state authority and refundable at the end. Never pay a bond or rent for a place you have not seen in person or on a verified video call. Advance-fee rental scams target new arrivals. Use temporary accommodation for your first week or two and view share houses once you are on the ground. The [cost of living pages](/cost-of-living) show what a room costs in [Sydney](/cost-of-living/sydney), [Melbourne](/cost-of-living/melbourne) and other cities, and the [real cost guide](/guides/real-cost-of-studying-in-australia) covers the rest.\n\n### Transport\n\nGet the local smartcard: Opal in Sydney, Myki in Melbourne, go card in Brisbane, and so on. Transport concessions for international students are limited and vary by state. In New South Wales most international students pay the full adult fare unless they hold a specific Australian Government scholarship. Victoria offers a discounted international student travel pass rather than a standard concession. Check your state's transport authority and your university's student services.\n\n### If you work: super and your rights\n\nWhen you work, your employer pays superannuation on top of your wage into a retirement fund, at 12 percent as of the 2025-26 year. As a temporary resident you can claim most of it back when you leave Australia for good, minus a departure tax.\n\nYour student visa caps paid work at 48 hours per fortnight while your course is in session, with no limit during scheduled breaks. Volunteering and genuinely unpaid work do not count. See [working while you study](/guides/working-while-you-study-in-australia).\n\n## The first-month checklist\n\n| Timing | Task |\n| --- | --- |\n| Before you fly | Start a bank account application online, book a week of temporary accommodation, pack a travel adaptor |\n| Day 1 to 2 | Declare goods at the airport, get a prepaid SIM, activate your bank account in branch |\n| Within 7 days | Give your university your residential address (condition 8533) |\n| Week 1 | Apply for a TFN, enrol and collect your student ID, attend orientation |\n| Week 1 to 2 | Register with your OSHC insurer, enrol in Medicare if your country has an agreement, find a bulk-billing GP |\n| Week 2 to 4 | View and secure a share house, pay the bond through the state scheme, get your transport smartcard |\n| Before your first shift | Give your employer your TFN and super fund details, check you are inside the 48-hour fortnight cap |\n\n## Do I need a TFN before I can start working?\n\nNo. You can start a job without one, but you must give your employer a TFN within 28 days or they withhold tax at 47 percent. Apply as soon as you have an Australian address so the letter arrives in time. The extra tax is refundable when you lodge a return, but that can be months away.\n\n## Can I get a student transport concession as an international student?\n\nIn most states, no. New South Wales limits concessions to domestic students and a few scholarship categories, so international students pay adult fares. Victoria and some other states offer a discounted international student pass, which is not the same as a full concession. Check your state transport authority for the current rule.",
    sources: [
      "https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn",
      "https://www.servicesaustralia.gov.au/reciprocal-health-care-agreements",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
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
      "For skilled migration, \"regional Australia\" means everywhere except Greater Sydney, Greater Melbourne, and Greater Brisbane. That is a wide net that includes several state capitals.\n\n## The two categories of regional area\n\nHome Affairs splits regional Australia into two groups, and the distinction affects graduate visa length and processing priority.\n\n| Category | Areas | What it gives you |\n| --- | --- | --- |\n| Category 2: Cities and major regional centres | Perth, Adelaide, Gold Coast, Sunshine Coast, Canberra, Newcastle and Lake Macquarie, Wollongong and the Illawarra, Geelong, Hobart | A 1-year extension on the [485](/visas/temporary-graduate-485), regional [points](/guides/how-the-australian-points-test-works), 491 access |\n| Category 3: Rest of regional Australia | Every other regional city and town, for example Toowoomba, Cairns, Townsville, Ballarat, Bendigo, Launceston, Darwin, Wagga Wagga | A 2-year 485 extension, priority visa processing, larger state nomination allocations |\n\nAll of these count as regional. The difference is that the smaller and more remote the area, the stronger the incentives the government attaches to it.\n\n## What you gain by studying regionally\n\n- **5 points** for study in a regional area, on top of the 5 for meeting the [Australian study requirement](/guides/cricos-and-course-accreditation-explained).\n- Access to the [491](/visas/skilled-work-regional-491), which carries a 15-point nomination bonus, broader occupation lists, and lower cut-offs than the [189](/visas/skilled-independent-189).\n- State and territory nomination criteria that are usually easier to meet outside the big three cities, and which reserve places for local graduates.\n- The extra 485 year or two shown in the table above.\n- Lower living costs. Adelaide and Perth run well below Sydney and Melbourne. See the [cost of living pages](/cost-of-living) for a breakdown.\n\n## Worked example: the regional points swing\n\nTwo students take the same Master of IT. One studies in Melbourne, one in Adelaide, both get a 190 nomination from their state.\n\n| Factor | Melbourne | Adelaide |\n| --- | --- | --- |\n| Australian study requirement | 5 | 5 |\n| Regional study | 0 | 5 |\n| Base score before nomination | 70 | 75 |\n| With 190 nomination | 75 | 80 |\n| If Adelaide student takes a 491 instead | | 90 |\n\nThe Adelaide student is 5 points ahead on the same profile, or 15 ahead if they use the 491.\n\n## What you trade\n\nSmaller job markets in the Category 3 towns, fewer large-employer graduate programs, and smaller communities from your home country. Perth, Adelaide, and Canberra have none of these problems, with universities, airports, hospitals, and established migrant communities. A town of 30,000 is a different proposition and worth visiting before you commit.\n\n## A sensible approach\n\nMany people study in Adelaide, Perth, or Canberra to get the regional points with a normal city job market, work there on the 485, and then decide whether to chase a [491](/visas/skilled-work-regional-491) that converts to permanent residence through the [191](/visas/permanent-residence-skilled-regional-191), or aim straight for a [190](/visas/skilled-nominated-190). Where you studied earns the points; it does not lock you into staying in that exact town forever, though the 491 and 191 do require you to keep living and working regionally until you convert to permanent residence.\n\n## If I transfer to a regional university after a semester in a big city, do I still get the regional points?\n\nUsually not. The 5 points for regional study require that all of the study counting toward your [Australian study requirement](/guides/cricos-and-course-accreditation-explained) was completed while you were living and studying in a regional area. If you spend a semester in Sydney, Melbourne or Brisbane and then transfer to a regional campus, that metropolitan study generally disqualifies you from the regional points, even if the rest of the degree was regional. Distance and online study also do not count toward the regional points. If regional points are part of your plan, start regional, and if you have already split your study, get advice on your exact timeline before you assume either way.",
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
      "Student visa work rights, the fortnightly cap (not the old 20 hours a week), tax file numbers, and what counts against the limit.",
    content: `[Student visa](/visas/student-500) holders can work, within a cap. The current limit is 48 hours per fortnight while your course is running.

If you have read that the limit is 20 hours a week, that figure is out of date. The old rule was 40 hours per fortnight, usually described as "20 hours a week". It was suspended during the pandemic, then reinstated at a higher permanent level of 48 hours per fortnight from 1 July 2023. Advice and forum posts still quoting 20 or 40 hours are describing the pre-2023 rule.

## The 48-hour fortnight rule

Condition 8105 limits you to 48 hours of work in any fortnight while your course is in session. Three details trip people up:

- A **fortnight** is a fixed, rolling 14-day period that the department defines, starting on a Monday. It is not "any 14 consecutive days you choose", and it is not a monthly figure averaged out. You cannot work 20 hours one fortnight and 76 the next.
- **Before your course starts** you have no work rights on a student visa. Your work rights begin when the course does.
- During **scheduled course breaks**, such as semester holidays and the summer break, there is no limit at all. You can work full time.

## What counts and what does not

| Counts toward the 48 hours | Does not count |
| --- | --- |
| Paid employment, casual or ongoing | Scheduled course breaks (unlimited) |
| Paid internships and paid placements | Unpaid work that is a formal, assessed part of your course |
| Paid work in a family business | Genuine unpaid volunteer work for a non-profit |
| Online or remote work for any employer, in Australia or overseas | Work by masters by research and PhD students, once the course has started |

## Getting set up to work

1. **Tax File Number (TFN).** Apply free through the ATO website once you arrive, using your passport and visa. Without a TFN your employer must withhold tax at the top rate.
2. **Minimum wage.** The national minimum is AUD 26.44 an hour before tax from 1 July 2026, and it rises every 1 July. Many awards pay more, and casual employees get a loading of around 25 percent on top.
3. **Superannuation.** Your employer pays super on top of your wage, currently 12 percent. You can claim most of it back as a Departing Australia Superannuation Payment when you leave the country permanently.
4. **The tax-free threshold.** As a resident for tax purposes you pay no income tax on the first AUD 18,200 you earn in a year. Most students working part time within the cap fall near or below this and get much of their withheld tax back at tax time.

## Why the cap is enforced, and what a breach costs

Exceeding 48 hours a fortnight breaches condition 8105. The department can cancel a student visa for a condition breach, and a cancellation can carry an exclusion period of up to three years on further temporary visas. Even where the visa is not cancelled, the breach surfaces later: when you apply for a [485 graduate visa](/visas/temporary-graduate-485) or a skilled visa, your tax and superannuation records show exactly how many hours you worked and when. A history of over-cap work is a real risk to the graduate visa that the whole [study-to-permanent-residence pathway](/guides/study-to-permanent-residence-pathway-australia) runs through.

Employers who roster international students over the limit are also breaking the law, but in practice the visa consequence lands on the student, not the business. If an employer pressures you to work more, that is a reason to change jobs, not to breach the condition.

## After you graduate

Once you move to a [485 Temporary Graduate visa](/visas/temporary-graduate-485) the cap is gone. You have full work rights for the two to three years of that visa, which is the point of it: the window to build the skilled experience your [points score](/guides/how-the-australian-points-test-works) and [skills assessment](/guides/getting-a-skills-assessment-in-australia) both need.

## Is the student visa work limit 20 hours or 48 hours?

It is 48 hours per fortnight while your course is in session, and unlimited during scheduled course breaks. The "20 hours a week" figure people still quote was the old 40-hour-per-fortnight rule, replaced on 1 July 2023.

## What happens if I work more than 48 hours in a fortnight?

You breach condition 8105. The department can cancel your student visa, and a cancellation can trigger an exclusion period of up to three years from further temporary visas. Extra hours also appear in your tax and super records, so they can be raised against a later graduate or skilled visa application even if your student visa was never cancelled.

## Can I work full time during semester breaks?

Yes. During scheduled course breaks there is no hour limit. The 48-hour cap only applies while your course is in session, including during exam periods.

## Does volunteer work or an unpaid internship count toward the 48 hours?

Genuine unpaid volunteer work for a non-profit does not count. Neither does unpaid work that is a formal, assessed requirement of your course. Paid internships and paid placements do count.

## Does remote work for an overseas employer count?

Yes. Any paid work counts toward the 48 hours, regardless of where the employer is based or whether the work is done online.`,
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/work-conditions-for-student-visa-holders",
      "https://www.studyaustralia.gov.au/en/plan-your-move/your-guide-to-visas/student-visa-subclass-500",
    ],
  },
  {
    slug: "study-gaps-and-the-australian-student-visa",
    title: "Study gaps and the Australian student visa",
    category: "country-guide",
    country: "AU",
    excerpt:
      "There is no maximum study gap for an Australian student visa. What decides the outcome is how well you document the gap and whether the course still makes sense for you. Here is how the Genuine Student assessment treats it.",
    content: `A lot of advice online quotes firm limits: two years for an undergraduate course, five for a postgraduate one, ten if you have work experience. Those numbers are agent conventions and, in some cases, individual university admission preferences. They are not visa rules. The Department of Home Affairs sets no maximum study gap for the [subclass 500](/visas/student-500), and the Genuine Student criterion it uses to assess applications does not mention one.

What actually happens is that your gap is one of several things a case officer weighs. A well-documented five-year gap is stronger than a vague one-year gap.

## Two separate gates

- **University admission.** Each provider sets its own view. Some want recent study for direct entry, some accept long gaps if you have relevant work, some do not ask at all. This is a question for the admissions team, not immigration.
- **The visa.** Assessed under the Genuine Student requirement. Here the gap matters only through the questions the officer is already asking: are your circumstances genuine, does the course fit your background, and will it improve your prospects.

## What the officer is looking for

Home Affairs asks applicants to provide evidence of employment or business activities for the 12 months before lodging an application. That is the clearest signal in the policy: the period right before you apply is the one you most need to account for. It also weighs whether the course is consistent with your current level of education and whether it will help your employment prospects back home.

So a gap raises questions in two ways. If you cannot show what you were doing, it looks like the study plan is a cover for something else. If the course does not build on your history, a long gap makes the jump look even less genuine.

## Explanations that work, and the evidence for each

| Reason for the gap | Evidence to attach |
| --- | --- |
| Full-time work | Employer letter with role and dates, payslips, tax records, a named contact |
| Running a business | Business registration, tax filings, bank statements |
| Family or caring responsibilities | A written explanation plus supporting documents |
| Health | Medical certificates covering the period |
| Saving for the course | Bank statements showing the build-up, plus what you were doing to earn |
| An earlier visa refusal | Address the exact reason on that decision, do not hide it. See [what to do if your student visa is refused](/guides/what-to-do-if-your-student-visa-is-refused) |
| Military service | Discharge or service documents |

Work experience is the strongest of these, because it doubles as the reason the course makes sense now: you have done the job, and the qualification formalises it.

## What makes a gap riskier

- A long gap plus a course that does not connect to your study or work history
- Weak ties to your home country, meaning no job to return to, no family, no assets
- A first application, minimum English, and a high-refusal passport in the same profile. Refusal rates by nationality are covered in [this post](/blog/student-visa-refusal-rate-20-year-high-2026)

Longer gaps do not fail on length. They fail when the documentation is thin or the course choice does not add up.

## How to put it in the Genuine Student answers

The form gives you four capped responses. Use the current circumstances answer to state plainly what you did during the gap, with the employer or activity named. Use the why this course answer to connect that period to the course: what you learned, what you could not progress without the qualification, what role you are aiming for afterward. Specific beats general every time. The [Genuine Student statement guide](/guides/genuine-student-requirement-how-to-write-your-statement) covers the full structure, and [the Genuine Student test explained](/blog/genuine-student-test-explained) covers how the assessment changed in 2024.

## If permanent residence is part of the plan

A gap costs you time you may need later. The [subclass 485 graduate visa](/visas/temporary-graduate-485) has an age-35 cap for most applicants, and the [skilled points test](/guides/how-the-australian-points-test-works) pays the most points between ages 25 and 32. If you are in your early thirties with a gap behind you, map the [study to permanent residence pathway](/guides/study-to-permanent-residence-pathway-australia) before you enrol, because the runway is shorter than it looks.

## Is there a maximum study gap for an Australian student visa?

No. Neither the Migration Regulations nor the Genuine Student policy sets a limit. The figures you see online, such as two years for undergraduate or five for postgraduate study, are guidance from agents and individual universities, not visa rules.

## Will a study gap get my student visa refused?

Not on its own. A gap that is clearly documented, with a course that fits your background and prospects, is routinely approved. A gap becomes a problem when you cannot evidence what you were doing, or the course does not connect to your history.

## How do I explain a study gap in the Genuine Student answers?

Name what you did and attach proof: an employer letter and payslips for work, registration and tax records for a business, medical certificates for health. Then link that period to the course in your why this course answer. Keep each response inside the 150-word limit.

## Does a study gap affect permanent residence later?

Indirectly. The gap itself is not counted against a skilled visa, but it uses up time. The 485 graduate visa is capped at age 35 for most applicants, and age points on the skilled test fall after 32, so a longer gap leaves you less room to reach a competitive score.`,
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
    ],
  },
  {
    slug: "which-australian-courses-lead-to-permanent-residence",
    title: "Which Australian courses actually lead to permanent residence",
    category: "country-guide",
    country: "AU",
    excerpt:
      "Not every degree creates a migration pathway. What matters is the occupation your course maps to, whether an assessing authority will assess it, and whether it gets invited. Here is the field-by-field picture using the most recent invitation round.",
    content: `Plenty of people enrol in an Australian course "for PR" without checking whether the course leads anywhere. The [study to permanent residence pathway](/guides/study-to-permanent-residence-pathway-australia) has a fixed shape: finish a qualification, move to a [485 graduate visa](/visas/temporary-graduate-485), get a [skills assessment](/guides/getting-a-skills-assessment-in-australia), build a [points score](/guides/how-the-australian-points-test-works), and get invited to a skilled visa. Your course choice decides whether the last two steps are realistic.

## The test your course has to pass

The [subclass 189](/visas/skilled-independent-189) points-tested stream requires an occupation on a current skilled list, a suitable skills assessment, an invitation, and a passing points score. Three things have to line up:

1. The course maps to an occupation on a current skilled list.
2. An assessing authority will assess that occupation, sometimes only after a period of post-qualification work.
3. The occupation actually gets invited at a score you can reach.

Most course choices fail on the third point. An occupation can sit on the list for years and receive no invitations, because far more high-scoring people are in the pool than there are places.

## What the most recent round actually invited

In the 4 June 2026 subclass 189 round, 10,000 invitations went out. The minimum score invited, by occupation group:

| Occupation group | Minimum score invited, 4 June 2026 |
| --- | --- |
| Construction trades: carpenter, electrician, plumber, bricklayer, tiler, plasterer, glazier | 65 |
| Metal and automotive trades: fitter, welder, metal fabricator, automotive electrician, refrigeration mechanic | 80 to 85 |
| Registered nurses and midwives | 75 to 80 |
| Secondary and special needs teachers | 75 to 85 |
| Allied health: physiotherapy, occupational therapy, social work, speech pathology, radiography, medical laboratory science | 75 to 85 |
| Electronics and telecommunications engineers | 95 |
| Accountants, auditors, software and ICT roles, civil, mechanical and electrical engineers | Not invited in this round |

That last row is the important one. Accounting, mainstream IT, and the big engineering disciplines received no 189 invitations at all in the June 2026 round. In earlier rounds they were invited, but only in the 90 to 100 range. Either way, a fresh graduate does not reach them through the 189.

A graduate with a [485](/visas/temporary-graduate-485), a year of local work, good English and no partner points usually scores 70 to 85.

## Field by field

**Nursing.** Maps to Registered Nurse. The program must be ANMAC accredited, and registration sets one of the highest English bars of any field, around IELTS 7 or OET B in every component. Invited at 75 to 80, so a normal graduate profile clears it. One of the clearest routes. See [nursing and health universities](/best/best-australian-universities-for-nursing-and-health-sciences).

**Teaching.** Secondary school teachers and special needs teachers were invited at 75, and special education teachers at 85. Programs need AITSL-aligned accreditation and the same high English bar as nursing.

**Trades.** Construction trades clear at 65. The catch is the skills assessment: a Certificate III on its own is not enough. Trades Recognition Australia wants evidence of hands-on experience, usually through an Australian apprenticeship or the Job Ready Program. Plan the work component, not just the enrolment. Metal and automotive trades were invited higher, at 80 to 85, in the June round.

**Engineering.** Civil, mechanical and electrical engineering map to occupations assessed by Engineers Australia, but they received no 189 invitations in June 2026 and needed around 90 in the rounds before that. Electronics and telecommunications engineering were invited, at 95. For most engineering graduates the realistic route is [state nomination](/visas/skilled-nominated-190), a [regional](/visas/skilled-work-regional-491) location, or stacking extra points through regional study, a Professional Year and partner points. See [engineering universities](/best/best-australian-universities-for-engineering) and the [regional universities list](/best/regional-australian-universities-for-skilled-migration).

**IT and computer science.** Maps to software and applications programmers and ICT analysts, assessed by the ACS, which requires relevant work after graduation before it will assess. These are among the most oversubscribed occupations and were not invited in the June 2026 189 round. A graduate's realistic route is [state nomination](/visas/skilled-nominated-190) or [regional](/visas/skilled-work-regional-491). See [computer science](/best/best-australian-universities-for-computer-science) and [information technology](/best/best-australian-universities-for-information-technology) universities.

**Accounting.** A Master of Professional Accounting accredited by CPA Australia, CA ANZ or the IPA makes you eligible for the Accountant assessment. Same problem as IT: heavily oversubscribed, no 189 invitations in June 2026, state nomination is the practical path. A generic Master of Commerce or finance degree does not carry the accreditation and does not map to Accountant.

**Other allied health.** Physiotherapy, occupational therapy, medical laboratory science, medical imaging, and social work are accredited, on the lists, and were invited at 75 to 85. Solid, though usually harder or longer to enter than nursing.

## Courses that do not create a pathway on their own

A general MBA, a Master of Business, Commerce or Management, and most marketing, human resources, project management and international business degrees do not lead to PR by themselves. The occupations they relate to are either off the 189 list, on the short-term list that only feeds the [190 and 491](/visas/skilled-nominated-190), or need years of specific work experience the degree does not provide. They are career investments, not migration pathways, and only form part of a PR plan if you already qualify for an occupation through earlier study or work. The same applies to most arts, humanities and generalist science degrees at bachelor level.

## How to choose

1. Pick the target occupation first. Check it is on a current skilled list and note the assessing authority.
2. Check recent invitation results for that occupation on the [invitation rounds page](/visas/invitation-rounds), and run your likely profile through the [points calculator](/visas/points-calculator).
3. If the occupation is oversubscribed, plan around [state nomination or a regional area](/best/regional-australian-universities-for-skilled-migration) from the start.
4. Only then pick a [CRICOS registered course](/guides/cricos-and-course-accreditation-explained) that satisfies that authority and meets the two year Australian study requirement.

## Does an MBA help with PR in Australia?

Not directly. There is no MBA occupation on the skilled lists, and the management occupations an MBA relates to generally need substantial relevant work experience rather than a qualification alone. An MBA can strengthen a case built on an occupation you already qualify for, but it does not create a pathway from an unrelated background.

## Which course has the best PR chances?

Judged by invitation results, accredited nursing and teaching programs, and construction trades with a genuine work component, are the most reliable, because they are invited close to the 65 point floor or in the mid 70s. Engineering, IT and accounting all lead to PR but need state nomination or a regional strategy for a fresh graduate.

## Is IT still a good PR pathway in Australia?

It is still a pathway, but not through the [189](/visas/skilled-independent-189) for a new graduate. ICT occupations were not invited in the June 2026 189 round and needed scores in the 90s before that. Plan around [state nomination](/visas/skilled-nominated-190) or a [regional](/visas/skilled-work-regional-491) location, both of which run off their own occupation lists with lower effective cut-offs.

## Do I need to study a two year course?

For the [485 graduate visa](/visas/temporary-graduate-485) you must meet the Australian study requirement, which is at least two academic years of study in Australia. A single one year masters does not meet it on its own, though two one year qualifications can combine.`,
    sources: [
      "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-tested",
    ],
  },
  {
    slug: "studying-in-australia-without-ielts",
    title: "Studying in Australia without IELTS: what actually works",
    category: "country-guide",
    country: "AU",
    excerpt:
      "You cannot skip the English requirement, but IELTS is not the only way to meet it. The routes that work: another approved test, the passport and prior-study exemptions, a university medium of instruction waiver, and packaging an English course.",
    content: `"Studying in Australia without IELTS" almost never means without any English requirement. It means one of four things: a different test, a visa exemption, a university waiver, or a packaged English course. Which one applies to you depends on your passport, your previous study, and the university you are applying to.

## Two gates, set separately

- **The [student visa (subclass 500)](/visas/student-500)** has its own English requirement in the Migration Regulations. You meet it with an approved test score, a listed exemption, or by packaging an English course with your degree.
- **Your university** sets its own English entry level on your offer letter. This is where medium of instruction waivers live.

Clearing one gate does not clear the other. You can meet a university's requirement through a waiver and still owe the visa a test result, and the reverse also happens.

## Route 1: take a different test

IELTS is one of several tests the Department of Home Affairs accepts. Following the August 2025 update the list also includes PTE Academic, TOEFL iBT, Cambridge C1 Advanced, OET for health courses, LanguageCert Academic, and others. Most students who say they are avoiding IELTS simply sit [PTE instead](/guides/ielts-vs-pte-for-australian-university-admission), which is computer marked and often faster to book and to get a result.

Two catches. Fully online or at home versions such as IELTS Online, TOEFL iBT Home Edition and OET@Home are not accepted for the visa. And from 21 January 2026, TOEFL iBT candidates must select "Taking TOEFL for Australia" when they register, or the result is not valid for a visa.

## Route 2: the visa exemptions

You do not need to provide any English test score with your student visa application if one of these applies:

- You are a citizen and hold a passport from the UK, USA, Canada, New Zealand, or the Republic of Ireland.
- You have completed at least five years of study, taught in English, in Australia, the UK, USA, Canada, New Zealand, South Africa, or the Republic of Ireland.
- In the two years before applying, while you held a student visa, you completed an Australian Senior Secondary Certificate of Education in English, or a substantial part of a course at Certificate IV level or higher.
- Your principal course is a standalone ELICOS course, a registered school course, a registered postgraduate research course, or a course delivered in a language other than English.
- You are a Foreign Affairs or Defence sponsored student, or a secondary exchange student.

The full list is in the Migration (English Language Tests and Evidence Exemptions for Subclass 500 (Student) Visas) Instrument 2025.

Note what is not on this list. A bachelor's degree taught in English in India, Nepal, the Philippines, Nigeria, or anywhere outside those seven countries does not, by itself, exempt you at the visa level. That kind of medium of instruction evidence is a university admission tool, not a visa exemption.

## Route 3: the university's medium of instruction waiver

Many Australian universities will waive their own English test requirement if your previous qualification was taught and assessed entirely in English. What they accept varies widely:

- Some accept a degree from any recognised English medium institution.
- Some only accept it from specified countries, or only if the degree was completed recently, often within two to five years.
- Some require a formal medium of instruction letter from your previous institution.
- Some run their own internal English test instead of accepting a waiver.

This waiver removes the university's requirement only. To satisfy the visa you still need a listed exemption or an approved test score. Confirm both with the admissions team before you assume you are clear.

## Route 4: package an English course

If your English is below the direct entry level, you can be admitted with an ELICOS course before your main degree, on a single student visa. This is course packaging. The ELICOS course brings your English up, issues the internal result the university needs, and lowers the test score the visa requires.

As a guide, since the 2024 increase the student visa needs around IELTS 6.0 overall for direct entry, or roughly 5.0 to 5.5 if you package an ELICOS course, with the exact figure depending on the length of the ELICOS course. Check the current figure before you rely on it, because these were raised once already. If you do sit a test, [these universities accept IELTS 6.0 or PTE 50](/best/australian-universities-accepting-ielts-6-0-for-international-students) for general entry. The trade off with an ELICOS course is cost and time: a term of ELICOS is a real expense and adds months before your degree starts.

## The Genuine Student angle

Weak English alongside a demanding degree taught in English is something a case officer notices. If you are getting in on a low score or a borderline waiver, your [Genuine Student answers](/guides/genuine-student-requirement-how-to-write-your-statement) and your course choice need to be strong enough that the application does not look like a stretch. This matters more now that [refusal rates are high](/blog/student-visa-refusal-rate-20-year-high-2026).

## How to work out your route

1. Check the visa exemptions first. If your passport or prior study covers you, you may need no test at all.
2. If not, choose between an approved test, where PTE is the usual IELTS alternative, and packaging an ELICOS course.
3. Separately, ask the university whether it grants a medium of instruction waiver and on what terms.
4. Do not assume that clearing one gate clears the other.

## Can I get an Australian student visa without IELTS?

Yes, but not without meeting the English requirement another way. You can use an approved test such as PTE Academic or TOEFL iBT, qualify for a visa exemption such as a UK, US, Canadian, New Zealand or Irish passport or five years of study in English in one of a short list of countries, or package an ELICOS English course with your degree.

## Does an English-medium bachelor's degree exempt me from the student visa English requirement?

Not on its own, unless the study was done in Australia, the UK, USA, Canada, New Zealand, South Africa, or the Republic of Ireland. A degree taught in English elsewhere can support a university medium of instruction waiver, but the visa has its own separate exemption list.

## Which universities in Australia accept students without IELTS?

Many will waive their own English test for applicants with an English medium qualification, but the terms differ by university and often by your country and how recent the degree is. Check directly with the admissions team, and confirm separately how you will meet the visa requirement.

## Is PTE easier than IELTS for an Australian student visa?

Neither is easier in itself. PTE is computer marked with faster results and no human interviewer, which some people prefer. Home Affairs and the universities accept both. See the [IELTS vs PTE guide](/guides/ielts-vs-pte-for-australian-university-admission).`,
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/en/plan-your-move/your-guide-to-visas/student-visa-subclass-500",
      "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/competent-english",
    ],
  },
  {
    slug: "bringing-family-on-an-australian-student-visa",
    title: "Bringing your partner and children on an Australian student visa",
    category: "country-guide",
    country: "AU",
    excerpt:
      "A partner and children under 18 can be added to a student visa, but the money you must show goes up, your partner's work rights depend on your course level, and you have to declare family before you lodge even if they stay home.",
    content: `You can include your partner and dependent children on a [student visa (subclass 500)](/visas/student-500), either in your application or as subsequent entrants later. Three things decide whether it is worth doing: the extra money you must show, your partner's work rights, and school costs for children.

## Who counts as family

- Your partner: a spouse, or a de facto or same-sex partner. A de facto relationship generally has to have existed for at least 12 months before you apply, unless it is registered with an Australian state or territory or there are compelling circumstances.
- Your, or your partner's, dependent child who is unmarried and under 18 at the time your visa is decided. A child who turns 18 before the decision must apply for their own visa.

Everyone included must meet the health and character requirements, and your partner must also satisfy the case officer that they are a genuine entrant.

## Declare them before you lodge, even if they stay home

This is the trap that cannot be undone. You must list every family member in your student visa application, even the ones who will not travel with you. If you leave a partner or child off the application, they can never get a student visa to join you later. If you are not sure whether your partner will come, declare them anyway.

If someone becomes your family member after you lodge but before the decision, tell Home Affairs straight away. Family members who were declared can later apply on their own as subsequent entrants through ImmiAccount.

## The money goes up

The financial capacity figure you show is per person. On top of the primary applicant's 12-month living cost of around A$29,710, you add:

| Family member | 12-month amount |
| --- | --- |
| Partner | A$10,394 |
| Each dependent child | A$4,449 |
| School costs, per school-age child | around A$13,502 |

Plus first-year tuition, travel for each person, and a visa application charge for each family member. See [proving your funds](/guides/proving-funds-for-an-australian-student-visa) for how the evidence is assessed. Bringing a partner and one school-age child roughly doubles the living-cost total you have to document.

There is also a second visa application charge for an adult family member who cannot show functional English, unless they provide evidence of it. It is a large fee, so check the current amount before you plan around it.

## Your partner's work rights depend on your course

Your partner works under condition 8104, which is not the same as your own 48-hour rule:

- If you are studying a **bachelor degree, a diploma, or a VET qualification**, your partner is capped at **48 hours per fortnight** while your course is in session, and cannot work at all until your course has started.
- If you are studying a **masters or a doctorate**, your partner generally has **unrestricted work rights**. The Home Affairs student visa page states this for a masters by research or a doctoral degree, and it is widely applied to coursework masters too. Because it is not spelled out the same way everywhere, check the exact condition on your partner's visa grant letter or in VEVO.

This is the single biggest reason the family maths changes between a bachelor and a masters. A partner on unrestricted work rights can realistically cover a large part of the household's living costs.

## Children and school

Dependent children of school age must be enrolled in school. In most states and territories, international student dependents pay full international school fees, which is why the financial requirement adds a separate school-cost figure. Rules and fee relief vary by state, so check with the education department where you plan to live. Children under five are not required to be in school; childcare and kindergarten are available but not free.

## The Genuine Student angle

Bringing family is normal and thousands of students do it every year, but it does add to what the case officer is weighing. They look at whether your finances genuinely cover everyone, whether the plan is consistent with temporary study, and whether your partner's circumstances make sense. Weak finances stretched across three or four people is a common reason a borderline application tips into a refusal, and [refusal rates are already high](/blog/student-visa-refusal-rate-20-year-high-2026), so the funds evidence for the whole family unit has to be solid. See [what to do if your student visa is refused](/guides/what-to-do-if-your-student-visa-is-refused).

## If permanent residence is the longer plan

A partner in Australia on a dependent visa builds local work experience and, if they hold a suitable qualification, can later be assessed for skilled migration in their own right, or contribute [partner points](/guides/how-the-australian-points-test-works) to your [skilled visa](/guides/study-to-permanent-residence-pathway-australia) if they meet the skill, age and English tests. Only one of you claims the partner points, and you cannot both be primary on the same application, so it is worth working out early which of you has the stronger occupation and profile.

## Can I bring my wife or husband on an Australian student visa?

Yes. A spouse, or a de facto or same-sex partner, can be included as a family member on a subclass 500 student visa, either in your application or later as a subsequent entrant. You must show additional funds of around A$10,394 for a partner and prove the relationship is genuine.

## Can my partner work full time on a student dependent visa?

It depends on your course. If you are studying a bachelor degree or lower, your partner is limited to 48 hours per fortnight. If you are studying a masters or doctorate, your partner generally has unrestricted work rights. Check your partner's visa grant letter for the exact condition.

## What happens if I did not declare my partner on my student visa application?

An undeclared family member cannot be granted a student visa to join you at any later stage. The only way to bring them is a different visa in their own right, if one fits. Always declare family members even if they will not travel with you.

## How much extra money do I need to bring my family on a student visa?

As a guide, around A$10,394 for a partner and A$4,449 for each child in living costs, plus roughly A$13,502 a year per school-age child in school fees, plus travel and a visa charge for each person. This is on top of your own living costs and tuition.

## Does my partner need to sit IELTS for a student dependent visa?

Not to meet an English entry standard the way you do. But an adult family member without functional English must either provide evidence of it or pay a second visa application charge before the visa is granted.`,
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://www.studyaustralia.gov.au/en/plan-your-move/bringing-your-family",
      "https://www.studyaustralia.gov.au/en/plan-your-move/your-guide-to-visas/student-visa-subclass-500",
    ],
  },
];

// ---------------------------------------------------------------------------
// Blog posts (dated, sourced). analysis: true adds the what-we-are-watching tag.
// ---------------------------------------------------------------------------
const posts = [
  {
    slug: "student-visa-refusal-rate-20-year-high-2026",
    title:
      "One in three university applicants refused: Australia's student visa squeeze",
    published_at: "2026-08-30",
    tags: ["visas", "australia", "student-visa"],
    excerpt:
      "In February 2026 the offshore refusal rate for higher education student visa applications reached 32.5 percent, the highest monthly level in about two decades. Here is what is driving it and how to lower your own risk.",
    content: `In February 2026 the refusal rate for offshore [Subclass 500](/visas/student-500) student visa applications tied to higher education reached 32.5 percent, according to Department of Home Affairs data. That is roughly one in three university applicants refused, and the highest monthly figure for the university cohort in about 20 years. For comparison, the rate sat near 10 to 12 percent through 2024 and around 20 percent in early 2025.

## The refusal rate is not the same everywhere

The published February 2026 figures for higher education, offshore, broke down by nationality like this:

| Country | Refusal rate |
| --- | --- |
| Nepal | 65% |
| Bangladesh | 51% |
| India | 40% |
| Sri Lanka | 38% |
| Bhutan | 36% |
| China | around 3% |

The gap is wide. A Chinese applicant and a Nepali applicant with otherwise similar profiles are not facing the same odds, because Home Affairs has tied the tighter scrutiny to what it calls "an increased focus on integrity and quality" in markets that grew fastest after borders reopened. Nepal, Bangladesh, India and Sri Lanka are those markets, and they are where refusals climbed most.

## What changed

Three things stacked up over about two years.

- **The Genuine Student requirement.** Since 23 March 2024 every Subclass 500 applicant answers a set of capped questions about their ties, course choice, and plans, and case officers run what the department calls a holistic assessment. A weak or templated set of answers can sink an application that looks fine on paper. We cover the format in [the Genuine Student test explained](/blog/genuine-student-test-explained) and how to write the answers in [this guide](/guides/genuine-student-requirement-how-to-write-your-statement).
- **Financial scrutiny.** The living cost figure a single applicant must show rose to A$29,710, and officers now look hard at whether the money is genuinely available, not just present. A lump sum that appears weeks before lodging, with no documented source, is one of the most common refusal reasons. See [proving your funds](/guides/proving-funds-for-an-australian-student-visa).
- **Provider prioritisation.** Ministerial Direction 111, replaced by Ministerial Direction 115 for applications lodged from 14 November 2025, sorts offshore student applications into processing tiers based on how close each education provider is to its allocation for the year. A Ministerial Direction is not a cap and does not decide grant or refusal, but applications to providers that are already near or over their allocation are processed last, which in a tightening environment is its own kind of pressure.

The application fee also [rose again in 2026](/blog/australia-student-visa-fee-increase-2026), which raises the cost of a refused attempt.

## What it does not mean

Your nationality is not a criterion. A higher refusal rate for a country reflects the average quality and risk profile of applications from that country in a given month, not a quota or a ban. A well-documented application with a coherent study plan and a clean funds trail still gets approved from Nepal, Bangladesh, or India. The country data tells you how much margin for error you have, which for those markets right now is very little.

## How to lower your own risk

- **Open the funds paper trail early.** A savings history takes months to build. Loans need a sanction letter from a recognised bank. Document the source of every large deposit.
- **Make the course choice make sense.** Officers look for a logical step from your past study or work. A sharp change of field needs an explanation in your Genuine Student answers, not silence.
- **Write the Genuine Student answers yourself.** Specific course units, a named target role back home, and real detail beat anything that reads like a template.
- **Check your provider's status.** For higher education, the department publishes each provider's prioritisation status. A university comfortably within its allocation is a faster, lower-friction path than one that is over.
- **If you have a prior refusal or a study gap**, treat the next application as a rebuttal of the exact reason on the last decision record. [What to do if your student visa is refused](/guides/what-to-do-if-your-student-visa-is-refused) walks through the offshore and onshore routes.

Country-specific document requirements are on our pages for [Nepal](/international/nepal), [India](/international/india), and [Bangladesh](/international/bangladesh). If cost is the pressure point, [the most affordable universities](/best/affordable-australian-universities-for-international-students) list is a starting point, though a cheaper course does not reduce the living cost figure you must show.

## Is my nationality counted against me in a student visa decision?

No. Citizenship is not a criterion for the Subclass 500. Published refusal rates by country are an outcome, the average of many individual decisions, driven by how well applications from that market meet the Genuine Student and financial requirements. A strong application is assessed on its own merits.

## Does my choice of university affect my visa chances?

Indirectly. The provider you name does not change the grant criteria, but under Ministerial Direction 115 it sets how quickly your offshore application is picked up. Providers near or over their yearly allocation sit in a lower processing tier. Provider reputation and past compliance also feed the department's broader risk assessment.

## Should I still apply to study in Australia?

Yes, if your case is genuine and well prepared. The tightening is aimed at weak and high-risk applications, and the approval rate for strong applications from any country is still high. Build the funds history, write real Genuine Student answers, and pick a course and provider that fit your background.`,
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-processing-times/visa-processing-priorities/student-visa",
      "https://www.sbs.com.au/news/article/australias-student-visa-crackdown-hits-record-highs/xi9s1oek9",
      "https://monitor.icef.com/2026/04/australia-student-visa-refusal-rates-reach-record-high-amid-weakening-demand-from-china/",
    ],
  },
  {
    slug: "genuine-student-test-explained",
    title:
      "What the Genuine Student Test Actually Asks (and How It's Different From the Old GTE Rule)",
    published_at: "2026-08-15",
    tags: ["visas", "australia", "applications"],
    excerpt:
      "Australia replaced the Genuine Temporary Entrant requirement with a Genuine Student test in 2024. Two years on, plenty of applicants are still confused about what actually changed.",
    content: `For any application lodged on or after 23 March 2024, Australian student visa applicants are assessed against a Genuine Student (GS) requirement rather than the older Genuine Temporary Entrant (GTE) test it replaced. It's still a common source of confusion for applicants researching visa requirements, since a lot of older guidance and forum advice online still references the GTE rule by name.

## The core shift: intent to study, not intent to leave

The old GTE requirement centered on proving you intended to return to your home country after your studies, which put applicants in the awkward position of having to argue against their own long-term ambitions if they hoped to eventually work or settle in Australia. The GS requirement drops that framing. It asks applicants to demonstrate that their primary purpose for the visa is genuine study, while explicitly acknowledging that a genuine student may reasonably pursue post-study work rights or a migration pathway afterward, as long as study remains the immediate, real goal of the visa.

## What the actual statement looks like

Rather than the single free-text GTE statement, applicants now answer four questions built into the form, each capped at 150 words (a fifth question applies to some applicants who have already held a student visa or are applying onshore from another visa). The four cover your current circumstances and ties to your home country, why you chose this course and this provider and how it fits your goals, how completing the course will benefit you, and any other context you want to add.

The word limit is worth taking seriously. Going over it, or writing vaguely to fill the space, tends to produce weaker responses than a tightly written answer that directly addresses what's being asked. Immigration case officers reviewing large volumes of applications respond better to specific, concrete answers than to broad statements of intent.

## Why this matters even if you think it doesn't apply to you

Some applicants assume the GS requirement is a formality that mainly affects borderline cases. In practice, every subclass 500 applicant is assessed against it, and a weak or generic GS statement can be flagged for further review even when the rest of an application, academic record, financial evidence, English test scores, is strong. Treating the four questions as a genuine writing task rather than a checkbox exercise is worth the extra time it takes.

## A practical note on getting help

If your personal circumstances are complex (a prior visa refusal, an unusual study gap, or a course choice that doesn't obviously build on your previous study history) it's reasonable to get help preparing a GS statement from a registered migration agent rather than relying on generic templates found online, since case officers are specifically trained to notice statements that read as templated rather than personal.`,
    sources: [
      "https://www.mondaq.com/australia/general-immigration/1450726/genuine-temporary-entrant-gte-student-visa-requirement-replaced-with-genuine-student-gs",
    ],
  },
  {
    slug: "australia-student-visa-fee-increase-2026",
    title:
      "Australia's Student Visa Fee Jumped 25 Percent on 1 July 2026. Here's What Changed",
    published_at: "2026-07-02",
    tags: ["visas", "australia", "fees"],
    excerpt:
      "The subclass 500 student visa application charge rose from AUD $2,000 to AUD $2,500, with a separate lower tier for ELICOS and non-award applicants.",
    content: `From 1 July 2026, the standard Student visa (subclass 500) application charge for the primary applicant rose from AUD $2,000 to AUD $2,500, a 25 percent increase. If you've already looked into applying to an Australian university this year, this is one of the first cost lines you'll hit, well before tuition, and it applies regardless of which university or course you're applying for.

## What actually changed

The increase applies strictly to applications lodged on or after 1 July 2026. If you submitted your visa application before that date, you're assessed under the previous $2,000 fee, even if a decision on your application is still pending. There's no retroactive charge for applications already in the system.

A separate, lower fee tier of AUD $2,050 was introduced specifically for standalone English Language Intensive Courses for Overseas Students (ELICOS) and non-award course applicants, meaning students applying for a pathway English course rather than a full degree program pay a smaller amount than degree-seeking applicants. Concessional rates continue to apply for applicants from Pacific nations and Timor-Leste.

## It's separate from your financial capacity requirement

This fee shouldn't be confused with the financial capacity requirement, the amount you need to demonstrate access to in order to prove you can support yourself while studying, which sits at AUD $29,710 annually as of this update. The visa application charge is a one-time payment made at the point of lodging your application; the financial capacity figure is evidence you provide, not a fee you pay directly to the Department of Home Affairs.

## Why this matters if you're comparing course offers

Application-stage costs like this one rarely show up on a university's own fee comparison pages, since visa charges are a government fee rather than a university one. If you're weighing offers from multiple Australian universities and building out a real total cost of attendance, this is a fixed cost that applies no matter which institution you choose, so it won't change your comparison between schools, but it does change the baseline number every applicant should be budgeting from before tuition is even added.

## What hasn't changed

The National Planning Level, the government's cap on new international student commencements, remains set at 295,000 for 2027, unchanged from the 2026 figure. The government has confirmed that no currently approved education provider will see its own allocation reduced heading into 2027, so most applicants shouldn't expect a meaningfully different admissions experience at the institutional level this cycle, even with the higher visa cost.`,
    sources: [
      "https://www.studyaustralia.gov.au/en/tools-and-resources/news/student-visa-application-charge-increase",
      "https://www.idp.com/australia/study-to-migrate/australian-visa-fee-increases/",
    ],
  },
  {
    slug: "ministerial-direction-119-skilled-visa-priorities",
    title: "Ministerial Direction 119: how skilled visa processing is now ranked",
    published_at: "2026-08-30",
    tags: ["visas", "australia", "skilled-migration"],
    excerpt:
      "Since 25 July 2026, Ministerial Direction 119 has set the order Home Affairs processes skilled visas in, ranking them by occupation and by whether you applied onshore or offshore.",
    content:
      "Since 25 July 2026, the Department of Home Affairs has processed skilled nomination and visa applications in the order set by Ministerial Direction 119. It replaced Ministerial Direction 105 in full, and it applies to every application already in the queue, not only those lodged after that date. For the first time the employer-sponsored [Skills in Demand visa](/visas/skills-in-demand-482) sits inside the priority framework.\n\n## The five priority tiers\n\nMD119 ranks applications on two things: the occupation nominated, and whether you were in or outside Australia on the day you applied.\n\n| Priority | Occupation | Location when you applied |\n| --- | --- | --- |\n| 1 | Law enforcement or defence interests | In Australia |\n| 2 | Law enforcement or defence interests | Outside Australia |\n| 3 | Construction, healthcare, or teaching | In Australia |\n| 4 | Any other skilled occupation | In Australia |\n| 5 | Any other skilled occupation | Outside Australia |\n\nThe department works through the higher tiers first. Two applicants with identical profiles can sit years apart in the queue if one applied onshore and the other offshore.\n\n## Which visas it covers\n\nMD119 covers the main skilled nomination and visa subclasses:\n\n- [Skills in Demand, subclass 482](/visas/skills-in-demand-482), including applications still on the older Temporary Skill Shortage rules\n- [Employer Nomination Scheme, subclass 186](/visas/employer-nomination-scheme-186)\n- [Skilled Independent, subclass 189](/visas/skilled-independent-189)\n- [Skilled Nominated, subclass 190](/visas/skilled-nominated-190)\n- [Skilled Work Regional, subclass 491](/visas/skilled-work-regional-491) and [Skilled Employer Sponsored Regional, subclass 494](/visas/skilled-employer-sponsored-regional-494)\n- [Permanent Residence (Skilled Regional), subclass 191](/visas/permanent-residence-skilled-regional-191)\n\nIt also names the closed subclasses 187, 489, 887, and 888, and the permanent Business Innovation and Investment visa.\n\n## What it does not change\n\nMD119 sets the order of processing and nothing else. It does not change eligibility, it does not touch the skilled occupation lists, and it does not shorten or guarantee any processing time. A top-tier application can still be refused. A [points-tested visa](/guides/how-the-australian-points-test-works) also still depends on an [invitation](/visas/invitation-rounds) and on places being left in the annual migration program.\n\n## The processing-time tool now asks for your application date\n\nAlongside the direction, the visa processing times guide on the Home Affairs site was updated on 4 August 2026. It now takes three inputs: visa type, visa stream, and your application date. It then shows where your application sits against the 50 percent and 90 percent marks for recently decided cases, and flags when you are already past the standard timeframe.\n\nAs a snapshot, on 30 August 2026 the tool put subclass 482 Core Skills at 50 percent of cases decided within 69 days and 90 percent within 10 months. Those figures move each month, so read the current number from the tool rather than quoting an old one.\n\nTwo limits are worth knowing. The estimate is still a single aggregate, not broken down by the five MD119 tiers or by onshore versus offshore. And it describes cases that have already been decided, so it lags the queue you are actually joining.\n\n## What it means if you are applying\n\n- Onshore beats offshore in the same occupation group. If you can lodge a [482](/visas/skills-in-demand-482) or [186](/visas/employer-nomination-scheme-186) while you are in Australia on a substantive visa, that alone lifts you a tier.\n- Construction, healthcare, and teaching occupations lodged onshore sit in tier 3, ahead of every other general skilled application.\n- An offshore application in a general occupation is now last in line, and the global estimate is likely to understate the wait.\n- A decision-ready application still matters. Priority controls when a case officer picks up your file, not how long they spend chasing missing documents.\n\nIf your route runs through study, the [student to permanent residence pathway](/guides/study-to-permanent-residence-pathway-australia) and the [quarterly 189 rounds](/blog/189-invitation-rounds-move-to-quarterly-2025-26) both still apply on top of this.\n\n## Does Ministerial Direction 119 apply to applications already lodged?\n\nYes. It applies to every skilled nomination and visa application on hand from 25 July 2026, not only new lodgements. An application that was mid-queue under the old direction was re-sorted into the new tiers.\n\n## Does a higher priority mean my visa is approved faster or guaranteed?\n\nNo. The direction only sets the order in which applications are allocated for assessment. It does not create a service standard, and it does not change the chance of approval or refusal.\n\n## Can I move to a better priority tier after I apply?\n\nNot really. Your location is fixed as at the date you applied, and your tier follows the occupation you nominated. Withdrawing and re-lodging onshore is the only way to change the location factor, and that carries its own cost and risk.",
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-processing-times/visa-processing-priorities/skilled-visa",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-processing-times/global-visa-processing-times",
    ],
  },
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
