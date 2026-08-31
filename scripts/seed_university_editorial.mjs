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

// Indicative single-student annual living cost by city (AUD). Anchored to the
// Home Affairs financial-capacity figure (~29,710) and adjusted for known
// cost-of-living differences between Australian cities. Approximate by design.
const LIVING_COST = {
  sydney: 33000,
  melbourne: 31000,
  canberra: 29000,
  brisbane: 28000,
  goldcoast: 28000,
  sunshinecoast: 27000,
  perth: 27000,
  adelaide: 26000,
  hobart: 26000,
  launceston: 25000,
  darwin: 27000,
  townsville: 25000,
  cairns: 25000,
  newcastle: 26000,
  wollongong: 26000,
  regional: 24000,
  national: 28000,
};

// slug -> { who: markdown, living: number, how?: markdown }
const E = {
  "adelaide-university": {
    living: LIVING_COST.adelaide,
    who: "Consider Adelaide University if you want a large, comprehensive institution in a city with noticeably lower living costs than Sydney or Melbourne. Formed in 2026 from the merger of two established universities, it now offers one of the broadest course catalogs in the country across health, engineering, business, and the creative arts. Adelaide also counts as a regional area for skilled migration, so studying here earns extra points toward the 491 and 190 visas.",
    intl: "Adelaide counts as a regional area for skilled migration, so study here earns 5 points toward the 190 and 491 and opens the 491 occupation lists, and South Australia runs nomination streams that favour local graduates. Adelaide University was formed on 1 January 2026 from the merger of the University of Adelaide and the University of South Australia, so confirm that your offer, your Confirmation of Enrolment, and the CRICOS codes all name the new combined entity.",
  },
  "australian-catholic-university": {
    living: LIVING_COST.national,
    who: "ACU suits students heading into nursing, teaching, paramedicine, and allied health, which are its core strengths and among the most direct routes to skilled work in Australia. Campuses in seven cities mean you can often study close to where you want to live. Every degree includes philosophy and ethics units and a community-engagement placement, so it is a better fit for students who want that grounding than for those after a purely technical program.",
  },
  "australian-institute-of-business": {
    living: LIVING_COST.adelaide,
    who: "AIB is built for working professionals doing an MBA or postgraduate business qualification part-time and online. There is almost no campus life and no broad undergraduate offering. It works well if you are already employed, want to keep earning while you study, and value flexible pacing over the traditional on-campus experience. It is a weaker fit if you need a student visa, since fully online study does not usually support one.",
  },
  "australian-institute-of-music": {
    living: LIVING_COST.sydney,
    how: "1. Choose your principal study area (performance, composition, music production, or music business) and instrument or voice.\n2. Check the entry requirements for that program, including the English test score.\n3. Prepare your portfolio or audition material. Most performance programs require a live or recorded audition; production and business programs may ask for a folio or interview.\n4. Apply directly through AIM's application portal and book your audition slot.\n5. Attend the audition or submit your recording by the deadline.\n6. Receive your outcome, accept the offer, and pay the deposit to receive a Confirmation of Enrolment.\n7. Apply for your Student visa and Overseas Student Health Cover.",
    who: "AIM is for students committed to a career in music who want a specialist conservatoire environment rather than a music department inside a large university. Entry is audition-based, and the programs are practical and industry-focused, concentrated in Sydney's Ultimo creative precinct. If you are still deciding between music and another field, a broader university with a strong music school may give you more room to change direction.",
  },
  "australian-national-university": {
    living: LIVING_COST.canberra,
    who: "ANU is the strongest choice for research-oriented students, especially in the sciences, economics, politics, and Asia-Pacific studies, where its ties to national institutes give undergraduates early exposure to active research. Canberra is smaller and quieter than Sydney or Melbourne, with lower living costs and an easier rental market. Graduate entry is broad from a solid bachelor's, though the flagship undergraduate programs are competitive, so it suits students who want a research-heavy rather than vocational degree.",
    intl: "Canberra counts as a regional area for skilled migration, so studying at ANU earns 5 points toward the 190 and 491 and opens the 491 occupation lists. The ACT also runs its own state nomination stream that favours people who have studied and lived in Canberra. ANU carries a genuine research focus even at undergraduate level, so it fits students aiming at further study or research careers better than those who want a purely vocational degree.",
  },
  "avondale-university": {
    living: LIVING_COST.regional,
    who: "Avondale is a small, faith-affiliated university with real strength in nursing and teaching. The scale is its selling point: small classes, a close-knit campus near Lake Macquarie, and lower living costs than the nearby cities. It suits students who want a supportive environment and a clear vocational path, particularly into nursing registration, and who are comfortable with its Seventh-day Adventist character.",
  },
  "bond-university": {
    living: LIVING_COST.goldcoast,
    how: "1. Choose your program and intake. Bond runs three semesters a year (January, May, and September), so you can start sooner than at most universities and finish a bachelor degree in two years.\n2. Check the entry requirements, including the English test score, for your specific program.\n3. Prepare your transcripts, English results, passport, and personal statement.\n4. Apply directly through Bond's online portal, or through an authorised agent. Applications are assessed on a rolling basis.\n5. Pay the application fee if one applies.\n6. Accept your offer and pay the deposit. Bond charges the same tuition to domestic and international students and does not offer Commonwealth Supported Places.\n7. Receive your Confirmation of Enrolment, then apply for your Student visa and health cover.",
    who: "Bond suits students who want to finish faster and are willing to pay for it. Three intakes a year and an accelerated calendar mean a standard degree takes two years instead of three, which can offset the higher fees through earlier entry to the workforce. Class sizes are small and the Gold Coast campus is compact. It is a private university with no subsidised places, so budget accordingly.",
  },
  "box-hill-institute": {
    living: LIVING_COST.melbourne,
    how: "1. Choose your qualification. Box Hill offers vocational certificates and diplomas as well as a small number of bachelor degrees.\n2. Check the entry requirements and English level for that course.\n3. Prepare your documents: prior qualifications, English test results, and passport.\n4. Apply directly through Box Hill Institute's international application system or through an authorised agent.\n5. Accept your offer and pay the required fees to receive a Confirmation of Enrolment.\n6. Apply for your Student visa and Overseas Student Health Cover.\n7. For vocational courses, check whether the qualification articulates into a bachelor degree later if you want that pathway.",
    who: "Box Hill is a Melbourne TAFE for students who want a hands-on, job-ready qualification in trades, hospitality, IT support, or applied business, often as a stepping stone into a bachelor degree or straight into work. It is one of the more affordable options in a major city. It is not the right choice if you want a research-oriented academic degree from the outset.",
  },
  "charles-darwin-university": {
    living: LIVING_COST.darwin,
    who: "CDU is worth considering if you want to study in a genuinely regional location with strong skilled-migration advantages. The Northern Territory offers some of the most accessible state nomination criteria in the country, and CDU combines university degrees with vocational training under one roof. It is strong in nursing, education, and engineering. Darwin is remote and the campus is small, which suits some students and not others.",
  },
  "charles-sturt-university": {
    living: LIVING_COST.regional,
    who: "Charles Sturt is built around regional NSW and the professions those communities need: veterinary science, pharmacy, teaching, nursing, and agriculture. Studying at one of its regional campuses earns skilled-migration points and opens regional nomination pathways, and living costs are well below the capital cities. It suits students who are comfortable in smaller towns and want a clear line from degree to registered profession.",
  },
  "cquniversity-australia": {
    living: LIVING_COST.regional,
    who: "CQUniversity has more campuses than almost any other Australian university, spread across regional Queensland and several capital cities, plus a large online cohort. That makes it flexible: you can often study a practical, career-focused degree in a regional location for the migration points, then use its distance options if you move. It is a strong fit for mature-age and first-in-family students and weaker for those wanting a traditional sandstone-campus experience.",
  },
  "curtin-university": {
    living: LIVING_COST.perth,
    who: "Curtin is the pick in Western Australia for applied engineering, mining, geology, and resources-sector careers, reflecting the state's economy. Perth has lower living costs than the eastern capitals and, crucially, counts as regional for skilled migration, so a Curtin degree earns extra visa points. It suits students aiming at industry roles rather than pure research, and those who do not mind Perth's distance from the rest of the country.",
    intl: "Curtin's main campus is in Perth, which counts as a regional area for skilled migration, so studying here earns 5 points toward the 190 and 491 and opens the 491 occupation lists, with living costs below the eastern capitals. Curtin also runs campuses in Malaysia, Singapore, and Dubai, so confirm your offer is for the Perth campus if the migration points matter to you. It is applied and industry-focused, strongest in engineering, mining, and the resources sector.",
  },
  "deakin-university": {
    living: LIVING_COST.melbourne,
    who: "Deakin suits students who value flexibility. It was an early mover into large-scale online delivery and still runs one of the country's biggest cloud campuses alongside physical sites in Melbourne and Geelong. It is strong in nursing, health, and business. If you want the option to mix on-campus and online study, or to start online and transition, Deakin is built for that. Geelong also offers lower living costs than central Melbourne.",
    intl: "Where you study at Deakin changes your migration position. Its Geelong campuses count as a regional area for skilled migration, worth 5 points toward the 190 and 491, while the Melbourne campus at Burwood does not. Deakin runs additional teaching periods beyond the standard February and July, so check the dates for your course. It is strong in nursing, education, sport science, and business.",
  },
  "edith-cowan-university": {
    living: LIVING_COST.perth,
    who: "ECU is a strong choice for cybersecurity and information security, where it runs one of Australia's designated Academic Centres of Cyber Security Excellence, as well as for nursing, education, and the performing arts through WAAPA. Perth's regional classification for skilled migration adds visa points, and living costs are moderate. It suits students with a clear vocational target in one of ECU's focus areas rather than those seeking a broad research university.",
  },
  "federation-university-australia": {
    living: LIVING_COST.regional,
    who: "Federation University serves regional Victoria around Ballarat and suits students who want an affordable, practical degree in a smaller city with skilled-migration advantages. It is strong in nursing, education, IT, and engineering technology, often with industry placements built in. Ballarat is an hour from Melbourne by train, so you get regional living costs and migration points while staying within reach of a major city.",
  },
  "flinders-university": {
    living: LIVING_COST.adelaide,
    who: "Flinders is built on medicine and health sciences and runs South Australia's first rural medical pathway, so it is a strong fit for students aiming at clinical careers, nursing, paramedicine, or public health. Adelaide's lower living costs and regional migration status are real advantages. The campus is in the Adelaide foothills, slightly removed from the city centre, which suits students who prefer a contained campus environment.",
  },
  "greenwich-college": {
    living: LIVING_COST.sydney,
    how: "1. Decide which partner university degree you are ultimately aiming for, since Greenwich's programs are designed to feed into those.\n2. Choose the right entry point: general English (ELICOS), an English for Academic Purposes course, or a foundation or diploma pathway program.\n3. Check the entry requirements for that program, including your current English level.\n4. Apply directly to Greenwich College or through an authorised agent, ideally as a package with the destination university degree.\n5. Accept your offer and pay fees to receive a Confirmation of Enrolment (one for the pathway, one for the degree if packaged).\n6. Apply for your Student visa covering the full package.\n7. On completing the pathway to the required standard, articulate into the partner university degree.",
    who: "Greenwich College is for students who need to build English proficiency or academic preparation before starting a university degree. It does not award its own bachelor degrees; its value is the guaranteed pathway into partner universities once you meet the required standard. It suits applicants who are close to but not yet at direct-entry requirements and want a structured route in.",
  },
  "griffith-university": {
    living: LIVING_COST.goldcoast,
    who: "Griffith spans Brisbane and the Gold Coast and is strong in health, environmental science, criminology, and the creative arts, including a well-regarded film school and conservatorium. The Gold Coast campus offers a beach-city lifestyle with lower living costs than Sydney or Melbourne. It suits students who want a mid-sized comprehensive university with good industry links and a choice of campus settings.",
    intl: "Griffith's campus choice affects skilled migration. Its Gold Coast campus counts as a regional area, worth 5 points toward the 190 and 491 and access to the 491 occupation lists, while the Brisbane campuses at Nathan, Mount Gravatt, and South Bank do not, because Brisbane is excluded from the definition of regional Australia. Griffith is strong in health, environmental science, criminology, and Asia-Pacific studies. Confirm which campus your course is based at before you accept.",
  },
  "holmes-institute": {
    living: LIVING_COST.national,
    who: "Holmes Institute is a private provider focused on business, accounting, and IT degrees for international students, with campuses in Melbourne, Sydney, and the Gold Coast. It suits students who want a straightforward, employment-oriented business or accounting qualification, particularly where accounting is a target occupation for skilled migration. It is not a research university and has a narrower course range than the public universities.",
  },
  icms: {
    living: LIVING_COST.sydney,
    who: "ICMS is for students set on hospitality, event management, sports management, or international business who want small classes and compulsory industry internships. The campus, a former castle on Sydney's northern beaches, is unusual and residential in feel. It suits students who value the internship structure and personal attention over the scale and research depth of a large university.",
  },
  "james-cook-university": {
    living: LIVING_COST.townsville,
    who: "JCU is the leading choice for marine biology, tropical ecology, and tropical medicine, backed by its location next to the Great Barrier Reef and the wet tropics. It also trains doctors and health professionals for regional and remote practice. Townsville and Cairns are genuinely regional, with lower living costs and strong migration incentives. It suits students whose field ties directly to the tropical environment or regional healthcare.",
  },
  "kaplan-business-school": {
    living: LIVING_COST.national,
    who: "Kaplan Business School is a private provider offering business and accounting degrees across four capital cities, with some programs built on pathway credit from Kaplan's diploma arm. It suits students who want a focused business qualification with city campuses and flexible entry points. As with other private business schools, the trade-off is a narrower catalog and no research profile compared with a public university.",
  },
  "la-trobe-university": {
    living: LIVING_COST.melbourne,
    who: "La Trobe suits students in the life sciences, ecology, health, and the humanities who want a large Melbourne university with a green, self-contained main campus. Its Bundoora site sits next to a wildlife reserve used directly in teaching. It is less selective than the Group of Eight, which makes it accessible, and it has regional campuses in Bendigo and Albury-Wodonga that carry migration advantages.",
    intl: "La Trobe's main Bundoora campus is in Melbourne and does not carry regional migration points, but its Bendigo and Albury-Wodonga campuses are in regional areas worth 5 points toward the 190 and 491, with much lower living costs. If the regional benefit matters to you, look at those campuses and confirm your course runs there in full rather than partly in Melbourne. La Trobe is strong in health sciences, agriculture, and the humanities, and is more accessible on entry than the Group of Eight.",
  },
  "macquarie-university": {
    living: LIVING_COST.sydney,
    who: "Macquarie is a strong fit for students in actuarial studies, finance, linguistics, cognitive science, and health, and its campus has its own metro station and a university-run hospital used in teaching. It sits in Sydney's north, near a major corporate and tech precinct, which helps with internships and graduate roles. Living costs are Sydney-level, so budget accordingly.",
    intl: "Macquarie is in northern Sydney, so there are no regional migration points and Sydney living costs are the highest in the country. Its campus has its own metro station and a university-run teaching hospital, MQ Health, which supports its medicine and allied health programs, and it is well regarded for actuarial studies, finance, and politics and international relations. Entry from a three-year overseas bachelor is accepted for most masters, with a credit average the common bar.",
  },
  "melbourne-institute-of-technology": {
    living: LIVING_COST.melbourne,
    who: "MIT Melbourne is a private provider concentrating on IT, networking, engineering, and business degrees, with campuses in central Melbourne and Sydney. It suits students who want a focused technology or business qualification in a major city with smaller classes. It is unrelated to the US institution with the same initials, and it is not a research university.",
  },
  "melbourne-polytechnic": {
    living: LIVING_COST.melbourne,
    how: "1. Choose your qualification. Melbourne Polytechnic offers vocational certificates and diplomas plus a small set of bachelor degrees, with particular strength in agriculture, horticulture, and building.\n2. Check the entry and English requirements for that course.\n3. Prepare your prior qualifications, English test results, and passport.\n4. Apply through Melbourne Polytechnic's international admissions team or an authorised agent.\n5. Accept your offer and pay fees to receive a Confirmation of Enrolment.\n6. Apply for your Student visa and Overseas Student Health Cover.\n7. Check articulation options if you plan to move into a bachelor degree afterwards.",
    who: "Melbourne Polytechnic is a public TAFE for students who want practical training in trades, agriculture, horticulture, or applied business in Melbourne, often as a pathway into further study or straight into work. Its large Epping agriculture campus is unusual for a city-based institute. It is not the right choice if you want an academic research degree from the start.",
  },
  "monash-university": {
    living: LIVING_COST.melbourne,
    who: "Monash is Australia's largest university and a good fit for students who want breadth, research depth, and global mobility. It runs its own campuses in Malaysia and Indonesia, so a Melbourne-based degree can include an overseas semester without a separate exchange application. It is strong across pharmacy, engineering, medicine, and business. It is selective and large, which suits independent students more than those wanting a small-campus feel.",
    intl: "Monash is in Melbourne, so studying here does not earn the regional migration points that Adelaide, Perth, and Canberra do. It runs full campuses in Malaysia and Indonesia, and some programs let you complete part of the degree offshore within the same university, which can lower the total cost. As the largest university in the country by enrolment, cohorts and class sizes are big, so it rewards students who are comfortable being proactive.",
  },
  "murdoch-university": {
    living: LIVING_COST.perth,
    who: "Murdoch is the only place in Western Australia to study veterinary science, and its campus includes a working farm and wildlife hospital used in teaching, so it is a natural fit for veterinary, animal science, and biosecurity students. It is also strong in the biological sciences. Perth's regional migration status and moderate living costs add to the case. The campus has a relaxed, bushland setting south of the city.",
  },
  nida: {
    living: LIVING_COST.sydney,
    how: "1. Check which programs are open for your intended intake. NIDA runs a small number of specialist degrees (acting, directing, design, and technical theatre and film) with limited places.\n2. Read the audition or portfolio requirements for your program carefully, as they are specific and detailed.\n3. Prepare your material: monologues for acting, a folio for design, a portfolio and interview for technical programs.\n4. Apply directly to NIDA and register for an audition or portfolio review. Deadlines are early, often months before the year starts.\n5. Attend the audition or interview. Acting typically runs multiple rounds.\n6. If offered a place, accept and pay the deposit to receive a Confirmation of Enrolment.\n7. Apply for your Student visa and health cover.",
    who: "NIDA is for students at the top of their field pursuing a professional career in acting, directing, or theatre and film production. Entry is by audition or portfolio and is among the most competitive in the world, with acting cohorts of only a handful of students. It suits applicants who are certain about a performing-arts career and prepared for an intensive conservatoire model.",
  },
  "queensland-university-of-technology": {
    living: LIVING_COST.brisbane,
    who: "QUT builds mandatory industry placements into most undergraduate degrees, closer to a co-op model than a traditional university, so it suits students who want work experience embedded in their study. It is strong in creative industries, urban planning, engineering, and health. Its campuses are in central Brisbane, which has lower living costs than Sydney or Melbourne while still being a state capital.",
    intl: "QUT is in central Brisbane, which is excluded from the definition of regional Australia, so it does not earn the regional study points that Gold Coast, Adelaide, Perth, and Canberra do, though Brisbane living costs sit below Sydney and Melbourne. QUT builds mandatory industry placements into most undergraduate degrees, closer to a co-op model, and is strongest in IT, engineering, health, and creative industries.",
  },
  "rmit-university": {
    living: LIVING_COST.melbourne,
    who: "RMIT is the pick for design, architecture, media, and applied technology, with a distinctly practical, studio-based culture and a central Melbourne campus in the heart of the city. It suits students who want industry connection and a creative or technical focus rather than a traditional liberal-arts degree. Being in the CBD means higher living costs but excellent transport and part-time work options.",
    intl: "RMIT is in central Melbourne, which does not carry regional migration points, and CBD living costs are high. It leans hard into design, applied technology, and industry-linked degrees, with several IT and engineering programs including a built-in professional placement. RMIT also runs campuses in Vietnam, so confirm your offer is for a Melbourne campus. Standard entry is a bachelor with a credit average and IELTS 6.5.",
  },
  "south-metropolitan-tafe": {
    living: LIVING_COST.perth,
    how: "1. Choose your vocational qualification. South Metropolitan TAFE offers certificates and diplomas, with strengths in trades, maritime, and technical fields.\n2. Check the entry and English requirements for that course.\n3. Prepare your prior qualifications, English test results, and passport.\n4. Apply through the TAFE's international admissions process or an authorised agent.\n5. Accept your offer and pay fees to receive a Confirmation of Enrolment.\n6. Apply for your Student visa and Overseas Student Health Cover.\n7. If you want to continue to a degree, check which Western Australian universities accept the diploma for credit.",
    who: "South Metropolitan TAFE is a public vocational institute in Perth's southern suburbs for students who want trade or technical training, often as a pathway into a university degree or directly into work. Perth's regional migration status is a genuine advantage. It is not a degree-granting university, so it suits students whose plan starts with a practical qualification.",
  },
  "southern-cross-university": {
    living: LIVING_COST.regional,
    how: "1. Choose your course and campus (Lismore, Gold Coast, or Coffs Harbour) or the online option.\n2. Note that Southern Cross uses a block model: you study one subject intensively over six weeks rather than juggling several at once. Make sure that structure suits how you learn.\n3. Check the entry and English requirements for your program.\n4. Prepare your transcripts, English results, and passport.\n5. Apply directly to Southern Cross or through an authorised agent. There are multiple start dates through the year.\n6. Accept your offer and pay the deposit to receive a Confirmation of Enrolment.\n7. Apply for your Student visa and health cover.",
    who: "Southern Cross suits students who prefer to focus on one subject at a time rather than spreading attention across four. Its block model and multiple annual intakes give flexibility, and its regional NSW campuses carry skilled-migration points and low living costs. It is strong in health, environmental science, and business, and works well for students who want structure and a smaller-campus feel.",
  },
  "swinburne-university-of-technology": {
    living: LIVING_COST.melbourne,
    who: "Swinburne blends university degrees with a strong applied, industry-linked focus and offers professional placement years in many programs. It has a research niche in astrophysics and space technology. The main campus is in Hawthorn, an inner Melbourne suburb with good transport. It suits students who want a technology or design focus with real work integration rather than a pure research pathway.",
  },
  "tafe-nsw": {
    living: LIVING_COST.regional,
    how: "1. Choose your qualification from TAFE NSW's certificate, diploma, and degree offerings, and a campus location.\n2. Check the entry and English requirements. Bachelor degrees at TAFE NSW have higher English requirements than most vocational courses.\n3. Prepare your prior qualifications, English test results, and passport.\n4. Apply through TAFE NSW International or an authorised agent.\n5. Accept your offer and pay fees to receive a Confirmation of Enrolment.\n6. Apply for your Student visa and Overseas Student Health Cover.\n7. If you start with a diploma, check credit and articulation into a university degree.",
    who: "TAFE NSW is Australia's largest vocational provider, with campuses across the state and training in trades, health support, hospitality, and business. It suits students who want a practical qualification, often at lower cost than a university, as a direct route to work or a pathway into a degree. Regional campuses carry skilled-migration advantages.",
  },
  "tafe-queensland": {
    living: LIVING_COST.regional,
    how: "1. Choose your certificate or diploma and a campus location in Queensland.\n2. Check the entry and English requirements for that qualification.\n3. Prepare your prior qualifications, English test results, and passport.\n4. Apply through TAFE Queensland's international admissions or an authorised agent.\n5. Accept your offer and pay fees to receive a Confirmation of Enrolment.\n6. Apply for your Student visa and Overseas Student Health Cover.\n7. Check articulation agreements if you plan to continue into a Queensland university degree.",
    who: "TAFE Queensland is the state's public vocational provider, delivering certificates and diplomas across dozens of campuses. It suits students who want job-ready training in trades, health support, tourism, or business, often at lower cost than university study, and many qualifications articulate into degrees. Regional campuses add skilled-migration points.",
  },
  "torrens-university-australia": {
    living: LIVING_COST.national,
    who: "Torrens is a private university with a catalog weighted toward business, design, hospitality management, and health, delivered across campuses in several cities. It suits students who want a career-focused degree with industry projects and flexible intakes. As a private provider it has no subsidised places and a narrower research profile than the public universities.",
  },
  "university-of-canberra": {
    living: LIVING_COST.canberra,
    who: "UC is a practical, teaching-focused university in the national capital, strong in sports science (through an Australian Institute of Sport partnership), health, education, and public administration. Canberra has lower living costs than Sydney, a tight graduate labour market in government, and its own state nomination stream. It suits students who want a mid-sized university with strong internship links to the public sector.",
  },
  "university-of-divinity": {
    living: LIVING_COST.melbourne,
    who: "University of Divinity is a specialist theological institution operating through a consortium of affiliated colleges. It suits students pursuing theology, ministry, chaplaincy, or religious scholarship at undergraduate or postgraduate level who want depth in that field. It is not a general university and does not offer programs outside its area.",
  },
  "university-of-melbourne": {
    living: LIVING_COST.melbourne,
    how: "1. Understand the Melbourne Model. Undergraduate study is a broad three-year degree (Arts, Science, Commerce, Biomedicine, Design, or Music), after which you take a professional graduate degree such as the Juris Doctor, Doctor of Medicine, or Master of Engineering.\n2. Choose the undergraduate degree and the majors within it that lead toward your intended graduate program.\n3. Check the entry requirements, including the English score and any prerequisite subjects, for that degree.\n4. Prepare your transcripts, English results, passport, and any required personal statement.\n5. Apply through the University of Melbourne's application portal or an authorised agent.\n6. Accept your offer and pay the deposit to receive a Confirmation of Enrolment.\n7. Apply for your Student visa and Overseas Student Health Cover.\n8. Plan for the graduate degree separately toward the end of your bachelor, including its own entry requirements.",
    who: "Melbourne suits students who value a broad first degree and are comfortable specialising later through a professional graduate qualification. Its Melbourne Model is deliberately different from direct-entry programs elsewhere, so it is a strong fit if you want time to explore before committing, and a weaker one if you want to start a professional degree immediately. It is highly ranked, and entry to the graduate professional degrees is competitive.",
    intl: "Melbourne is a major city, so it does not carry the regional study points or 491 access that Adelaide, Perth, and Canberra do. Because of the Melbourne Model, a professional qualification such as the Juris Doctor or Master of Engineering is a separate graduate application after your bachelor, so plan for two admission cycles rather than one. Entry from a three-year overseas bachelor is accepted for most masters, but competitive programs expect strong marks.",
  },
  "university-of-new-england": {
    living: LIVING_COST.regional,
    who: "UNE was Australia's first regional university and remains heavily distance-education focused, with most students studying off-campus. It suits students who want a flexible, largely online degree from an established institution, particularly in education, agriculture, and the sciences. Its Armidale campus is genuinely regional with very low living costs for students who do want to be on site.",
  },
  "university-of-newcastle": {
    living: LIVING_COST.newcastle,
    who: "Newcastle is strong in medicine, engineering, and the health sciences, and it pioneered problem-based learning in its medical program. Newcastle is a coastal city two hours north of Sydney with markedly lower living costs and a relaxed lifestyle. It suits students who want a research-active university without Sydney prices, and its campus carries some regional advantages for migration.",
    intl: "The University of Newcastle's main Callaghan campus is in Newcastle, which counts as a regional area for skilled migration, so study here earns 5 points toward the 190 and 491 and opens the 491 occupation lists, with living costs well below Sydney's, two hours south. It also runs a Sydney campus, which does not carry the regional benefit, so check which campus your course is delivered at. Newcastle is strong in medicine, engineering, and the health sciences.",
  },
  "university-of-notre-dame-australia": {
    living: LIVING_COST.perth,
    how: "1. Choose your program and campus (Fremantle, Sydney, or Broome for some health programs).\n2. Note that every degree includes a required core of philosophy, ethics, and theology units. Factor that into your study plan.\n3. Check the entry and English requirements for your program. Health programs such as medicine and physiotherapy have additional requirements and interviews.\n4. Prepare your transcripts, English results, passport, and a personal statement. Notre Dame places weight on interviews for many courses.\n5. Apply directly to the university. Attend an interview if required.\n6. Accept your offer and pay the deposit to receive a Confirmation of Enrolment.\n7. Apply for your Student visa and health cover.",
    who: "Notre Dame Australia is a Catholic university with a required core curriculum of philosophy and ethics across every degree and a strong interview-based admissions culture. It is well regarded in medicine, nursing, physiotherapy, and education. It suits students who want that ethical grounding and a more personal admissions process, and who are comfortable with its religious character.",
  },
  "university-of-queensland": {
    living: LIVING_COST.brisbane,
    who: "UQ is a research-intensive Group of Eight university strong in the life sciences, biotechnology, agriculture, and engineering, with undergraduates getting early access to active research labs. Brisbane has lower living costs than Sydney or Melbourne while still being a large city. UQ is selective, so it suits students with strong records who want research depth and a large, well-resourced campus.",
    intl: "Brisbane is one of the three cities excluded from the definition of regional Australia, so despite lower living costs than Sydney or Melbourne, studying at UQ does not earn the regional study points or 491 access that Adelaide, Perth, and Canberra do. UQ is research-intensive and selective, strongest in the life sciences, biotechnology, and engineering. Entry from a three-year overseas bachelor is accepted for most masters, with competitive programs expecting a credit to distinction average.",
  },
  "university-of-southern-queensland": {
    living: LIVING_COST.regional,
    who: "UniSQ (based in Toowoomba) is one of the country's most online-oriented universities and suits students who want flexible, distance-friendly study in education, engineering, nursing, or the sciences. Toowoomba and its other regional campuses carry skilled-migration points and low living costs. It is a good fit for mature-age students and those balancing study with work or family.",
  },
  "university-of-sydney": {
    living: LIVING_COST.sydney,
    who: "Sydney is a comprehensive Group of Eight university with a broad faculty structure that lets first-years explore before locking into a major. It is strong across medicine, law, business, engineering, and the humanities, and its sandstone campus is close to the city centre. It is selective and large, and Sydney living costs are the highest in the country, so it suits students with the academic record and budget to match.",
    intl: "Sydney is a major city with the highest living costs in the country and no regional migration points. It publishes application closing dates for each intake, so check the date for your specific course and apply well ahead rather than assuming rolling assessment. A one-semester tuition deposit is standard, and a larger one can apply where a higher-risk financial assessment is used for your country.",
  },
  "university-of-tasmania": {
    living: LIVING_COST.hobart,
    who: "UTAS is the only university in Tasmania and has genuine world-class strength in marine, Antarctic, and fisheries science, using the state's role as a gateway to the Southern Ocean. The whole of Tasmania is classified regional for skilled migration, giving strong visa incentives, and Hobart and Launceston have low living costs. It suits students whose field fits its research strengths or who want the migration and cost advantages of studying regionally.",
  },
  "university-of-technology-sydney": {
    living: LIVING_COST.sydney,
    who: "UTS is a technology-focused university built around practice-based learning studios and strong industry connections, in central Sydney next to the tech and startup precinct. It is strong in engineering, IT, design, and business analytics. It suits students who want an applied, industry-linked degree in the heart of Sydney and who can manage the city's living costs.",
    intl: "UTS is in central Sydney, so there are no regional migration points and living costs are the highest in the country. Its model is built around practice-based studios and industry placement rather than traditional lectures, and it is strongest in engineering, IT, design, and business analytics. Entry from a three-year overseas bachelor is accepted for most masters, with a credit average the common bar.",
  },
  "university-of-the-sunshine-coast": {
    living: LIVING_COST.sunshinecoast,
    who: "UniSC is one of Australia's youngest universities, growing fastest in the health sciences alongside the region's rapid population growth. The Sunshine Coast offers a beach lifestyle with lower living costs than Brisbane and regional migration advantages. It suits students who want a newer, smaller university with modern facilities and a focus on health, education, and business rather than a large research institution.",
  },
  "university-of-western-australia": {
    living: LIVING_COST.perth,
    who: "UWA is Western Australia's Group of Eight university, research-intensive with particular strength in marine science, agriculture, mining engineering, and medicine. Its riverside Perth campus is well regarded, Perth counts as regional for skilled migration, and living costs are lower than the eastern capitals. It is selective and traditional in structure, suiting students who want research depth and are comfortable with Perth's distance from the rest of Australia.",
    intl: "Perth counts as a regional area for skilled migration, so studying at UWA earns 5 points toward the 190 and 491 and opens the 491 occupation lists, while Perth living costs sit below the eastern capitals. UWA is research-intensive and traditional in structure, strongest in marine science, mining and petroleum engineering, agriculture, and medicine. Western Australia is a long flight from the eastern states, which is worth weighing if you expect to travel during your studies.",
  },
  "university-of-wollongong": {
    living: LIVING_COST.wollongong,
    who: "UOW is strong in engineering, computing, and materials science, with close co-op ties to local industry, and its campus sits between an escarpment and the coast an hour south of Sydney. Wollongong has much lower living costs than Sydney and some regional migration benefits. It suits students who want a research-active university with strong industry placement links and a smaller-city lifestyle.",
    intl: "UOW's main campus is in Wollongong, which counts as a regional area for skilled migration, so studying here earns 5 points toward the 190 and 491 and opens the 491 occupation lists, an hour south of Sydney with much lower living costs. UOW also runs a Sydney CBD campus and several smaller regional campuses, so confirm which one your course is delivered at. It is strongest in engineering, computing, and materials science, with strong local industry placement links.",
  },
  "unsw-sydney": {
    living: LIVING_COST.sydney,
    who: "UNSW leans harder into engineering and the built environment than most of the Group of Eight, with co-op and industry-placement tracks built into several degrees, and it is also strong in business and law. It runs a trimester calendar, so the academic year is structured differently from most universities. It is selective and in Sydney, so it suits strong applicants with the budget for the city.",
    intl: "UNSW runs a trimester calendar with three main teaching periods a year, roughly February, June, and September, so there are more entry points than the standard February and July but a faster pace once you start. It is in Sydney, so there are no regional migration points and living costs are the highest in the country. Engineering and business are the largest international cohorts.",
  },
  "victoria-university": {
    living: LIVING_COST.melbourne,
    how: "1. Choose your course. Victoria University teaches most undergraduate programs through the VU Block Model, where you study one unit at a time over four weeks rather than several at once.\n2. Confirm that the block structure suits how you learn.\n3. Check the entry and English requirements for your program.\n4. Prepare your transcripts, English results, and passport.\n5. Apply directly to Victoria University or through an authorised agent. There are several intakes through the year.\n6. Accept your offer and pay the deposit to receive a Confirmation of Enrolment.\n7. Apply for your Student visa and Overseas Student Health Cover.",
    who: "Victoria University suits students who do better focusing on one subject at a time. Its Block Model restructured most undergraduate teaching around that idea, aimed at improving completion rates. It is based in Melbourne's west and inner city and is strong in sport science, business, and education, with an accessible entry profile.",
  },
  "victoria-university-polytechnic": {
    living: LIVING_COST.melbourne,
    how: "1. Choose your vocational certificate or diploma. Victoria University Polytechnic is the TAFE arm of Victoria University and focuses on trades and applied qualifications.\n2. Check the entry and English requirements for that course.\n3. Prepare your prior qualifications, English test results, and passport.\n4. Apply through Victoria University's international admissions team, noting the polytechnic course.\n5. Accept your offer and pay fees to receive a Confirmation of Enrolment.\n6. Apply for your Student visa and Overseas Student Health Cover.\n7. Many polytechnic diplomas articulate directly into a Victoria University bachelor degree with credit, so plan that pathway if a degree is your goal.",
    who: "Victoria University Polytechnic is the vocational division of Victoria University, offering certificates and diplomas that can articulate directly into VU degrees. It suits students who want to start with a hands-on qualification in a trade or applied field and then step up into a bachelor degree with credit, all within one institution in Melbourne.",
  },
  "western-sydney-university": {
    living: LIVING_COST.sydney,
    who: "Western Sydney University spans ten campuses across Greater Western Sydney and built its reputation on widening access, with strong support for first-in-family students. It is strong in nursing, education, and health, and its newer vertical campuses put it in the centre of regional towns and business districts. It is more accessible than the inner-Sydney universities, though Sydney living costs still apply.",
  },
  "william-angliss-institute": {
    living: LIVING_COST.melbourne,
    how: "1. Choose your qualification. William Angliss specialises almost entirely in cookery, patisserie, hospitality management, tourism, and events, from certificates to bachelor degrees.\n2. Check the entry and English requirements for that course.\n3. Prepare your prior qualifications, English test results, and passport.\n4. Apply through William Angliss Institute's international admissions or an authorised agent.\n5. Accept your offer and pay fees to receive a Confirmation of Enrolment.\n6. Apply for your Student visa and Overseas Student Health Cover.\n7. Check articulation if you start with a diploma and want to progress to the bachelor degree.",
    who: "William Angliss is a specialist hospitality, tourism, and culinary institute with its own working restaurants and kitchens used in teaching. It suits students committed to a career in food, hospitality management, tourism, or events who want hands-on training from a recognised specialist rather than a general business degree with a hospitality elective.",
  },
};

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows: unis } = await client.query(
    `select u.id, u.slug from universities u
     join countries co on co.id = u.country_id
     where u.status = 'published' and co.is_launched = true`,
  );
  const bySlug = Object.fromEntries(unis.map((u) => [u.slug, u.id]));

  let updated = 0;
  const missing = [];
  for (const [slug, data] of Object.entries(E)) {
    const id = bySlug[slug];
    if (!id) {
      missing.push(slug);
      continue;
    }
    if (/—/.test(data.who + (data.how ?? "") + (data.intl ?? ""))) {
      throw new Error(`em dash in content for ${slug}`);
    }
    await client.query(
      `update universities
       set who_is_it_for = $1, how_to_apply = $2, living_cost_annual = $3,
           international_student_notes = coalesce($5, international_student_notes),
           last_verified_at = current_date, updated_at = now()
       where id = $4`,
      [data.who, data.how ?? null, data.living, id, data.intl ?? null],
    );
    updated++;
  }

  const uncovered = unis.filter((u) => !E[u.slug]).map((u) => u.slug);
  console.log(`updated ${updated} universities`);
  if (missing.length) console.log("slugs in script but not in DB:", missing);
  if (uncovered.length) console.log("published unis not covered:", uncovered);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
