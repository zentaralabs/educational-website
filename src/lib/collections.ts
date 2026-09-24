import { GO8_SLUGS, isRegionalCity } from "@/lib/australia";
import type { CollectionUniversity } from "@/lib/queries/public-collections";
import { formatCurrency } from "@/lib/format";
import { SUBJECT_BEST_PAGES, SUBJECT_CONTENT } from "@/lib/subjects";

export type CollectionEntry = {
  slug: string;
  name: string;
  city: string | null;
  /** Short bold metric shown next to the name. */
  headline: string;
  /** One sentence of reasoning specific to this university. */
  note: string;
};

/** A short editorial section rendered between the intro/table and the ranked list, or after it. */
export type CollectionSection = {
  heading: string;
  body: string[];
};

/** An at-a-glance comparison table, rendered above the ranked list. */
export type CollectionTable = {
  columns: string[];
  /** One row per entry; cell order matches `columns`. Use null for "not published". */
  rows: { cells: (string | null)[] }[];
  /** Shown under the table, e.g. a "last verified" stamp. */
  note?: string;
};

export type Collection = {
  slug: string;
  /** On-page H1. Free to be long and explanatory. */
  title: string;
  /**
   * SERP title, when the H1 is longer than the ~60 characters Google renders.
   * Keyword-first: "Cheapest Universities in Sydney" beats "The cheapest
   * universities in Sydney for international students", which gets cut at
   * "...for internation". Falls back to `title` when unset.
   */
  metaTitle?: string;
  shortTitle: string;
  /** Groups the shortlist on the /best index tabs. */
  category: "cost" | "admissions" | "migration" | "city" | "subject";
  metaDescription: string;
  /** Editorial intro, one or two paragraphs. */
  intro: string[];
  /** Optional editorial sections rendered after the intro, before the comparison table/list. */
  sectionsBeforeList?: CollectionSection[];
  /** Optional at-a-glance comparison table, rendered after `sectionsBeforeList` and before the ranked list. */
  table?: CollectionTable;
  /** Optional editorial sections rendered after the ranked list, before "How this list was built". */
  sectionsAfterList?: CollectionSection[];
  /** How the list was built. */
  methodology: string;
  /** Optional FAQ, rendered after methodology. Adds FAQPage JSON-LD. */
  faq?: { q: string; a: string }[];
  /**
   * The guide (or other non-list page) that explains the concept behind this
   * shortlist. Rendered as a callout on the collection page so the "understand
   * it" and "see the universities" pages point at each other rather than
   * competing for the same query.
   */
  relatedGuide?: { href: string; label: string };
  /**
   * A sibling /best collection covering an adjacent-but-distinct search
   * intent (e.g. the MBA page and the broader business-schools page),
   * rendered as its own callout so the two don't compete for the same
   * query while still pointing a reader toward the more specific one.
   */
  seeAlso?: { href: string; label: string };
  build: (universities: CollectionUniversity[]) => CollectionEntry[];
};

/** Tab labels + order for the /best index. */
export const BEST_CATEGORY_LABELS: Record<Collection["category"], string> = {
  cost: "Cost & funding",
  admissions: "Getting in",
  migration: "Migration & timing",
  city: "By city",
  subject: "By subject",
};

export const BEST_CATEGORY_ORDER: Collection["category"][] = [
  "cost",
  "admissions",
  "migration",
  "city",
  "subject",
];

const isRegional = isRegionalCity;
const GO8 = GO8_SLUGS;

function budget(u: CollectionUniversity): string {
  return u.firstYearBudget
    ? `${formatCurrency(u.firstYearBudget, "AUD")} first-year budget`
    : "Budget not available";
}

const SUBJECT_NAMES: Record<string, string> = {
  "computer-science": "computer science",
  "information-technology": "information technology",
  "data-science": "data science",
  business: "business and management",
  "nursing-and-health-sciences": "nursing and health sciences",
  engineering: "engineering",
};

/**
 * Hand-written opening paragraph for the factory-built subject and city
 * collections, keyed by collection slug. Prepended to the templated intro so
 * each page leads with something specific to that subject or city rather than
 * the same sentence with a noun swapped. Needs a factual review pass on any
 * edit. House style: no em dashes.
 */
const LEAD: Record<string, string> = {
  "best-australian-universities-for-computer-science":
    "Computing is one of the more reliable study-to-migration routes in Australia, with software, systems, and cybersecurity roles all on the skilled occupation lists. Reputation in the field clusters at a handful of universities with large research groups and deep industry ties, though a strong specialisation at a mid-ranked university often matters more than the overall name. Fees run from the low AUD 30,000s to the high 40,000s a year.",
  "best-australian-universities-for-information-technology":
    "Information technology degrees cover much the same ground as computer science with a more applied, industry-facing slant, and several universities of technology build an assessed placement into the program. The master's usually accepts a bachelor's in any discipline, which makes IT a common conversion path for career changers. Entry sits around a credit average and IELTS 6.5.",
  "best-australian-universities-for-data-science":
    "Data science sits between statistics, computing, and a domain subject, so the strongest programs have genuine depth in all three rather than being a rebadged analytics course. Most master's degrees want some quantitative content in your prior study. The field maps onto the skilled occupation lists through computing and statistics roles.",
  "best-australian-universities-for-business":
    "No single ranking settles which Australian university is best for business, and accreditation from AACSB, EQUIS, or AMBA is a more useful signal than a league-table position. The gap is wide between an MBA, which usually wants work experience and costs the most, and a general business master's, which often wants neither. This shortlist flags what each school is known for.",
  "best-australian-universities-for-nursing-and-health-sciences":
    "Nursing is regulated. The qualification has to be accredited by the Australian Nursing and Midwifery Accreditation Council, and the Nursing and Midwifery Board sets one of the highest English bars of any field for registration, so a program's accreditation status matters more than its prestige. Registered nurse is on the skilled occupation lists, which makes nursing one of the clearer routes to permanent residence.",
  "best-australian-universities-for-engineering":
    "For engineering, the signal that matters most is Engineers Australia accreditation, which every program here holds and which underpins both registration and the skilled-migration skills assessment. Beyond that, strength is specialised: a university can lead in mining or civil and be ordinary in software. Fees are among the higher ones, commonly in the AUD 40,000s.",
  "cheapest-universities-in-sydney-for-international-students":
    "Sydney is the most expensive place to study in Australia, and rent is almost the entire reason. Tuition at a western-Sydney university can be less than half what a Group of Eight charges, so the institution you pick moves your budget far more than the suburb does. Metropolitan Sydney does not count as a regional area for migration points.",
  "cheapest-universities-in-melbourne-for-international-students":
    "Melbourne runs a close second to Sydney on cost, with the same pattern: rent is the swing factor and tuition varies widely by university. The city has more universities within commuting distance than anywhere else in the country, which widens the cheaper end of this list. Like Sydney, metropolitan Melbourne is not a regional area for skilled migration.",
  "cheapest-universities-in-perth-for-international-students":
    "Perth is one of the more affordable capital cities for students, and unusually it counts as a regional area for skilled migration, so studying here earns the regional study points on the skilled visa points test and opens the 491 and 190 nomination pathways. The trade-off is distance from the eastern states. Curtin and UWA anchor the list.",
  "cheapest-universities-in-brisbane-for-international-students":
    "Brisbane costs noticeably less than Sydney or Melbourne, mostly on rent, while everyday expenses are similar. Brisbane itself is not classified as regional for migration, though several other Queensland cities are. The list leans toward the technology-focused universities, with UQ at the higher-fee end.",
  "cheapest-universities-in-adelaide-for-international-students":
    "Adelaide is among the cheapest capital cities to live in and is a designated regional area for skilled migration, which adds points and widens state-nomination options. The university landscape changed in 2026 when two long-established institutions merged into Adelaide University, so catalogues and fee schedules are still settling. Confirm figures with the university directly.",
  "cheapest-universities-in-canberra-for-international-students":
    "Canberra is smaller and quieter than the big east-coast cities, with a tighter but generally cheaper rental market and short commutes. The choice is narrow: ANU, which is highly selective and sits in the top fee band, and the University of Canberra, which is more accessible on both entry and cost. The whole ACT counts as a regional area for skilled migration, and it runs its own 190 and 491 nomination through the Canberra Matrix.",
};

/**
 * Optional hand-written sections/FAQ layered onto the generic
 * subjectBestCollection template, keyed by SUBJECT_BEST_PAGES slug. Added so
 * these pages carry real field-specific depth (accreditation body, migration
 * pathway, entry bar) instead of just the generic intro + ranked list.
 * Content checked against ACS/Engineers Australia/NMBA published guidance
 * and the skilled occupation lists in September 2026; re-verify before
 * reusing elsewhere.
 */
const SUBJECT_BEST_EXTRA: Record<
  string,
  {
    sectionsBeforeList?: CollectionSection[];
    sectionsAfterList?: CollectionSection[];
    faq?: { q: string; a: string }[];
  }
