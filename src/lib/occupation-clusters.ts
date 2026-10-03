/**
 * Occupation pages whose degree-pathway list is (almost) the same set of
 * programs as a sibling's.
 *
 * Each occupation page is mostly its list of linked degrees, and that list is
 * keyed to field of study rather than to the ANZSCO code: six accountant-family
 * occupations each link the identical 1,149 programs, nine health occupations
 * the identical 923, and so on. Measured on the live data (program-set Jaccard
 * overlap >= 0.8) that is 13 clusters covering 53 of 60 occupation pages, and
 * roughly 85% of each page's words are shared with its siblings.
 *
 * Until the programs are re-mapped per occupation (a data change), one page per
 * cluster, the lead, stays indexable. The rest stay live for users and internal
 * links but render `noindex, follow` and are left out of the sitemap, the same
 * treatment thin program pages already get.
 *
 * The first slug in each cluster is the lead. To bring a page back into the
 * index (for example after its programs are re-mapped), delete its slug here.
 * Regenerate from `program_occupations` if the occupation set changes.
 */
export const OCCUPATION_CLUSTERS: string[][] = [
  [
    "accountant-general-221111",
    "company-secretary-221211",
    "external-auditor-221213",
    "internal-auditor-221214",
    "management-accountant-221112",
    "taxation-accountant-221113",
  ],
  [
    "agricultural-scientist-234112",
    "agricultural-consultant-234111",
    "veterinarian-234711",
  ],
  [
    "civil-engineer-233211",
    "agricultural-engineer-233912",
    "biomedical-engineer-233913",
    "chemical-engineer-233111",
    "electrical-engineer-233311",
    "electronics-engineer-233411",
    "mechanical-engineer-233512",
    "mining-engineer-excluding-petroleum-233611",
    "structural-engineer-233214",
  ],
  ["architect-232111", "landscape-architect-232112"],
  ["solicitor-271311", "barrister-271111"],
  ["hotel-or-motel-manager-141311", "cafe-or-restaurant-manager-141111"],
  [
    "clinical-psychologist-272311",
    "educational-psychologist-272312",
    "organisational-psychologist-272313",
  ],
  [
    "software-engineer-261313",
    "computer-network-and-systems-engineer-263111",
    "developer-programmer-261312",
    "ict-business-analyst-261111",
    "ict-security-specialist-262112",
    "systems-analyst-261112",
  ],
  ["systems-administrator-262113", "database-administrator-262111"],
  [
    "registered-nurse-medical-254418",
    "dietitian-251111",
    "midwife-254111",
    "nurse-practitioner-254411",
    "occupational-therapist-252411",
    "physiotherapist-252511",
    "registered-nurse-aged-care-254412",
    "registered-nurse-community-health-254414",
    "registered-nurse-mental-health-254422",
  ],
  [
    "primary-school-teacher-241213",
    "early-childhood-pre-primary-school-teacher-241111",
    "secondary-school-teacher-241411",
    "special-needs-teacher-241511",
  ],
  ["environmental-consultant-234312", "environmental-research-scientist-234313"],
  ["graphic-designer-232411", "industrial-designer-232312", "web-designer-232414"],
];

const LEAD_BY_SLUG = new Map<string, string>();
const SIBLINGS_BY_SLUG = new Map<string, string[]>();
for (const [lead, ...rest] of OCCUPATION_CLUSTERS) {
  for (const slug of rest) LEAD_BY_SLUG.set(slug, lead);
  SIBLINGS_BY_SLUG.set(lead, rest);
}

/** True for a cluster member that is not the lead: noindex, out of sitemap. */
export function isClusterDuplicate(slug: string): boolean {
  return LEAD_BY_SLUG.has(slug);
}

/** The indexable lead page for a non-lead member, else null. */
export function clusterLead(slug: string): string | null {
  return LEAD_BY_SLUG.get(slug) ?? null;
}

/** The other pages in the cluster, lead first, for "same degree pathways" links. */
export function clusterRelatives(slug: string): string[] {
  const lead = LEAD_BY_SLUG.get(slug) ?? slug;
  const members = [lead, ...(SIBLINGS_BY_SLUG.get(lead) ?? [])];
  return members.filter((s) => s !== slug);
}
