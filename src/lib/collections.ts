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
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