> = {
  "computer-science": {
    sectionsBeforeList: [
      {
        heading: "You don't need a maths-heavy background to switch into it",
        body: [
          "A direct-entry Bachelor of Computer Science usually wants senior secondary maths at a level comparable to Australian Methods or Specialist Maths, which rules some international applicants out or means a bridging semester. The more common route for international students who already hold a bachelor's degree in an unrelated field is a conversion Master of Computer Science: an 18-month to two-year postgraduate degree that assumes no prior programming, admits graduates from any discipline, and is still ACS-accredited at the end, exactly like the undergraduate degree.",
          "ACS accreditation itself is recognised beyond Australia through the Seoul Accord, the ICT equivalent of engineering's Washington Accord, a mutual-recognition agreement between the computing accreditation bodies of Australia, Canada, the US, the UK, Japan, Korea, and several other signatories. That matters less for the visa (which runs on the ACS skills assessment either way) and more if you're weighing whether the qualification will be recognised if you later work outside Australia.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "Accreditation and the migration pathway",
        body: [
          "The Australian Computer Society (ACS) is the skills assessing authority for ICT occupations on the skilled migration lists, and it accredits specific computer science degrees at each university rather than a department as a whole. An ACS-accredited degree still needs an ACS skills assessment before a skilled visa application, but graduating from an accredited program removes any question about whether your qualification counts as \"ICT major\" content, which is where self-taught-heavy or conversion degrees can run into trouble.",
          "Software Engineer, Developer Programmer, Systems Analyst, and Computer Network and Systems Engineer are among the ICT occupations that sit on the Core Skills Occupation List, which supports the 189, 190, 491, and employer-sponsored 482 and 186 visas. Most computer science graduates on the 485 graduate visa apply for the ACS assessment while they have work rights, since it takes several weeks and some occupations require documented employment history.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need an ACS-accredited degree to work in tech in Australia?",
        a: "Not to get a job, but you need an ACS skills assessment for most ICT skilled visas, and graduating from an ACS-accredited program makes that assessment more straightforward because the ICT content of your degree isn't in question.",
      },
      {
        q: "Is computer science a good pathway to permanent residence in Australia?",
        a: "Yes. Several ICT occupations, including Software Engineer and Developer Programmer, sit on the Core Skills Occupation List, and the 485 graduate visa gives time to build the local experience some pathways want before applying for a skilled visa.",
      },
      {
        q: "What's the difference between a Bachelor of Computer Science and a Bachelor of Software Engineering?",
        a: "Software engineering programs generally lean more toward formal engineering design process and large-system architecture, while computer science is broader and lets you specialise later in AI, security, or data through electives. Both are assessed by ACS for ICT skilled visas, so the choice matters more for what you'll actually enjoy studying than for the migration outcome.",
      },
    ],
  },
  "information-technology": {
    sectionsBeforeList: [
      {
        heading: "The Professional Year: a structured bridge from degree to visa",
        body: [
          "The ACS Professional Year in IT is a 44-week program (32 weeks of classroom training plus a 12-week workplace internship) built specifically for recent IT graduates on a 485 graduate visa, and it's worth planning for before you finish your degree rather than discovering it afterwards. Completing it within four years of your visa application adds 5 points on the general skilled migration points test for eligible occupations, on top of giving you the local workplace experience and references that are otherwise hard to get straight out of an international student's degree.",
          "It's a separate, ACS-approved provider program, not something your university runs, and it only makes sense once you're already ACS skills-assessed and holding (or about to hold) a 485 visa, so it's a post-graduation decision rather than something that affects which university or degree you pick now.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "ACS assessment and which IT roles count",
        body: [
          "Information technology sits under the same ACS skills-assessing framework as computer science, but the occupation list is broader: ICT Business Analyst, Analyst Programmer, and ICT Security Specialist join Software Engineer and Systems Analyst on the Core Skills Occupation List, alongside less technical roles like ICT Project Manager. Which ANZSCO occupation your degree and work experience map to matters more for a skilled visa than which university you attended, so check the specific occupation before picking a specialisation.",
          "A general IT degree without a strong major (networking, security, or software development, for example) can be harder for ACS to match to a specific skilled occupation. Universities that clearly label their IT specialisations make that mapping easier when you apply for the assessment.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the difference between computer science and information technology degrees for migration?",
        a: "Both go through the same ACS skills assessment and can lead to the same ICT occupations. Computer science tends to be more theory- and software-development-heavy; IT degrees are often broader and can include networking, security, or business-systems specialisations, so the occupation you're assessed against depends more on your major and work history than the degree title.",
      },
      {
        q: "Is the ACS Professional Year worth doing after an IT degree?",
        a: "If you're on a 485 graduate visa and planning a skilled visa application, generally yes: it's the most direct way to add 5 points and get supervised local work experience, and both count toward occupations that are otherwise hard to build a local track record for straight out of a degree. It costs money and takes 44 weeks, so weigh that against how close you already are to the points threshold without it.",
      },
      {
        q: "Do I need work experience before applying for an IT graduate role in Australia?",
        a: "Not formally for an entry-level graduate role, but international graduates without local internships or a placement built into their degree often find the local-experience expectation is the real barrier, not the degree itself. A degree with an industry placement, or completing the ACS Professional Year afterward, addresses this directly.",
      },
    ],
  },
  "data-science": {
    sectionsBeforeList: [
      {
        heading: "The same degree title, taught out of different faculties",
        body: [
          "\"Data science\" isn't a single standardised curriculum in Australia the way \"nursing\" is: at one university it's taught out of the science faculty with a heavy statistics and mathematics core, at another it sits inside the engineering or IT faculty and leans toward software engineering and systems work. Both get called a Bachelor or Master of Data Science, but they lead to meaningfully different skill sets and, as above, different skilled-migration occupation mappings, so read the actual unit list before assuming two programs with the same name are interchangeable.",
          "Entry maths requirements track the faculty: science-faculty programs generally expect a stronger senior secondary maths background than IT-faculty ones, which more often offer a bridging or foundation option for students without it.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "Where data science fits on the skilled migration lists",
        body: [
          "Data Scientist is not its own line on Australia's skilled occupation lists, so ACS skills assessments for data science graduates are usually matched against a related ICT occupation such as ICT Business Analyst, Analyst Programmer, or Software Engineer, depending on how much of the degree was programming and systems work versus statistics and analytics. That mapping is worth checking with ACS before you enrol if migration is the main goal, since it affects which occupation ceiling and state nomination criteria apply to you.",
          "In practice, a data science degree with a strong programming and software-engineering core maps more cleanly to an ICT occupation than one built mostly around statistics electives, which can sit closer to a mathematics or analytics classification instead.",
          "If migration is the priority rather than the specific job title, this actually gives you room to choose: picking electives that lean toward programming and systems work over pure statistics keeps more ICT occupations open to you at assessment time, without changing the degree you graduate with.",
        ],
      },
    ],
    faq: [
      {
        q: "Is there a dedicated Data Scientist visa occupation in Australia?",
        a: "No. Data Scientist doesn't appear as its own entry on the skilled occupation lists, so ACS typically assesses data science graduates against a related ICT occupation like ICT Business Analyst, Analyst Programmer, or Software Engineer, based on the degree's actual content and your work history.",
      },
      {
        q: "Should I do a data science degree or a straight computer science degree if I want to work in AI or machine learning?",
        a: "Either can work: a computer science degree with machine learning and AI electives gives you a broader software-engineering foundation that's useful for building production systems, while a data science degree goes deeper on the statistics and modelling side earlier. Employers hiring for ML engineering roles specifically often prefer the stronger software-engineering base, so check the elective list rather than the degree title.",
      },
      {
        q: "Do I need a strong maths background to study data science in Australia?",
        a: "It depends on the faculty. Science-faculty data science programs generally expect senior secondary maths at a level comparable to Australian Specialist or Methods Maths; IT-faculty programs are often more accessible and may offer a bridging option if your maths background is weaker.",
      },
      {
        q: "Is a data science master's worth it if I already have a computer science or maths bachelor's?",
        a: "Often yes, if you want structured depth in statistics, machine learning, and big-data systems specifically, rather than picking those up piecemeal through electives or on the job. It's a genuine specialisation, not just a relabelled computer science degree, so check the unit list matches what you actually want to go deeper on before enrolling.",
      },
    ],
  },
  engineering: {
    sectionsBeforeList: [
      {
        heading: "The Professional Year applies here too",
        body: [
          "Engineering has its own version of the ACS Professional Year: a structured post-graduation program combining workplace-readiness training with an industry internship, run by an Engineers Australia-approved provider rather than by ACS, aimed at international graduates on a 485 visa. Like the IT version, completing it within the required window before you lodge a skilled visa application adds bonus points on the general skilled migration points test, and it's a post-degree decision rather than something that changes which university or program you should pick now.",
          "Most four-year Bachelor of Engineering (Honours) programs run a mandatory industry placement or work-integrated-learning component built into the degree itself, separate from the Professional Year, and universities vary in how much help they give international students to secure one. Ask about placement support specifically, not just whether a placement is required, since a required-but-unsupported placement can be a real barrier for a student without existing local contacts.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "Engineers Australia accreditation and the Washington Accord",
        body: [
          "Engineers Australia accredits specific engineering degrees, not universities as a whole, against the Washington Accord competency standard. A degree accredited under the Washington Accord is recognised as equivalent to a professional engineering qualification in every other signatory country, and graduating from one means Engineers Australia's Migration Skills Assessment (the standard route to a skilled engineering visa) accepts your qualification without the extra Competency Demonstration Report that non-accredited or overseas-qualified applicants have to write.",
          "Most four-year Bachelor of Engineering (Honours) programs at Australian universities are Washington Accord accredited; check the specific program and major, since a small number of newer or combined degrees are not, or are accredited under a different track (the Sydney Accord, for engineering technologist qualifications, carries a lower level of recognition).",
        ],
      },
    ],
    faq: [
      {
        q: "Does my engineering degree need to be Engineers Australia accredited for a skilled visa?",
        a: "It doesn't have to be, but it makes the Migration Skills Assessment far simpler. A Washington Accord-accredited degree skips the Competency Demonstration Report that non-accredited and overseas graduates must write to prove their engineering competencies against Engineers Australia's standard.",
      },
      {
        q: "What is the difference between the Washington Accord and the Sydney Accord for engineering degrees?",
        a: "The Washington Accord covers full professional engineering (Engineer) qualifications; the Sydney Accord covers engineering technologist qualifications, a step below, which carry a lower migration skills-assessment outcome (Engineering Technologist rather than Professional Engineer). Check which accord your specific program is accredited under, not just whether it says \"accredited\".",
      },
      {
        q: "Is the engineering Professional Year the same program as the IT one?",
        a: "No, it's run by an Engineers Australia-approved provider rather than ACS and structured for engineering occupations specifically, but the shape is the same: classroom job-readiness training plus a workplace internship, done on a 485 visa, adding bonus points toward a skilled visa within the required window.",
      },
    ],
  },
  "nursing-and-health-sciences": {
    sectionsBeforeList: [
      {
        heading: "Already have a bachelor's degree? You don't need to start over",
        body: [
          "A Master of Nursing (Graduate Entry) is the standard route into nursing for international students who already hold a bachelor's degree in an unrelated field. It's a full postgraduate nursing qualification, typically completed in around two years full-time (some universities offer it in as little as 18 months), built around the same ANMAC-accredited curriculum and clinical placement requirements as the undergraduate Bachelor of Nursing, and it leads to the identical outcome: eligibility to register as a Registered Nurse with NMBA. It is not a shortcut with a lesser qualification at the end, just a faster route to the same one if you're not starting from a blank undergraduate transcript.",
          "The NMBA English and clinical-placement requirements below apply identically whether you take the three- or four-year undergraduate route or the graduate-entry master's, so don't assume the postgraduate pathway relaxes them.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "NMBA registration is the real gate, not the university",
        body: [
          "Every Bachelor of Nursing accredited by the Australian Nursing and Midwifery Accreditation Council leads to the same outcome: eligibility to register as a Registered Nurse with the Nursing and Midwifery Board of Australia (NMBA). The university you attend affects clinical placement quality, campus location, and cost, but not whether you can register, since accreditation (not institutional prestige) is what NMBA checks.",
          "The NMBA's English requirement is stricter than most university admission requirements: IELTS Academic 7.0 in listening, reading, and speaking, and 6.5 in writing, or the equivalent OET or PTE Academic score. Confirm your university's admission IELTS bar against this registration bar separately, since a program that admits at 6.5 overall can still require you to hit 7.0 in three of four bands before NMBA will register you at the end.",
        ],
      },
    ],
    faq: [
      {
        q: "Does it matter which Australian university I study nursing at for registration?",
        a: "Not for eligibility to register. Any Bachelor of Nursing accredited by the Australian Nursing and Midwifery Accreditation Council leads to NMBA registration eligibility. It matters for clinical placement access, cost, and campus location, which is what actually varies between universities.",
      },
      {
        q: "Can I do a Master of Nursing in Australia if I already have a nursing degree from another country?",
        a: "The graduate-entry master's is designed for a non-nursing bachelor's, not as a bridging pathway for an overseas nursing qualification. If you already hold a nursing degree from another country, NMBA's overseas qualification assessment process (rather than enrolling in a new Australian nursing degree) is usually the more direct route, and it may require a bridging program rather than a full degree.",
      },
      {
        q: "How many clinical placement hours does an Australian nursing degree require?",
        a: "ANMAC-accredited programs build a substantial block of supervised clinical placement hours into the curriculum, spread across the degree rather than concentrated at the end, and the exact number and settings (hospital, aged care, community health) vary by university. Ask the specific program for its placement hour total and where placements are typically located, since travel to a placement site is a real cost some students don't budget for.",
      },
    ],
  },
};

/** Builds a "best universities for <subject>" collection from the curated
 *  strongAt list in SUBJECT_CONTENT. */
function subjectBestCollection(subjectSlug: string): Collection {
  const name = SUBJECT_NAMES[subjectSlug] ?? subjectSlug.replace(/-/g, " ");
  const curated = SUBJECT_CONTENT[subjectSlug]?.strongAt ?? [];
  const order = new Map(curated.map((c, i) => [c.slug, i]));
  const why = new Map(curated.map((c) => [c.slug, c.why]));
  const extra = SUBJECT_BEST_EXTRA[subjectSlug];
  return {
    slug: `best-australian-universities-for-${subjectSlug}`,
    title: `The best Australian universities for ${name}`,
    metaTitle: `Best Australian Universities for ${name}`,
    shortTitle: `Best for ${name}`,
    category: "subject",
    metaDescription: `Australian universities with a recognised strength in ${name}, for international students. Reputation, cost, and the skilled-migration angle.`,
    intro: [
      ...(LEAD[`best-australian-universities-for-${subjectSlug}`]
        ? [LEAD[`best-australian-universities-for-${subjectSlug}`]]
        : []),
      `There is no official ranking of Australian universities by field of study, so "best for ${name}" comes down to research reputation, industry links, and how seriously a university invests in the area.`,
      `This shortlist is the universities with a genuine reputation in ${name}, with a note on what sets each apart. For the full list of every university that teaches it, plus the cheapest programs, see the ${name} subject page.`,
    ],
    sectionsBeforeList: extra?.sectionsBeforeList,
    sectionsAfterList: extra?.sectionsAfterList,
    faq: extra?.faq,
    methodology: `Curated from the research strengths, specialist facilities, and industry links each university is known for in ${name}. It is not a league table, and a strong department at a lower-ranked university can beat a weak one at a famous name. Check the specific program.`,
    build: (unis) =>
      unis
        .filter((u) => order.has(u.slug))
        .sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline:
            u.firstYearBudget != null
              ? `${formatCurrency(u.firstYearBudget, "AUD")} first-year budget`
              : GO8_SLUGS.has(u.slug)
                ? "Group of Eight"
                : "",
          note: why.get(u.slug) ?? `A recognised choice for ${name}.`,
        })),
  };
}

/**
 * Hand-authored (not factory-built) "best business schools" collection.
 * Business is the single biggest impression cluster in GSC for this site
 * (see memory/gsc-analysis-2026-09-07.md), so this page carries a comparison
 * table plus PR-pathway and entry-requirement sections the generic
 * subjectBestCollection template doesn't support. MBA program figures below
 * (tuition, duration, admission, accreditation) were checked against each
 * university's published MBA page and `scripts/data/programs.json` in
 * September 2026; re-verify before reusing these numbers in another context.
 */
function businessSchoolsCollection(): Collection {
  const curated = SUBJECT_CONTENT.business?.strongAt ?? [];
  const order = new Map(curated.map((c, i) => [c.slug, i]));
  const why = new Map(curated.map((c) => [c.slug, c.why]));
  return {
    slug: "best-australian-universities-for-business",
    title: "The best business schools in Australia for international students",
    metaTitle: "Best Business Schools in Australia",
    shortTitle: "Best for business",
    category: "subject",
    metaDescription:
      "Compare Australia's top business schools by tuition, entry requirements, accreditation, and application intakes, with the PR pathway for business graduates.",
    intro: [
      LEAD["best-australian-universities-for-business"],
      "There is no official ranking of Australian business schools, and league-table position is a weaker signal than accreditation from AACSB, EQUIS, or AMBA, the three bodies that actually audit a business school's teaching quality and research output. This shortlist is the schools with a genuine reputation in business and management, with a note on what sets each apart. For every university that teaches business, plus the cheapest programs, see the business and management subject page.",
    ],
    sectionsBeforeList: [
      {
        heading: "MBA or business degree, which are you looking for?",
        body: [
          "An MBA and a general business master's are not the same product. The MBA is built for people already in management: most programs want two or more years of work experience, cost the most on this list, and lean on cohort networking and a case-study teaching style. A Master of Management, Master of Business Analytics, or specialist master's in finance, marketing, or accounting is more accessible, usually accepts a bachelor's in any discipline with no work experience required, and suits a career changer or a recent graduate.",
          "Both sit under \"business and management\" in search results, but they lead to different outcomes and different price tags, so the first decision is which one you're actually after.",
        ],
      },
    ],
    table: {
      columns: ["University", "MBA program", "Tuition (per year)", "Duration", "Accreditation", "Typical entry bar", "Intakes"],
      rows: [
        {
          cells: [
            "University of Melbourne",
            "MBA (Melbourne Business School)",
            formatCurrency(56250, "AUD"),
            "2 years",
            "AACSB, EQUIS",
            "2–3 yrs work experience; GMAT/GRE optional",
            "Feb, Jul",
          ],
        },
        {
          cells: [
            "UNSW Sydney",
            "MBA (AGSM)",
            formatCurrency(68000, "AUD"),
            "1.5 years",
            "AACSB, EQUIS",
            "2 yrs work experience (or 6 yrs without a degree); GMAT/GRE preferred",
            "Feb, Jul",
          ],
        },
        {
          cells: [
            "University of Sydney",
            "MBA (Leadership and Enterprise)",
            formatCurrency(60700, "AUD"),
            "1.5 years",
            "AACSB, EQUIS, AMBA",
            "3 yrs work experience, GPA 65+, interview; GMAT 600+ if below the academic bar",
            "Contact the school",
          ],
        },
        {
          cells: [
            "Monash University",
            "MBA",
            formatCurrency(62000, "AUD"),
            "1.5 years",
            "AACSB, EQUIS, AMBA",
            "Credit average (60%+) plus 3 yrs relevant work experience",
            "Feb, Jul",
          ],
        },
        {
          cells: [
            "Queensland University of Technology",
            "MBA (Digital MBA)",
            formatCurrency(44000, "AUD"),
            "2 years",
            "AACSB, EQUIS, AMBA",
            "Bachelor's degree plus 3 yrs professional work experience",
            "Feb, Jul",
          ],
        },
        {
          cells: [
            "Bond University",
            "MBA",
            formatCurrency(50900, "AUD"),
            "~16 months",
            "AACSB, EQUIS",
            "Bachelor's degree; work experience recommended, not always required",
            "Jan, May, Sep",
          ],
        },
        {
          cells: [
            "University of Technology Sydney",
            "MBA",
            formatCurrency(49990, "AUD"),
            "2 years",
            "AACSB, EQUIS",
            "Bachelor's with GPA 5.25/7, or a graduate-certificate pathway",
            "Feb, Jul",
          ],
        },
        {
          cells: [
            "Australian Institute of Business",
            "MBA (specialisations from AUD 34,000)",
            formatCurrency(34000, "AUD"),
            "2 years",
            "TEQSA-registered (not AACSB/EQUIS/AMBA)",
            "Bachelor's in any discipline, or significant management experience",
            "Feb, Jul, Oct",
          ],
        },
      ],
      note: "Annual tuition for the MBA (multiply by duration for the full program cost), checked against each school's own program page in September 2026. Fees change; confirm the current figure before applying. AIB is a TEQSA-registered private higher education provider, not a university, and does not hold AACSB, EQUIS, or AMBA accreditation.",
    },
    sectionsAfterList: [
      {
        heading: "Career outcomes and the PR pathway",
        body: [
          "A business degree's value for permanent residence depends entirely on which occupation you're aiming at, not which school you attended. General management and marketing roles are hard to nominate for on Australia's skilled occupation lists. Accounting is the exception: Accountant (General), Management Accountant, and Taxation Accountant all sit on the Medium and Long-term Strategic Skills List and the Core Skills Occupation List, which supports the 189, 190, 491, and employer-sponsored 482 and 186 visas, with a skills assessment from CPA Australia, CA ANZ, or the IPA.",
          "That makes an accredited Master of Professional Accounting, not the MBA, the more reliable migration route through a business faculty. If PR is the goal, check that the specific program carries the professional accreditation needed for the skills assessment before enrolling, and treat the MBA as a career and networking investment rather than a migration strategy.",
        ],
      },
      {
        heading: "Entry requirements at a glance",
        body: [
          "English requirements cluster around IELTS Academic 6.5 overall for most business master's, rising to 7.0 for the University of Sydney's MBA. GMAT is rarely mandatory: only the University of Sydney and Australian National University lean on it as a fallback when the academic record or work experience falls short, and most schools will admit on your degree and CV alone.",
          "Work experience is the real filter for an MBA specifically. UNSW, Monash, and QUT all expect two to three years in a professional role, Bond and UTS are more flexible about it, and the Australian Institute of Business will admit on a bachelor's degree in any discipline with no work experience at all, which is part of why it's the cheapest option here.",
        ],
      },
    ],
    methodology:
      "Schools are the ones with a genuine reputation in business and management: research output, industry links, and accreditation, not league-table position. MBA tuition, duration, admission criteria, and intakes are the published figures for each school's flagship MBA, checked against the university's own program page and this site's program dataset in September 2026. It is not a ranking, and a strong specialist master's at a lower-ranked university can suit you better than a famous name.",
    relatedGuide: {
      href: "/guides/which-australian-courses-lead-to-permanent-residence",
      label: "Which Australian courses actually lead to permanent residence",
    },
    seeAlso: {
      href: "/best/best-mba-programs-in-australia",
      label: "The best MBA programs in Australia, ranked and compared",
    },
    faq: [
      {
        q: "Do I need work experience for an MBA in Australia?",
        a: "Most MBA programs want at least two to three years of professional work experience, and some (like UNSW and Sydney) will admit on six or more years without a completed degree. The Australian Institute of Business is the exception on this list: it accepts a bachelor's degree in any discipline with no work experience required.",
      },
      {
        q: "How much does an MBA cost in Australia for international students?",
        a: "Annual tuition on this list runs from about AUD 34,000 at the Australian Institute of Business to AUD 68,000 at UNSW Sydney, for programs lasting roughly 16 months to two years, so the full program costs more than the annual figure. Fees are reviewed annually, so confirm the current figure with the school before applying.",
      },
      {
        q: "Can I get PR in Australia after an MBA?",
        a: "It's a weaker path than it looks. General management roles are hard to nominate for on the skilled occupation lists. An accredited Master of Professional Accounting has a much clearer route, through CPA Australia, CA ANZ, or IPA skills assessment, because accounting occupations sit on both the MLTSSL and CSOL.",
      },
      {
        q: "Which Australian business schools hold triple accreditation?",
        a: "The University of Sydney, Monash University, and Queensland University of Technology all hold the AACSB, EQUIS, and AMBA \"triple crown,\" a mark held by roughly 1 percent of business schools worldwide. Melbourne, UNSW, Bond, and UTS hold AACSB and EQUIS but not AMBA.",
      },
    ],
    build: (unis) =>
      unis
        .filter((u) => order.has(u.slug))
        .sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline:
            u.firstYearBudget != null
              ? `${formatCurrency(u.firstYearBudget, "AUD")} first-year budget`
              : GO8_SLUGS.has(u.slug)
                ? "Group of Eight"
                : "",
          note: why.get(u.slug) ?? "A recognised choice for business and management.",
        })),
  };
}

/**
 * The eight MBA programs, same schools and same source-checked figures as
 * the table in `businessSchoolsCollection()`. Split into its own typed
 * array so the dedicated MBA page (`mbaCollection()`, below) and the
 * broader business-schools page can both build from one fact-checked
 * source rather than drifting apart. See that function's comment for the
 * verification date and method.
 */
const MBA_SCHOOLS: {
  slug: string;
  name: string;
  program: string;
  tuition: number;
  duration: string;
  accreditation: string;
  entry: string;
  intakes: string;
}[] = [
  {
    slug: "university-of-melbourne",
    name: "University of Melbourne",
    program: "MBA (Melbourne Business School)",
    tuition: 56250,
    duration: "2 years",
    accreditation: "AACSB, EQUIS",
    entry: "2–3 yrs work experience; GMAT/GRE optional",
    intakes: "Feb, Jul",
  },
  {
    slug: "unsw-sydney",
    name: "UNSW Sydney",
    program: "MBA (AGSM)",
    tuition: 68000,
    duration: "1.5 years",
    accreditation: "AACSB, EQUIS",
    entry: "2 yrs work experience (or 6 yrs without a degree); GMAT/GRE preferred",
    intakes: "Feb, Jul",
  },
  {
    slug: "university-of-sydney",
    name: "University of Sydney",
    program: "MBA (Leadership and Enterprise)",
    tuition: 60700,
    duration: "1.5 years",
    accreditation: "AACSB, EQUIS, AMBA",
    entry: "3 yrs work experience, GPA 65+, interview; GMAT 600+ if below the academic bar",
    intakes: "Contact the school",
  },
  {
    slug: "monash-university",
    name: "Monash University",
    program: "MBA",
    tuition: 62000,
    duration: "1.5 years",
    accreditation: "AACSB, EQUIS, AMBA",
    entry: "Credit average (60%+) plus 3 yrs relevant work experience",
    intakes: "Feb, Jul",
  },
  {
    slug: "queensland-university-of-technology",
    name: "Queensland University of Technology",
    program: "MBA (Digital MBA)",
    tuition: 44000,
    duration: "2 years",
    accreditation: "AACSB, EQUIS, AMBA",
    entry: "Bachelor's degree plus 3 yrs professional work experience",
    intakes: "Feb, Jul",
  },
  {
    slug: "bond-university",
    name: "Bond University",
    program: "MBA",
    tuition: 50900,
    duration: "~16 months",
    accreditation: "AACSB, EQUIS",
    entry: "Bachelor's degree; work experience recommended, not always required",
    intakes: "Jan, May, Sep",
  },
  {
    slug: "university-of-technology-sydney",
    name: "University of Technology Sydney",
    program: "MBA",
    tuition: 49990,
    duration: "2 years",
    accreditation: "AACSB, EQUIS",
    entry: "Bachelor's with GPA 5.25/7, or a graduate-certificate pathway",
    intakes: "Feb, Jul",
  },
  {
    slug: "australian-institute-of-business",
    name: "Australian Institute of Business",
    program: "MBA (specialisations from AUD 34,000)",
    tuition: 34000,
    duration: "2 years",
    accreditation: "TEQSA-registered (not AACSB/EQUIS/AMBA)",
    entry: "Bachelor's in any discipline, or significant management experience",
    intakes: "Feb, Jul, Oct",
  },
];

/**
 * Hand-authored, MBA-only collection, split out from `businessSchoolsCollection()`
 * on 2026-09-20 per the SEO audit's cluster analysis: "best MBA in Australia"
 * and "best business schools in Australia" return SERPs sharing zero top-10
 * URLs, so a page titled and framed around business schools generally will
 * not rank for MBA-specific intent no matter how much MBA content it
 * contains, and the reverse is also true. GSC shows this as a real,
 * separate opportunity: large impression volume at position 50-90 for the
 * business/MBA cluster, with no dedicated page competing for it.
 *
 * The 9/9 top-ranking pages for "best MBA in Australia" are numbered
 * listicles with a per-school heading, fees, and rank citations -- the
 * `/best/[slug]` template's ranked-list rendering (real <h2> per entry,
 * fixed 2026-09-20) matches that shape directly, unlike a narrative guide.
 *
 * Same eight schools and same September-2026-verified figures as
 * `businessSchoolsCollection()` (see `MBA_SCHOOLS`); re-verify before
 * reusing these numbers elsewhere.
 */
function mbaCollection(): Collection {
  const order = new Map(MBA_SCHOOLS.map((m, i) => [m.slug, i]));
  const byUniSlug = new Map(MBA_SCHOOLS.map((m) => [m.slug, m]));
  return {
    slug: "best-mba-programs-in-australia",
    title: "The best MBA programs in Australia for international students",
    metaTitle: "Best MBA in Australia: Cost, Entry Requirements, Rankings",
    shortTitle: "Best MBA programs",
    category: "subject",
    metaDescription:
      "Compare Australia's top MBA programs by tuition, duration, accreditation, and entry requirements, with what an MBA actually does for your permanent residence chances.",
    intro: [
      "An MBA in Australia costs from around AUD 34,000 a year at the low end to AUD 68,000 at UNSW Sydney, and most programs want at least two years of professional work experience before they'll admit you. That work-experience bar is what separates the MBA from a general business master's, which usually accepts a bachelor's in any discipline straight out of undergrad.",
      "There is no official ranking of Australian MBA programs, and league-table position is a weaker signal than accreditation from AACSB, EQUIS, or AMBA, the three bodies that actually audit a business school's teaching and research quality. This list ranks the eight MBA programs with a genuine reputation among Australian business schools, with what each is known for. For the broader field, including business master's that don't require work experience, see the best business schools page.",
    ],
    sectionsBeforeList: [
      {
        heading: "Is an MBA actually the degree you want?",
        body: [
          "The MBA is built for people already in management: most programs want two or more years of work experience, cost the most of any business qualification, and lean on cohort networking and a case-study teaching style over classroom lectures. If you're a recent graduate or changing careers without that experience, a Master of Management, Master of Business Analytics, or a specialist master's in finance, marketing, or accounting is more accessible and usually cheaper, and most accept a bachelor's in any discipline with no work experience required.",
          "Both sit under \"business and management\" in search results and on this site, but they lead to different outcomes and different price tags. If you're not sure an MBA is the one you need, the best business schools page covers the wider field.",
        ],
      },
    ],
    table: {
      columns: ["University", "MBA program", "Tuition (per year)", "Duration", "Accreditation", "Typical entry bar", "Intakes"],
      rows: MBA_SCHOOLS.map((m) => ({
        cells: [
          m.name,
          m.program,
          formatCurrency(m.tuition, "AUD"),
          m.duration,
          m.accreditation,
          m.entry,
          m.intakes,
        ],
      })),
      note: "Annual tuition for the MBA (multiply by duration for the full program cost), checked against each school's own program page in September 2026. Fees change; confirm the current figure before applying. AIB is a TEQSA-registered private higher education provider, not a university, and does not hold AACSB, EQUIS, or AMBA accreditation.",
    },
    sectionsAfterList: [
      {
        heading: "Is an MBA worth it for permanent residence?",
        body: [
          "Weaker than it looks. General management and marketing roles, which is what an MBA graduate is usually aiming for, are hard to nominate for on Australia's skilled occupation lists. Accounting is the clear exception in the business faculty: Accountant (General), Management Accountant, and Taxation Accountant all sit on the Medium and Long-term Strategic Skills List and the Core Skills Occupation List, supporting the 189, 190, 491, and employer-sponsored 482 and 186 visas, with a skills assessment from CPA Australia, CA ANZ, or the IPA.",
          "If permanent residence is the actual goal rather than a nice-to-have, an accredited Master of Professional Accounting is the more reliable route through a business faculty, not the MBA. Treat the MBA as a career and networking investment, and pair it with a genuine migration plan if you need one.",
        ],
      },
      {
        heading: "MBA entry requirements at a glance",
        body: [
          "English requirements cluster around IELTS Academic 6.5 overall, rising to 7.0 for the University of Sydney's MBA. The GMAT is rarely mandatory: only Sydney and, at some intakes, other Go8 schools lean on it as a fallback when the academic record or work experience falls short, and most schools will admit on your degree and CV alone.",
          "Work experience is the real filter. UNSW, Monash, and QUT all expect two to three years in a professional role, Bond and UTS are more flexible about it, and the Australian Institute of Business will admit on a bachelor's degree in any discipline with no work experience at all, which is why it's the lowest-cost option here.",
        ],
      },
    ],
    methodology:
      "The eight MBA programs with a genuine reputation among Australian business schools, based on research output, industry links, and accreditation, not league-table position. Tuition, duration, admission criteria, and intakes are the published figures for each school's flagship MBA, checked against the university's own program page and this site's program dataset in September 2026. It is not a ranking, and a shorter, cheaper program can suit your goals better than the most expensive name on this list.",
    relatedGuide: {
      href: "/guides/which-australian-courses-lead-to-permanent-residence",
      label: "Which Australian courses actually lead to permanent residence",
    },
    seeAlso: {
      href: "/best/best-australian-universities-for-business",
      label: "The best business schools in Australia, including master's degrees that don't require work experience",
    },
    faq: [
      {
        q: "What is the best MBA in Australia?",
        a: "There is no official ranking. The University of Sydney, Monash University, and Queensland University of Technology hold the AACSB, EQUIS, and AMBA \"triple crown\" accreditation, held by roughly 1 percent of business schools worldwide, which is a stronger signal than any league table. Melbourne Business School and UNSW's AGSM are the other two most recognised names.",
      },
      {
        q: "How much does an MBA cost in Australia for international students?",
        a: "Annual tuition runs from about AUD 34,000 at the Australian Institute of Business to AUD 68,000 at UNSW Sydney, for programs lasting roughly 16 months to two years, so the full program costs considerably more than the annual figure. Fees are reviewed annually; confirm the current figure with the school before applying.",
      },
      {
        q: "Do I need work experience for an MBA in Australia?",
        a: "Most programs want at least two to three years of professional work experience, and some, like UNSW and Sydney, will admit on six or more years without a completed degree. The Australian Institute of Business is the exception: it accepts a bachelor's degree in any discipline with no work experience required.",
      },
      {
        q: "Can I get PR in Australia after an MBA?",
        a: "It's a weaker path than it looks. General management roles are hard to nominate for on the skilled occupation lists. An accredited Master of Professional Accounting has a much clearer route, through CPA Australia, CA ANZ, or IPA skills assessment, because accounting occupations sit on both the MLTSSL and CSOL.",
      },
      {
        q: "Do Australian MBA programs require the GMAT?",
        a: "Rarely as a hard requirement. The University of Sydney asks for GMAT 600+ if your academic record falls below its bar, and a few other schools accept it as an optional strengthening of your application, but most admit on your degree, CV, and work experience alone.",
      },
    ],
    build: (unis) =>
      unis
        .filter((u) => order.has(u.slug))
        .sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99))
        .map((u) => {
          const m = byUniSlug.get(u.slug)!;
          return {
            slug: u.slug,
            name: u.name,
            city: u.city,
            headline: `${formatCurrency(m.tuition, "AUD")}/year`,
            note: `${m.program}, ${m.duration}. ${m.accreditation}.`,
          };
        }),
  };
}

