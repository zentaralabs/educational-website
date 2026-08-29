/**
 * Config for the /international/[country] pages: "Study in Australia from X"
 * for the largest source countries. Same config-in-code pattern as
 * collections.ts / subjects.ts / cities.ts. Zero em dashes (house style).
 *
 * These pages cover what is *different* for applicants from that country
 * (agent rules, deadlines, credential recognition, visa scrutiny), not the
 * generic "how to apply" material, which lives in /guides and /visas.
 */

export type OriginCountry = {
  slug: string;
  /** Country name, e.g. "India". */
  name: string;
  /** Adjective for citizens, e.g. "Indian". */
  demonym: string;
  /** Answer-first intro, 2 short paragraphs. */
  intro: string[];
  /** Country-specific points about applying to a university. */
  applying: string[];
  /** Country-specific note on qualifications and English. */
  credentials: string[];
  /** Fields most chosen by students from this country. */
  popularFields: string[];
  faq: { q: string; a: string }[];
  /** Official pages the facts were checked against. */
  sources: string[];
  /** ISO date the country-specific facts were last verified. */
  lastVerified: string;
};

export const ORIGIN_COUNTRIES: Record<string, OriginCountry> = {
  india: {
    slug: "india",
    name: "India",
    demonym: "Indian",
    intro: [
      "Indian students can study at any Australian university, and India is one of the two largest sources of international students in Australia. A first year usually costs between AUD 40,000 and AUD 75,000 all in, you apply either directly to the university or through an authorised agent, and the visa is the subclass 500 student visa.",
      "What is different for Indian applicants: several universities only accept applications from Indian citizens through an approved agent, a few set earlier deadlines, and the financial-evidence and Genuine Student checks are applied more closely than for lower-risk countries. None of this changes what you are eligible for. It changes how you prepare.",
    ],
    applying: [
      "Apply through the university's own international application portal, or through an agent that the university has authorised. Several universities, particularly in Western Australia, only accept applications from Indian citizens through an authorised agent. Edith Cowan University, for example, lists India among the countries that must apply via an agent. Check each university's how-to-apply page before you start.",
      "Deadlines can fall earlier for Indian applicants. The University of Western Australia closes international applications for citizens of higher visa-scrutiny countries, India among them, several weeks before the date for other countries. Curtin closes applications 10 weeks before the course start for those countries, against 4 weeks for others. Apply three to four months ahead.",
      "Most universities assess applications on a rolling basis and run February and July intakes. Use the universities directory to filter by state, tuition, English requirement, and intake, and check the deadline calendar for the recommended dates.",
    ],
    credentials: [
      "A three-year Indian bachelor's degree is accepted for direct entry to most Australian master's programs. Some competitive programs, and a few universities, prefer a four-year degree or first-class marks, so read the specific program's entry requirements.",
      "How your percentage converts to an Australian grade depends on which university or board awarded your degree. Universities publish India-specific entry tables. A 60 percent aggregate is a common minimum, with 65 to 75 percent for competitive courses.",
      "For English, you can use IELTS, PTE, or TOEFL, and many universities also accept a medium-of-instruction letter confirming your degree was taught and assessed in English. The university sets its own score and the student visa has its own English rule, so confirm both.",
    ],
    popularFields: [
      "Information technology and computer science",
      "Engineering",
      "Business and management",
      "Nursing and health",
      "Accounting",
    ],
    faq: [
      {
        q: "Can I study in Australia from India with a 3-year bachelor's degree?",
        a: "Yes, for most Australian master's programs. Australian universities generally treat a three-year Indian bachelor's as equivalent for postgraduate entry. A minority of competitive programs want a four-year degree, honours, or high marks, so check the entry requirements for your specific course.",
      },
      {
        q: "How much does it cost to study in Australia from India?",
        a: "Budget AUD 40,000 to 75,000 for the first year: roughly AUD 30,000 to 50,000 tuition depending on the university and field, about AUD 30,000 living costs, the AUD 2,500 visa, health cover, and flights. Group of Eight universities and the Sydney and Melbourne cost of living sit at the top of that range.",
      },
      {
        q: "Do Indian students need to apply through an agent?",
        a: "Some universities require it. Several universities, mostly in Western Australia, only accept applications from Indian citizens through an authorised agent rather than directly. Others accept both. Check the university's how-to-apply page: if India is listed under agent-only countries, you cannot apply direct.",
      },
      {
        q: "What is the student visa fee for Indian students?",
        a: "AUD 2,500 for the subclass 500 student visa. It is the same for every nationality. On top of that you need to show funds for tuition, travel, and 12 months of living costs (AUD 29,710, set by the Australian Government).",
      },
      {
        q: "Do Indian students need IELTS for Australia?",
        a: "Not always. Many universities accept a medium-of-instruction letter instead of a test for admission if your degree was taught in English. The student visa has a separate English requirement, which a recognised test or an English-taught qualification can satisfy. Confirm what your university and your visa each need.",
      },
      {
        q: "Can I get PR in Australia after studying from India?",
        a: "It is a common pathway, not an automatic outcome. After graduating, most students qualify for a Temporary Graduate visa (subclass 485) with two to three years of full work rights, then compete for a points-tested skilled visa (189, 190, or 491) with skilled work experience. Whether it works out depends on your occupation, points, and the invitation rounds.",
      },
    ],
    sources: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-student-requirement",
      "https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=1196",
      "https://www.studyaustralia.gov.au/",
    ],
    lastVerified: "2026-08-29",
  },
};

export function getOriginCountry(slug: string): OriginCountry | undefined {
  return ORIGIN_COUNTRIES[slug];
}

export const ORIGIN_COUNTRY_SLUGS = Object.keys(ORIGIN_COUNTRIES);
