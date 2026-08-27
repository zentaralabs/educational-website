export type SubjectContent = {
  /** 1-2 paragraphs on studying this field in Australia as an international student. */
  intro: string[];
  /** One line on graduate outcomes and skilled-migration relevance. */
  careers: string;
  faq: { q: string; a: string }[];
};

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
  },
  "information-technology": {
    intro: [
      "Information technology degrees in Australia are practical and broad, covering software development, networking, cybersecurity, data, and IT project management. The Master of Information Technology is the flagship postgraduate qualification and is open to graduates of any discipline at most universities.",
      "Fees sit a little below straight computer science at many universities, and several universities of technology (UTS, RMIT, QUT, Curtin, Swinburne) build a mandatory industry placement into the degree. Standard entry is a bachelor's in any field with a credit average and IELTS 6.5.",
    ],
    careers: "ICT business analyst, systems analyst, and software roles are skilled occupations. IT graduates often add a Professional Year in IT for extra migration points.",
    faq: [
      {
        q: "What is the difference between a Master of IT and a Master of Computer Science?",
        a: "IT is more applied and industry-focused; computer science leans theoretical and research-oriented. For skilled migration both map to ICT occupations. Pick based on whether you want hands-on project work or deeper technical foundations.",
      },
      {
        q: "Is a Professional Year worth it after an IT degree?",
        a: "It adds 5 points to the skilled points test and includes a work placement, which helps with your first Australian job. It costs roughly AUD 10,000 to 12,000 and takes about a year.",
      },
    ],
  },
  "data-science": {
    intro: [
      "Data science is one of the faster-growing postgraduate fields in Australia, sitting between computer science, statistics, and business analytics. Most programs are one to two year master's degrees, and universities differ on how much coding versus statistics they expect coming in.",
      "Entry typically requires a bachelor's with some quantitative content (mathematics, statistics, engineering, economics, or computing) and IELTS 6.5. A few universities offer a longer two-year version for applicants without that background.",
    ],
    careers: "Data scientist and data analyst roles feed into ICT and, in some states, dedicated data occupations on the nomination lists. The 485 graduate visa gives time to reach the experience most skilled visas want.",
    faq: [
      {
        q: "Do I need to know programming before a data science master's in Australia?",
        a: "For the one-year versions, yes, usually Python or R plus basic statistics. Two-year versions include a foundational semester and accept applicants from broader backgrounds.",
      },
    ],
  },
  business: {
    intro: [
      "Business is the single largest field of study for international students in Australia, covering the MBA, Master of Management, Master of Business Analytics, and specialist master's in marketing, finance, and human resources, plus three-year bachelor degrees.",
      "The MBA is the most expensive option and usually wants two or more years of work experience. Non-MBA business master's are more accessible: a bachelor's in any discipline, IELTS 6.5, and no work experience required at most universities. Fees range widely, from the mid AUD 30,000s at regional universities to over AUD 55,000 for a Go8 MBA.",
    ],
    careers: "Accounting is the business occupation most directly tied to skilled migration and needs a specific accredited degree plus a skills assessment. General management and marketing roles are harder to nominate for.",
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
  },
  "nursing-and-health-sciences": {
    intro: [
      "Nursing and the allied health fields are strong choices in Australia because they lead to registered professions that appear on the skilled occupation lists and are in genuine shortage. The main routes are a Bachelor of Nursing, a two-year Master of Nursing for graduates of other fields, or specialist master's in public health, nutrition, and physiotherapy.",
      "Nursing has higher English requirements than most degrees, typically IELTS 7.0 with no band below 7.0, because registration with the Nursing and Midwifery Board depends on it. Clinical placements are built into every nursing program.",
    ],
    careers: "Registered nurse is one of the most reliably nominated occupations across every state. Placement hours during study count toward registration, and a 485 visa gives time to register and gain experience before applying for a skilled visa.",
    faq: [
      {
        q: "What IELTS score do I need to study nursing in Australia?",
        a: "Usually IELTS 7.0 overall with no individual band below 7.0, or an equivalent PTE score. This is set by the Nursing and Midwifery Board of Australia for registration, and universities apply it at admission.",
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
  },
  engineering: {
    intro: [
      "Engineering degrees in Australia are accredited by Engineers Australia, which matters because that accreditation is what makes your skills assessment for migration straightforward. The main options are a four-year Bachelor of Engineering (Honours) or a two-year Master of Engineering that builds on a related bachelor's.",
      "Civil, mechanical, electrical, and software engineering are the largest streams. Entry to a master's usually needs a cognate bachelor's with a credit average and IELTS 6.5. Fees are among the higher ones, commonly in the AUD 40,000s at established universities.",
    ],
    careers: "Most engineering disciplines are on the skilled occupation lists. An Engineers Australia skills assessment plus a year of experience on a 485 is the standard pre-invitation setup.",
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
  },
  law: {
    intro: [
      "Law in Australia is offered as an undergraduate LLB (often as a double degree) and as the graduate-entry Juris Doctor for people who already hold a bachelor's in another field. There is also the Master of Laws (LLM) for qualified lawyers who want to specialise.",
      "The JD is a three-year professional degree and one of the more expensive options, commonly over AUD 45,000 a year at the Group of Eight. Practising as a lawyer in Australia requires admission to a state legal profession, which involves practical legal training beyond the degree.",
    ],
    careers: "Legal roles are difficult to nominate for skilled migration unless you requalify and gain local experience. Many international law graduates use the degree for policy, compliance, or corporate roles rather than practice.",
    faq: [
      {
        q: "Can I practise law in Australia with an overseas law degree?",
        a: "Not directly. You apply to a state Legal Practitioners Admissions Board, which assesses your qualifications and usually requires you to complete specific subjects and practical legal training before admission.",
      },
      {
        q: "What is the difference between an LLB and a JD in Australia?",
        a: "An LLB is an undergraduate law degree, often taken as a double degree over five years. A JD is a graduate-entry law degree of about three years for people who already hold a bachelor's. Both qualify you to seek admission to practice.",
      },
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
    faq: [
      {
        q: "Is environmental science on the skilled occupation list in Australia?",
        a: "Environmental scientist and environmental consultant appear on some lists and are nominated by certain states, often for regional roles. Check the current Core Skills Occupation List and state criteria.",
      },
    ],
  },
};