/**
 * Curated cheapest-first list of real Bachelor of Nursing (or equivalent
 * degree-title) programs, one per university, sourced from
 * `scripts/data/programs.json` in September 2026. Deliberately excludes
 * every Diploma/Advanced Diploma of Nursing, even ones cheaper than any
 * bachelor's here: a diploma is an Enrolled Nurse credential, not the
 * Registered Nurse degree this page is about, and blending the two is the
 * exact mistake this page exists to avoid (see the sibling
 * `/study/nursing-and-health-sciences` page's own comparison table, which
 * already filters the same way after the Finding 1 fix in commit 0880c88).
 */
const CHEAPEST_NURSING: {
  slug: string;
  name: string;
  city: string;
  program: string;
  tuition: number;
  duration: string;
  intakes: string;
}[] = [
  { slug: "federation-university-australia", name: "Federation University Australia", city: "Ballarat, VIC", program: "Bachelor of Nursing", tuition: 29000, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "university-of-the-sunshine-coast", name: "University of the Sunshine Coast", city: "Sunshine Coast, QLD", program: "Bachelor of Nursing Science", tuition: 29000, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "university-of-notre-dame-australia", name: "University of Notre Dame Australia", city: "Fremantle, WA", program: "Bachelor of Nursing", tuition: 29304, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "avondale-university", name: "Avondale University", city: "Cooranbong, NSW", program: "Bachelor of Nursing", tuition: 30000, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "cquniversity-australia", name: "CQUniversity Australia", city: "Rockhampton, QLD", program: "Bachelor of Nursing", tuition: 30500, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "university-of-canberra", name: "University of Canberra", city: "Canberra, ACT", program: "Bachelor of Nursing", tuition: 30500, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "victoria-university", name: "Victoria University", city: "Melbourne, VIC", program: "Bachelor of Nursing", tuition: 30500, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "murdoch-university", name: "Murdoch University", city: "Perth, WA", program: "Bachelor of Nursing", tuition: 31000, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "charles-darwin-university", name: "Charles Darwin University", city: "Darwin, NT", program: "Bachelor of Nursing", tuition: 32000, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "university-of-new-england", name: "University of New England", city: "Armidale, NSW", program: "Bachelor of Nursing", tuition: 32000, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "southern-cross-university", name: "Southern Cross University", city: "Lismore, NSW", program: "Bachelor of Nursing", tuition: 32320, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "university-of-newcastle", name: "University of Newcastle", city: "Newcastle, NSW", program: "Bachelor of Nursing", tuition: 32500, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "australian-catholic-university", name: "Australian Catholic University", city: "Sydney, NSW", program: "Bachelor of Nursing", tuition: 33000, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "edith-cowan-university", name: "Edith Cowan University", city: "Perth, WA", program: "Bachelor of Science (Nursing)", tuition: 33000, duration: "3 years", intakes: "Feb, Jul" },
  { slug: "torrens-university-australia", name: "Torrens University Australia", city: "Adelaide, SA", program: "Bachelor of Nursing", tuition: 33600, duration: "3 years", intakes: "Feb, Jul, Oct" },
];

