/**
 * Per-city cost-of-living estimates for international students, in AUD per
 * week. Grounded in 2026 published ranges (Study Australia, Numbeo,
 * university international-student cost pages) and the Australian
 * Government's AUD 29,710 minimum for the student visa. These are estimates
 * with wide ranges, surfaced as such on the pages.
 */

export type CityCost = {
  slug: string;
  name: string;
  state: string;
  /** One-line positioning. */
  blurb: string;
  /** Weekly AUD estimates. Rent is the big variable. */
  rentSharedLow: number;
  rentSharedHigh: number;
  rentStudioLow: number;
  rentStudioHigh: number;
  food: number;
  transport: number;
  utilities: number;
  phoneInternet: number;
  entertainment: number;
  /** Universities with a main campus here (slugs). */
  universitySlugs: string[];
  faq: { q: string; a: string }[];
};

const OSHC_WEEKLY = 12; // ~AUD 600/year single OSHC, spread weekly

export const CITY_COSTS: CityCost[] = [
  {
    slug: "sydney",
    name: "Sydney",
    state: "NSW",
    blurb:
      "The most expensive student city in Australia, driven almost entirely by rent. Everything else costs roughly the same as anywhere else in the country.",
    rentSharedLow: 320,
    rentSharedHigh: 520,
    rentStudioLow: 550,
    rentStudioHigh: 850,
    food: 120,
    transport: 45,
    utilities: 40,
    phoneInternet: 15,
    entertainment: 80,
    universitySlugs: [
      "university-of-sydney",
      "unsw-sydney",
      "university-of-technology-sydney",
      "macquarie-university",
      "western-sydney-university",
    ],
    faq: [
      {
        q: "How much does it cost to live in Sydney as an international student?",
        a: "Budget roughly AUD 33,000 to 44,000 a year if you share accommodation, more for your own studio. Rent is by far the largest item: a room in a shared house typically runs AUD 320 to 520 a week, more the closer you are to the city or a beach.",
      },
      {
        q: "Is Sydney cheaper than Melbourne for students?",
        a: "No. Sydney is the most expensive Australian city for students, mostly because of rent. Melbourne is a little cheaper, and Brisbane, Perth, and Adelaide are meaningfully cheaper.",
      },
    ],
  },
  {
    slug: "melbourne",
    name: "Melbourne",
    state: "VIC",
    blurb:
      "Australia's biggest student city and a little cheaper than Sydney, with a large rental market, extensive trams, and a strong part-time job market.",
    rentSharedLow: 280,
    rentSharedHigh: 460,
    rentStudioLow: 480,
    rentStudioHigh: 720,
    food: 115,
    transport: 40,
    utilities: 40,
    phoneInternet: 15,
    entertainment: 75,
    universitySlugs: [
      "university-of-melbourne",
      "monash-university",
      "rmit-university",
      "deakin-university",
      "la-trobe-university",
      "swinburne-university-of-technology",
      "victoria-university",
    ],
    faq: [
      {
        q: "How much does it cost to live in Melbourne as an international student?",
        a: "Around AUD 30,000 to 39,500 a year sharing accommodation. A room in a shared house is usually AUD 280 to 460 a week; an inner-city studio is a lot more. Melbourne's tram network keeps transport costs down, and inner suburbs have a dense casual job market.",
      },
    ],
  },
  {
    slug: "brisbane",
    name: "Brisbane",
    state: "QLD",
    blurb:
      "A state capital with noticeably lower rent than Sydney or Melbourne, a warm climate, and a growing tech and health sector.",
    rentSharedLow: 220,
    rentSharedHigh: 360,
    rentStudioLow: 420,
    rentStudioHigh: 620,
    food: 105,
    transport: 35,
    utilities: 38,
    phoneInternet: 15,
    entertainment: 65,
    universitySlugs: [
      "university-of-queensland",
      "queensland-university-of-technology",
      "griffith-university",
    ],
    faq: [
      {
        q: "Is Brisbane cheaper than Sydney or Melbourne for students?",
        a: "Yes, mainly on rent. A shared room in Brisbane is commonly AUD 220 to 360 a week against 320 to 520 in Sydney. A full year sharing accommodation works out around AUD 25,500 to 33,000.",
      },
    ],
  },
  {
    slug: "perth",
    name: "Perth",
    state: "WA",
    blurb:
      "A relaxed, spread-out capital with moderate costs. Perth counts as a designated regional area for skilled migration, so studying here also earns visa points.",
    rentSharedLow: 220,
    rentSharedHigh: 360,
    rentStudioLow: 400,
    rentStudioHigh: 590,
    food: 105,
    transport: 35,
    utilities: 38,
    phoneInternet: 15,
    entertainment: 65,
    universitySlugs: [
      "university-of-western-australia",
      "curtin-university",
      "edith-cowan-university",
      "murdoch-university",
    ],
    faq: [
      {
        q: "How much does it cost to live in Perth as an international student?",
        a: "About AUD 25,500 to 33,000 a year sharing accommodation. Perth is more spread out than the eastern cities, so factor in transport if you live far from campus. It is also classified regional for skilled migration.",
      },
    ],
  },
  {
    slug: "adelaide",
    name: "Adelaide",
    state: "SA",
    blurb:
      "Consistently the most affordable mainland capital for students, with the lowest rent of the big cities and a compact, walkable centre. Regional for skilled migration.",
    rentSharedLow: 170,
    rentSharedHigh: 280,
    rentStudioLow: 350,
    rentStudioHigh: 500,
    food: 100,
    transport: 35,
    utilities: 38,
    phoneInternet: 15,
    entertainment: 60,
    universitySlugs: [
      "adelaide-university",
      "flinders-university",
    ],
    faq: [
      {
        q: "Is Adelaide the cheapest city to study in Australia?",
        a: "Among the major cities, yes. Rent is the lowest of any mainland capital, commonly AUD 170 to 280 a week for a shared room, and a full year sharing accommodation is around AUD 22,500 to 28,000. Adelaide also counts as regional for skilled migration.",
      },
    ],
  },
  {
    slug: "canberra",
    name: "Canberra",
    state: "ACT",
    blurb:
      "The national capital: small, quiet, with a tight rental market but a strong graduate job market in the public service. Regional for skilled migration.",
    rentSharedLow: 250,
    rentSharedHigh: 400,
    rentStudioLow: 450,
    rentStudioHigh: 650,
    food: 110,
    transport: 35,
    utilities: 42,
    phoneInternet: 15,
    entertainment: 65,
    universitySlugs: ["australian-national-university", "university-of-canberra"],
    faq: [
      {
        q: "How much does it cost to live in Canberra as an international student?",
        a: "Roughly AUD 27,500 to 35,500 a year sharing accommodation. The rental market is small and can be competitive at the start of semester, so line up housing early. Canberra is classified regional for skilled migration.",
      },
    ],
  },
];

export function getCity(slug: string): CityCost | undefined {
  return CITY_COSTS.find((c) => c.slug === slug);
}

/** Weekly total using the low end of shared rent. */
export function weeklyLow(c: CityCost): number {
  return (
    c.rentSharedLow +
    c.food +
    c.transport +
    c.utilities +
    c.phoneInternet +
    c.entertainment +
    OSHC_WEEKLY
  );
}

/** Weekly total using the high end of shared rent. */
export function weeklyHigh(c: CityCost): number {
  return (
    c.rentSharedHigh +
    c.food +
    c.transport +
    c.utilities +
    c.phoneInternet +
    c.entertainment +
    OSHC_WEEKLY
  );
}

export function annualLow(c: CityCost): number {
  return Math.round((weeklyLow(c) * 52) / 500) * 500;
}
export function annualHigh(c: CityCost): number {
  return Math.round((weeklyHigh(c) * 52) / 500) * 500;
}

export { OSHC_WEEKLY };
