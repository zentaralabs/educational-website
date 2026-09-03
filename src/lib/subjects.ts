import type { RelatedLink } from "@/lib/related-content";

export type SubjectContent = {
  /** 1-2 paragraphs on studying this field in Australia as an international student. */
  intro: string[];
  /** One line on graduate outcomes and skilled-migration relevance. */
  careers: string;
  faq: { q: string; a: string }[];
  /**
   * Universities with a recognised strength in this field, with a one-line
   * reason. Curated from domain knowledge (there is no field-level ranking
   * data). Order is deliberate, strongest first.
   */
  strongAt?: { slug: string; why: string }[];
  /**
   * Field-specific entry requirements. Replaces the generic requirements
   * paragraph on the /study/[slug] page when present. Use for fields where
   * the bar differs materially (law and nursing English, registration-based
   * fields, portfolio requirements).
   */
  requirements?: string[];
  /** One line on what the fee range means for this field, shown under the stat grid. */
  costNote?: string;
  /**
   * One line on the source-country angle (which nationalities pick this field
   * and why), shown after the intro. Links the subject page to the
   * /international/{country} pages for the "study X in australia from Y" query.
   */
  fromCountry?: string;
  /**
   * Subject-aware "Related" links. Replaces the static fallback list on the
   * /study/[slug] page when present.
   */
  related?: RelatedLink[];
};

/** Subjects that get a dedicated /best/best-australian-universities-for-X page. */
export const SUBJECT_BEST_PAGES = [
  "computer-science",
  "information-technology",
  "data-science",
  "business",
  "nursing-and-health-sciences",
  "engineering",
];

/**
 * Editorial copy for the /study/[slug] subject landing pages, keyed by the
 * `subjects.slug` value. Subjects without an entry fall back to a templated
 * intro built from the program data. Zero em-dashes (house style).
 */
