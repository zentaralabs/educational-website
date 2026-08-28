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

export type Collection = {
  slug: string;
  title: string;
  shortTitle: string;
  /** Groups the shortlist on the /best index tabs. */
  category: "cost" | "admissions" | "migration" | "city" | "subject";
  metaDescription: string;
  /** Editorial intro, one or two paragraphs. */
  intro: string[];
  /** How the list was built. */
  methodology: string;
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

/** Builds a "best universities for <subject>" collection from the curated
 *  strongAt list in SUBJECT_CONTENT. */
function subjectBestCollection(subjectSlug: string): Collection {
  const name = SUBJECT_NAMES[subjectSlug] ?? subjectSlug.replace(/-/g, " ");
  const curated = SUBJECT_CONTENT[subjectSlug]?.strongAt ?? [];
  const order = new Map(curated.map((c, i) => [c.slug, i]));
  const why = new Map(curated.map((c) => [c.slug, c.why]));
  return {
    slug: `best-australian-universities-for-${subjectSlug}`,
    title: `The best Australian universities for ${name}`,
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
    category: "city",
    metaDescription: `Universities in ${city} ranked by estimated first-year budget for international students: tuition plus ${city} living costs. Not ranked by prestige.`,
    intro: [
      ...(LEAD[slug] ? [LEAD[slug]] : []),
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
    category: "cost",
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
    category: "migration",
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
    shortTitle: "Higher acceptance rates",
    category: "admissions",
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
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
