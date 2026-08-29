/** Shared Australia-specific helpers used by collections and FAQ builders. */

export const GO8_SLUGS = new Set([
  "australian-national-university",
  "university-of-melbourne",
  "university-of-sydney",
  "unsw-sydney",
  "university-of-queensland",
  "monash-university",
  "university-of-western-australia",
  "adelaide-university",
]);

const REGIONAL_RE =
  /(Perth|Adelaide|Canberra|Hobart|Launceston|Darwin|Gold Coast|Sunshine Coast|Sippy Downs|Newcastle|Wollongong|Ballarat|Armidale|Toowoomba|Lismore|Coffs|Townsville|Cairns|Bathurst|Wagga|Bendigo|Geelong|Cooranbong|regional| WA| SA| TAS| NT| ACT)/i;

/**
 * True if the campus city sits in a designated regional area for skilled
 * migration (everywhere except Greater Sydney, Melbourne, and Brisbane).
 * A heuristic on the free-text `city` field, not the official postcode list.
 */
export function isRegionalCity(city: string | null): boolean {
  if (!city) return false;
  if (/Sydney|Melbourne/i.test(city)) return false;
  if (/^Brisbane,/i.test(city)) return false;
  return REGIONAL_RE.test(city);
}

/** The Australian states/territories, in the order used for filters. */
export const AU_STATES = [
  { code: "NSW", name: "New South Wales", slug: "new-south-wales" },
  { code: "VIC", name: "Victoria", slug: "victoria" },
  { code: "QLD", name: "Queensland", slug: "queensland" },
  { code: "WA", name: "Western Australia", slug: "western-australia" },
  { code: "SA", name: "South Australia", slug: "south-australia" },
  { code: "ACT", name: "Australian Capital Territory", slug: "act" },
  { code: "TAS", name: "Tasmania", slug: "tasmania" },
  { code: "NT", name: "Northern Territory", slug: "northern-territory" },
] as const;

export function stateBySlug(slug: string) {
  return AU_STATES.find((s) => s.slug === slug);
}

/**
 * Per-state context for the /universities/in/[state] landing pages. Whether
 * the state's main campuses count as regional for skilled migration is the
 * single most useful state-level fact for an international student, so it
 * leads. Zero em dashes (house style).
 */
export const AU_STATE_CONTENT: Record<
  string,
  { migration: string; cities: string; intro: string }
> = {
  NSW: {
    intro:
      "New South Wales has the most universities of any state and the largest international student population, concentrated in Sydney with campuses also in Newcastle, Wollongong, and regional centres.",
    migration:
      "Greater Sydney is not a designated regional area, so studying there earns no regional migration points. Newcastle, Wollongong, and the rest of regional NSW do count as regional, which adds points on the skilled visa points test and opens the 491 and 190 nomination pathways.",
    cities: "Sydney, Newcastle, Wollongong, plus regional campuses",
  },
  VIC: {
    intro:
      "Victoria is second only to NSW for university choice, with more universities inside commuting distance of one city, Melbourne, than anywhere else in Australia. Regional campuses run in Geelong, Ballarat, Bendigo, and elsewhere.",
    migration:
      "Greater Melbourne is not a designated regional area, so it earns no regional migration points. Geelong, Ballarat, Bendigo, and the rest of regional Victoria do count as regional.",
    cities: "Melbourne, Geelong, Ballarat, Bendigo",
  },
  QLD: {
    intro:
      "Queensland's universities span Brisbane and a long list of regional cities up the coast, and the state is strong in tourism, marine science, and health.",
    migration:
      "Greater Brisbane is not a designated regional area. The Gold Coast, Sunshine Coast, Toowoomba, Cairns, Townsville, and the rest of regional Queensland all count as regional for skilled migration.",
    cities: "Brisbane, Gold Coast, Sunshine Coast, Cairns, Townsville, Toowoomba",
  },
  WA: {
    intro:
      "Western Australia's universities are almost all in Perth, anchored by the University of Western Australia and Curtin, with lower living costs than the eastern capitals.",
    migration:
      "The whole of Western Australia, including Perth, is a designated regional area for skilled migration. Studying anywhere in WA earns the regional study points and access to the 491 visa and WA state nomination.",
    cities: "Perth, with some regional campuses",
  },
  SA: {
    intro:
      "South Australia's university landscape changed in 2026 when two long-established institutions merged into Adelaide University, alongside Flinders and a few specialist providers. Living costs are among the lowest of any capital.",
    migration:
      "The whole of South Australia, including Adelaide, is a designated regional area for skilled migration. Studying in SA earns the regional study points and opens the 491 visa and South Australian state nomination.",
    cities: "Adelaide",
  },
  ACT: {
    intro:
      "The Australian Capital Territory has two universities in Canberra: the Australian National University, which is highly selective and research-intensive, and the University of Canberra, which is more accessible on entry and cost.",
    migration:
      "The whole of the ACT is a designated regional area for skilled migration. Canberra runs its own 190 and 491 nomination through the Canberra Matrix, and studying there earns the regional study points.",
    cities: "Canberra",
  },
  TAS: {
    intro:
      "Tasmania has one university, the University of Tasmania, with campuses in Hobart and Launceston. It is a common choice for students who want lower costs and the regional migration advantage.",
    migration:
      "The whole of Tasmania is a designated regional area for skilled migration. Studying there earns the regional study points and opens the 491 visa and Tasmanian state nomination, which has historically been one of the more accessible.",
    cities: "Hobart, Launceston",
  },
  NT: {
    intro:
      "The Northern Territory has one university, Charles Darwin University, based in Darwin. It is small, and the Territory actively encourages international students to stay through its migration program.",
    migration:
      "The whole of the Northern Territory is a designated regional area for skilled migration. The NT runs the Northern Territory Designated Area Migration Agreement and its own nomination, both aimed at keeping graduates in the Territory.",
    cities: "Darwin",
  },
};

/**
 * Best-effort state code(s) from the free-text `city` field, e.g.
 * "Melbourne, VIC" -> ["VIC"], "Fremantle, WA / Sydney, NSW" -> ["WA","NSW"],
 * "Multi-campus (7 campuses, 5 states)" -> [] (treated as national).
 */
export function statesFromCity(city: string | null): string[] {
  if (!city) return [];
  const codes = new Set<string>();
  for (const m of city.matchAll(/\b(NSW|VIC|QLD|WA|SA|ACT|TAS|NT)\b/g)) {
    codes.add(m[1]);
  }
  return [...codes];
}