export const SUBJECT_CONTENT: Record<string, SubjectContent> = {
  "computer-science": {
    intro: [
      "Computer science and computing degrees are among the most popular choices for international students in Australia, partly because the field maps cleanly onto the skilled-migration occupation lists. Most universities offer a two-year Master of Computer Science or Master of Information Technology that accepts graduates from any discipline, alongside three-year bachelor degrees.",
      "Tuition for a master's runs from the low AUD 30,000s at regional and newer universities to the high AUD 40,000s at the Group of Eight. Entry usually needs a credit average (around 65 percent) in your previous degree and IELTS 6.5, though conversion master's for non-computing graduates have gentler academic bars.",
    ],
    careers: "Software engineer, data engineer, and cybersecurity roles are on the skilled occupation lists, so a computing degree plus a year of work on a 485 graduate visa is a common route toward the 189, 190, or 491.",
    strongAt: [
      { slug: "unsw-sydney", why: "Australia's largest computer science and engineering faculty, with co-op programs and a big research output." },
      { slug: "university-of-melbourne", why: "Strong across AI, machine learning, and distributed systems; the Melbourne Model routes CS through a Science or Design bachelor." },
      { slug: "university-of-sydney", why: "Deep strength in AI, robotics, and human-centred computing." },
      { slug: "australian-national-university", why: "Small, research-heavy school with close ties to national research institutes." },
      { slug: "monash-university", why: "Large, well-resourced, with data science and cybersecurity specialisations and overseas campus options." },
      { slug: "university-of-queensland", why: "Research-intensive with strong industry links in Brisbane's growing tech sector." },
    ],
    faq: [
      {
        q: "Can I do a master's in computer science in Australia without a computing background?",
        a: "Yes. Many universities run a Master of Information Technology or a conversion Master of Computer Science designed for graduates of other fields. These are usually two years and cover programming fundamentals in the first semester.",
      },
      {
        q: "Do Australian universities require GRE or GMAT for computer science?",
        a: "No. No Australian university requires the GRE or GMAT for a computer science or IT master's. Admission is based on your prior academic record and an English test.",
      },
      {
        q: "Which is cheaper, Computer Science or Information Technology?",
        a: "They overlap heavily and cost about the same at most universities. IT programs are slightly more applied; computer science is more theoretical. Check the specific program's fee rather than assuming one field is cheaper.",
      },
    ],
    related: [
      { href: "/guides/how-the-australian-points-test-works", label: "How the skilled points test works" },
      { href: "/guides/study-to-permanent-residence-pathway-australia", label: "The study-to-PR pathway" },
      { href: "/guides/getting-a-skills-assessment-in-australia", label: "Getting a skills assessment" },
      { href: "/visas/temporary-graduate-485", label: "Temporary Graduate visa (485)" },
      { href: "/international/india", label: "Study in Australia from India" },
      { href: "/best/regional-australian-universities-for-skilled-migration", label: "Regional universities for skilled migration" },
    ],
  },
  "information-technology": {
    intro: [
      "Information technology degrees in Australia are practical and broad, covering software development, networking, cybersecurity, data, and IT project management. The Master of Information Technology is the flagship postgraduate qualification, usually 1.5 to 2 years, and is open to graduates of any discipline at most universities. The first block brings non-IT graduates up to a common baseline in programming, systems, and data before they pick a specialisation.",
      "Fees sit a little below straight computer science at many universities, from the low AUD 30,000s at regional and newer universities to the high AUD 40,000s at the Group of Eight. Several universities of technology (UTS, RMIT, QUT, Curtin, Swinburne) build a mandatory industry placement into the degree, which matters for both employability and later migration points.",
    ],
    fromCountry:
      "IT is the single most chosen field for Indian and Nepali students in Australia, largely because it maps so cleanly onto the skilled occupation lists. If you are applying from South Asia, check the /international pages for what is different on evidence level, agent rules, and deadlines.",
    costNote:
      "Regional and newer universities sit well below the Group of Eight for the same Master of Information Technology, and studying in a regional-classified city (Adelaide, Perth, Canberra) also adds 5 points on the skilled points test later.",
    requirements: [
      "Entry to a Master of IT is a completed bachelor's in any field, usually with a credit average of around 65 percent, and IELTS 6.5 overall (PTE Academic 58). Conversion programs for non-IT graduates have the gentler academic bar.",
      "No Australian university requires the GRE or GMAT for an IT or computer science master's.",
      "Bachelor of IT entry is a completed senior secondary qualification meeting the university's minimum, plus IELTS 6.0 to 6.5.",
    ],
    careers: "ICT business analyst, systems analyst, software engineer, developer programmer, and ICT security specialist are all skilled occupations. The Australian Computer Society is the assessing authority, and it generally wants the degree plus one to two years of relevant work, or the degree plus a Professional Year in IT in place of some of that experience. A year of work on a 485 graduate visa is the usual way to build it.",
    strongAt: [
      { slug: "university-of-technology-sydney", why: "Practice-based studios and one of the strongest industry-placement models for IT in the country." },
      { slug: "rmit-university", why: "Applied, industry-linked IT with a central Melbourne campus and strong employer connections." },
      { slug: "queensland-university-of-technology", why: "Mandatory industry placements built into most IT degrees, closer to a co-op model." },
      { slug: "swinburne-university-of-technology", why: "Professional placement years and a genuine focus on work-integrated learning." },
      { slug: "curtin-university", why: "Applied IT reflecting WA's resources and services economy, in a regional-classified city." },
      { slug: "monash-university", why: "Large Faculty of IT with cybersecurity, AI, and data science specialisations and an industry-studio capstone." },
    ],
    faq: [
      {
        q: "What is the difference between a Master of IT and a Master of Computer Science?",
        a: "IT is more applied and industry-focused; computer science leans theoretical and research-oriented. For skilled migration both map to ICT occupations. Pick based on whether you want hands-on project work or deeper technical foundations.",
      },
      {
        q: "Is a Professional Year worth it after an IT degree?",
        a: "It adds 5 points to the skilled points test and includes a 12-week work placement, which helps with your first Australian job. It costs roughly AUD 10,000 to 12,000 and takes about a year. It also counts in place of some of the work experience the Australian Computer Society wants for a skills assessment.",
      },
      {
        q: "Can I study a Master of IT in Australia without a computing background?",
        a: "Yes. Most universities design the Master of Information Technology as an open-door degree for graduates of any field, with the first block covering programming, systems, and data fundamentals before specialisation. About half of a typical intake enters without an IT background.",
      },
      {
        q: "Which Australian city is best for studying IT for migration?",
        a: "Adelaide, Perth, Canberra, and the smaller cities are classified regional for skilled migration, so studying IT there earns 5 extra points on the points test and opens the Skilled Work Regional (491) visa. Sydney and Melbourne have the largest job markets but no regional points.",
      },
    ],
    related: [
      { href: "/guides/how-the-australian-points-test-works", label: "How the skilled points test works" },
      { href: "/guides/study-to-permanent-residence-pathway-australia", label: "The study-to-PR pathway" },
      { href: "/guides/getting-a-skills-assessment-in-australia", label: "Getting a skills assessment" },
      { href: "/international/india", label: "Study in Australia from India" },
      { href: "/international/nepal", label: "Study in Australia from Nepal" },
      { href: "/best/regional-australian-universities-for-skilled-migration", label: "Regional universities for skilled migration" },
    ],
  },
  "data-science": {
    intro: [
      "Data science is one of the faster-growing postgraduate fields in Australia, sitting between computer science, statistics, and business analytics. Most programs are one to two year master's degrees, and universities differ on how much coding versus statistics they expect coming in.",
      "Entry typically requires a bachelor's with some quantitative content (mathematics, statistics, engineering, economics, or computing) and IELTS 6.5. A few universities offer a longer two-year version for applicants without that background.",
    ],
    careers: "Data scientist and data analyst roles feed into ICT and, in some states, dedicated data occupations on the nomination lists. The 485 graduate visa gives time to reach the experience most skilled visas want.",
    strongAt: [
      { slug: "university-of-melbourne", why: "Master of Data Science jointly run by computing, maths, and statistics." },
      { slug: "monash-university", why: "Large data science program with business analytics and applied streams." },
      { slug: "university-of-technology-sydney", why: "Industry-facing analytics with a strong placement component." },
      { slug: "unsw-sydney", why: "Data science across the science and engineering faculties." },
      { slug: "university-of-adelaide", why: "Machine learning research strength, with the Australian Institute for Machine Learning." },
    ],
    faq: [
      {
        q: "Do I need to know programming before a data science master's in Australia?",
        a: "For the one-year versions, yes, usually Python or R plus basic statistics. Two-year versions include a foundational semester and accept applicants from broader backgrounds.",
      },
    ],
    related: [
      { href: "/guides/how-the-australian-points-test-works", label: "How the skilled points test works" },
      { href: "/guides/getting-a-skills-assessment-in-australia", label: "Getting a skills assessment" },
      { href: "/visas/temporary-graduate-485", label: "Temporary Graduate visa (485)" },
      { href: "/international/india", label: "Study in Australia from India" },
      { href: "/best/regional-australian-universities-for-skilled-migration", label: "Regional universities for skilled migration" },
      { href: "/guides/real-cost-of-studying-in-australia", label: "The real cost of studying in Australia" },
    ],
  },
  business: {
    intro: [
      "Business is the single largest field of study for international students in Australia, covering the MBA, Master of Management, Master of Business Analytics, and specialist master's in marketing, finance, and human resources, plus three-year bachelor degrees.",
      "The MBA is the most expensive option and usually wants two or more years of work experience. Non-MBA business master's are more accessible: a bachelor's in any discipline, IELTS 6.5, and no work experience required at most universities. Fees range widely, from the mid AUD 30,000s at regional universities to over AUD 55,000 for a Go8 MBA.",
    ],
    careers: "Accounting is the business occupation most directly tied to skilled migration and needs a specific accredited degree plus a skills assessment. General management and marketing roles are harder to nominate for.",
    strongAt: [
      { slug: "university-of-melbourne", why: "Melbourne Business School and a highly ranked commerce faculty." },
      { slug: "unsw-sydney", why: "The AGSM and particular strength in finance, actuarial studies, and accounting." },
      { slug: "university-of-sydney", why: "Broad business school with strong finance and accounting programs." },
      { slug: "monash-university", why: "Very large business faculty with accredited accounting pathways and overseas campuses." },
      { slug: "bond-university", why: "Small classes and an accelerated calendar; MBA in about a year." },
      { slug: "queensland-university-of-technology", why: "Practical business degrees with real-world projects, in lower-cost Brisbane." },
    ],
    faq: [
      {
        q: "Is an MBA in Australia worth it for international students?",
        a: "It depends on your goal. For career progression in management it can be, especially with the networking and the post-study work visa. For skilled migration it is weaker than an accredited accounting degree, since general management is hard to get nominated for.",
      },
      {
        q: "Which business degree is best for permanent residence in Australia?",
        a: "An accredited Master of Professional Accounting, because accounting is on the skilled occupation lists and has a clear skills-assessment pathway (CPA Australia, CA ANZ, or IPA). Confirm the program is accredited before enrolling.",
      },
      {
        q: "Do Australian business master's require the GMAT?",
        a: "Most do not. A few competitive MBA programs ask for it or a GMAT waiver based on work experience. Standard business master's admit on your bachelor's record and an English test.",
      },
    ],
    related: [
      { href: "/guides/which-australian-courses-lead-to-permanent-residence", label: "Courses that lead to PR" },
      { href: "/guides/getting-a-skills-assessment-in-australia", label: "Getting a skills assessment" },
      { href: "/guides/commonwealth-supported-places-explained", label: "Commonwealth Supported Places (CSP)" },
      { href: "/visas/student-500", label: "Student visa (subclass 500)" },
      { href: "/international/india", label: "Study in Australia from India" },
      { href: "/guides/real-cost-of-studying-in-australia", label: "The real cost of studying in Australia" },
    ],
  },
  "nursing-and-health-sciences": {
    intro: [
      "Nursing and the allied health fields are strong choices in Australia because they lead to registered professions that appear on the skilled occupation lists and are in genuine shortage. The main routes are a Bachelor of Nursing, a two-year Master of Nursing for graduates of other fields, or specialist master's in public health, nutrition, and physiotherapy.",
      "Nursing has higher English requirements than most degrees, set by the Nursing and Midwifery Board of Australia: IELTS Academic 7.0 in listening, reading, and speaking, and at least 6.5 in writing, or the OET or PTE equivalent. Clinical placements are built into every nursing program.",
    ],
    careers: "Registered nurse is one of the most reliably nominated occupations across every state. Placement hours during study count toward registration, and a 485 visa gives time to register and gain experience before applying for a skilled visa.",
    strongAt: [
      { slug: "university-of-technology-sydney", why: "One of the largest and highest-ranked nursing faculties in Australia." },
      { slug: "monash-university", why: "Large nursing and midwifery school with extensive clinical placement networks." },
      { slug: "university-of-sydney", why: "Research-intensive nursing with strong clinical partnerships." },
      { slug: "deakin-university", why: "Big nursing intake, clinical simulation facilities, and flexible delivery." },
      { slug: "australian-catholic-university", why: "Nursing is a core strength, taught across campuses in most states." },
      { slug: "flinders-university", why: "Built its reputation on health sciences, including rural and remote nursing." },
    ],
    faq: [
      {
        q: "What IELTS score do I need to study nursing in Australia?",
        a: "The Nursing and Midwifery Board of Australia requires IELTS Academic 7.0 in listening, reading, and speaking, and at least 6.5 in writing, or an equivalent OET or PTE score. Results from two test sittings within six months can be combined. Universities apply this standard at admission.",
      },
      {
        q: "Can I become a registered nurse in Australia with an overseas nursing degree?",
        a: "You go through the Nursing and Midwifery Board's assessment, which may require a bridging program. Many international students instead do a full Bachelor or Master of Nursing in Australia to register directly.",
      },
      {
        q: "Is nursing a good pathway to permanent residence in Australia?",
        a: "Yes, it is one of the more dependable routes. Registered nurse is nominated by essentially every state and territory, and the 485 graduate visa gives time to register and build experience.",
      },
    ],
    related: [
      { href: "/guides/studying-in-australia-without-ielts", label: "Studying without IELTS" },
      { href: "/guides/ielts-vs-pte-for-australian-university-admission", label: "IELTS vs PTE" },
      { href: "/guides/study-to-permanent-residence-pathway-australia", label: "The study-to-PR pathway" },
      { href: "/guides/getting-a-skills-assessment-in-australia", label: "Getting a skills assessment" },
      { href: "/international/nepal", label: "Study in Australia from Nepal" },
      { href: "/best/regional-australian-universities-for-skilled-migration", label: "Regional universities for skilled migration" },
    ],
  },
  engineering: {
    intro: [
      "Engineering degrees in Australia are accredited by Engineers Australia, which matters because that accreditation is what makes your skills assessment for migration straightforward. The main options are a four-year Bachelor of Engineering (Honours) or a two-year Master of Engineering that builds on a related bachelor's.",
      "Civil, mechanical, electrical, and software engineering are the largest streams. Entry to a master's usually needs a cognate bachelor's with a credit average and IELTS 6.5. Fees are among the higher ones, commonly in the AUD 40,000s at established universities.",
    ],
    careers: "Most engineering disciplines are on the skilled occupation lists. An Engineers Australia skills assessment plus a year of experience on a 485 is the standard pre-invitation setup.",
    strongAt: [
      { slug: "unsw-sydney", why: "The largest engineering faculty in Australia, leaning hard into the discipline with co-op tracks." },
      { slug: "university-of-melbourne", why: "Master of Engineering across all major streams, taken after a Science or Design bachelor." },
      { slug: "university-of-queensland", why: "Research-intensive engineering with strong minerals, mechanical, and civil programs." },
      { slug: "monash-university", why: "Broad engineering faculty with an overseas campus option and strong aerospace and materials work." },
      { slug: "university-of-western-australia", why: "Particular strength in mining, petroleum, and marine engineering, in a regional-classified city." },
      { slug: "university-of-technology-sydney", why: "Practice-based engineering with industry placement built in." },
    ],
    faq: [
      {
        q: "Is an Australian engineering degree recognised for skilled migration?",
        a: "If it is accredited by Engineers Australia (most are), your skills assessment is a formality. For a non-accredited or overseas degree, Engineers Australia runs a Competency Demonstration Report pathway instead.",
      },
      {
        q: "Can I do a Master of Engineering without an engineering bachelor's?",
        a: "Usually no. Master of Engineering programs need a related bachelor's. A small number of universities offer a longer conversion master's for science or maths graduates.",
      },
    ],
    related: [
      { href: "/guides/getting-a-skills-assessment-in-australia", label: "Getting a skills assessment" },
      { href: "/guides/how-the-australian-points-test-works", label: "How the skilled points test works" },
      { href: "/guides/study-to-permanent-residence-pathway-australia", label: "The study-to-PR pathway" },
      { href: "/visas/temporary-graduate-485", label: "Temporary Graduate visa (485)" },
      { href: "/international/india", label: "Study in Australia from India" },
      { href: "/best/regional-australian-universities-for-skilled-migration", label: "Regional universities for skilled migration" },
    ],
  },
  law: {
    intro: [
      "A law degree in Australia comes in three forms. The undergraduate Bachelor of Laws (LLB) runs three to four years on its own or five as a double degree, and is the route for school leavers. The graduate-entry Juris Doctor (JD) is a three-year professional degree for people who already hold a bachelor's in another field, and is the most common choice for international students who did their first degree at home. The Master of Laws (LLM) is a one-year specialisation for people who are already qualified lawyers.",
      "The JD is one of the more expensive coursework degrees, commonly AUD 45,000 to 55,000 a year at the Group of Eight, less at newer and regional law schools. All three degrees teach Australian law, so an LLM does not on its own let an overseas-qualified lawyer practise here.",
    ],
    fromCountry:
      "Law attracts a smaller and more specific group of international students than business or IT, often people aiming at corporate, policy, or academic work rather than courtroom practice. If you are weighing it up, check what is different for applicants from your country on the /international pages.",
    costNote:
      "The spread is wide. A JD at a sandstone law school can cost more than double an LLB at a newer university, and the degree name matters less than the school's admission recognition and its clinical and internship offerings.",
    requirements: [
      "JD entry needs a completed bachelor's in any field, usually with a credit to distinction average. A few schools consider the LSAT but none require it. LLB entry needs a strong senior secondary result or a completed year of tertiary study.",
      "English is set higher than the general postgraduate bar: most law schools want IELTS Academic 7.0 overall with no band below 6.5, or the PTE equivalent.",
      "There is no separate portfolio or interview for most JD programs. Double-degree LLB places can be more competitive because they draw on both faculties' entry cut-offs.",
    ],
    careers: "Legal practice is hard to use for skilled migration. Solicitor and barrister sit on the occupation lists, but you must first be admitted to an Australian state legal profession, which for an overseas or JD graduate means passing the assessed academic subjects, completing Practical Legal Training, and being admitted by the state Supreme Court. Many international law graduates instead use the degree for policy, compliance, legal-adjacent corporate, or further academic work, where it is not a nominated occupation.",
    strongAt: [
      { slug: "university-of-melbourne", why: "Melbourne Law School and the graduate-entry Juris Doctor, consistently the top-ranked law school in the country." },
      { slug: "university-of-sydney", why: "Long-established law school with strong international and commercial law programs." },
      { slug: "unsw-sydney", why: "Known for social justice, human rights, and clinical legal education." },
      { slug: "australian-national-university", why: "Strong in public law, international law, and legal theory, in the national capital." },
      { slug: "monash-university", why: "Large law faculty with a well-regarded JD and extensive clinical and internship placements." },
      { slug: "university-of-queensland", why: "Broad law school with strong commercial and international law offerings in Brisbane." },
    ],
    faq: [
      {
        q: "Can I practise law in Australia with an overseas law degree?",
        a: "Not directly. You apply to the state admitting authority, which assesses your qualifications against the required academic areas known as the Priestley 11. It usually requires you to complete several bridging subjects and then Practical Legal Training before you can be admitted. A local JD covers the academic areas in full.",
      },
      {
        q: "What is the difference between an LLB and a JD in Australia?",
        a: "An LLB is an undergraduate law degree, often taken as a double degree over four to five years. A JD is a graduate-entry law degree of about three years for people who already hold a bachelor's in another field. Both are professional qualifications that let you seek admission to practise, and both cost about the same per year.",
      },
      {
        q: "Do Australian law schools require the LSAT?",
        a: "No. No Australian law school requires the LSAT for JD admission. A small number will consider a strong LSAT score as supporting evidence, but admission is based on your prior academic record.",
      },
      {
        q: "Is a law degree from Australia good for permanent residence?",
        a: "It is one of the weaker fields for skilled migration. To claim solicitor or barrister as your occupation you must first be admitted to practise in an Australian state, which takes further study and supervised work. If permanent residence is your main goal, accounting, IT, engineering, nursing, and teaching have clearer pathways.",
      },
    ],
    related: [
      { href: "/guides/getting-your-qualifications-recognised-in-australia", label: "Getting your qualifications recognised" },
      { href: "/guides/which-australian-courses-lead-to-permanent-residence", label: "Courses that lead to PR" },
      { href: "/visas/student-500", label: "Student visa (subclass 500)" },
      { href: "/guides/real-cost-of-studying-in-australia", label: "The real cost of studying in Australia" },
      { href: "/deadlines/february-2027-intake", label: "February 2027 intake deadlines" },
      { href: "/scholarships", label: "Scholarships for studying in Australia" },
    ],
  },
  psychology: {
    intro: [
      "Psychology in Australia follows a structured sequence: an accredited three-year bachelor's, then a fourth honours year, then postgraduate professional training. International students often start with a Bachelor of Psychological Science or a Graduate Diploma of Psychology to enter the sequence.",
      "Becoming a registered psychologist requires accreditation from the Australian Psychology Accreditation Council at each stage and registration with the Psychology Board of Australia. Standard entry to a bachelor's is a strong secondary record and IELTS 6.5; postgraduate places are competitive.",
    ],
    careers: "Registered psychologist and clinical psychologist appear on skilled lists but the training pathway is long. Many graduates work in research, HR, or counselling-adjacent roles that do not require full registration.",
    faq: [
      {
        q: "How long does it take to become a psychologist in Australia?",
        a: "At least six years: a three-year accredited bachelor's, a fourth honours year, and then a two-year master's or equivalent supervised practice. Clinical psychology adds further training.",
      },
    ],
  },
  education: {
    intro: [
      "Teaching qualifications in Australia are the Bachelor of Education and the graduate-entry Master of Teaching (primary or secondary) for people who already hold a bachelor's in a teaching area. Both are accredited by state teacher regulatory authorities.",
      "Teaching has higher English requirements than most fields, usually IELTS 7.5 with 8.0 in speaking and listening, set by the regulators. Programs include supervised practicum in schools. Fees are moderate, often in the high AUD 20,000s to low AUD 30,000s.",
    ],
    careers: "Secondary teachers in maths, science, and languages are consistently on skilled lists and nominated by several states. Primary teaching is more variable. Registration with a state teaching authority is required to work.",
    strongAt: [
      { slug: "university-of-melbourne", why: "Melbourne Graduate School of Education, highly ranked, with the Master of Teaching as the main route." },
      { slug: "monash-university", why: "Very large education faculty with primary, secondary, and early-childhood pathways." },
      { slug: "university-of-sydney", why: "Research-intensive education school with strong practicum partnerships." },
      { slug: "australian-catholic-university", why: "Teaching is a core ACU strength, with campuses in most states." },
      { slug: "queensland-university-of-technology", why: "Practical teacher education with extensive school placement." },
    ],
    faq: [
      {
        q: "What English score do I need to study teaching in Australia?",
        a: "Usually IELTS 7.5 overall with 8.0 in speaking and listening and no band below 7.0. This is set by teacher regulatory authorities such as VIT or NESA, not the university.",
      },
      {
        q: "Can I teach in Australia with an overseas teaching degree?",
        a: "You apply to a state teacher regulatory authority for an assessment. Depending on the outcome you may need bridging study or a full Master of Teaching to register.",
      },
    ],
  },
  "arts-and-design": {
    intro: [
      "Creative fields in Australia span fine art, graphic and communication design, animation, film, fashion, and interior design, offered mainly at universities of technology and specialist institutions like RMIT, UTS, and the creative schools within larger universities.",
      "Many design programs ask for a portfolio alongside academic results and IELTS 6.5. Studio-based teaching and industry projects are common. Fees are moderate, generally in the low to mid AUD 30,000s.",
    ],
    careers: "Some design occupations (graphic designer, web designer, industrial designer) appear on skilled lists, though creative fields are harder to nominate for than technical ones.",
    faq: [
      {
        q: "Do I need a portfolio to study design in Australia?",
        a: "For most design, fine art, and architecture programs, yes. Requirements vary from a folio of 10 to 20 works to a specific brief. Some broad creative-industries degrees admit without one.",
      },
    ],
  },
  architecture: {
    intro: [
      "Architecture in Australia is a two-part qualification: a three-year Bachelor of Design or Architectural Studies, then a two-year Master of Architecture, which is the professional degree accredited by the Architects Accreditation Council of Australia.",
      "Both stages usually require a portfolio. Registration as an architect needs the accredited master's plus logged practical experience and the Architectural Practice Examination. Fees are in the mid AUD 30,000s at most universities.",
    ],
    careers: "Architect is on the skilled occupation lists, assessed by the Architects Accreditation Council of Australia. The full path from study to registration takes several years.",
    strongAt: [
      { slug: "university-of-melbourne", why: "Melbourne School of Design, the leading architecture school in Australia." },
      { slug: "university-of-sydney", why: "Long-established architecture and urban design programs." },
      { slug: "rmit-university", why: "Studio-driven and design-focused, with a strong reputation in practice." },
      { slug: "university-of-technology-sydney", why: "Practice-based architecture with industry studios." },
      { slug: "university-of-queensland", why: "Well-regarded architecture school in subtropical Brisbane." },
    ],
    faq: [
      {
        q: "Can I register as an architect in Australia with a master's from another country?",
        a: "The Architects Accreditation Council of Australia runs an overseas qualifications assessment. An accredited Australian Master of Architecture is the most direct route to eligibility for registration.",
      },
    ],
  },
  "communications-and-media": {
    intro: [
      "Communications, media, journalism, and public relations degrees in Australia are offered widely, most strongly at UTS, RMIT, QUT, and Monash. Programs are a mix of theory and production work, often with an internship component.",
      "Entry is a bachelor's in any field for the master's, or a solid secondary record for the bachelor's, plus IELTS 6.5 (sometimes 7.0 for journalism). Fees are moderate, generally low to mid AUD 30,000s.",
    ],
    careers: "Communications roles are largely absent from the skilled occupation lists, so this field is a weaker choice if permanent residence is the main goal.",
    faq: [
      {
        q: "Is a media or communications degree from Australia good for migration?",
        a: "Not particularly. Most communications, PR, and journalism roles are not on the skilled occupation lists. Choose this field for the qualification and experience rather than a migration pathway.",
      },
    ],
  },
  "biology-and-life-sciences": {
    intro: [
      "Life sciences in Australia cover biomedical science, biotechnology, molecular biology, genetics, and marine and environmental biology. The research-intensive Group of Eight universities and James Cook University (for tropical and marine biology) are the traditional strengths.",
      "Undergraduate entry is a strong science background; postgraduate coursework master's accept cognate bachelor's with a credit average and IELTS 6.5. Research master's and PhDs are funded through the Research Training Program.",
    ],
    careers: "Pure life-science roles are thin on the skilled lists. Graduates often move into laboratory, research support, regulatory, or further study (medicine, PhD) rather than a direct migration occupation.",
    faq: [
      {
        q: "Can a biology degree lead to permanent residence in Australia?",
        a: "Not directly through the occupation lists. Common routes are further study into a listed health profession, a research higher degree, or employer sponsorship.",
      },
    ],
  },
  agriculture: {
    intro: [
      "Agricultural science, agribusiness, and viticulture are areas where Australia has genuine research depth, concentrated at regional universities like Charles Sturt, the University of New England, and the University of Adelaide, plus the Group of Eight for research degrees.",
      "Programs often include farm-based or industry placements. Entry is a science or agriculture background for postgraduate study and IELTS 6.5. Fees are among the lower ones, frequently in the mid to high AUD 20,000s.",
    ],
    careers: "Agricultural consultant, agronomist, and agricultural scientist appear on skilled lists and are nominated by several states, particularly for regional roles. Studying at a regional campus adds migration points.",
    strongAt: [
      { slug: "university-of-adelaide", why: "The Waite campus, one of the largest agricultural research precincts in the southern hemisphere." },
      { slug: "charles-sturt-university", why: "Trains a large share of Australia's rural agronomists and vets, across regional NSW." },
      { slug: "university-of-new-england", why: "Australia's first regional university, with deep strength in agriculture and rural science." },
      { slug: "university-of-queensland", why: "Gatton campus and strong agricultural and animal science programs." },
      { slug: "university-of-western-australia", why: "Agricultural science tied to WA's grain and livestock industries, in a regional-classified city." },
    ],
    faq: [
      {
        q: "Is agriculture a good field for skilled migration to Australia?",
        a: "It can be. Agricultural scientist, agronomist, and agricultural consultant are on skilled lists and several states nominate for them, especially for regional employment. Studying regionally also earns points.",
      },
    ],
  },
  "hospitality-and-tourism": {
    intro: [
      "Hospitality management, tourism, and events are taught at specialist institutions like William Angliss, Blue Mountains International Hotel Management School, and ICMS, as well as several universities. Programs are practical, with substantial paid or unpaid industry placement.",
      "Entry bars are lower than for most fields, and fees are among the cheapest, often in the low to mid AUD 20,000s. IELTS 6.0 to 6.5 is typical.",
    ],
    careers: "Some management roles (cafe or restaurant manager, hotel manager) appear on regional occupation lists, but hospitality is generally a weaker migration pathway than technical fields.",
    faq: [
      {
        q: "Is hospitality management a pathway to PR in Australia?",
        a: "Weakly. A few management occupations are on regional lists, and studying in a regional area helps, but it is less reliable than nursing, engineering, or accounting.",
      },
    ],
  },
  "music-and-performing-arts": {
    intro: [
      "Music, acting, and performing arts are taught at conservatoriums within larger universities and at specialist schools like NIDA, the Australian Institute of Music, and WAAPA at Edith Cowan. Entry is almost always by audition or portfolio.",
      "Cohorts are small and admission is competitive, particularly for acting. Fees vary widely. These programs are chosen for the training and industry connection rather than a migration outcome.",
    ],
    careers: "Performing-arts occupations are not on the skilled lists. This field is about the craft and the network, not permanent residence.",
    faq: [
      {
        q: "Do I need to audition to study music or acting in Australia?",
        a: "Almost always. Performance programs require a live or recorded audition; some also want a written application or interview. Music production and music business programs may accept a portfolio instead.",
      },
    ],
  },
  "environmental-science": {
    intro: [
      "Environmental science, sustainability, and environmental management degrees in Australia draw on the country's distinctive ecosystems and its strengths in marine, Antarctic, and land management research. The University of Tasmania, James Cook University, and the Group of Eight are notable.",
      "Programs combine fieldwork with policy and data skills. Entry is a science background for the master's and IELTS 6.5. Fees are moderate, generally low to mid AUD 30,000s.",
    ],
    careers: "Environmental consultant and environmental scientist appear on some skilled and regional lists. The pathway is less direct than engineering or health but exists.",
    strongAt: [
      { slug: "university-of-tasmania", why: "World-class marine, Antarctic, and land-management science, the whole state classified regional." },
      { slug: "james-cook-university", why: "Tropical ecology and environmental science next to the Great Barrier Reef." },
      { slug: "australian-national-university", why: "Fenner School of Environment and Society, strong in policy and climate science." },
      { slug: "university-of-queensland", why: "Environmental management and ecology with major research centres." },
      { slug: "murdoch-university", why: "Environmental and conservation science with a bushland campus and wildlife facilities." },
    ],
    faq: [
      {
        q: "Is environmental science on the skilled occupation list in Australia?",
        a: "Environmental scientist and environmental consultant appear on some lists and are nominated by certain states, often for regional roles. Check the current Core Skills Occupation List and state criteria.",
      },
    ],
  },
  "political-science-and-international-relations": {
    intro: [
      "Political science and international relations are taught across about 11 Australian universities, with roughly 34 programs for international students. The common postgraduate qualifications are the Master of International Relations, the Master of Public Policy, and coursework masters in political science, diplomacy, or national security, most of which accept a bachelor degree in any field. Bachelor degrees in politics and international relations are widely available too.",
      "Fees run from the high AUD 20,000s at Edith Cowan and the University of the Sunshine Coast to around AUD 50,000 at the research-intensive universities, with most programs between AUD 30,000 and AUD 46,000 a year. Standard entry is a bachelor with a credit average and IELTS 6.5. Canberra is the natural base for the field, with the federal public service, the diplomatic corps, and the national security agencies all in the city.",
    ],
    careers: "Political science and international relations do not map neatly onto the skilled occupation lists, and many Australian public-sector and policy roles require citizenship. Graduates more often use the degree for work with international organisations, NGOs, research, and journalism, for further study, or paired with a field that does have a migration pathway.",
    strongAt: [
      { slug: "australian-national-university", why: "The strongest school in the country for the field, with the Coral Bell School of Asia Pacific Affairs, the Crawford School of Public Policy, and the National Security College, all in Canberra." },
      { slug: "unsw-sydney", why: "Well regarded for politics and international relations, with strength in human rights, security, and Australian foreign policy." },
      { slug: "macquarie-university", why: "Long-established politics and international relations department with a broad coursework offering in Sydney." },
      { slug: "griffith-university", why: "The Griffith Asia Institute anchors strong work on the Indo-Pacific, regional security, and development." },
      { slug: "deakin-university", why: "The Alfred Deakin Institute for Citizenship and Globalisation gives its international relations programs a research base." },
    ],
    faq: [
      {
        q: "Which Australian university is best for international relations?",
        a: "There is no official field-level ranking, but the Australian National University has the clearest reputation for political science, international relations, and public policy, helped by its location in Canberra and its dedicated schools for Asia-Pacific affairs, public policy, and national security. UNSW, Macquarie, Griffith, and Deakin also have recognised strengths.",
      },
      {
        q: "Does a political science degree help with skilled migration to Australia?",
        a: "Not directly. Policy, intelligence, and most government analyst roles in Australia require citizenship, and the field does not sit cleanly on the skilled occupation lists the way computing, engineering, nursing, and accounting do. If permanent residence is the goal, treat this degree as something to combine with a profession that has a clearer pathway, or plan around roles with international organisations and NGOs.",
      },
      {
        q: "Can I study international relations in Australia without a related bachelor?",
        a: "Usually yes. Most Master of International Relations and Master of Public Policy programs are generalist and accept a bachelor degree in any discipline with a credit average. A few research-focused or specialist masters expect some background in politics, economics, or a related social science.",
      },
    ],
  },
};
