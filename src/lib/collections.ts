import type { CollectionUniversity } from "@/lib/queries/public-collections";
import { formatCurrency } from "@/lib/format";

export type CollectionEntry = {
  slug: string;
  name: string;
  city: string | null;
  /** Short bold metric shown next to the name. */
  headline: string;
  /** One sentence of reasoning specific to this university. */
  note: string;
};

export type Collection = {
  slug: string;
  title: string;
  shortTitle: string;
  metaDescription: string;
  /** Editorial intro, one or two paragraphs. */
  intro: string[];
  /** How the list was built. */
  methodology: string;
  build: (universities: CollectionUniversity[]) => CollectionEntry[];
};

const REGIONAL_RE =
  /(Perth|Adelaide|Canberra|Hobart|Launceston|Darwin|Gold Coast|Sunshine Coast|Sippy Downs|Newcastle|Wollongong|Ballarat|Armidale|Toowoomba|Lismore|Coffs|Townsville|Cairns|Bathurst|Wagga|Bendigo|Geelong|Cooranbong|regional| WA| SA| TAS| NT| ACT)/i;

function isRegional(city: string | null): boolean {
  if (!city) return false;
  if (/Sydney|Melbourne/i.test(city)) return false;
  if (/^Brisbane,/i.test(city)) return false;
  return REGIONAL_RE.test(city);
}

function budget(u: CollectionUniversity): string {
  return u.firstYearBudget
    ? `${formatCurrency(u.firstYearBudget, "AUD")} first-year budget`
    : "Budget not available";
}

const GO8 = new Set([
  "australian-national-university",
  "university-of-melbourne",
  "university-of-sydney",
  "unsw-sydney",
  "university-of-queensland",
  "monash-university",
  "university-of-western-australia",
  "adelaide-university",
]);

/** Builds a "cheapest universities in <city>" collection. */
function cityCollection(opts: {
  city: string;
  match: RegExp;
  slug: string;
}): Collection {
  const { city, match, slug } = opts;
  return {
    slug,
    title: `The cheapest universities in ${city} for international students`,
    shortTitle: `Cheapest in ${city}`,
    metaDescription: `Universities in ${city} ranked by estimated first-year budget for international students: tuition plus ${city} living costs. Not ranked by prestige.`,
    intro: [
      `${city} has universities across the full price range, and where you study inside the city matters less for cost than which institution and course you pick. This list ranks the ${city} universities by estimated first-year budget, cheapest first.`,
      `The budget figure is the cheapest international tuition on record for each university plus our ${city} living-cost estimate plus a rough setup allowance. Tuition varies a lot by course, so treat the order as a guide and check your specific program.`,
    ],
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
    shortTitle: "Most affordable universities",
    metaDescription:
      "Australian universities ranked by estimated first-year budget: cheapest international tuition plus the city's living costs, not by ranking.",
    intro: [
      "Australia is not a cheap place to study, but the gap between the most and least expensive universities is wide. A year at a sandstone university in Sydney can cost more than double a year at a regional or specialist provider.",
      "This list ranks universities by estimated first-year budget: the cheapest international tuition we have on record plus the indicative annual living cost for that city, plus a rough allowance for one-off setup costs. It is not ranked by prestige. Several of these universities are strong in specific fields and sit in cities where your money goes further.",
    ],
    methodology:
      "We took each university's lowest published international tuition (university-wide or its cheapest individual program), added our city-specific living-cost estimate and about AUD 4,000 in setup costs, then sorted low to high. Specialist and pathway-only providers are included where they grant degrees. Always confirm the fee for your specific course.",
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
    shortTitle: "Regional universities",
    metaDescription:
      "Australian universities in designated regional areas, where studying earns extra points toward the 491 and 190 skilled visas and living costs are lower.",
    intro: [
      "For skilled migration, \"regional\" means everywhere in Australia except Greater Sydney, Greater Melbourne, and Greater Brisbane. Studying at a regional campus is worth 5 extra points on the skilled points test, opens the Skilled Work Regional (491) visa, and often comes with easier state nomination criteria.",
      "Perth, Adelaide, Canberra, Hobart, the Gold Coast, Newcastle, and Wollongong all count as regional, and none of them are small towns. Living costs at these universities are also consistently below Sydney and Melbourne.",
    ],
    methodology:
      "We flagged universities whose main campus city sits in a designated regional area. Multi-campus universities that also operate in Sydney or Melbourne are excluded here even if they have regional campuses, since your points depend on where you actually study. Check the current designated postcode list before relying on this.",
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
    shortTitle: "Multiple intakes",
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
    shortTitle: "Automatic scholarships",
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
    shortTitle: "Higher acceptance rates",
    metaDescription:
      "Australian universities with the highest acceptance rates and most open admissions for international students, and what that means for entry requirements.",
    intro: [
      "\"Easiest to get into\" is the wrong way to think about it, because a place at any accredited Australian university still needs you to meet real academic and English requirements. But acceptance rates vary widely, and some universities have genuinely more open admissions than the highly selective Group of Eight.",
      "The most open are the TAFEs and pathway providers, then the regional, newer, and teaching-focused universities. These often accept a broader range of prior qualifications and lower entry averages, and several run their own foundation or diploma pathways for applicants who fall just short.",
    ],
    methodology:
      "We listed published universities with an acceptance rate of 78 percent or higher, sorted highest first. Acceptance rate is an institution-wide figure and does not tell you about a specific competitive course (medicine, law, some design programs stay selective everywhere). Always check the requirements for your course.",
    build: (unis) =>
      unis
        .filter((u) => u.acceptanceRate != null && u.acceptanceRate >= 78)
        .sort((a, b) => (b.acceptanceRate ?? 0) - (a.acceptanceRate ?? 0))
        .slice(0, 18)
        .map((u) => ({
          slug: u.slug,
          name: u.name,
          city: u.city,
          headline: `${Math.round(u.acceptanceRate!)}% acceptance rate`,
          note:
            u.firstYearBudget != null
              ? `Around ${formatCurrency(u.firstYearBudget, "AUD")} for the first year. Competitive courses still have their own requirements.`
              : "Broad admissions across most courses; competitive programs are still selective.",
        })),
  },
  {
    slug: "private-universities-in-australia-for-international-students",
    title: "Private universities in Australia",
    shortTitle: "Private universities",
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
  cityCollection({ city: "Sydney", match: /sydney|manly/i, slug: "cheapest-universities-in-sydney-for-international-students" }),
  cityCollection({ city: "Melbourne", match: /melbourne|geelong/i, slug: "cheapest-universities-in-melbourne-for-international-students" }),
  cityCollection({ city: "Perth", match: /perth|fremantle/i, slug: "cheapest-universities-in-perth-for-international-students" }),
  cityCollection({ city: "Brisbane", match: /brisbane|gold coast/i, slug: "cheapest-universities-in-brisbane-for-international-students" }),
  cityCollection({ city: "Adelaide", match: /adelaide/i, slug: "cheapest-universities-in-adelaide-for-international-students" }),
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