/** Hand-authored "cheapest nursing courses" collection. See CHEAPEST_NURSING for sourcing notes. */
function cheapestNursingCollection(): Collection {
  const byUniSlug = new Map(CHEAPEST_NURSING.map((n, i) => [n.slug, i]));
  return {
    slug: "cheapest-nursing-courses-in-australia-for-international-students",
    title: "The cheapest nursing courses in Australia for international students",
    metaTitle: "Cheapest Nursing Courses in Australia",
    shortTitle: "Cheapest nursing courses",
    category: "subject",
    metaDescription:
      "Compare the real cost of Bachelor of Nursing degrees in Australia for international students: verified tuition, NMBA English requirements, and the PR pathway.",
    intro: [
      "This list ranks real Bachelor of Nursing degrees only, the qualification that leads to registration as a Registered Nurse in Australia. Every figure is checked against the university's own published fee schedule, and nothing here is a diploma or pathway program dressed up as a nursing degree.",
      "That distinction matters more here than on most cost comparisons. A Diploma of Nursing can look cheaper on paper, but it leads to a different, more limited credential (Enrolled Nurse), not the Registered Nurse outcome most international students studying nursing in Australia are actually after.",
    ],
    sectionsBeforeList: [
      {
        heading: "Diploma of Nursing vs. Bachelor of Nursing, what you're actually comparing",
        body: [
          "A Diploma of Nursing, usually delivered by a TAFE or private college, qualifies you to register as an Enrolled Nurse (EN) with the Nursing and Midwifery Board of Australia (NMBA). It typically costs less and takes around two years. A Bachelor of Nursing qualifies you to register as a Registered Nurse (RN), the credential with the broader scope of practice, the higher pay ceiling, and the occupation that actually sits on Australia's skilled occupation lists. It takes three years and costs more.",
          "Both are legitimate, regulated pathways, and an EN-to-RN bridging option exists if you start with the diploma. But they are not interchangeable for planning purposes, and a ranking that mixes diploma and bachelor's tuition without saying so, as this site's own nursing subject page did before a September 2026 fix, ends up recommending the wrong thing to someone who wants to become a Registered Nurse. This page ranks Bachelor of Nursing degrees only.",
        ],
      },
    ],
    table: {
      columns: ["University", "Program", "Tuition (per year)", "Duration", "Intakes"],
      rows: CHEAPEST_NURSING.map((n) => ({
        cells: [n.name, n.program, formatCurrency(n.tuition, "AUD"), n.duration, n.intakes],
      })),
      note: "Annual tuition for the Bachelor of Nursing (or equivalently titled degree), checked against each university's own program page in September 2026. Multiply by duration for the full program cost, and confirm the current fee before applying.",
    },
    sectionsAfterList: [
      {
        heading: "NMBA English requirements",
        body: [
          "Nursing has a higher English bar than almost any other field, set by the Nursing and Midwifery Board of Australia (NMBA): IELTS Academic 7.0 in listening, reading, and speaking, and at least 6.5 in writing, or the OET or PTE Academic equivalent. This applies at registration, and universities enforce it at admission, so it is not a score you can make up with a strong academic record elsewhere. Results from two test sittings within six months can be combined.",
        ],
      },
      {
        heading: "Nursing and the permanent residency pathway",
        body: [
          "Registered Nurse is one of the more dependable occupations for skilled migration. Registered Nurse (Medical) and the other RN specialisations sit on Australia's Medium and Long-term Strategic Skills List, supporting the 189, 190, and 491 visas, and are nominated by essentially every state and territory. Clinical placement hours built into every Bachelor of Nursing program count toward NMBA registration, and the 485 graduate visa gives time to register and gain paid experience before applying for a skilled visa.",
        ],
      },
      {
        heading: "Entry requirements beyond English",
        body: [
          "Universities generally ask for a completed senior secondary qualification (or a recognised foundation year) that meets their minimum, on top of the NMBA English bands above. Every program includes mandatory clinical placements, which come with their own checks: a national police check, an immunisation and vaccination record meeting the placement provider's requirements, and sometimes a Working with Children check, arranged through the university once you're enrolled.",
        ],
      },
    ],
    methodology:
      "Filtered this site's program dataset to degrees named Bachelor of Nursing or an equivalent literal title (Bachelor of Nursing Science, Bachelor of Science (Nursing)) at degree-granting universities, excluding every Diploma, Advanced Diploma, and Foundation/Pathway program regardless of price. Where a university offers more than one such program, the cheapest is shown. Ranked by annual international tuition, cheapest first. It is not a ranking of nursing school quality; check ANMAC accreditation and clinical placement locations for the specific program.",
    relatedGuide: {
      href: "/guides/study-to-permanent-residence-pathway-australia",
      label: "The study-to-PR pathway",
    },
    faq: [
      {
        q: "Is a Diploma of Nursing cheaper than a Bachelor of Nursing?",
        a: "Usually yes, but it leads to a different outcome. A diploma registers you as an Enrolled Nurse; a Bachelor of Nursing registers you as a Registered Nurse, the qualification with the broader scope of practice and the one that sits on the skilled occupation lists. Compare them on outcome, not just price.",
      },
      {
        q: "What IELTS score do I need to study nursing in Australia?",
        a: "The Nursing and Midwifery Board of Australia requires IELTS Academic 7.0 in listening, reading, and speaking, and at least 6.5 in writing, or an equivalent OET or PTE Academic score. Universities apply this at admission, not just at registration.",
      },
      {
        q: "Can I work as a nurse in Australia after an overseas nursing diploma or degree?",
        a: "You go through the NMBA's assessment of your overseas qualification, which may require a bridging program before you can register. Many international students instead complete a full Bachelor of Nursing in Australia to register directly, without that extra assessment step.",
      },
      {
        q: "Is nursing a good pathway to permanent residence in Australia?",
        a: "Yes, one of the more dependable ones. Registered Nurse is nominated by essentially every state and territory, and the 485 graduate visa gives time to register with the NMBA and build paid experience before applying for a skilled visa.",
      },
    ],
    build: (unis) =>
      unis
        .filter((u) => byUniSlug.has(u.slug))
        .sort((a, b) => (byUniSlug.get(a.slug) ?? 99) - (byUniSlug.get(b.slug) ?? 99))
        .map((u) => {
          const curated = CHEAPEST_NURSING[byUniSlug.get(u.slug) ?? 0];
          return {
            slug: u.slug,
            name: u.name,
            city: u.city,
            headline: `${formatCurrency(curated.tuition, "AUD")}/year`,
            note: `${curated.program}, ${curated.duration}. Intakes: ${curated.intakes}.`,
          };
        }),
  };
}

/**
 * Optional hand-written sections/FAQ layered onto the generic cityCollection
 * template, keyed by the collection slug. Added so these pages carry real
 * city-specific depth (transport, work rights, regional-migration status)
 * instead of just the generic intro + ranked list. Transport fares and
 * regional-migration classification checked against each state's transit
 * operator and the Migration (LIN 19/051) regional-area instrument in
 * September 2026; re-verify before reusing elsewhere.
 */
const CITY_EXTRA: Record<
  string,
  {
    sectionsBeforeList?: CollectionSection[];
    sectionsAfterList?: CollectionSection[];
    faq?: { q: string; a: string }[];
  }
> = {
  "cheapest-universities-in-sydney-for-international-students": {
    sectionsBeforeList: [
      {
        heading: "Rent, not tuition, is what actually blows the budget here",
        body: [
          "Sydney's rental vacancy rate is consistently among the tightest of any Australian capital, and most universities only guarantee first-year on-campus or partner accommodation to a limited number of students who apply early, not to everyone who wants it. If you're not offered a place, budget for weeks of share-house hunting on arrival, competing against other students and the general rental market, and treat a temporary short-stay booking for your first few weeks as a real line item, not an afterthought.",
          "Because rent varies so much by suburb, the cheapest-on-paper university isn't automatically the cheapest to actually live near. A pricier university with a campus in a suburb where students can realistically find affordable share housing can beat a cheaper university whose only nearby suburbs are already expensive.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "Getting around without inflating your budget",
        body: [
          "A weekly Opal transport cap keeps unlimited bus, train, ferry, and light rail travel to a set fee once you've tapped on and off enough times in a week, which matters more in Sydney than most cities because campuses and share-house-friendly suburbs are rarely in the same postcode. Budget for the cap as a recurring cost, not an occasional top-up, especially if your course is at a CBD or harbourside campus and you're renting further out to save on rent.",
          "Student visa holders can work up to 48 hours a fortnight during term and unlimited hours during scheduled breaks, which is worth planning around before you pick the cheapest-on-paper university: a campus poorly served by public transport can cost you more in commute time (and therefore lost work hours) than a slightly pricier one near where you'll actually live.",
        ],
      },
    ],
    faq: [
      {
        q: "Is it possible to find affordable student housing in Sydney?",
        a: "Yes, but it takes real search effort and usually means share housing further from the CBD rather than a purpose-built student residence near campus. Applying for university-partnered accommodation as early as your offer allows, and having a short-stay booking as a fallback for your first weeks, both matter more in Sydney than in a less competitive rental market.",
      },
      {
        q: "Which Sydney university is genuinely the cheapest for international students?",
        a: "It changes as fees are reviewed, so check the ranked list above for the current figures rather than a fixed answer. As a pattern, western-Sydney universities are consistently cheaper on tuition than the Group of Eight campuses closer to the CBD and harbour.",
      },
      {
        q: "Does metropolitan Sydney count as regional for skilled migration?",
        a: "No. Unlike Perth, Adelaide, and Canberra, metropolitan Sydney is not classified as a regional area under the Department of Home Affairs' boundaries, so studying here doesn't add the regional points or open the 491 nomination pathway those cities carry.",
      },
      {
        q: "What should I budget for setup costs when I first arrive in Sydney?",
        a: "Beyond the first weeks of temporary accommodation, budget for a rental bond (commonly four weeks' rent), basic furniture and kitchenware if your share house is unfurnished, a local phone plan, and initial transport top-ups before your first pay cheque or scholarship instalment lands. This is on top of, not instead of, the general setup allowance already built into the budget figures above.",
      },
    ],
  },
  "cheapest-universities-in-melbourne-for-international-students": {
    sectionsBeforeList: [
      {
        heading: "The biggest international student market has upsides and a trade-off",
        body: [
          "Melbourne has been ranked Australia's top student city by QS every year since 2015, and placed fifth globally in the 2026 QS Best Student Cities index, with roughly 230,000 international students across its ten universities. That scale means a genuinely large student support ecosystem (dedicated student-housing stock, an established international-student services sector, a large peer network from almost every country) but also the most competition for the cheapest share housing and entry-level part-time jobs, both of which get harder to find the later in the enrolment cycle you arrive.",
          "Booking accommodation and lining up part-time work before you land, rather than after, matters more in Melbourne than in a smaller city precisely because of that scale: the cheap options exist, but they don't sit unclaimed for long.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "Myki caps and the tram-heavy inner city",
        body: [
          "Melbourne's Myki system caps daily and weekly fares, and the free tram zone covers most of the CBD, which helps if your campus and part-time job both sit inside it. Once you're outside that zone the cost adds up like any other city's transit, so factor your actual commute (not just the CBD free-zone marketing) into the budget figure above.",
          "Inner-north and inner-west suburbs near RMIT, Melbourne, and Victoria University's city campuses tend to have the most share-house stock aimed at students, which is often the more realistic cost lever than the university's own tuition figure once you account for where you'll actually be able to find a room.",
        ],
      },
    ],
    faq: [
      {
        q: "Why is Melbourne ranked the best student city in Australia?",
        a: "QS's Best Student Cities index scores factors including student mix, affordability relative to income, employability, and how students themselves rate the city, and Melbourne has topped Australia's ranking every year since 2015. That's a reputation and lifestyle signal, not a guarantee of low cost: it's still one of the more expensive cities on this list once rent is factored in.",
      },
      {
        q: "Is it hard to find a part-time job as an international student in Melbourne?",
        a: "It's competitive precisely because Melbourne has the largest international student population of any Australian city, which means more people chasing the same entry-level hospitality and retail roles. Starting the search before semester begins, rather than after classes start, meaningfully improves your odds.",
      },
      {
        q: "Is metropolitan Melbourne a regional area for skilled migration?",
        a: "No. Metropolitan Melbourne sits outside the Department of Home Affairs' regional boundaries, the same as Sydney, so it doesn't carry the regional points or 491 nomination access that Perth, Adelaide, and Canberra offer.",
      },
      {
        q: "Does Victoria have any regional areas near Melbourne worth considering?",
        a: "Yes. Cities like Geelong, which several Melbourne-area universities also have campuses in, sit outside the metropolitan exclusion and carry regional status, so a Geelong-based program can combine Melbourne-adjacent access with a genuine regional-migration benefit metropolitan Melbourne itself doesn't offer.",
      },
    ],
  },
  "cheapest-universities-in-perth-for-international-students": {
    sectionsBeforeList: [
      {
        heading: "A resources-driven economy, not a services one",
        body: [
          "Western Australia's economy runs on mining and energy in a way no eastern-state economy does, which shapes the part-time and graduate job market international students actually encounter: strong demand in engineering, geology, and trades-adjacent support roles, but a smaller finance, media, and corporate-services sector than Sydney or Melbourne offers. If your field is engineering, mining, or earth sciences, that's a genuine advantage; if you're aiming at a career in banking, consulting, or media, the graduate job market is thinner than on the east coast, migration points aside.",
          "Weigh that against the regional-migration points below rather than assuming they cancel out: a strong PR pathway on paper is worth less if the actual graduate job market in your field is thin where you studied.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "The regional-migration angle is the real draw here",
        body: [
          "The whole of Western Australia, including metropolitan Perth, is classified as a regional area under the Department of Home Affairs' regional migration boundaries, which is a genuine structural advantage over Sydney and Melbourne: it adds points on the skilled visa points test, opens the 491 and 190 regional-nomination pathways, and can extend post-study work rights under the 485 visa for graduates of a regional campus. Confirm the current postcode list and points value on the Department of Home Affairs site before relying on it, since regional classifications are reviewed periodically.",
          "Balanced against that, Perth's distance from the eastern states means fewer direct flights and a higher cost to travel home or to conferences/interviews on the east coast, worth weighing against the migration points if your degree or career plans pull you toward Sydney or Melbourne after graduation.",
        ],
      },
    ],
    faq: [
      {
        q: "Does studying in Perth actually help with permanent residence?",
        a: "It can, through the extra points and nomination pathways that come with Western Australia's whole-of-state regional classification, but the strength of that pathway depends on your occupation being on the relevant state or federal skilled occupation list. Check your specific occupation against WA's current nomination criteria rather than assuming the regional classification alone is enough.",
      },
      {
        q: "Is Perth a cheaper place to live than Sydney or Melbourne?",
        a: "Generally yes, on rent in particular, and that gap is part of why it shows up ahead of Sydney and Melbourne on the budget figures above. It's also more isolated, with a higher cost and longer travel time to reach the eastern states, which is worth weighing if you'll want to travel for internships, interviews, or visits home on that side of the country.",
      },
      {
        q: "What jobs are actually easy to find for students in Perth?",
        a: "Hospitality, retail, and warehousing roles are as available in Perth as in any Australian city; what's genuinely different is the depth of demand in engineering, geology, and technical support roles feeding the resources sector, which is a real advantage if your degree is in one of those fields and less relevant if it isn't.",
      },
      {
        q: "How far is Perth from Sydney and Melbourne, and does that matter for studying there?",
        a: "It's roughly a four-hour flight, noticeably further than the one-to-two-hour hops between the eastern-state capitals. It mostly matters for the cost and hassle of attending east-coast interviews, conferences, or family visits, rather than for the day-to-day experience of studying in Perth itself.",
      },
      {
        q: "Do I need to be studying a mining or engineering degree to benefit from Perth's regional status?",
        a: "No, the regional-migration points and nomination pathways apply regardless of your field of study; only the graduate job-market advantage is field-specific. A business or arts graduate in Perth gets the same regional points as an engineering graduate, just without the same local industry demand once they're job hunting.",
      },
    ],
  },
  "cheapest-universities-in-brisbane-for-international-students": {
    sectionsBeforeList: [
      {
        heading: "The 2032 Olympics is reshaping the city while you'll be studying here",
        body: [
          "Brisbane is the confirmed host of the 2032 Summer Olympics, and the infrastructure and construction spending that comes with it (transport, venues, housing) will run through most of the years a current international student will spend studying and, on a 485 visa, working here. That's relevant beyond curiosity: it's driving genuine demand in construction, project management, engineering, and event-adjacent hospitality roles for the next several years, a graduate job market tailwind Sydney and Melbourne don't currently have to the same degree.",
          "The same construction boom is also a contributor to Brisbane's rising rents and competitive housing market, so the cost advantage over Sydney and Melbourne, while still real, has been narrowing rather than staying fixed. Treat the budget figures below as a snapshot, not a guarantee.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "Go Card and the Brisbane-to-Gold-Coast commute",
        body: [
          "Translink's Go Card covers Brisbane's buses, trains, and ferries with off-peak discounts that matter if your class schedule lets you avoid the morning and evening peak. Griffith and Bond both run Gold Coast campuses that sit outside metropolitan Brisbane's fare zones and are a genuine commute from Brisbane proper, so check which campus a program is actually taught at before assuming inner-Brisbane rent and transport costs apply.",
          "Brisbane itself does not carry regional-migration status, but several other Queensland university towns and Gold Coast postcodes do at different times depending on the current Home Affairs boundary, so a Queensland university with satellite or regional campuses can be worth checking against the migration angle even if its main Brisbane campus doesn't qualify.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Brisbane cheaper than Sydney or Melbourne for international students?",
        a: "Yes, though the gap has been narrowing as Olympics-related construction pushes up rents. It's still generally cheaper on everyday living costs than the two bigger cities, with tuition varying by university rather than being uniformly lower.",
      },
      {
        q: "Should I study at a Brisbane campus or a Gold Coast campus for a Queensland university?",
        a: "Check which campus your specific program is actually taught at before enrolling: Griffith and Bond both run genuinely separate Gold Coast campuses, which sit outside Brisbane's fare zones and rental market and shouldn't be assumed to carry the same cost or commute profile as the university's main Brisbane site.",
      },
      {
        q: "Will Brisbane's Olympics construction boom actually create graduate jobs by the time I finish my degree?",
        a: "Construction and infrastructure spending for the 2032 Games is already ramping up and will continue through the years most current students will be studying and, on a 485 visa, working here, so the timing lines up for construction, project management, and engineering graduates specifically. It's a less direct benefit for graduates outside those fields.",
      },
      {
        q: "Is Brisbane classified as regional for skilled migration?",
        a: "Metropolitan Brisbane itself is not, unlike Perth, Adelaide, and Canberra. Some other Queensland cities and Gold Coast postcodes do carry regional status depending on the current Home Affairs boundary, so it's worth checking a specific postcode rather than assuming the whole state is excluded.",
      },
      {
        q: "Is the Gold Coast a cheaper place to live than Brisbane?",
        a: "It varies by suburb and season rather than being uniformly cheaper, since Gold Coast rents are also shaped by tourism demand. Check the actual rental market near the specific campus (Griffith's or Bond's Gold Coast site, not central Brisbane) before assuming it's automatically the more affordable option.",
      },
    ],
  },
  "cheapest-universities-in-adelaide-for-international-students": {
    sectionsBeforeList: [
      {
        heading: "The AUKUS submarine program is a real, if narrow, graduate opportunity",
        body: [
          "South Australia's naval shipbuilding expansion under the AUKUS submarine program is expected to employ up to 5,000 people in the industry by 2030, with several thousand of those direct shipyard roles, plus dedicated graduate, apprentice, and traineeship places being created specifically to build the workforce. For engineering, manufacturing, and some computing graduates, it's a genuine, growing local employer base that didn't exist at this scale a few years ago, and it's a reasonable reason to weight an Adelaide engineering degree higher than the tuition figure alone suggests.",
          "The caveat matters: many direct defence-industry roles require Australian citizenship or a security clearance that citizenship alone can satisfy, which most international graduates won't hold straight out of a degree. Check the citizenship and clearance requirements for a specific role before treating this as your PR-to-career plan, rather than assuming a defence-adjacent Adelaide degree opens defence-industry doors on its own.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "The 2026 Adelaide University merger and what it means for fees",
        body: [
          "The University of Adelaide and the University of South Australia merged into Adelaide University at the start of 2026, and current international applicants should expect some fee schedules, program names, and application pages to still be settling as the merged institution consolidates its catalogue. Where a program you're comparing existed at both legacy universities, confirm you're looking at the current merged-institution fee, not a legacy page that hasn't been updated yet.",
          "Adelaide's cost advantage is real and holds regardless of the merger: South Australia is consistently one of the cheaper state capitals to rent in, and the whole of South Australia is classified as a regional area for skilled migration, adding points and opening state-nomination pathways on top of the raw living-cost saving.",
        ],
      },
    ],
    faq: [
      {
        q: "Does the Adelaide University merger affect my existing offer or enrolment?",
        a: "If you already hold an offer from the University of Adelaide or the University of South Australia, contact the merged institution directly to confirm how your specific program, fees, and start date are being carried across, since the transition timeline can vary by faculty. Don't assume a legacy offer letter still reflects the current fee.",
      },
      {
        q: "Is Adelaide a safe, welcoming city for international students?",
        a: "Adelaide is generally regarded as one of the more liveable and lower-stress Australian capitals to study in, with a smaller international-student population than Sydney or Melbourne but an established support ecosystem across its universities. That smaller scale also means a less crowded rental and part-time job market than the bigger cities.",
      },
      {
        q: "Are the AUKUS submarine program jobs open to international graduates?",
        a: "Some are, but many direct defence-industry and shipyard roles require Australian citizenship or a security clearance that only citizens or permanent residents can readily obtain. Treat it as a strong reason to study engineering or a related field in Adelaide rather than a guaranteed job outcome for an international graduate specifically, and check the citizenship requirement for any role before counting on it.",
      },
      {
        q: "How does Adelaide's regional-migration status compare to Perth's?",
        a: "Both give access to the same broad category of regional points and 491/190 nomination pathways, since the whole of South Australia (like the whole of Western Australia) is classified as regional. The specific state-nomination criteria and occupation priorities differ between South Australia and Western Australia, so check each state's current list rather than assuming they're identical.",
      },
      {
        q: "How far is Adelaide from Sydney and Melbourne?",
        a: "About a two-hour flight to Melbourne and a bit over two hours to Sydney, closer than Perth's isolation but still enough that regular travel adds up. Both routes have frequent direct flights, which makes weekend visits or interstate interviews reasonably practical.",
      },
    ],
  },
  "cheapest-universities-in-canberra-for-international-students": {
    sectionsBeforeList: [
      {
        heading: "A city built at a human scale, for better and worse",
        body: [
          "Canberra was purpose-planned rather than grown organically, which means wide bike paths, short commutes, and a compact footprint that makes it genuinely easy to live without a car, unusual for an Australian capital. The trade-off is a smaller, quieter social and nightlife scene than Sydney or Melbourne offers, and fewer direct international flights, so weigh the lower cost and calmer pace against whether that's the kind of city you actually want to spend several years in, not just the cheapest one on paper.",
          "The ACT's economy leans heavily on the federal public service and its surrounding contractor and consulting ecosystem, which is a specific, narrower job market than a diversified state capital, and one where local citizenship or permanent residency is often a prerequisite for the public-service roles themselves.",
        ],
      },
    ],
    sectionsAfterList: [
      {
        heading: "The Canberra Matrix and ACT nomination",
        body: [
          "The whole of the Australian Capital Territory is classified as a regional area for skilled migration, and the ACT runs its own state-nomination points test, the Canberra Matrix, rather than using the generic points system other states apply. Studying at ANU or the University of Canberra can position you well for ACT nomination on the 190 or 491 visa, but the Matrix changes its point allocations periodically, so check the current version on the ACT government's migration site before treating it as a fixed plan.",
          "Canberra's small size cuts both ways: rent and commute times are genuinely lower than in the bigger east-coast cities, but the part-time job market is thinner outside the public service and hospitality sectors, worth weighing if you're counting on local work income to fund your studies.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Canberra a good choice if I want to work in Australian government or policy?",
        a: "Studying in Canberra puts you physically close to the federal public service and its policy, consulting, and defence-adjacent contractor ecosystem, which is a genuine networking advantage. Most core public-service graduate roles require Australian citizenship, though, so check the specific eligibility for any program you're targeting rather than assuming proximity alone is enough.",
      },
      {
        q: "Is ANU worth the higher cost compared to the University of Canberra?",
        a: "ANU carries a stronger international research reputation and sits at the top fee band on this list; the University of Canberra is more accessible on both entry and cost. Which is worth it depends on whether you need ANU's specific research strength and prestige for your field, or whether a more affordable, still ACT-based degree meets your goals just as well.",
      },
      {
        q: "Is Canberra too quiet for international students used to a bigger city?",
        a: "It's a genuine trade-off, not just a cost saving: Canberra's nightlife, dining, and cultural scene are smaller than Sydney's or Melbourne's, and its international flight options are limited, so most travel connects through Sydney or Melbourne anyway. Some students prefer the calmer pace and lower cost; others find it too quiet after a semester or two and transfer, so weigh your own preference, not just the budget figures.",
      },
      {
        q: "How easy is it to get to Sydney or Melbourne from Canberra?",
        a: "Very easy by Australian standards: it's about a three-hour drive or coach trip to Sydney, with regular direct flights to both Sydney and Melbourne taking around an hour. That makes weekend trips or interstate interviews genuinely practical, unlike Perth's isolation from the eastern states.",
      },
      {
        q: "Does Canberra have a large international student community despite its small size?",
        a: "It's smaller in absolute numbers than Sydney or Melbourne, but ANU and the University of Canberra both draw a genuinely international cohort, and the city's compact size means that community is easier to find and connect with than in a larger, more spread-out city.",
      },
    ],
  },
};

/** Builds a "cheapest universities in <city>" collection. */
function cityCollection(opts: {
  city: string;
  match: RegExp;
  slug: string;
}): Collection {
  const { city, match, slug } = opts;
  const extra = CITY_EXTRA[slug];
  return {
    slug,
    title: `The cheapest universities in ${city} for international students`,
    metaTitle: `Cheapest Universities in ${city}`,
    shortTitle: `Cheapest in ${city}`,
    category: "city",
    metaDescription: `Universities in ${city} ranked by estimated first-year budget for international students: tuition plus ${city} living costs. Not ranked by prestige.`,
    intro: [
      ...(LEAD[slug] ? [LEAD[slug]] : []),
      `${city} has universities across the full price range, and where you study inside the city matters less for cost than which institution and course you pick. This list ranks the ${city} universities by estimated first-year budget, cheapest first.`,
      `The budget figure is the cheapest international tuition on record for each university plus our ${city} living-cost estimate plus a rough setup allowance. Tuition varies a lot by course, so treat the order as a guide and check your specific program.`,
    ],
    sectionsBeforeList: extra?.sectionsBeforeList,
    sectionsAfterList: extra?.sectionsAfterList,
    faq: extra?.faq,
    methodology: `We took every published university with a campus in ${city}, used its lowest international tuition (university-wide or its cheapest program), added the ${city} living-cost estimate and about AUD 4,000 in setup costs, and sorted low to high.`,
    build: (unis) =>
      unis
        .filter((u) => u.city != null && match.test(u.city) && u.firstYearBudget != null)
        .sort((a, b) => (a.firstYearBudget ?? 0) - (b.firstYearBudget ?? 0))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline: budget(u),
          note:
            u.minTuition != null
              ? `Tuition from ${formatCurrency(u.minTuition, "AUD")} a year.`
              : `Among the more affordable options in ${city}.`,
        })),
  };
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "affordable-australian-universities-for-international-students",
    title: "The most affordable Australian universities for international students",
    metaTitle: "Cheapest Universities in Australia for Intl Students",
    shortTitle: "Most affordable universities",
    category: "cost",
    metaDescription:
      "Australian universities ranked by estimated first-year budget: cheapest international tuition plus the city's living costs, not by ranking.",
    intro: [
      "Australia is not a cheap place to study, but the gap between the most and least expensive universities is wide. A year at a sandstone university in Sydney can cost more than double a year at a regional or specialist provider.",
      "This list ranks universities by estimated first-year budget: the cheapest international tuition we have on record plus the indicative annual living cost for that city, plus a rough allowance for one-off setup costs. It is not ranked by prestige. Several of these universities are strong in specific fields and sit in cities where your money goes further.",
    ],
    methodology:
      "We took each university's lowest published international tuition (university-wide or its cheapest individual program), added our city-specific living-cost estimate and about AUD 4,000 in setup costs, then sorted low to high. Specialist and pathway-only providers are included where they grant degrees. Always confirm the fee for your specific course.",
    relatedGuide: {
      href: "/guides/cheapest-australian-university-tuition-vs-total-cost",
      label: "Why the cheapest tuition is rarely the cheapest degree",
    },
    build: (unis) =>
      unis
        .filter((u) => u.firstYearBudget != null)
        .sort((a, b) => (a.firstYearBudget ?? 0) - (b.firstYearBudget ?? 0))
        .slice(0, 15)
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline: budget(u),
          note:
            u.minTuition != null
              ? `International tuition from ${formatCurrency(u.minTuition, "AUD")} a year.${
                  u.living_cost_annual != null && u.living_cost_annual <= 27000
                    ? ` Living costs here are below the Sydney and Melbourne average.`
                    : ""
                }`
              : "Among the lower-cost options in this dataset.",
        })),
  },
  {
    slug: "regional-australian-universities-for-skilled-migration",
    title: "Regional Australian universities and what they mean for skilled migration",
    metaTitle: "Regional Universities in Australia for Migration Points",
    shortTitle: "Regional universities",
    category: "migration",
    metaDescription:
      "Australian universities in designated regional areas, where studying earns extra points toward the 491 and 190 skilled visas and living costs are lower.",
    intro: [
      "For skilled migration, \"regional\" means everywhere in Australia except Greater Sydney, Greater Melbourne, and Greater Brisbane. Studying at a regional campus is worth 5 extra points on the skilled points test, opens the Skilled Work Regional (491) visa, and often comes with easier state nomination criteria.",
      "Perth, Adelaide, Canberra, Hobart, the Gold Coast, Newcastle, and Wollongong all count as regional, and none of them are small towns. Living costs at these universities are also consistently below Sydney and Melbourne.",
    ],
    methodology:
      "We flagged universities whose main campus city sits in a designated regional area. Multi-campus universities that also operate in Sydney or Melbourne are excluded here even if they have regional campuses, since your points depend on where you actually study. Check the current designated postcode list before relying on this.",
    relatedGuide: {
      href: "/guides/choosing-a-regional-area-to-study-in-australia",
      label: "Studying in regional Australia: what counts and what you gain",
    },
    build: (unis) =>
      unis
        .filter((u) => isRegional(u.city))
        .sort((a, b) => (a.firstYearBudget ?? 9e9) - (b.firstYearBudget ?? 9e9))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline: u.city ?? "Regional",
          note: `${
            u.firstYearBudget
              ? `Around ${formatCurrency(u.firstYearBudget, "AUD")} for the first year. `
              : ""
          }Studying here earns the regional study points and access to the 491 visa.`,
        })),
  },
  {
    slug: "australian-universities-with-multiple-intakes-per-year",
    title: "Australian universities with more than one intake a year",
    metaTitle: "Australian Universities with Multiple Intakes a Year",
    shortTitle: "Multiple intakes",
    category: "migration",
    metaDescription:
      "Most Australian universities start in February and July. These offer three or more intakes a year, useful if you miss a deadline or want to start sooner.",
    intro: [
      "Almost every Australian university has a February and a July intake. A smaller number run three or more starts a year, which matters if you have missed a semester deadline, are waiting on a test result, or simply want to begin sooner.",
      "More frequent intakes also mean shorter gaps between finishing one qualification and starting the next, which can help you stay in status on a student or graduate visa.",
    ],
    methodology:
      "We counted the distinct intake months across each university and its published programs, and listed those with three or more. Private universities and pathway-oriented providers dominate this list because their calendars are built for flexibility.",
    build: (unis) =>
      unis
        .filter((u) => u.intakes.length >= 3)
        .sort((a, b) => b.intakes.length - a.intakes.length || a.name.localeCompare(b.name))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline: `${u.intakes.length} intakes: ${u.intakes.join(", ")}`,
          note:
            u.name === "Bond University"
              ? "Three trimesters a year, so a bachelor degree finishes in two years."
              : `Starts in ${u.intakes.join(", ")}, giving more than the usual two entry points.`,
        })),
  },
  {
    slug: "australian-universities-with-automatic-scholarships",
    title: "Australian universities that give international scholarships automatically",
    metaTitle: "Australian Universities with Automatic Scholarships",
    shortTitle: "Automatic scholarships",
    category: "cost",
    metaDescription:
      "Australian universities where a tuition scholarship is awarded automatically on the merit of your admission application, with no separate form.",
    intro: [
      "Many international scholarships need a separate application, a statement, sometimes an interview, and a lot of applicants never get around to them. At these universities, a tuition reduction is applied automatically based on the grades in your admission application.",
      "That makes the effective cost of these universities lower than the sticker price for any student with a solid academic record. The reductions usually run for the whole degree, not just the first year.",
    ],
    methodology:
      "We listed universities that have at least one published scholarship in our database marked as requiring no separate application. Rates and eligibility bands change yearly, so follow the link to each scholarship for the current terms.",
    build: (unis) =>
      unis
        .filter((u) => u.automaticScholarships.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => {
          const s = u.automaticScholarships[0];
          return {
            slug: u.slug,
            name: u.name,
            city: u.city,
            headline: s.amount ? `${s.name}: ${s.amount}` : s.name,
            note: "Applied automatically on the academic merit of your admission application, no separate form.",
          };
        }),
  },
  {
    slug: "easiest-australian-universities-to-get-into-for-international-students",
    title: "The most accessible Australian universities for international students",
    metaTitle: "Easiest Australian Universities to Get Into",
    shortTitle: "More open admissions",
    category: "admissions",
    metaDescription:
      "Australian universities with the most open admissions for international students, and what that means for entry requirements.",
    intro: [
      "\"Easiest to get into\" is the wrong way to think about it, because a place at any accredited Australian university still needs you to meet real academic and English requirements. But selectivity varies widely, and some universities have genuinely more open admissions than the more selective Group of Eight.",
      "The most open are the TAFEs and pathway providers, then the regional, newer, and teaching-focused universities. These often accept a broader range of prior qualifications and lower entry averages, and several run their own foundation or diploma pathways for applicants who fall just short.",
    ],
    methodology:
      "Australian universities do not publish official acceptance rates, so we assign each institution a selectivity band by editorial judgement (see the methodology page). This list is the published universities we place in the broadly accessible band, sorted alphabetically. That is an institution-wide read and does not tell you about a specific competitive course, since medicine, law and some design programs stay selective everywhere. Always check the requirements for your course.",
    build: (unis) =>
      unis
        .filter((u) => u.selectivityBand === "broadly-accessible")
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 18)
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline: "Broadly accessible admissions",
          note:
            u.firstYearBudget != null
              ? `Around ${formatCurrency(u.firstYearBudget, "AUD")} for the first year. Competitive courses still have their own requirements.`
              : "Broad admissions across most courses; competitive programs are still selective.",
        })),
  },
  {
    slug: "private-universities-in-australia-for-international-students",
    title: "Private universities in Australia",
    metaTitle: "Private Universities in Australia for Intl Students",
    shortTitle: "Private universities",
    category: "admissions",
    metaDescription:
      "Every private university and private higher-education provider in Australia, what each is known for, and how they differ from the public system for international students.",
    intro: [
      "Australia's university system is overwhelmingly public, so private universities and private higher-education providers are a small group with distinct characters. They tend to be smaller, more teaching-focused, and more expensive per year, since they receive no government funding and charge international and domestic students the same fee.",
      "The trade-off is often smaller classes, a tighter industry focus, more frequent intakes, and in Bond's case a compressed calendar that finishes a bachelor degree in two years. None offer Commonwealth Supported Places, so scholarship support matters more here.",
    ],
    methodology:
      "We listed every published provider marked as a private institution, sorted alphabetically. This includes both full private universities (Bond, Torrens, Notre Dame, Divinity) and private higher-education providers that grant degrees.",
    build: (unis) =>
      unis
        .filter((u) => u.institution_type === "private")
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline:
            u.minTuition != null
              ? `Tuition from ${formatCurrency(u.minTuition, "AUD")}/yr`
              : "Private provider",
          note:
            u.who_is_it_for?.split(". ").slice(0, 1).join(". ").slice(0, 180) ??
            "Private provider; domestic and international students pay the same fee.",
        })),
  },
  {
    slug: "group-of-eight-universities-in-australia",
    title: "The Group of Eight universities in Australia",
    shortTitle: "Group of Eight",
    category: "admissions",
    metaDescription:
      "The eight research-intensive Group of Eight universities in Australia, what Go8 membership means for international students, and how their costs compare.",
    intro: [
      "The Group of Eight is an alliance of Australia's oldest and most research-intensive universities. They dominate the international rankings, run the largest research budgets, and are where most of Australia's professional graduate programs (medicine, law, some engineering) sit.",
      "For international students the Go8 name carries weight with employers, especially outside Australia. The trade-offs are the highest tuition in the country, the most competitive admissions, and, for several of them, big-city living costs. A Go8 degree is not automatically the right choice if your field is taught just as well elsewhere for less.",
    ],
    methodology:
      "The Group of Eight is a fixed alliance: ANU, Melbourne, Sydney, UNSW, Queensland, Monash, Western Australia, and Adelaide. We show them here with their cheapest tuition on record and first-year budget so you can compare.",
    build: (unis) =>
      unis
        .filter((u) => GO8.has(u.slug))
        .sort((a, b) => (a.firstYearBudget ?? 0) - (b.firstYearBudget ?? 0))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline:
            u.firstYearBudget != null
              ? budget(u)
              : u.minTuition != null
                ? `Tuition from ${formatCurrency(u.minTuition, "AUD")}/yr`
                : "Group of Eight",
          note: "Research-intensive, highly ranked, selective admissions, and the highest tuition band in Australia.",
        })),
  },
  {
    slug: "australian-universities-with-no-application-fee",
    title: "Australian universities with no application fee for international students",
    metaTitle: "Australian Universities with No Application Fee",
    shortTitle: "No application fee",
    category: "cost",
    metaDescription:
      "Most Australian universities charge international students nothing to apply. Here is the list of fee-free universities, and the few that do charge.",
    intro: [
      "Applying to Australian universities is cheaper than applying in the US or UK, because most of them charge international students no application fee at all when you apply directly or through an authorised agent.",
      "That means you can put in several applications and compare your offers without spending anything upfront. A small number of universities do charge a direct-application fee, usually AUD 55 to 125, though several waive it for agent-lodged applications.",
    ],
    methodology:
      "We list universities recorded as charging no application fee for international students. The figure reflects the standard direct-application fee; some universities that charge one waive it for applications through an authorised agent, so confirm before you apply. Third-party application platforms may add their own service fee regardless.",
    build: (unis) =>
      unis
        .filter((u) => u.applicationFee === 0)
        .sort((a, b) => (a.firstYearBudget ?? 9e9) - (b.firstYearBudget ?? 9e9))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline: "No application fee",
          note:
            u.minTuition != null
              ? `Free to apply. Tuition from ${formatCurrency(u.minTuition, "AUD")} a year.`
              : "Free to apply directly or through an authorised agent.",
        })),
  },
  {
    slug: "australian-universities-accepting-ielts-6-0-for-international-students",
    title: "Australian universities that accept IELTS 6.0 or PTE 50",
    shortTitle: "Accept IELTS 6.0 / PTE 50",
    category: "admissions",
    metaDescription:
      "Australian universities with an institutional minimum of IELTS 6.0 (or PTE Academic 50) for undergraduate entry. Note that specific courses require higher scores.",
    intro: [
      "IELTS 6.0, or PTE Academic 50 under the standard concordance, is the most common institutional minimum for undergraduate entry at Australian universities. The Group of Eight and a few others set their floor at IELTS 6.5 (PTE 58), but most regional, newer, and technology universities accept 6.0 overall for general degrees.",
      "This is only the institutional minimum. It is the score below which the university will not consider you at all, not a guarantee your course accepts it. Nursing needs IELTS 7.0, teaching 7.5, and medicine, law, and business commonly 7.0. Postgraduate coursework usually needs 6.5. Universities that take IELTS almost always take PTE Academic at the equivalent score.",
    ],
    methodology:
      "We list universities whose institutional minimum for undergraduate entry is IELTS 6.0 overall, which maps to PTE Academic 50. Always check the requirement for your specific course, since many programs sit well above the institutional floor.",
    build: (unis) =>
      unis
        .filter((u) => u.ieltsOverall != null && u.ieltsOverall <= 6.0)
        .sort((a, b) => (a.firstYearBudget ?? 9e9) - (b.firstYearBudget ?? 9e9))
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline: u.pteOverall != null ? "IELTS 6.0 / PTE 50 minimum" : "IELTS 6.0 minimum",
          note: `Institutional minimum for undergraduate entry is IELTS 6.0${
            u.pteOverall != null ? " (PTE Academic 50)" : ""
          }.${u.applicationFee === 0 ? " No application fee." : ""} Specific courses require more.`,
        })),
  },
  cityCollection({ city: "Sydney", match: /sydney|manly/i, slug: "cheapest-universities-in-sydney-for-international-students" }),
  cityCollection({ city: "Melbourne", match: /melbourne|geelong/i, slug: "cheapest-universities-in-melbourne-for-international-students" }),
  cityCollection({ city: "Perth", match: /perth|fremantle/i, slug: "cheapest-universities-in-perth-for-international-students" }),
  cityCollection({ city: "Brisbane", match: /brisbane|gold coast/i, slug: "cheapest-universities-in-brisbane-for-international-students" }),
  cityCollection({ city: "Adelaide", match: /adelaide/i, slug: "cheapest-universities-in-adelaide-for-international-students" }),
  cityCollection({ city: "Canberra", match: /canberra/i, slug: "cheapest-universities-in-canberra-for-international-students" }),
  ...SUBJECT_BEST_PAGES.map(subjectBestCollection),
  businessSchoolsCollection(),
  mbaCollection(),
  cheapestNursingCollection(),
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
